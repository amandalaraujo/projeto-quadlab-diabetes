from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.overview, name='overview'),
    path('territorio/', views.territory, name='territory'),
    path('demografia/', views.demographic, name='demographic'),
    path('mortalidade/', views.mortality, name='mortality'),
    path('complicacoes/', views.complications, name='complications'),
    path('evolucao/', views.evolution, name='evolution'),
    path('economico/', views.economic, name='economic'),
]