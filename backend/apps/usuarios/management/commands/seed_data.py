from django.core.management.base import BaseCommand
from apps.usuarios.models import User


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        if User.objects.filter(username="admin_emi").exists():
            self.stdout.write("Seeddata: el usuario ya existe.")
            return

        User.objects.create_superuser(
            username="admin_emi",
            email="admin@emi.edu.bo",
            password="emi123456",
            first_name="Administrador",
            last_name="EMI Cochabamba",
            is_admin=True,
        )

        self.stdout.write(self.style.SUCCESS("Seeddata: usuario admin_emi creado exitosamente."))