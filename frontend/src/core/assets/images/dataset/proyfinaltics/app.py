# Dentro de tu app.py, asegúrate de tener la conexión así:
from turtle import pd

from neo4j import GraphDatabase

def get_data_from_neo4j():
    URI = "bolt+ssc://52698335.databases.neo4j.io"
    USER = "52698335"
    PASSWORD = "NJ9sqIUSu8MHcmMdlCWhlvUwIuWNJk8edDmyfCQ2e1Q"
    
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    with driver.session(database="52698335") as session:
        # Aquí va tu consulta Cypher para mostrar datos en la web
        resultados = session.run("MATCH (d:Docente)-[r:IMPARTE]->(a:Asignatura) RETURN d.nombre as Docente, a.nombre as Materia").data()
    driver.close()
    return pd.DataFrame(resultados)