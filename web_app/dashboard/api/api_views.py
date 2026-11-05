"""
Endpoints da API do QuadLab — um por página do dashboard
(ver a documentação do projeto no Notion).

Padrão usado em todos os endpoints:
1. `queryset_filtrado(request)` aplica os filtros globais (ano, sexo,
   raça/cor, região, UF, município, faixa etária, CID) — ver filters.py.
2. Consultas agregadas via Django ORM (nunca carregamos linha a linha em Python).
3. Gráficos montados com plotly.graph_objects e devolvidos com
   `fig.to_plotly_json()` nas chaves `fig_*`; KPIs em `kpis` e tabelas
   como listas de dicts, que o front desenha em HTML.
"""

import calendar
import math
from statistics import median

import plotly.graph_objects as go
from django.db.models import Avg, Count, F, Q, Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import AtendimentosDiabetes
from .filters import (
    COMPLICACOES_GRAVES,
    GRAVE,
    OBITO,
    ORDEM_FAIXAS,
    faixa_etaria,
    queryset_filtrado,
)

# Mesmas cores do front (tokens em frontend/src/style.css).
TEAL = "#12b8a6"
CORAL = "#f04461"
AMBER = "#f5a623"
BLUE = "#4f7cff"
PURPLE = "#8a63d2"
NAVY = "#1e3a8a"
COLORS = [TEAL, CORAL, AMBER, BLUE, PURPLE, "#2fb8e6"]

SEXO_CORES = {"Feminino": CORAL, "Masculino": BLUE}

# Escala clara -> escura de cada camada dos mapas: bolhas maiores ficam mais escuras.
ESCALAS_MAPA = {
    TEAL: [[0, "#a7ede4"], [0.5, TEAL], [1, "#04534c"]],
    PURPLE: [[0, "#d9ccf5"], [0.5, PURPLE], [1, "#33197a"]],
}
MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

AIHS = Count("n_aih")


def contar(condicao):
    return Count("n_aih", filter=condicao)


def periodo(ano, mes):
    """Competência no eixo dos gráficos: "Jan/25"."""
    return f"{MESES[mes - 1]}/{str(ano)[2:]}"


def razao(parte, total):
    return parte / total if total else None


def indicadores(qs):
    """KPIs comuns a várias páginas."""
    kpis = qs.aggregate(
        aihs=AIHS,
        graves=contar(GRAVE),
        obitos=contar(OBITO),
        custo_total=Sum("val_tot"),
        custo_medio=Avg("val_tot"),
        permanencia_media=Avg("dias_perm"),
        idade_media=Avg("def_idade_anos"),
    )
    kpis["pct_graves"] = razao(kpis["graves"], kpis["aihs"])
    kpis["letalidade"] = razao(kpis["obitos"], kpis["aihs"])
    return kpis


def serie_mensal(qs):
    """AIHs, graves, óbitos e custo por competência (ano/mês)."""
    linhas = (
        qs.values("ano_cmpt", "mes_cmpt")
        .annotate(
            aihs=AIHS,
            graves=contar(GRAVE),
            obitos=contar(OBITO),
            custo=Sum("val_tot"),
            custo_medio=Avg("val_tot"),
        )
        .order_by("ano_cmpt", "mes_cmpt")
    )
    return [{**r, "periodo": periodo(r["ano_cmpt"], r["mes_cmpt"])} for r in linhas]


def por_municipio(qs, prefixo):
    """Agrega por município de residência (`res`) ou de internação (`int`), com coordenadas."""
    nome, uf = f"{prefixo}_munnome", f"{prefixo}_sigla_uf"
    lat, lon = f"{prefixo}_latitude", f"{prefixo}_longitude"
    return list(
        qs.exclude(**{f"{lat}__isnull": True})
        .values(nome, uf, lat, lon)
        .annotate(aihs=AIHS, graves=contar(GRAVE), obitos=contar(OBITO), custo=Sum("val_tot"))
        .values("aihs", "graves", "obitos", "custo", municipio=F(nome), uf=F(uf), lat=F(lat), lon=F(lon))
        .order_by("-aihs")
    )


def bolhas(linhas, nome, cor, maximo):
    """Traço de mapa com uma bolha por município: área e tom proporcionais às AIHs."""
    escala = [math.sqrt(r["aihs"] / maximo) for r in linhas]
    return go.Scattermap(
        name=nome,
        lat=[r["lat"] for r in linhas],
        lon=[r["lon"] for r in linhas],
        mode="markers",
        marker=dict(
            size=[5 + 40 * e for e in escala],
            # Mesma escala do tamanho, para a cor acompanhar a bolha.
            color=escala,
            colorscale=ESCALAS_MAPA.get(cor, [[0, cor], [1, cor]]),
            cmin=0,
            cmax=1,
            showscale=False,
            opacity=0.7,
        ),
        customdata=[[r["municipio"], r["aihs"], r["obitos"]] for r in linhas],
        hovertemplate=(
            f"<b>%{{customdata[0]}}</b> · {nome}<br>"
            "%{customdata[1]:,} AIHs · %{customdata[2]:,} óbitos<extra></extra>"
        ),
    )


def mapa(*camadas):
    """Figura de mapa; cada camada é (nome, linhas de `por_municipio`, cor)."""
    maximo = max((r["aihs"] for _, linhas, _ in camadas for r in linhas), default=1)
    fig = go.Figure([bolhas(linhas, nome, cor, maximo) for nome, linhas, cor in camadas])
    # Centro ponderado pelo volume: acompanha os filtros de UF/região.
    pontos = [r for _, linhas, _ in camadas for r in linhas]
    peso = sum(r["aihs"] for r in pontos) or 1
    centro = dict(
        lat=sum(r["lat"] * r["aihs"] for r in pontos) / peso if pontos else -22.2,
        lon=sum(r["lon"] * r["aihs"] for r in pontos) / peso if pontos else -48.5,
    )
    fig.update_layout(
        # Subplot `map` (MapLibre), sucessor do `mapbox` no Plotly; não exige token.
        map=dict(style="carto-positron", center=centro, zoom=5.2),
        showlegend=len(camadas) > 1,
    )
    return fig.to_plotly_json()


class FiltersAPIView(APIView):
    """Opções da barra de filtros (sobre a base inteira, sem filtros aplicados)."""

    def get(self, request):
        qs = AtendimentosDiabetes.objects

        def distintos(campo):
            return list(
                qs.exclude(**{f"{campo}__isnull": True})
                .values_list(campo, flat=True)
                .distinct()
                .order_by(campo)
            )

        faixas = set(qs.annotate(faixa=faixa_etaria()).values_list("faixa", flat=True).distinct())
        return Response(
            {
                "ano": distintos("ano_cmpt"),
                "sexo": distintos("def_sexo"),
                "raca": distintos("def_raca_cor"),
                "regiao": distintos("res_regiao"),
                "uf": distintos("res_sigla_uf"),
                "municipio": distintos("int_munnome"),
                "faixa": [f for f in ORDEM_FAIXAS if f in faixas],
                "cid": distintos("def_diag_princ_cat"),
            }
        )


class TerritoryAPIView(APIView):
    """Página 1 — Distribuição territorial e impacto econômico."""

    def get(self, request):
        qs = queryset_filtrado(request)
        kpis = indicadores(qs)

        serie = serie_mensal(qs)
        fig_custo = go.Figure(
            go.Bar(
                x=[r["periodo"] for r in serie],
                y=[r["custo_medio"] for r in serie],
                marker_color=NAVY,
                customdata=[[r["aihs"], r["custo"]] for r in serie],
                hovertemplate=(
                    "<b>%{x}</b><br>R$ %{y:,.2f} por AIH<br>"
                    "%{customdata[0]:,} AIHs · R$ %{customdata[1]:,.0f}<extra></extra>"
                ),
            )
        )

        residencia = por_municipio(qs, "res")
        total_custo = kpis["custo_total"] or 0
        municipios = [
            {
                "municipio": r["municipio"],
                "uf": r["uf"],
                "aihs": r["aihs"],
                "pct_aihs": razao(r["aihs"], kpis["aihs"]),
                "custo": r["custo"],
                "pct_custo": razao(r["custo"], total_custo),
                "custo_medio": razao(r["custo"], r["aihs"]),
            }
            for r in residencia
        ]

        return Response(
            {
                "kpis": kpis,
                "fig_mapa": mapa(("Residência", residencia, TEAL)),
                "fig_custo_periodo": fig_custo.to_plotly_json(),
                "municipios": municipios,
            }
        )


class OverviewAPIView(APIView):
    """Página 2 — Panorama epidemiológico do Diabetes Mellitus."""

    def get(self, request):
        qs = queryset_filtrado(request)
        serie = serie_mensal(qs)
        x = [r["periodo"] for r in serie]

        fig_evolucao = go.Figure(
            [
                go.Scatter(x=x, y=[r["aihs"] for r in serie], name="AIHs diabetes",
                           mode="lines+markers", line=dict(color=NAVY)),
                go.Scatter(x=x, y=[r["graves"] for r in serie], name="AIHs graves",
                           mode="lines+markers", line=dict(color=BLUE)),
                # Óbitos são ~30x menos que AIHs: eixo próprio à direita.
                go.Scatter(x=x, y=[r["obitos"] for r in serie], name="Óbitos",
                           mode="lines+markers", line=dict(color=CORAL, dash="dot"), yaxis="y2"),
            ]
        )
        fig_evolucao.update_layout(
            hovermode="x unified",
            yaxis=dict(rangemode="tozero"),
            yaxis2=dict(overlaying="y", side="right", rangemode="tozero", showgrid=False),
        )

        atendimento = por_municipio(qs, "int")
        municipios = [
            {
                "municipio": r["municipio"],
                "uf": r["uf"],
                "aihs": r["aihs"],
                "pct_graves": razao(r["graves"], r["aihs"]),
                "obitos": r["obitos"],
                "custo_medio": razao(r["custo"], r["aihs"]),
            }
            for r in atendimento
        ]

        return Response(
            {
                "kpis": indicadores(qs),
                "fig_evolucao": fig_evolucao.to_plotly_json(),
                "fig_mapa": mapa(("Internação", atendimento, PURPLE)),
                "municipios": municipios,
            }
        )


class CriticalityAPIView(APIView):
    """Página 3 — Dispersão e municípios críticos."""

    # Abaixo disso o % de graves oscila demais para comparar municípios.
    MIN_AIHS = 30

    def get(self, request):
        qs = queryset_filtrado(request)
        kpis = indicadores(qs)
        kpis["fora_do_municipio"] = qs.aggregate(n=contar(~Q(res_munnome=F("int_munnome"))))["n"]
        kpis["pct_fora_do_municipio"] = razao(kpis["fora_do_municipio"], kpis["aihs"])

        categorias = list(
            qs.values("def_diag_princ_cat")
            .annotate(aihs=AIHS, custo_medio=Avg("val_tot"))
            .order_by("-aihs")
        )
        codigos = [c["def_diag_princ_cat"][:3] for c in categorias]
        nomes = [c["def_diag_princ_cat"] for c in categorias]
        fig_categorias = go.Figure(
            go.Bar(
                x=codigos,
                y=[c["aihs"] for c in categorias],
                marker_color=NAVY,
                text=[c["aihs"] for c in categorias],
                texttemplate="%{text:,}",
                textposition="outside",
                cliponaxis=False,
                customdata=nomes,
                hovertemplate="<b>%{customdata}</b><br>%{y:,} AIHs<extra></extra>",
            )
        )
        fig_custo_categoria = go.Figure(
            go.Bar(
                x=codigos,
                y=[c["custo_medio"] for c in categorias],
                marker_color=AMBER,
                text=[c["custo_medio"] for c in categorias],
                texttemplate="R$ %{text:,.0f}",
                textposition="outside",
                cliponaxis=False,
                customdata=nomes,
                hovertemplate="<b>%{customdata}</b><br>R$ %{y:,.2f} por AIH<extra></extra>",
            )
        )

        residencia = por_municipio(qs, "res")
        atendimento = por_municipio(qs, "int")

        # Matriz de criticidade: volume x gravidade por município de internação.
        pontos = [r for r in atendimento if r["aihs"] >= self.MIN_AIHS]
        for r in pontos:
            r["pct_graves"] = r["graves"] / r["aihs"]
            r["letalidade"] = r["obitos"] / r["aihs"]
        corte_volume = median([r["aihs"] for r in pontos]) if pontos else 0
        corte_gravidade = median([r["pct_graves"] for r in pontos]) if pontos else 0

        fig_criticidade = go.Figure(
            go.Scatter(
                x=[r["aihs"] for r in pontos],
                y=[r["pct_graves"] * 100 for r in pontos],
                mode="markers",
                marker=dict(
                    size=[8 + 26 * math.sqrt(r["obitos"] / max(p["obitos"] for p in pontos) if r["obitos"] else 0)
                          for r in pontos],
                    color=[r["letalidade"] * 100 for r in pontos],
                    colorscale=[[0, "#fde68a"], [0.5, AMBER], [1, CORAL]],
                    colorbar=dict(title=dict(text="Letalidade %"), thickness=10, len=0.8),
                    line=dict(color="#fff", width=1),
                    opacity=0.85,
                ),
                customdata=[[r["municipio"], r["obitos"], r["letalidade"] * 100] for r in pontos],
                hovertemplate=(
                    "<b>%{customdata[0]}</b><br>%{x:,} AIHs · %{y:.1f}% graves<br>"
                    "%{customdata[1]:,} óbitos (letalidade %{customdata[2]:.1f}%)<extra></extra>"
                ),
            )
        )
        fig_criticidade.update_layout(
            xaxis=dict(type="log", tickvals=[30, 50, 100, 200, 500, 1000, 2000, 5000]),
            yaxis=dict(ticksuffix="%"),
            shapes=[
                dict(type="line", xref="x", yref="paper", x0=corte_volume, x1=corte_volume, y0=0, y1=1,
                     line=dict(color="#98a2b3", dash="dash", width=1)),
                dict(type="line", xref="paper", yref="y", x0=0, x1=1,
                     y0=corte_gravidade * 100, y1=corte_gravidade * 100,
                     line=dict(color="#98a2b3", dash="dash", width=1)),
            ],
            annotations=[
                dict(xref="paper", yref="paper", x=1, y=1, xanchor="right", yanchor="top", showarrow=False,
                     text="Alto volume · alta gravidade", font=dict(size=11, color=CORAL)),
            ],
        )

        criticos = sorted(
            (r for r in pontos if r["aihs"] >= corte_volume and r["pct_graves"] >= corte_gravidade),
            key=lambda r: r["graves"],
            reverse=True,
        )

        return Response(
            {
                "kpis": kpis,
                "fig_categorias": fig_categorias.to_plotly_json(),
                "fig_custo_categoria": fig_custo_categoria.to_plotly_json(),
                "fig_fluxo": mapa(("Residência", residencia, TEAL), ("Internação", atendimento, PURPLE)),
                "fig_criticidade": fig_criticidade.to_plotly_json(),
                "corte": {"aihs": corte_volume, "pct_graves": corte_gravidade, "min_aihs": self.MIN_AIHS},
                "criticos": [
                    {k: r[k] for k in ("municipio", "aihs", "pct_graves", "obitos", "letalidade")}
                    for r in criticos[:10]
                ],
            }
        )


class GeneralAPIView(APIView):
    """Página 4 — Panorama geral das AIHs (volume, sexo, período e faixa etária)."""

    def get(self, request):
        qs = queryset_filtrado(request)
        kpis = indicadores(qs)

        por_sexo = {r["def_sexo"]: r["aihs"] for r in qs.values("def_sexo").annotate(aihs=AIHS)}
        kpis["sexo"] = {s: {"aihs": n, "pct": razao(n, kpis["aihs"])} for s, n in por_sexo.items()}

        serie = serie_mensal(qs)
        dias = sum(calendar.monthrange(r["ano_cmpt"], r["mes_cmpt"])[1] for r in serie)
        kpis["media_diaria"] = razao(kpis["aihs"], dias)
        pico = max(serie, key=lambda r: r["aihs"], default=None)
        kpis["pico"] = {"periodo": pico["periodo"], "aihs": pico["aihs"]} if pico else None

        fig_sexo = go.Figure(
            go.Pie(
                labels=list(por_sexo),
                values=list(por_sexo.values()),
                marker=dict(colors=[SEXO_CORES.get(s, "#98a2b3") for s in por_sexo]),
                sort=False,
                hovertemplate="<b>%{label}</b><br>%{value:,} AIHs · %{percent}<extra></extra>",
            )
        )

        fig_evolucao = go.Figure(
            go.Bar(
                x=[r["periodo"] for r in serie],
                y=[r["aihs"] for r in serie],
                marker_color=[BLUE if r is pico else NAVY for r in serie],
                text=[r["aihs"] for r in serie],
                texttemplate="%{text:,}",
                textposition="outside",
                cliponaxis=False,
                hovertemplate="<b>%{x}</b><br>%{y:,} AIHs<extra></extra>",
            )
        )

        faixas = {
            r["faixa"]: r["aihs"]
            for r in qs.annotate(faixa=faixa_etaria()).values("faixa").annotate(aihs=AIHS)
        }
        ranking = sorted(faixas.items(), key=lambda item: item[1], reverse=True)

        return Response(
            {
                "kpis": kpis,
                "fig_sexo": fig_sexo.to_plotly_json(),
                "fig_evolucao": fig_evolucao.to_plotly_json(),
                "ranking_faixas": [{"faixa": f, "aihs": n} for f, n in ranking[:10]],
            }
        )


class DemographicAPIView(APIView):
    """Página 5 — Perfil demográfico e mortalidade."""

    def get(self, request):
        qs = queryset_filtrado(request)
        kpis = indicadores(qs)

        kpis["sexo"] = {
            r["def_sexo"]: {
                "aihs": r["aihs"],
                "obitos": r["obitos"],
                "pct_graves": razao(r["graves"], r["aihs"]),
                "letalidade": razao(r["obitos"], r["aihs"]),
            }
            for r in qs.values("def_sexo")
            .annotate(aihs=AIHS, graves=contar(GRAVE), obitos=contar(OBITO))
            .order_by("def_sexo")
        }

        # Pirâmide etária: feminino à esquerda (valores negativos), masculino à direita.
        piramide = (
            qs.annotate(faixa=faixa_etaria())
            .values("faixa", "def_sexo")
            .annotate(aihs=AIHS)
        )
        contagem = {(r["faixa"], r["def_sexo"]): r["aihs"] for r in piramide}
        faixas = [f for f in ORDEM_FAIXAS if any(k[0] == f for k in contagem)]
        fig_piramide = go.Figure(
            [
                go.Bar(
                    name=sexo,
                    y=faixas,
                    x=[contagem.get((f, sexo), 0) * sinal for f in faixas],
                    orientation="h",
                    marker_color=SEXO_CORES[sexo],
                    customdata=[contagem.get((f, sexo), 0) for f in faixas],
                    hovertemplate=f"<b>%{{y}}</b> · {sexo}<br>%{{customdata:,}} AIHs<extra></extra>",
                )
                for sexo, sinal in (("Feminino", -1), ("Masculino", 1))
            ]
        )
        fig_piramide.update_layout(barmode="relative", bargap=0.15)
        # Rótulos do eixo x sem o sinal negativo do lado feminino.
        maximo = max(contagem.values(), default=0)
        if maximo:
            passo = 10 ** math.floor(math.log10(maximo))
            ticks = [i * passo for i in range(-int(maximo // passo), int(maximo // passo) + 1)]
            fig_piramide.update_xaxes(tickvals=ticks, ticktext=[f"{abs(t):,}".replace(",", ".") for t in ticks])

        racas = list(
            qs.filter(OBITO).values("def_raca_cor").annotate(obitos=AIHS).order_by("obitos")
        )
        total_obitos = kpis["obitos"] or 1
        fig_obitos_raca = go.Figure(
            go.Bar(
                y=[r["def_raca_cor"] for r in racas],
                x=[r["obitos"] for r in racas],
                orientation="h",
                marker_color=PURPLE,
                text=[f"{r['obitos']} · {r['obitos'] / total_obitos:.1%}".replace(".", ",") for r in racas],
                textposition="outside",
                cliponaxis=False,
                hovertemplate="<b>%{y}</b><br>%{x:,} óbitos<extra></extra>",
            )
        )
        # Folga à direita para o rótulo da maior barra não ser cortado.
        fig_obitos_raca.update_xaxes(range=[0, max((r["obitos"] for r in racas), default=1) * 1.18])

        return Response(
            {
                "kpis": kpis,
                "fig_piramide": fig_piramide.to_plotly_json(),
                "fig_obitos_raca": fig_obitos_raca.to_plotly_json(),
            }
        )


def complicacao_da_subcategoria(subcat):
    """"E10.1 C/cetoacidose" -> "C/cetoacidose"; sem 4º dígito -> "Sem subcategoria"."""
    return subcat.split(" ", 1)[1] if subcat else "Sem subcategoria"


class ComplicationsAPIView(APIView):
    """Página 6 — Complicações clínicas e estratificação por CID-10."""

    def get(self, request):
        qs = queryset_filtrado(request)
        linhas = list(
            qs.values("def_diag_princ_cat", "def_diag_princ_subcat")
            .annotate(aihs=AIHS)
            .order_by("def_diag_princ_cat", "def_diag_princ_subcat")
        )

        categorias = {}
        for r in linhas:
            categorias[r["def_diag_princ_cat"]] = categorias.get(r["def_diag_princ_cat"], 0) + r["aihs"]
        total = sum(categorias.values())

        raiz = "AIHs diabetes"
        ids, labels, parents, values = [raiz], [raiz], [""], [total]
        for cat, n in categorias.items():
            ids.append(cat)
            labels.append(cat[:3])
            parents.append(raiz)
            values.append(n)
        for r in linhas:
            sub = r["def_diag_princ_subcat"] or f"{r['def_diag_princ_cat'][:3]} sem subcategoria"
            ids.append(f"{r['def_diag_princ_cat']}/{sub}")
            labels.append(sub)
            parents.append(r["def_diag_princ_cat"])
            values.append(r["aihs"])

        fig_hierarquia = go.Figure(
            go.Sunburst(
                ids=ids,
                labels=labels,
                parents=parents,
                values=values,
                branchvalues="total",
                insidetextorientation="radial",
                hovertemplate="<b>%{label}</b><br>%{value:,} AIHs · %{percentRoot:.1%} do total<extra></extra>",
            )
        )
        fig_hierarquia.update_layout(
            sunburstcolorway=[NAVY, TEAL, AMBER, CORAL, PURPLE, BLUE],
            extendsunburstcolors=True,
        )

        # Matriz tipo de diabetes x complicação, em % das AIHs de cada tipo.
        complicacoes = []
        celulas = {}
        for r in linhas:
            comp = complicacao_da_subcategoria(r["def_diag_princ_subcat"])
            if comp not in complicacoes:
                complicacoes.append(comp)
            chave = (r["def_diag_princ_cat"], comp)
            celulas[chave] = celulas.get(chave, 0) + r["aihs"]
        complicacoes.sort(key=lambda c: -sum(n for (_, cc), n in celulas.items() if cc == c))
        cats = sorted(categorias, key=lambda c: -categorias[c])

        z = [[100 * celulas.get((cat, comp), 0) / categorias[cat] for comp in complicacoes] for cat in cats]
        fig_matriz = go.Figure(
            go.Heatmap(
                x=complicacoes,
                y=[c[:3] for c in cats],
                z=z,
                customdata=[[[celulas.get((cat, comp), 0), cat] for comp in complicacoes] for cat in cats],
                text=[[f"{v:.0f}%" if v >= 1 else "" for v in linha] for linha in z],
                texttemplate="%{text}",
                colorscale=[[0, "#f5f7fb"], [0.4, "#93c5fd"], [1, NAVY]],
                showscale=False,
                xgap=2,
                ygap=2,
                hovertemplate=(
                    "<b>%{customdata[1]}</b><br>%{x}: %{customdata[0]:,} AIHs "
                    "(%{z:.1f}% do tipo)<extra></extra>"
                ),
            )
        )
        fig_matriz.update_layout(yaxis=dict(autorange="reversed"), xaxis=dict(tickangle=-30))

        return Response(
            {
                "total": total,
                "categorias": [{"categoria": c, "aihs": categorias[c]} for c in cats],
                "fig_hierarquia": fig_hierarquia.to_plotly_json(),
                "fig_matriz": fig_matriz.to_plotly_json(),
            }
        )


class AgePatternAPIView(APIView):
    """Página 7 — Padrão etário: diagnóstico principal x faixa etária."""

    def get(self, request):
        qs = queryset_filtrado(request)
        linhas = (
            qs.annotate(faixa=faixa_etaria())
            .values("def_diag_princ_cat", "def_diag_princ_subcat", "faixa")
            .annotate(aihs=AIHS)
        )

        matriz = {}
        faixas_presentes = set()
        for r in linhas:
            diag = r["def_diag_princ_subcat"] or f"{r['def_diag_princ_cat'][:3]} (sem subcategoria)"
            item = matriz.setdefault(diag, {"diagnostico": diag, "categoria": r["def_diag_princ_cat"], "por_faixa": {}})
            item["por_faixa"][r["faixa"]] = r["aihs"]
            faixas_presentes.add(r["faixa"])

        faixas = [f for f in ORDEM_FAIXAS if f in faixas_presentes]
        diagnosticos = [
            {
                "diagnostico": item["diagnostico"],
                "categoria": item["categoria"],
                "valores": [item["por_faixa"].get(f, 0) for f in faixas],
                "total": sum(item["por_faixa"].values()),
            }
            for item in matriz.values()
        ]
        diagnosticos.sort(key=lambda d: -d["total"])

        return Response(
            {
                "faixas": faixas,
                "diagnosticos": diagnosticos,
                "totais": [sum(d["valores"][i] for d in diagnosticos) for i in range(len(faixas))],
                "total": sum(d["total"] for d in diagnosticos),
            }
        )


class MortalityAPIView(APIView):
    """Página 8 — Mortalidade: procedimentos e desfechos."""

    def get(self, request):
        qs = queryset_filtrado(request)
        kpis = indicadores(qs)
        obitos = qs.filter(OBITO)
        kpis.update(
            obitos.aggregate(
                permanencia_obitos=Avg("dias_perm"),
                idade_obitos=Avg("def_idade_anos"),
            )
        )

        por_solicitado = {
            r["def_procedimento_solicitado"]: r
            for r in qs.values("def_procedimento_solicitado").annotate(aihs=AIHS, obitos=contar(OBITO))
        }
        # Procedimento realizado mais frequente entre os óbitos de cada procedimento solicitado.
        realizado = {}
        for r in (
            obitos.values("def_procedimento_solicitado", "def_procedimento_realizado")
            .annotate(n=AIHS)
            .order_by("-n")
        ):
            realizado.setdefault(r["def_procedimento_solicitado"], (r["def_procedimento_realizado"], r["n"]))

        procedimentos = sorted(
            (
                {
                    "solicitado": nome,
                    "obitos": r["obitos"],
                    "aihs": r["aihs"],
                    "letalidade": razao(r["obitos"], r["aihs"]),
                    "realizado": realizado[nome][0],
                    "obitos_realizado": realizado[nome][1],
                }
                for nome, r in por_solicitado.items()
                if r["obitos"]
            ),
            key=lambda p: -p["obitos"],
        )

        por_complicacao = list(
            qs.values("tipo_complicacao")
            .annotate(aihs=AIHS, obitos=contar(OBITO))
            .order_by("-obitos")
        )
        fig_complicacao = go.Figure(
            go.Bar(
                x=[r["tipo_complicacao"].replace(" registrada", "") for r in por_complicacao],
                y=[100 * r["obitos"] / r["aihs"] for r in por_complicacao],
                marker_color=[
                    CORAL if r["tipo_complicacao"] in COMPLICACOES_GRAVES else "#98a2b3"
                    for r in por_complicacao
                ],
                customdata=[[r["obitos"], r["aihs"]] for r in por_complicacao],
                texttemplate="%{y:.1f}%",
                textposition="outside",
                cliponaxis=False,
                hovertemplate=(
                    "<b>%{x}</b><br>Letalidade %{y:.1f}%<br>"
                    "%{customdata[0]:,} óbitos em %{customdata[1]:,} AIHs<extra></extra>"
                ),
            )
        )

        return Response(
            {
                "kpis": kpis,
                "procedimentos": procedimentos,
                "fig_letalidade_complicacao": fig_complicacao.to_plotly_json(),
            }
        )
