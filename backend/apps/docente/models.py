from django.db import models


class GradoAcademico(models.TextChoices):
    ING  = "ING.",       "Ingeniero/a"
    LIC  = "LIC.",       "Licenciado/a"
    MSC  = "MSC.",       "Magíster Scientiarum"
    MGS  = "MGS.",       "Magíster"
    PHD  = "PHD.",       "Doctor en Filosofía"
    DR   = "DR.",        "Doctor"
    CNL  = "CNL. DAEN", "Coronel DAEN"
    OTRO = "OTRO",       "Otro"


class Docente(models.Model):
    grado        = models.CharField(max_length=20, choices=GradoAcademico.choices)
    nombres      = models.CharField(max_length=100)
    apellidos    = models.CharField(max_length=100)
    ci           = models.CharField(max_length=20, unique=True)
    correo       = models.EmailField(blank=True)
    telefono     = models.CharField(max_length=20, blank=True)
    # Campos para TF-IDF / Bayes
    especialidad = models.CharField(max_length=200, blank=True,
                       help_text="Ej: Redes, Bases de Datos, Inteligencia Artificial")
    descripcion  = models.TextField(blank=True,
                       help_text="Perfil profesional y competencias del docente")
    activo       = models.BooleanField(default=True)
    creado_en    = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Docente"
        verbose_name_plural = "Docentes"
        ordering = ["apellidos", "nombres"]

    def __str__(self):
        return f"{self.grado} {self.apellidos}, {self.nombres}"

    @property
    def nombre_completo(self):
        return f"{self.apellidos}, {self.nombres}"

    @property
    def texto_tfidf(self):
        """Corpus para indexación TF-IDF: combina especialidad y descripción."""
        return f"{self.especialidad} {self.descripcion}".strip()