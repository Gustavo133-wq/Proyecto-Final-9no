from rest_framework import serializers
from .models import Asignatura


class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Asignatura
        fields = [
            'id', 'nombre', 'codigo', 'semestre',
            'horas_teoria', 'horas_laboratorio',
            'descripcion', 'activa', 'creado_en',
        ]
        read_only_fields = ['id', 'creado_en']


class AsignaturaListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Asignatura
        fields = [
            'id', 'nombre', 'codigo', 'semestre',
            'horas_teoria', 'horas_laboratorio',
            'descripcion', 'activa',
        ]