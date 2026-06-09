from django.urls import path
from .views import (
    ContratoListCreateView, ContratoDetailView,
    ContratoDocumentosView, ContratoEstadisticasView,
)

urlpatterns = [
    path("contratos/",                        ContratoListCreateView.as_view()),
    path("contratos/<int:pk>/",               ContratoDetailView.as_view()),
    path("contratos/<int:pk>/documentos/",    ContratoDocumentosView.as_view()),
    path("contratos/estadisticas/",           ContratoEstadisticasView.as_view()),
]