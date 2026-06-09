import pandas as pd
from django.core.management.base import BaseCommand
from apps.docente.models import Docente, GradoAcademico
from apps.asignatura.models import Asignatura
from apps.contrato.models import Contrato, Modalidad, EstadoContrato


GRADOS_MAP = {
    "ING.":      GradoAcademico.ING,
    "LIC.":      GradoAcademico.LIC,
    "MSC.":      GradoAcademico.MSC,
    "MGS.":      GradoAcademico.MGS,
    "PHD.":      GradoAcademico.PHD,
    "DR.":       GradoAcademico.DR,
    "CNL. DAEN": GradoAcademico.CNL,
}


class Command(BaseCommand):
    help = "Importa docentes, asignaturas y contratos desde Dataset_Contratos_Adjudicacion.xlsx"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            default="Dataset_Contratos_Adjudicacion.xlsx",
            help="Ruta al archivo xlsx",
        )
        parser.add_argument("--gestion", default=2026, type=int)

    def handle(self, *args, **options):
        ruta    = options["file"]
        gestion = options["gestion"]

        self.stdout.write(f"Leyendo {ruta}...")
        df = pd.read_excel(ruta)
        df.columns = [c.strip() for c in df.columns]

        docentes_creados    = 0
        asignaturas_creadas = 0
        contratos_creados   = 0

        for _, row in df.iterrows():
            # — Parsear nombre apellidos —
            nombre_raw = str(row.get("NOMBRE", "")).strip()
            if "," in nombre_raw:
                apellidos, nombres = nombre_raw.split(",", 1)
            else:
                partes    = nombre_raw.split()
                apellidos = " ".join(partes[:2]) if len(partes) >= 2 else nombre_raw
                nombres   = " ".join(partes[2:]) if len(partes) > 2 else ""

            ci    = str(row.get("CEDULA", "")).strip()
            grado = str(row.get("GRADO",  "")).strip()
            grado_val = GRADOS_MAP.get(grado, GradoAcademico.OTRO)

            # — Docente —
            docente, created = Docente.objects.get_or_create(
                ci=ci,
                defaults={
                    "grado":     grado_val,
                    "nombres":   nombres.strip(),
                    "apellidos": apellidos.strip(),
                }
            )
            if created:
                docentes_creados += 1

            # — Asignatura —
            nombre_asig = str(row.get("ASIGNATURA", "")).strip()
            asignatura, created = Asignatura.objects.get_or_create(nombre=nombre_asig)
            if created:
                asignaturas_creadas += 1

            # — Modalidad —
            mod_raw  = str(row.get("TEORIA/LABC", "")).strip().upper()
            modalidad = Modalidad.LABORATORIO if "LAB" in mod_raw else Modalidad.TEORIA

            # — Contrato —
            nro_contrato = str(row.get("CONTRATO", "")).strip()
            _, created = Contrato.objects.get_or_create(
                docente=docente,
                asignatura=asignatura,
                modalidad=modalidad,
                gestion=gestion,
                defaults={
                    "monto":               float(row.get("MONTO", 0) or 0),
                    "monto_literal":       str(row.get("LITERAL", "")).strip(),
                    "codigo":              str(row.get("CODIGO", "")).strip(),
                    "nro_nota_adjudicacion": str(row.get("NOTA DE ADJUDICACION", "")).strip(),
                    "nro_informe":         str(row.get("INFORME", "")).strip(),
                    "nro_memorandum":      str(row.get("MEMORANDUM", "")).strip(),
                    "nro_contrato":        nro_contrato,
                    "estado":              EstadoContrato.ACTIVO,
                }
            )
            if created:
                contratos_creados += 1

        self.stdout.write(self.style.SUCCESS(
            f"Importación completa: "
            f"{docentes_creados} docentes, "
            f"{asignaturas_creadas} asignaturas, "
            f"{contratos_creados} contratos."
        ))