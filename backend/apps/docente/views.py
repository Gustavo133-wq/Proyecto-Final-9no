from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Docente
from .serializers import DocenteSerializer, DocenteListSerializer
from apps.usuarios.permissions import IsAdmin, HasModulePermission


class CanViewDocente(HasModulePermission):
    module = "docentes"
    action = "view"

class CanCreateDocente(HasModulePermission):
    module = "docentes"
    action = "create"


class DocenteListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, CanViewDocente]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DocenteSerializer
        return DocenteListSerializer

    def get_queryset(self):
        qs = Docente.objects.all()
        q  = self.request.query_params.get("q", "")
        activo = self.request.query_params.get("activo", None)
        if q:
            qs = qs.filter(
                Q(nombres__icontains=q) | Q(apellidos__icontains=q) |
                Q(ci__icontains=q)      | Q(especialidad__icontains=q)
            )
        if activo is not None:
            qs = qs.filter(activo=activo.lower() == "true")
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanCreateDocente()]
        return [IsAuthenticated(), CanViewDocente()]


class DocenteDetailView(RetrieveUpdateDestroyAPIView):
    queryset           = Docente.objects.all()
    serializer_class   = DocenteSerializer
    permission_classes = [IsAuthenticated, CanViewDocente]


class DocenteBusquedaView(APIView):
    """Búsqueda simple por texto sobre nombre, especialidad y descripción."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"results": [], "total": 0})
        qs = Docente.objects.filter(
            Q(nombres__icontains=q)      |
            Q(apellidos__icontains=q)    |
            Q(especialidad__icontains=q) |
            Q(descripcion__icontains=q)
        )
        data = DocenteListSerializer(qs, many=True).data
        return Response({"results": data, "total": len(data)})