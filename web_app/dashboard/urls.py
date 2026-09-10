from django.urls import path
from . import views

urlpatterns = [
    # Área pública
    path('', views.landing, name='landing'),
    path('entrar/', views.login_view, name='login'),

    # Área do painel (protótipo)
    path('painel/', views.painel_overview, name='painel_overview'),
    path('painel/territorio/', views.painel_territorio, name='painel_territorio'),
    path('painel/demografico/', views.painel_demografico, name='painel_demografico'),
    path('painel/mortalidade/', views.painel_mortalidade, name='painel_mortalidade'),
    path('painel/complicacoes/', views.painel_complicacoes, name='painel_complicacoes'),
    path('painel/evolucao/', views.painel_evolucao, name='painel_evolucao'),
    path('painel/economico/', views.painel_economico, name='painel_economico'),
    path('painel/dados-reais/', views.painel_dados_reais, name='painel_dados_reais'),
]
