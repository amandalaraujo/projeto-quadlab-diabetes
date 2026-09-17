from django.shortcuts import render
from django.db.models import Count
from .models import AtendimentosDiabetes

def overview(request):
    # Lógica de consulta ao Neon mantida
    complicacoes = (
        AtendimentosDiabetes.objects
        .values('tipo_complicacao')
        .annotate(total=Count('*'))
        .order_by('-total')
    )
    labels = [item['tipo_complicacao'] for item in complicacoes]
    valores = [item['total'] for item in complicacoes]

    dados_mes = (
        AtendimentosDiabetes.objects
        .exclude(tipo_complicacao='Sem complicação grave registrada')
        .values('mes_cmpt', 'tipo_complicacao')
        .annotate(total=Count('*'))
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
        'page_key': 'overview',
        'labels': labels,
        'valores': valores,
        'meses': meses,
        'series_mensais': series_mensais,
    }

    return render(request, 'overview.html', contexto)

def territory(request):
    return render(request, 'territorio.html', {'page_key': 'territory'})

def demographic(request):
    return render(request, 'demografia.html', {'page_key': 'demographic'})

def mortality(request):
    return render(request, 'mortalidade.html', {'page_key': 'mortality'})

def complications(request):
    return render(request, 'complicacoes.html', {'page_key': 'complications'})

def evolution(request):
    return render(request, 'evolucao.html', {'page_key': 'evolution'})

def economic(request):
    return render(request, 'economico.html', {'page_key': 'economic'})