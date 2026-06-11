import requests
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

URL = "https://52698335.databases.neo4j.io/db/52698335/query/v2"
AUTH = ("52698335", "NJ9sqIUSu8MHcmMdlCWhlvUwIuWNJk8edDmyfCQ2e1Q")
HEADERS = {"Content-Type": "application/json"}

def run_query(cypher, params={}):
    body = {"statement": cypher, "parameters": params}
    r = requests.post(URL, json=body, auth=AUTH, headers=HEADERS)
    r.raise_for_status()
    return r.json()

def inyectar_fila(args):
    index, row = args
    query = """
    MERGE (d:Docente {nombre: $nombre})
    SET d.grado = $grado
    MERGE (a:Asignatura {nombre: $asignatura})
    MERGE (d)-[r:IMPARTE]->(a)
    SET r.monto = $monto, r.contrato = $contrato
    """
    params = {
        "nombre":     str(row['NOMBRE']),
        "grado":      str(row.get('GRADO', '')),
        "asignatura": str(row['ASIGNATURA']),
        "monto":      float(row.get('MONTO', 0)),
        "contrato":   str(row.get('CONTRATO', ''))
    }
    run_query(query, params)
    return index

print("\n" + "="*55)
print("  INYECCIÓN PARALELA A NEO4J CON THREADPOOLEXECUTOR")
print("="*55)

try:
    # Limpiar base de datos
    print("\n[1/3] Limpiando base de datos Neo4j...")
    run_query("MATCH (n) DETACH DELETE n")
    print("✅ Base de datos limpia.")

    # Leer Excel
    print("\n[2/3] Cargando dataset...")
    df = pd.read_excel('Dataset_Limpio_Adjudicaciones.xlsx')
    filas = list(df.iterrows())
    print(f"✅ Dataset cargado: {len(filas)} registros listos para inyectar.")

    # ─────────────────────────────────────────────────
    # PROCESAMIENTO SECUENCIAL (para comparar velocidad)
    # ─────────────────────────────────────────────────
    print("\n[3/3] Comparando rendimiento: Secuencial vs Paralelo...")
    print("\n  → Ejecutando inyección SECUENCIAL...")
    run_query("MATCH (n) DETACH DELETE n")  # Limpiar antes de medir

    inicio_sec = time.time()
    for index, row in df.iterrows():
        inyectar_fila((index, row))
    tiempo_sec = time.time() - inicio_sec
    print(f"  ✅ Secuencial completado en {tiempo_sec:.2f} segundos.")

    # ─────────────────────────────────────────────────
    # PROCESAMIENTO PARALELO con ThreadPoolExecutor
    # ─────────────────────────────────────────────────
    print("\n  → Ejecutando inyección PARALELA (5 hilos)...")
    run_query("MATCH (n) DETACH DELETE n")  # Limpiar antes de medir

    completados = 0
    inicio_par = time.time()

    with ThreadPoolExecutor(max_workers=5) as executor:
        futuros = {executor.submit(inyectar_fila, (i, row)): i 
                   for i, row in df.iterrows()}
        
        for futuro in as_completed(futuros):
            completados += 1
            if completados % 50 == 0:
                print(f"     → {completados}/{len(filas)} registros inyectados...")

    tiempo_par = time.time() - inicio_par
    print(f"  ✅ Paralelo completado en {tiempo_par:.2f} segundos.")

    # ─────────────────────────────────────────────────
    # RESUMEN DE RENDIMIENTO
    # ─────────────────────────────────────────────────
    mejora = ((tiempo_sec - tiempo_par) / tiempo_sec) * 100
    print("\n" + "─"*55)
    print("  📊 RESULTADO COMPARACIÓN DE RENDIMIENTO:")
    print(f"     Secuencial : {tiempo_sec:.2f}s")
    print(f"     Paralelo   : {tiempo_par:.2f}s")
    print(f"     Mejora     : {mejora:.1f}% más rápido con paralelismo")
    print("─"*55)

    # Verificación final
    result = run_query("MATCH (n) RETURN count(n) AS total")
    total = result['data']['values'][0][0]
    print(f"\n✅ Nodos en Neo4j: {total}")

    # Consulta de vinculación de grafos
    print("\n🔗 Top 5 docentes por monto total (grafo vinculado):")
    result2 = run_query("""
        MATCH (d:Docente)-[r:IMPARTE]->(a:Asignatura)
        RETURN d.nombre, count(a) AS materias, sum(r.monto) AS total
        ORDER BY total DESC LIMIT 5
    """)
    for row in result2['data']['values']:
        print(f"   {row[0]}: {row[1]} materias | Bs. {row[2]}")

except Exception as e:
    print(f"\n❌ Error crítico: {e}")