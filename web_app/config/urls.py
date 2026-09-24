from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API consumida pelo front-end em React (frontend/)
    path('api/', include('dashboard.api.urls')),
    # Views antigas em Django templates — mantidas durante a migração para
    # o React. Podem ser removidas (junto com dashboard/urls.py e
    # dashboard/templates/) quando o front novo cobrir todas as páginas.
    path('', RedirectView.as_view(url='/dashboard/overview/', permanent=False)),
    path('dashboard/', include('dashboard.urls')),
]