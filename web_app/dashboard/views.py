from django.shortcuts import render, redirect
from django.db.models import Count
from .models import AtendimentosDiabetes


# ---------------------------------------------------------------------------
# Área pública
# ---------------------------------------------------------------------------

def landing(request):
    """Página institucional/pública do QuadLab (protótipo)."""
    return render(request, 'dashboard/public/landing.html')


def login_view(request):
    """Tela de acesso à área de análise.

    TODO: implementar autenticação real (django.contrib.auth) quando o
    controle de usuários do projeto for definido. Por enquanto, qualquer
    envio do formulário libera o acesso ao painel (protótipo).
    """
    if request.method == 'POST':
        return redirect('painel_overview')
    return render(request, 'dashboard/public/login.html')


# ---------------------------------------------------------------------------
# Área do painel (protótipo — conteúdo ainda estático, sem dados reais)
# ---------------------------------------------------------------------------

def painel_overview(request):
    return render(request, 'dashboard/painel/overview.html', {'active_page': 'overview'})


def painel_territorio(request):
    return render(request, 'dashboard/painel/territorio.html', {'active_page': 'territorio'})


def painel_demografico(request):
    return render(request, 'dashboard/painel/demografico.html', {'active_page': 'demografico'})


def painel_mortalidade(request):
    return render(request, 'dashboard/painel/mortalidade.html', {'active_page': 'mortalidade'})


def painel_complicacoes(request):
    return render(request, 'dashboard/painel/complicacoes.html', {'active_page': 'complicacoes'})


def painel_evolucao(request):
    return render(request, 'dashboard/painel/evolucao.html', {'active_page': 'evolucao'})


def painel_economico(request):
    return render(request, 'dashboard/painel/economico.html', {'active_page': 'economico'})


def painel_dados_reais(request):
    """Protótipo com dados reais, gerados a partir do model AtendimentosDiabetes."""
    complicacoes = (
        AtendimentosDiabetes.objects
        .values('tipo_complicacao')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    labels = [item['tipo_complicacao'] for item in complicacoes]
    valores = [item['total'] for item in complicacoes]

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
        'active_page': 'complicacoes',
        'labels': labels,
        'valores': valores,
        'meses': meses,
        'series_mensais': series_mensais,
    }
    return render(request, 'dashboard/painel/dados_reais.html', contexto)
