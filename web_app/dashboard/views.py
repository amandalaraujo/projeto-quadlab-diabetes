from django.shortcuts import render
from django.db.models import Count
from .models import AtendimentosDiabetes

# Funcão 'home' para renderizar os dois gráficos na mesma página!
# ******* Depois refatorar para separar em funções diferentes, caso necessário *******
def home(request):
    # --- Gráfico 1: distribuição geral de complicações ---
    complicacoes = (
        AtendimentosDiabetes.objects
        .values('tipo_complicacao')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    labels = [item['tipo_complicacao'] for item in complicacoes]
    valores = [item['total'] for item in complicacoes]

    # --- Gráfico 2: evolução mensal por tipo de complicação ---
    dados_mes = (
        AtendimentosDiabetes.objects
        .exclude(tipo_complicacao='Sem complicação grave registrada')
        .values('mes_cmpt', 'tipo_complicacao')
        .annotate(total=Count('id'))
        .order_by('mes_cmpt')
    )

    meses = sorted(set(d['mes_cmpt'] for d in dados_mes))
    tipos = sorted(set(d['tipo_complicacao'] for d in dados_mes))

    series_mensais = {}
    for tipo in tipos:
        series_mensais[tipo] = [
            next((d['total'] for d in dados_mes if d['mes_cmpt'] == mes and d['tipo_complicacao'] == tipo), 0)
            for mes in meses
        ]

    contexto = {
        'labels': labels,
        'valores': valores,
        'meses': meses,
        'series_mensais': series_mensais,
    }
    return render(request, 'dashboard/home.html', contexto)