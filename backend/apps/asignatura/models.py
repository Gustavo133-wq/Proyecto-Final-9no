from django.db import models


class Asignatura(models.Model):
    nombre    = models.CharField(max_length=200, unique=True)
    codigo    = models.CharField(max_length=20, blank=True)
    semestre  = models.PositiveSmallIntegerField(null=True, blank=True)
    horas_teoria      = models.PositiveSmallIntegerField(default=0)
    horas_laboratorio = models.PositiveSmallIntegerField(default=0)
    descripcion       = models.TextField(blank=True,
                            help_text="Contenido mínimo y objetivos de la asignatura")
    activa    = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Asignatura"
        verbose_name_plural = "Asignaturas"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre