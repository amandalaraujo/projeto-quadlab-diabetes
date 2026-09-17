from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Redireciona a raiz (http://localhost:8000/) direto para o dashboard
    path('', RedirectView.as_view(url='/dashboard/overview/', permanent=False)),
    # Inclui todas as rotas criadas no app dashboard
    path('dashboard/', include('dashboard.urls')),
]