"""
Endpoints da API do QuadLab.

Padrão usado em todos os endpoints:
1. Consulta agregada via Django ORM (nunca carregamos linha a linha em Python).
2. Montagem da figura com plotly.graph_objects.
3. Devolução via `fig.to_plotly_json()` — um dict só com `data` e `layout`,
   pronto para o componente <Plot /> do react-plotly.js no front.

Para criar um endpoint novo (ex: mortalidade, complicações, evolução):
copie um dos métodos abaixo, troque o `.values(...)` / `.annotate(...)`
e o tipo de traço do Plotly (go.Bar, go.Scatter, go.Pie...).
"""

import plotly.graph_objects as go
from django.db.models import Count, Sum, Avg, Q
from rest_framework.views import APIView
from rest_framework.response import Response

from ..models import AtendimentosDiabetes

COLORS = ["#12b8a6", "#f04461", "#f5a623", "#4f7cff", "#8a63d2", "#2fb8e6"]


class OverviewAPIView(APIView):
    """KPIs do topo + gráfico de complicações + evolução mensal."""

    def get(self, request):
        qs = AtendimentosDiabetes.objects

        kpis = qs.aggregate(
            total_aihs=Count("n_aih"),
            obitos=Count("n_aih", filter=Q(morte=1)),
            custo_total=Sum("val_tot"),
            custo_medio=Avg("val_tot"),
            permanencia_media=Avg("dias_perm"),
        )

        complicacoes = (
            qs.values("tipo_complicacao")
            .annotate(total=Count("*"))
            .order_by("-total")
        )
        fig_complicacoes = go.Figure(
            data=[
                go.Bar(
                    x=[c["tipo_complicacao"] for c in complicacoes],
                    y=[c["total"] for c in complicacoes],
                    marker_color=COLORS,
                )
            ]
        )
        fig_complicacoes.update_layout(
            margin=dict(l=30, r=10, t=10, b=30),
            showlegend=False,
        )

        dados_mes = (
            qs.values("mes_cmpt", "tipo_complicacao")
            .annotate(total=Count("*"))
            .order_by("mes_cmpt")
        )
        meses = sorted({d["mes_cmpt"] for d in dados_mes})
        tipos = sorted({d["tipo_complicacao"] for d in dados_mes})

        fig_evolucao = go.Figure()
        for i, tipo in enumerate(tipos):
            fig_evolucao.add_trace(
                go.Scatter(
                    x=meses,
                    y=[
                        next(
                            (d["total"] for d in dados_mes if d["mes_cmpt"] == m and d["tipo_complicacao"] == tipo),
                            0,
                        )
                        for m in meses
                    ],
                    mode="lines+markers",
                    name=tipo,
                    line=dict(color=COLORS[i % len(COLORS)]),
                )
            )
        fig_evolucao.update_layout(margin=dict(l=30, r=10, t=10, b=30))

        return Response(
            {
                "kpis": kpis,
                "fig_complicacoes": fig_complicacoes.to_plotly_json(),
                "fig_evolucao": fig_evolucao.to_plotly_json(),
            }
        )


class TerritoryAPIView(APIView):
    """Onde estão? — internações por UF e concentração por município."""

    def get(self, request):
        # Gráfico existente: quantidade de registros por UF.
        dados_por_uf = (
            AtendimentosDiabetes.objects
            .values("uf_zi")
            .annotate(total=Count("*"))
            .order_by("-total")
        )

        fig_por_uf = go.Figure(
            data=[
                go.Bar(
                    x=[str(item["uf_zi"]) for item in dados_por_uf],
                    y=[item["total"] for item in dados_por_uf],
                    marker_color="#12b8a6",
                )
            ]
        )

        fig_por_uf.update_layout(
            margin=dict(l=30, r=10, t=10, b=30),
            showlegend=False,
        )

        # Funcionalidade integrada do protótipo:
        # mapa de calor utilizando município e coordenadas de residência.
        dados_mapa = (
            AtendimentosDiabetes.objects
            .exclude(res_latitude__isnull=True)
            .exclude(res_longitude__isnull=True)
            .values(
                "res_munnome",
                "res_latitude",
                "res_longitude",
            )
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("-total")
        )

        fig_mapa_calor = go.Figure(
            data=[
                go.Densitymapbox(
                    lat=[float(item["res_latitude"]) for item in dados_mapa],
                    lon=[float(item["res_longitude"]) for item in dados_mapa],
                    z=[item["total"] for item in dados_mapa],
                    customdata=[item["res_munnome"] for item in dados_mapa],
                    radius=22,
                    colorscale="YlOrRd",
                    hovertemplate=(
                        "<b>%{customdata}</b><br>"
                        "%{z} AIHs"
                        "<extra></extra>"
                    ),
                )
            ]
        )

        fig_mapa_calor.update_layout(
            mapbox_style="open-street-map",
            mapbox=dict(
                center=dict(lat=-22.2, lon=-48.5),
                zoom=5,
            ),
            margin=dict(l=10, r=10, t=10, b=10),
            showlegend=False,
        )

        return Response({
            "fig_por_uf": fig_por_uf.to_plotly_json(),
            "fig_mapa_calor": fig_mapa_calor.to_plotly_json(),
        })


class DemographicAPIView(APIView):
    """'Quem são?' — distribuição por sexo e faixa etária."""

    def get(self, request):
        qs = AtendimentosDiabetes.objects

        por_sexo = qs.values("sexo").annotate(total=Count("*")).order_by("sexo")
        fig_sexo = go.Figure(
            data=[
                go.Pie(
                    labels=["Masculino" if r["sexo"] == 1 else "Feminino" if r["sexo"] == 3 else "Não informado"
                            for r in por_sexo],
                    values=[r["total"] for r in por_sexo],
                )
            ]
        )
        fig_sexo.update_layout(margin=dict(l=10, r=10, t=10, b=10))

        por_idade = (
            qs.values("idade").annotate(total=Count("*")).order_by("idade")
        )
        fig_idade = go.Figure(
            data=[
                go.Bar(
                    x=[r["idade"] for r in por_idade],
                    y=[r["total"] for r in por_idade],
                    marker_color="#4f7cff",
                )
            ]
        )
        fig_idade.update_layout(margin=dict(l=30, r=10, t=10, b=30), showlegend=False)

        return Response(
            {
                "fig_sexo": fig_sexo.to_plotly_json(),
                "fig_idade": fig_idade.to_plotly_json(),
            }
        )


class EconomicAPIView(APIView):
    """Impacto econômico — custo total por mês."""

    def get(self, request):
        qs = (
            AtendimentosDiabetes.objects.values("mes_cmpt")
            .annotate(custo=Sum("val_tot"))
            .order_by("mes_cmpt")
        )
        fig = go.Figure(
            data=[
                go.Bar(
                    x=[r["mes_cmpt"] for r in qs],
                    y=[r["custo"] for r in qs],
                    marker_color="#f5a623",
                )
            ]
        )
        fig.update_layout(margin=dict(l=30, r=10, t=10, b=30), showlegend=False)
        return Response({"fig_custo_mensal": fig.to_plotly_json()})

class EvolutionAPIView(APIView):
    """Evolução das AIHs — série temporal mensal das internações."""

    def get(self, request):
        dados_mensais = (
            AtendimentosDiabetes.objects
            .values("ano_cmpt", "mes_cmpt")
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("ano_cmpt", "mes_cmpt")
        )

        periodos = [
            f'{item["mes_cmpt"]:02d}/{item["ano_cmpt"]}'
            for item in dados_mensais
        ]

        totais = [
            item["total"]
            for item in dados_mensais
        ]

        fig_evolucao = go.Figure(
            data=[
                go.Scatter(
                    x=periodos,
                    y=totais,
                    mode="lines+markers",
                    name="AIHs",
                    line=dict(color="#12b8a6"),
                )
            ]
        )

        fig_evolucao.update_layout(
            xaxis_title="Mês/Ano",
            yaxis_title="Número de AIHs",
            margin=dict(l=50, r=20, t=20, b=50),
            showlegend=False,
        )

        return Response({
            "fig_evolucao": fig_evolucao.to_plotly_json(),
        })

class ComplicationsAPIView(APIView):
    """Complicações e CID-10 — distribuição das complicações e principais diagnósticos."""

    def get(self, request):
        # Distribuição das AIHs por tipo de complicação.
        dados_complicacoes = (
            AtendimentosDiabetes.objects
            .exclude(tipo_complicacao__isnull=True)
            .exclude(tipo_complicacao="")
            .values("tipo_complicacao")
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("-total")
        )

        fig_complicacoes = go.Figure(
            data=[
                go.Bar(
                    x=[item["tipo_complicacao"] for item in dados_complicacoes],
                    y=[item["total"] for item in dados_complicacoes],
                    marker_color="#12b8a6",
                )
            ]
        )

        fig_complicacoes.update_layout(
            xaxis_title="Tipo de complicação",
            yaxis_title="Número de AIHs",
            margin=dict(l=50, r=20, t=20, b=80),
            showlegend=False,
        )

        # Principais diagnósticos CID-10 registrados nas AIHs.
        dados_cid10 = (
            AtendimentosDiabetes.objects
            .exclude(diag_princ__isnull=True)
            .exclude(diag_princ="")
            .values("diag_princ")
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("-total")[:10]
        )

        fig_cid10 = go.Figure(
            data=[
                go.Bar(
                    x=[item["total"] for item in dados_cid10],
                    y=[item["diag_princ"] for item in dados_cid10],
                    orientation="h",
                    marker_color="#4f7cff",
                )
            ]
        )

        fig_cid10.update_layout(
            xaxis_title="Número de AIHs",
            yaxis_title="CID-10",
            yaxis=dict(autorange="reversed"),
            margin=dict(l=70, r=20, t=20, b=50),
            showlegend=False,
        )

        return Response({
            "fig_complicacoes": fig_complicacoes.to_plotly_json(),
            "fig_cid10": fig_cid10.to_plotly_json(),
        })

class MortalityAPIView(APIView):
    """Mortalidade — distribuição dos óbitos por complicação e UF."""

    def get(self, request):
        # Considera somente internações que evoluíram para óbito.
        obitos = AtendimentosDiabetes.objects.filter(morte=1)

        # Óbitos por tipo de complicação.
        obitos_por_complicacao = (
            obitos
            .exclude(tipo_complicacao__isnull=True)
            .exclude(tipo_complicacao="")
            .values("tipo_complicacao")
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("-total")
        )

        fig_por_complicacao = go.Figure(
            data=[
                go.Bar(
                    x=[
                        item["tipo_complicacao"]
                        for item in obitos_por_complicacao
                    ],
                    y=[
                        item["total"]
                        for item in obitos_por_complicacao
                    ],
                    marker_color="#f04461",
                )
            ]
        )

        fig_por_complicacao.update_layout(
            xaxis_title="Tipo de complicação",
            yaxis_title="Número de óbitos",
            margin=dict(l=50, r=20, t=20, b=80),
            showlegend=False,
        )

        # Óbitos por UF de residência.
        obitos_por_uf = (
            obitos
            .exclude(res_sigla_uf__isnull=True)
            .exclude(res_sigla_uf="")
            .values("res_sigla_uf")
            .annotate(total=Count("n_aih", distinct=True))
            .order_by("-total")
        )

        fig_por_uf = go.Figure(
            data=[
                go.Bar(
                    x=[
                        item["res_sigla_uf"]
                        for item in obitos_por_uf
                    ],
                    y=[
                        item["total"]
                        for item in obitos_por_uf
                    ],
                    marker_color="#4f7cff",
                )
            ]
        )

        fig_por_uf.update_layout(
            xaxis_title="UF",
            yaxis_title="Número de óbitos",
            margin=dict(l=50, r=20, t=20, b=50),
            showlegend=False,
        )

        return Response({
            "fig_mortalidade_complicacao":
                fig_por_complicacao.to_plotly_json(),
            "fig_mortalidade_uf":
                fig_por_uf.to_plotly_json(),
        })


# TODO (mesmo padrão dos acima): MortalityAPIView (filtrar morte=1, cruzar
# com tipo_complicacao/UF), ComplicationsAPIView (agrupar por diag_princ /
# CID-10) e EvolutionAPIView (série temporal ano_cmpt+mes_cmpt de AIHs).
# Ver a documentação do projeto no Notion para as métricas exatas que
# vocês já definiram no Power BI.
