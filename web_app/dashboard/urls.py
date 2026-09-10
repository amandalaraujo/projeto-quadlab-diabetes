from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('quadlab-moderno/', views.quadlab_moderno, name='quadlab_moderno'),
]