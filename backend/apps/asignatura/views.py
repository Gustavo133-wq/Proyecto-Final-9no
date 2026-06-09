from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Asignatura
from .serializers import AsignaturaSerializer, AsignaturaListSerializer
from apps.usuarios.permissions import HasModulePermission


class CanViewAsignatura(HasModulePermission):
    module = "asignaturas"
    action = "view"

class CanCreateAsignatura(HasModulePermission):
    module = "asignaturas"
    action = "create"


class AsignaturaListCreateView(ListCreateAPIView):

    def get_serializer_class(self):
        return AsignaturaSerializer if self.request.method == "POST" else AsignaturaListSerializer

    def get_queryset(self):
        qs = Asignatura.objects.all()
        q  = self.request.query_params.get("q", "")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(codigo__icontains=q))
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanCreateAsignatura()]
        return [IsAuthenticated(), CanViewAsignatura()]


class AsignaturaDetailView(RetrieveUpdateDestroyAPIView):
    queryset           = Asignatura.objects.all()
    serializer_class   = AsignaturaSerializer
    permission_classes = [IsAuthenticated, CanViewAsignatura]