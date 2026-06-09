from django.contrib import admin
from .models import Asignatura

@admin.register(Asignatura)
class AsignaturaAdmin(admin.ModelAdmin):
    list_display  = ('nombre', 'codigo', 'semestre', 'horas_teoria', 'horas_laboratorio', 'activa')
    list_filter   = ('activa', 'semestre')
    search_fields = ('nombre', 'codigo')