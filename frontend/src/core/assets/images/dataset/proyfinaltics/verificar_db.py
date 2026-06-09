from neo4j import GraphDatabase

# Tus mismas credenciales
URI = "bolt+ssc://52698335.databases.neo4j.io"
USER = "52698335"
PASSWORD = "NJ9sqIUSu8MHcmMdlCWhlvUwIuWNJk8edDmyfCQ2e1Q"

print("🔍 Buscando nombre de la base de datos...")
try:
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    with driver.session() as session:
        # Esto nos listará todas las bases de datos disponibles
        result = session.run("SHOW DATABASES")
        for record in result:
            # Imprimimos todo el registro para que tú veas el nombre real
            print(f"✅ Encontrada: {record.values()}")
    driver.close()
except Exception as e:
    print(f"❌ Error: {e}")