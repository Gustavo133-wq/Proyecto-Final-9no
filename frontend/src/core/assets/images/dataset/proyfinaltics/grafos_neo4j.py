from neo4j import GraphDatabase
import pandas as pd

URI = "bolt+ssc://52698335.databases.neo4j.io"
USER = "neo4j"
PASSWORD = "NJ9sqIUSu8MHcmMdlCWhlvUwIuWNJk8edDmyfCQ2e1Q"

print("\nConectando y limpiando base de datos...")
try:
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    with driver.session() as session:
        # Borrado seguro
        session.run("MATCH (n) DETACH DELETE n")
        print("✅ Base de datos limpia.")

        # Leer datos
        df = pd.read_excel('Dataset_Limpio_Adjudicaciones.xlsx')
        
        print(f"Inyectando {len(df)} registros...")
        for index, row in df.iterrows():
            query = """
            MERGE (d:Docente {nombre: $nombre})
            SET d.grado = $grado
            MERGE (a:Asignatura {nombre: $asignatura})
            MERGE (d)-[r:IMPARTE]->(a)
            SET r.monto = $monto, r.contrato = $contrato
            """
            session.run(query, 
                        nombre=str(row['NOMBRE']), 
                        grado=str(row.get('GRADO', '')), 
                        asignatura=str(row['ASIGNATURA']), 
                        monto=float(row.get('MONTO', 0)), 
                        contrato=str(row.get('CONTRATO', '')))
            
    driver.close()
    print("✅ ¡Inyección exitosa y verificada!")
except Exception as e:
    print(f"❌ Error crítico: {e}")