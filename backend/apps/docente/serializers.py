from rest_framework import serializers
from .models import Docente


class DocenteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    texto_tfidf     = serializers.ReadOnlyField()

    class Meta:
        model  = Docente
        fields = [
            'id', 'grado', 'nombres', 'apellidos', 'nombre_completo',
            'ci', 'correo', 'telefono', 'especialidad', 'descripcion',
            'texto_tfidf', 'activo', 'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en']


class DocenteListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()

    class Meta:
        model  = Docente
        fields = [
            'id', 'grado', 'nombre_completo', 'nombres', 'apellidos',
            'ci', 'correo', 'telefono', 'especialidad', 'descripcion', 'activo',
        ]