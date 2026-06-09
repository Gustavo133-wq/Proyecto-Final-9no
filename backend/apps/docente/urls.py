from django.urls import path
from .views import DocenteListCreateView, DocenteDetailView, DocenteBusquedaView

urlpatterns = [
    path("docentes/",          DocenteListCreateView.as_view()),
    path("docentes/<int:pk>/", DocenteDetailView.as_view()),
    path("docentes/buscar/",   DocenteBusquedaView.as_view()),
]