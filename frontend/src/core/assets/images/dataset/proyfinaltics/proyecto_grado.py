# =====================================================================
# CASO DE USO: ANÁLISIS BIG DATA, NOSQL Y GRAFOS EN ADJUDICACIÓN DOCENTE
# =====================================================================

import pandas as pd
from pymongo import MongoClient
import networkx as nx
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import warnings

# Ignorar advertencias menores para mantener limpia la consola en la presentación
warnings.filterwarnings('ignore')

print("Iniciando Pipeline de Procesamiento...")
print("="*50)

# =====================================================================
# 1. FASE ETL (Extracción, Transformación y Limpieza)
# =====================================================================
print("\n[1/4] Ejecutando Fase ETL...")
try:
    # Cargar datos crudos
    df_crudo = pd.read_excel('Dataset_Adjudicacion_Multicarrera.xlsx')
    
    # Limpieza
    df_limpio = df_crudo.dropna(how='all').drop_duplicates()
    
    # Estandarización de textos
    columnas_texto = ['NOMBRE', 'ASIGNATURA', 'CARRERA', 'LITERAL']
    for col in columnas_texto:
        df_limpio[col] = df_limpio[col].str.strip()
    
    # Tratamiento de valores numéricos
    df_limpio['MONTO'] = df_limpio['MONTO'].fillna(0).astype(int)
    
    # Guardar backup limpio
    df_limpio.to_excel('Dataset_Limpio_Adjudicaciones.xlsx', index=False)
    print(f"✅ ETL Completado. Dataset limpio con {len(df_limpio)} registros exportado.")

except Exception as e:
    print(f"❌ Error en la fase ETL: {e}")
    exit()

# =====================================================================
# 2. ALMACENAMIENTO NOSQL Y BÚSQUEDA INDEXADA (MONGODB)
# =====================================================================
print("\n[2/4] Integrando con MongoDB (Distribución NoSQL y Búsqueda)...")
try:
    # Conexión local
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    
    # Forzar una llamada al servidor para verificar que esté encendido
    client.server_info() 
    
    db = client['universidad_db']
    coleccion = db['contratos_adjudicacion']
    
    # Limpiar colección previa para evitar duplicados en pruebas
    coleccion.drop()
    
    # Ingestar datos limpios
    registros_json = df_limpio.to_dict(orient='records')
    coleccion.insert_many(registros_json)
    
    # Crear Índices de Texto para Búsqueda (Ranking)
    coleccion.create_index([("NOMBRE", "text"), ("ASIGNATURA", "text")])
    print("✅ Datos ingestados y motor de búsqueda indexado correctamente.")
    
    # Prueba del sistema de búsqueda
    termino = "SISTEMAS"
    print(f"   -> Probando motor de búsqueda para la palabra: '{termino}'")
    resultados = coleccion.find(
        {"$text": {"$search": termino}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(3)
    
    for i, doc in enumerate(resultados, 1):
        print(f"      {i}. [Ranking: {doc['score']:.2f}] {doc['ASIGNATURA']} ({doc['NOMBRE']})")

except Exception as e:
    print(f"⚠️ Aviso: No se pudo conectar a MongoDB. ¿Está iniciado el servicio en tu computadora? Detalle: {e}")
    print("Continuando con el resto del pipeline...")

# =====================================================================
# 3. ALGORITMOS DE CLASIFICACIÓN DE INFORMACIÓN (MACHINE LEARNING)
# =====================================================================
print("\n[3/4] Entrenando Modelo de Clasificación (TF-IDF + Naive Bayes)...")

# Vectorización
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df_limpio['ASIGNATURA'])
y = df_limpio['CARRERA']

# División Train/Test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entrenamiento
clf = MultinomialNB()
clf.fit(X_train, y_train)

# Evaluación
y_pred = clf.predict(X_test)
print(f"✅ Modelo entrenado con éxito.")
print(f"   -> Precisión (Accuracy) del modelo: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
# Imprimir un reporte resumido para no saturar la consola
print("   -> Reporte de Clasificación (Métricas):")
print(classification_report(y_test, y_pred, zero_division=0))

# =====================================================================
# 4. INTEGRACIÓN DE GRAFOS (ALGORITMO TIPO PREGEL / PAGERANK)
# =====================================================================
print("\n[4/4] Procesando Red de Grafos Académicos...")

G = nx.Graph()

# Construcción de la red
for index, row in df_limpio.iterrows():
    nodo_docente = f"Docente: {row['NOMBRE']}"
    nodo_asignatura = f"Materia: {row['ASIGNATURA']}"
    
    # Añadir arista con el monto como peso
    G.add_edge(nodo_docente, nodo_asignatura, weight=row['MONTO'])

# Implementación de ranking (PageRank)
pagerank_scores = nx.pagerank(G, weight='weight')
nodos_importantes = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)

print("✅ Análisis de Grafos completado.")
print("   -> Top 5 Nodos más influyentes (Cuellos de botella o Pilares):")
for nodo, score in nodos_importantes[:5]:
    print(f"      - {nodo}: {score:.5f}")

# Visualización para la defensa
print("\nGenerando visualización gráfica... (Cierra la ventana de la imagen para terminar el programa)")
plt.figure(figsize=(10, 8))
nodo_central = nodos_importantes[0][0]
sub_G = nx.ego_graph(G, nodo_central, radius=1)

# Estilos del grafo
pos = nx.spring_layout(sub_G, seed=42)
nx.draw(sub_G, pos, with_labels=True, 
        node_color='#4A90E2', edge_color='#CCCCCC', 
        node_size=2500, font_size=8, font_weight='bold')
plt.title(f"Visualización del Nodo Principal: {nodo_central}", fontsize=14)
plt.tight_layout()
plt.show()

print("\n"=="*50")
print("Ejecución finalizada exitosamente.")