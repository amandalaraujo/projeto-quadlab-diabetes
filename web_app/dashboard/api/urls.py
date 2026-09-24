from django.urls import path
from . import api_views

urlpatterns = [
    path("overview/", api_views.OverviewAPIView.as_view(), name="api-overview"),
    path("territory/", api_views.TerritoryAPIView.as_view(), name="api-territory"),
    path("demographic/", api_views.DemographicAPIView.as_view(), name="api-demographic"),
    path("economic/", api_views.EconomicAPIView.as_view(), name="api-economic"),
    # path("mortality/", api_views.MortalityAPIView.as_view(), name="api-mortality"),
    # path("complications/", api_views.ComplicationsAPIView.as_view(), name="api-complications"),
    # path("evolution/", api_views.EvolutionAPIView.as_view(), name="api-evolution"),
]
