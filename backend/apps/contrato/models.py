from django.db import models
from apps.docente.models import Docente
from apps.asignatura.models import Asignatura


class Modalidad(models.TextChoices):
    TEORIA      = "TEORIA",      "Teoría"
    LABORATORIO = "LABORATORIO", "Laboratorio"


class EstadoContrato(models.TextChoices):
    PENDIENTE  = "PENDIENTE",  "Pendiente"
    ACTIVO     = "ACTIVO",     "Activo"
    FINALIZADO = "FINALIZADO", "Finalizado"
    ANULADO    = "ANULADO",    "Anulado"


class Contrato(models.Model):
    docente    = models.ForeignKey(Docente,    on_delete=models.PROTECT, related_name="contratos")
    asignatura = models.ForeignKey(Asignatura, on_delete=models.PROTECT, related_name="contratos")
    modalidad  = models.CharField(max_length=20, choices=Modalidad.choices)
    monto      = models.DecimalField(max_digits=10, decimal_places=2)
    monto_literal = models.CharField(max_length=300, blank=True)
    gestion    = models.PositiveSmallIntegerField(help_text="Año de la gestión, ej: 2026")
    estado     = models.CharField(max_length=20, choices=EstadoContrato.choices,
                                  default=EstadoContrato.PENDIENTE)
    # Números de referencia documental (del dataset original)
    codigo              = models.CharField(max_length=20, blank=True)
    nro_nota_adjudicacion = models.CharField(max_length=20, blank=True)
    nro_informe         = models.CharField(max_length=20, blank=True)
    nro_memorandum      = models.CharField(max_length=20, blank=True)
    nro_contrato        = models.CharField(max_length=20, blank=True)
    # Fechas
    fecha_inicio    = models.DateField(null=True, blank=True)
    fecha_fin       = models.DateField(null=True, blank=True)
    fecha_contrato  = models.DateField(null=True, blank=True)
    # Trazabilidad
    observaciones = models.TextField(blank=True)
    creado_en     = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"
        ordering = ["-gestion", "docente__apellidos"]

    def __str__(self):
        return f"Contrato {self.nro_contrato} — {self.docente} / {self.asignatura}"


class DocumentoContrato(models.Model):
    """Documentos adjuntos al contrato (adjudicación, informe, memorándum, etc.)"""

    class TipoDocumento(models.TextChoices):
        ADJUDICACION = "ADJUDICACION", "Nota de Adjudicación"
        INFORME      = "INFORME",      "Informe"
        MEMORANDUM   = "MEMORANDUM",   "Memorándum"
        CONTRATO     = "CONTRATO",     "Contrato"
        OTRO         = "OTRO",         "Otro"

    contrato  = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name="documentos")
    tipo      = models.CharField(max_length=20, choices=TipoDocumento.choices)
    numero    = models.CharField(max_length=50, blank=True)
    fecha     = models.DateField(null=True, blank=True)
    archivo   = models.FileField(upload_to="contratos/documentos/", null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Documento de Contrato"
        verbose_name_plural = "Documentos de Contrato"

    def __str__(self):
        return f"{self.tipo} Nº{self.numero} — {self.contrato}"