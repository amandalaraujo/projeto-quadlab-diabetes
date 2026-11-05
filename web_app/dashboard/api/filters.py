"""
Filtros globais do dashboard (a barra de filtros no topo das páginas).

O front manda cada filtro como query param repetido, um valor por item
selecionado: `?ano=2025&uf=SP&uf=MG&faixa=60-64a`. Toda view chama
`queryset_filtrado(request)` e trabalha em cima do resultado, então um
filtro novo só precisa entrar em `FILTROS` (e na resposta de
`FiltersAPIView`, para aparecer na barra).
"""

from django.db.models import Case, CharField, Q, Value, When

from ..models import AtendimentosDiabetes

# Faixas etárias de 5 anos: (rótulo, idade mínima, idade máxima exclusiva).
FAIXAS_ETARIAS = [
    ("<1a", 0, 1),
    ("1-4a", 1, 5),
    ("5-9a", 5, 10),
    *[(f"{i}-{i + 4}a", i, i + 5) for i in range(10, 80, 5)],
    ("80+a", 80, 200),
]
ORDEM_FAIXAS = [rotulo for rotulo, _, _ in FAIXAS_ETARIAS]

# Complicações que o projeto classifica como graves (coluna TIPO_COMPLICACAO do ETL).
COMPLICACOES_GRAVES = ["Cetoacidose", "Amputação", "Coma Diabético"]
GRAVE = Q(tipo_complicacao__in=COMPLICACOES_GRAVES)
OBITO = Q(morte=1)


def faixa_etaria():
    """Expressão SQL que devolve o rótulo da faixa etária de cada AIH."""
    return Case(
        *[
            When(def_idade_anos__gte=minimo, def_idade_anos__lt=maximo, then=Value(rotulo))
            for rotulo, minimo, maximo in FAIXAS_ETARIAS
        ],
        default=Value("Sem idade"),
        output_field=CharField(),
    )


def _filtro_faixas(rotulos):
    q = Q()
    for rotulo, minimo, maximo in FAIXAS_ETARIAS:
        if rotulo in rotulos:
            q |= Q(def_idade_anos__gte=minimo, def_idade_anos__lt=maximo)
    return q


# query param -> função que recebe a lista de valores e devolve o Q do filtro.
FILTROS = {
    "ano": lambda v: Q(ano_cmpt__in=[int(x) for x in v if x.isdigit()]),
    "sexo": lambda v: Q(def_sexo__in=v),
    # Filtro "Etnia" da documentação: a coluna ETNIA do SIH vem quase toda "NÃO
    # INFORMADO", então o filtro usa raça/cor.
    "raca": lambda v: Q(def_raca_cor__in=v),
    "regiao": lambda v: Q(res_regiao__in=v),
    "uf": lambda v: Q(res_sigla_uf__in=v),
    "municipio": lambda v: Q(int_munnome__in=v),
    "faixa": _filtro_faixas,
    "cid": lambda v: Q(def_diag_princ_cat__in=v),
}


def queryset_filtrado(request):
    qs = AtendimentosDiabetes.objects.all()
    for param, construir in FILTROS.items():
        valores = [v for v in request.query_params.getlist(param) if v]
        if valores:
            qs = qs.filter(construir(valores))
    return qs
