from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count

from .models import Contrato, DocumentoContrato
from .serializers import (
    ContratoSerializer, ContratoListSerializer, DocumentoContratoSerializer
)
from apps.usuarios.permissions import HasModulePermission


class CanViewContrato(HasModulePermission):
    module = "contratos"
    action = "view"

class CanCreateContrato(HasModulePermission):
    module = "contratos"
    action = "create"


class ContratoListCreateView(ListCreateAPIView):

    def get_serializer_class(self):
        return ContratoSerializer if self.request.method == "POST" else ContratoListSerializer

    def get_queryset(self):
        qs = Contrato.objects.select_related('docente', 'asignatura').all()
        q        = self.request.query_params.get("q", "")
        gestion  = self.request.query_params.get("gestion", "")
        estado   = self.request.query_params.get("estado", "")
        modalidad = self.request.query_params.get("modalidad", "")
        if q:
            qs = qs.filter(
                Q(docente__nombres__icontains=q)    |
                Q(docente__apellidos__icontains=q)  |
                Q(asignatura__nombre__icontains=q)  |
                Q(nro_contrato__icontains=q)
            )
        if gestion:   qs = qs.filter(gestion=gestion)
        if estado:    qs = qs.filter(estado=estado)
        if modalidad: qs = qs.filter(modalidad=modalidad)
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanCreateContrato()]
        return [IsAuthenticated(), CanViewContrato()]


class ContratoDetailView(RetrieveUpdateDestroyAPIView):
    queryset           = Contrato.objects.select_related('docente', 'asignatura').prefetch_related('documentos')
    serializer_class   = ContratoSerializer
    permission_classes = [IsAuthenticated, CanViewContrato]


class ContratoDocumentosView(APIView):
    """Agrega o lista documentos de un contrato específico."""
    permission_classes = [IsAuthenticated, CanViewContrato]

    def get(self, request, pk):
        contrato   = Contrato.objects.get(pk=pk)
        documentos = contrato.documentos.all()
        return Response(DocumentoContratoSerializer(documentos, many=True).data)

    def post(self, request, pk):
        contrato = Contrato.objects.get(pk=pk)
        serializer = DocumentoContratoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(contrato=contrato)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ContratoEstadisticasView(APIView):
    """Estadísticas para el dashboard — MapReduce simulado sobre contratos."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gestion = request.query_params.get("gestion", "")
        qs = Contrato.objects.all()
        if gestion:
            qs = qs.filter(gestion=gestion)

        # MapReduce: agrupar por modalidad
        por_modalidad = (
            qs.values("modalidad")
              .annotate(total=Count("id"), monto_total=Sum("monto"))
              .order_by("modalidad")
        )
        # MapReduce: agrupar por estado
        por_estado = (
            qs.values("estado")
              .annotate(total=Count("id"))
              .order_by("estado")
        )
        # Top 5 docentes por cantidad de contratos
        top_docentes = (
            qs.values("docente__apellidos", "docente__nombres")
              .annotate(total=Count("id"), monto=Sum("monto"))
              .order_by("-total")[:5]
        )
        # Top 5 asignaturas más contratadas
        top_asignaturas = (
            qs.values("asignatura__nombre")
              .annotate(total=Count("id"), monto=Sum("monto"))
              .order_by("-total")[:5]
        )

        return Response({
            "total_contratos":    qs.count(),
            "monto_total":        qs.aggregate(t=Sum("monto"))["t"] or 0,
            "por_modalidad":      list(por_modalidad),
            "por_estado":         list(por_estado),
            "top_docentes":       list(top_docentes),
            "top_asignaturas":    list(top_asignaturas),
        })