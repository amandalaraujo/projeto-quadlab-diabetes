from django.urls import path
from . import api_views

urlpatterns = [
    path("filters/", api_views.FiltersAPIView.as_view(), name="api-filters"),
    path("territory/", api_views.TerritoryAPIView.as_view(), name="api-territory"),
    path("overview/", api_views.OverviewAPIView.as_view(), name="api-overview"),
    path("criticality/", api_views.CriticalityAPIView.as_view(), name="api-criticality"),
    path("general/", api_views.GeneralAPIView.as_view(), name="api-general"),
    path("demographic/", api_views.DemographicAPIView.as_view(), name="api-demographic"),
    path("complications/", api_views.ComplicationsAPIView.as_view(), name="api-complications"),
    path("age-pattern/", api_views.AgePatternAPIView.as_view(), name="api-age-pattern"),
    path("mortality/", api_views.MortalityAPIView.as_view(), name="api-mortality"),
]
