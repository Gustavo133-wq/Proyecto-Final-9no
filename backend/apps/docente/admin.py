from django.contrib import admin
from .models import Docente

@admin.register(Docente)
class DocenteAdmin(admin.ModelAdmin):
    list_display   = ('grado', 'apellidos', 'nombres', 'ci', 'especialidad', 'activo')
    list_filter    = ('grado', 'activo')
    search_fields  = ('apellidos', 'nombres', 'ci', 'especialidad')