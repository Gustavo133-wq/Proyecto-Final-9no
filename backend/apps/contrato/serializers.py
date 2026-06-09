from rest_framework import serializers
from .models import Contrato, DocumentoContrato
from apps.docente.serializers import DocenteListSerializer
from apps.asignatura.serializers import AsignaturaListSerializer


class DocumentoContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DocumentoContrato
        fields = ['id', 'tipo', 'numero', 'fecha', 'archivo', 'creado_en']
        read_only_fields = ['id', 'creado_en']


class ContratoSerializer(serializers.ModelSerializer):
    docente_detalle    = DocenteListSerializer(source='docente',    read_only=True)
    asignatura_detalle = AsignaturaListSerializer(source='asignatura', read_only=True)
    documentos         = DocumentoContratoSerializer(many=True, read_only=True)

    class Meta:
        model  = Contrato
        fields = [
            'id', 'docente', 'docente_detalle',
            'asignatura', 'asignatura_detalle',
            'modalidad', 'monto', 'monto_literal', 'gestion', 'estado',
            'codigo', 'nro_nota_adjudicacion', 'nro_informe',
            'nro_memorandum', 'nro_contrato',
            'fecha_inicio', 'fecha_fin', 'fecha_contrato',
            'observaciones', 'documentos',
            'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en']


class ContratoListSerializer(serializers.ModelSerializer):
    docente_nombre    = serializers.CharField(source='docente.nombre_completo', read_only=True)
    asignatura_nombre = serializers.CharField(source='asignatura.nombre',       read_only=True)

    class Meta:
        model  = Contrato
        fields = [
            'id', 'docente_nombre', 'asignatura_nombre',
            'modalidad', 'monto', 'gestion', 'estado', 'nro_contrato',
        ]