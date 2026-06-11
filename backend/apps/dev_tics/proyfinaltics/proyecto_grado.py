import pandas as pd
from pymongo import MongoClient
import networkx as nx
import matplotlib.pyplot as plt
import time
import warnings
warnings.filterwarnings('ignore')

# Clasificadores
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

print("="*55)
print("  PIPELINE: NoSQL + GRAFOS + COMPARACIÓN CLASIFICADORES")
print("="*55)

# ─────────────────────────────────────────────────────
# 1. ETL
# ─────────────────────────────────────────────────────
print("\n[1/4] Ejecutando Fase ETL...")
try:
    df_crudo = pd.read_excel('Dataset_Adjudicacion_Multicarrera.xlsx')
    df_limpio = df_crudo.dropna(how='all').drop_duplicates()

    columnas_texto = ['NOMBRE', 'ASIGNATURA', 'CARRERA', 'LITERAL']
    for col in columnas_texto:
        df_limpio[col] = df_limpio[col].str.strip()

    df_limpio['MONTO'] = df_limpio['MONTO'].fillna(0).astype(int)
    df_limpio.to_excel('Dataset_Limpio_Adjudicaciones.xlsx', index=False)
    print(f"✅ ETL completado. {len(df_limpio)} registros limpios.")
except Exception as e:
    print(f"❌ Error ETL: {e}")
    exit()

# ─────────────────────────────────────────────────────
# 2. MONGODB
# ─────────────────────────────────────────────────────
print("\n[2/4] Integrando con MongoDB...")
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    client.server_info()
    db = client['universidad_db']
    coleccion = db['contratos_adjudicacion']
    coleccion.drop()
    coleccion.insert_many(df_limpio.to_dict(orient='records'))
    coleccion.create_index([("NOMBRE", "text"), ("ASIGNATURA", "text")])
    print("✅ Datos ingestados e índices creados.")

    termino = "SISTEMAS"
    print(f"   → Búsqueda indexada para: '{termino}'")
    resultados = coleccion.find(
        {"$text": {"$search": termino}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(3)

    for i, doc in enumerate(resultados, 1):
        print(f"      {i}. [Score: {doc['score']:.2f}] {doc['ASIGNATURA']} ({doc['NOMBRE']})")

except Exception as e:
    print(f"⚠️  MongoDB no disponible: {e}\n   Continuando...")

# ─────────────────────────────────────────────────────
# 3. COMPARACIÓN DE CLASIFICADORES
# ─────────────────────────────────────────────────────
print("\n[3/4] Comparación de Clasificadores de Información...")

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df_limpio['ASIGNATURA'])
y = df_limpio['CARRERA']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

modelos = {
    "Naive Bayes        ": MultinomialNB(),
    "Regresión Logística": LogisticRegression(max_iter=1000),
}

resultados_modelos = {}

print("\n  " + "─"*51)
print(f"  {'Modelo':<25} {'Accuracy':>10} {'Tiempo':>10}")
print("  " + "─"*51)

for nombre, modelo in modelos.items():
    inicio = time.time()
    modelo.fit(X_train, y_train)
    pred = modelo.predict(X_test)
    tiempo = time.time() - inicio
    acc = accuracy_score(y_test, pred) * 100
    resultados_modelos[nombre] = {"accuracy": acc, "tiempo": tiempo, "pred": pred}
    print(f"  {nombre:<25} {acc:>9.2f}% {tiempo:>9.3f}s")

print("  " + "─"*51)

# Determinar ganador
mejor = max(resultados_modelos, key=lambda k: resultados_modelos[k]['accuracy'])
print(f"\n  🏆 Mejor clasificador: {mejor.strip()}")
print(f"     Accuracy: {resultados_modelos[mejor]['accuracy']:.2f}%")

# Reporte detallado del mejor modelo
print(f"\n  📋 Reporte detallado — {mejor.strip()}:")
print(classification_report(y_test, resultados_modelos[mejor]['pred'], zero_division=0))

# ─────────────────────────────────────────────────────
# 4. GRAFOS + PAGERANK
# ─────────────────────────────────────────────────────
print("\n[4/4] Procesando Red de Grafos con PageRank...")

G = nx.Graph()
for _, row in df_limpio.iterrows():
    G.add_edge(
        f"Docente: {row['NOMBRE']}",
        f"Materia: {row['ASIGNATURA']}",
        weight=row['MONTO']
    )

pagerank_scores = nx.pagerank(G, weight='weight')
nodos_importantes = sorted(
    pagerank_scores.items(), key=lambda x: x[1], reverse=True
)

print("✅ PageRank calculado.")
print("   → Top 5 nodos más influyentes:")
for nodo, score in nodos_importantes[:5]:
    print(f"      - {nodo}: {score:.5f}")

# Visualización
print("\n  Generando visualización del grafo...")
nodo_central = nodos_importantes[0][0]
sub_G = nx.ego_graph(G, nodo_central, radius=1)
pos = nx.spring_layout(sub_G, seed=42)

plt.figure(figsize=(10, 8))
nx.draw(sub_G, pos,
        with_labels=True,
        node_color='#4A90E2',
        edge_color='#CCCCCC',
        node_size=2500,
        font_size=8,
        font_weight='bold')
plt.title(f"Nodo Principal (PageRank): {nodo_central}", fontsize=13)
plt.tight_layout()
plt.show()

print("\n" + "="*55)
print("  ✅ Pipeline completo finalizado exitosamente.")
print("="*55)