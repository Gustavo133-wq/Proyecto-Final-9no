from django.urls import path
from .views import AsignaturaListCreateView, AsignaturaDetailView

urlpatterns = [
    path("asignaturas/",          AsignaturaListCreateView.as_view()),
    path("asignaturas/<int:pk>/", AsignaturaDetailView.as_view()),
]