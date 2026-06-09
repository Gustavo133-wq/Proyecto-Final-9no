from django.contrib.auth.models import AbstractUser
from django.db import models


class Module(models.TextChoices):
    DOCENTES = "docentes", "Docentes"
    CONTRATOS = "contratos", "Contratos"
    ASIGNATURAS = "asignaturas", "Asignaturas"
    USUARIOS = "usuarios", "Usuarios"
    REPORTES = "reportes", "Reportes"


class Action(models.TextChoices):
    VIEW = "view", "Ver"
    CREATE = "create", "Crear"
    EDIT = "edit", "Editar"
    DELETE = "delete", "Eliminar"
    DOWNLOAD = "download", "Descargar"


class Scope(models.TextChoices):
    OWN = "own", "Solo propios"
    ALL = "all", "Todos"


class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"


class UserPermission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="custom_permissions")
    module = models.CharField(max_length=20, choices=Module.choices)
    action = models.CharField(max_length=20, choices=Action.choices)
    scope = models.CharField(max_length=10, choices=Scope.choices, default=Scope.OWN)

    class Meta:
        unique_together = ("user", "module", "action")
        verbose_name = "Permiso"
        verbose_name_plural = "Permisos"

    def __str__(self):
        return f"{self.user.username} | {self.module}:{self.action} ({self.scope})"