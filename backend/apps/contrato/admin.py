from django.contrib import admin
from .models import Contrato, DocumentoContrato


class DocumentoInline(admin.TabularInline):
    model = DocumentoContrato
    extra = 0


@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    inlines       = [DocumentoInline]
    list_display  = ('nro_contrato', 'docente', 'asignatura', 'modalidad', 'monto', 'gestion', 'estado')
    list_filter   = ('gestion', 'estado', 'modalidad')
    search_fields = ('docente__apellidos', 'asignatura__nombre', 'nro_contrato')
    raw_id_fields = ('docente', 'asignatura')