import pandas as pd
import psycopg2
from psycopg2 import sql
from textblob import TextBlob
import warnings
warnings.filterwarnings('ignore')

print("="*50)
print("INICIANDO PIPELINE BIG DATA: MAPREDUCE & SQL")
print("="*50)

# =====================================================================
# 1. FASE ETL Y LECTURA DEL DATASET DIRECTO DESDE EXCEL (.xls)
# =====================================================================
print("\n[1/4] Leyendo y limpiando dataset original...")

# RUTA ABSOLUTA a tu archivo en Descargas
archivo_excel = r"C:\Users\KATANA\Downloads\ING DE SISTEMAS.xls"

try:
    # Leemos la pestaña "DATOS PROCESO" saltando las primeras 14 filas de encabezados
    # Usamos engine='xlrd' para asegurar compatibilidad con el formato antiguo .xls
    df = pd.read_excel(archivo_excel, sheet_name='DATOS PROCESO', skiprows=14, engine='xlrd')
    
    # Eliminamos filas que no tengan nombre de docente (ruido del Excel, subtotales, etc)
    df_limpio = df.dropna(subset=['NOMBRE', 'MONTO'])
    
    # Limpiamos espacios en blanco en las columnas de texto
    df_limpio['NOMBRE'] = df_limpio['NOMBRE'].astype(str).str.strip()
    df_limpio['ASIGNATURA'] = df_limpio['ASIGNATURA'].astype(str).str.strip()
    
    # Aseguramos que el monto sea un número válido
    df_limpio['MONTO'] = pd.to_numeric(df_limpio['MONTO'], errors='coerce').fillna(0)
    
    print(f"✅ Datos cargados y limpios desde Excel. Total de registros válidos: {len(df_limpio)}")

except Exception as e:
    print(f"❌ Error al leer el archivo Excel: {e}")
    print("Por favor, asegúrate de haber ejecutado: pip install xlrd")
    exit()

# =====================================================================
# 2. APLICACIÓN DE MAPREDUCE (Agrupación y Agregación)
# =====================================================================
print("\n[2/4] Ejecutando algoritmo MapReduce (Agregación de Montos por Docente)...")

# MAP: Seleccionamos solo las llaves (Docente) y los valores (Monto)
# REDUCE: Agrupamos por Docente y sumamos los montos, y contamos cuántas materias tiene
map_reduce_resultado = df_limpio.groupby('NOMBRE').agg(
    TOTAL_ADJUDICADO=('MONTO', 'sum'),
    CANTIDAD_MATERIAS=('ASIGNATURA', 'count')
).reset_index()

# Ordenamos para ver a los docentes con mayor carga horaria/monto
map_reduce_resultado = map_reduce_resultado.sort_values(by='TOTAL_ADJUDICADO', ascending=False)

print("✅ MapReduce completado. Top 3 docentes con mayor adjudicación:")
for index, row in map_reduce_resultado.head(3).iterrows():
    print(f"   - {row['NOMBRE']}: Bs. {row['TOTAL_ADJUDICADO']} ({row['CANTIDAD_MATERIAS']} materias)")

# =====================================================================
# 3. ALMACENAMIENTO DISTRIBUIDO EN SQL (POSTGRESQL)
# =====================================================================
print("\n[3/4] Migrando datos limpios a Base de Datos SQL (PostgreSQL)...")

# Configura aquí tus credenciales de PostgreSQL local
DB_HOST = "localhost"
DB_NAME = "universidad_db"  # IMPORTANTE: Debes crear esta BD vacía en pgAdmin
DB_USER = "postgres"
DB_PASS = "13498710" # Tu contraseña de postgres

try:
    # Conexión a PostgreSQL
    conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
    cursor = conn.cursor()
    
    # Crear tabla estructurada si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contratos_docentes (
            id SERIAL PRIMARY KEY,
            grado VARCHAR(50),
            nombre VARCHAR(255),
            cedula VARCHAR(50),
            asignatura VARCHAR(255),
            tipo_clase VARCHAR(50),
            monto NUMERIC(10, 2),
            codigo_contrato VARCHAR(50)
        )
    """)
    
    # Limpiar tabla para evitar duplicados si corres el script varias veces
    cursor.execute("TRUNCATE TABLE contratos_docentes RESTART IDENTITY;")
    
    # Preparar el query de inserción
    insert_query = sql.SQL("""
        INSERT INTO contratos_docentes (grado, nombre, cedula, asignatura, tipo_clase, monto, codigo_contrato)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """)
    
    for index, row in df_limpio.iterrows():
        # Usamos .get() por si los nombres de columnas varían ligeramente en el Excel
        grado = str(row.get('GRADO', '')) if pd.notna(row.get('GRADO')) else ''
        cedula = str(row.get('CEDULA', '')) if pd.notna(row.get('CEDULA')) else ''
        tipo_clase = str(row.get('TEORIA/LABORATORIO', '')) if pd.notna(row.get('TEORIA/LABORATORIO')) else ''
        contrato = str(row.get('CONTRATO', '')) if pd.notna(row.get('CONTRATO')) else ''

        cursor.execute(insert_query, (
            grado, str(row['NOMBRE']), cedula, str(row['ASIGNATURA']), 
            tipo_clase, float(row['MONTO']), contrato
        ))
    
    conn.commit()
    print("✅ Migración SQL exitosa. Datos guardados en la tabla 'contratos_docentes'.")

except Exception as e:
    print(f"⚠️ Aviso SQL: No se pudo conectar a PostgreSQL. Verifica que el servidor esté corriendo, la base de datos 'universidad_db' exista y las credenciales sean correctas. \nDetalle del Error: {e}")
finally:
    if 'conn' in locals():
        cursor.close()
        conn.close()

print("\n" + "="*50)
print("🚀 Pipeline ETL, MapReduce y SQL Finalizado.")