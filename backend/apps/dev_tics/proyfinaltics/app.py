# app.py
import streamlit as st
import pandas as pd
import requests
import networkx as nx
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import time

st.set_page_config(page_title="Sistema Adjudicación UMSS", layout="wide")
st.title(" Sistema Inteligente de Adjudicación Docente - EMI")
st.markdown("**Análisis Big Data con NoSQL, Grafos y Machine Learning**")

# ── Cargar datos ──────────────────────────────────────
@st.cache_data
def cargar_datos():
    return pd.read_excel('Dataset_Limpio_Adjudicaciones.xlsx')

df = cargar_datos()
st.success(f"✅ Dataset cargado: {len(df)} registros")

# ── Tabs de navegación ────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 MapReduce", 
    "🤖 Clasificadores", 
    "🔗 Grafos Neo4j", 
    "🌐 Análisis de Sentimientos"
])

# ── TAB 1: MapReduce ──────────────────────────────────
with tab1:
    st.header("MapReduce: Agregación por Docente")
    
    inicio = time.time()
    resultado = df.groupby('NOMBRE').agg(
        TOTAL=('MONTO', 'sum'),
        MATERIAS=('ASIGNATURA', 'count')
    ).reset_index().sort_values('TOTAL', ascending=False)
    tiempo = time.time() - inicio
    
    st.metric("Tiempo de procesamiento", f"{tiempo:.4f}s")
    st.dataframe(resultado.head(20), use_container_width=True)
    
    st.bar_chart(resultado.set_index('NOMBRE')['TOTAL'].head(10))

# ── TAB 2: Clasificadores ─────────────────────────────
with tab2:
    st.header("Comparación: Naive Bayes vs Regresión Logística")
    
    if 'CARRERA' in df.columns:
        vectorizer = TfidfVectorizer()
        X = vectorizer.fit_transform(df['ASIGNATURA'])
        y = df['CARRERA']
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        modelos = {
            "Naive Bayes": MultinomialNB(),
            "Regresión Logística": LogisticRegression(max_iter=1000)
        }
        
        cols = st.columns(2)
        for i, (nombre, modelo) in enumerate(modelos.items()):
            inicio = time.time()
            modelo.fit(X_train, y_train)
            pred = modelo.predict(X_test)
            tiempo = time.time() - inicio
            acc = accuracy_score(y_test, pred) * 100
            
            with cols[i]:
                st.metric(nombre, f"{acc:.2f}%", f"{tiempo:.3f}s")
    else:
        st.warning("El dataset no tiene columna CARRERA para clasificar.")

# ── TAB 3: Grafos Neo4j ───────────────────────────────
with tab3:
    st.header("Consulta de Grafos - Neo4j Aura")
    
    URL = "https://52698335.databases.neo4j.io/db/52698335/query/v2"
    AUTH = ("52698335", "NJ9sqIUSu8MHcmMdlCWhlvUwIuWNJk8edDmyfCQ2e1Q")
    
    if st.button("Consultar Top 10 Docentes en el Grafo"):
        with st.spinner("Consultando Neo4j..."):
            try:
                body = {
                    "statement": """
                        MATCH (d:Docente)-[r:IMPARTE]->(a:Asignatura)
                        RETURN d.nombre AS Docente, 
                               count(a) AS Materias, 
                               sum(r.monto) AS Total
                        ORDER BY Total DESC LIMIT 10
                    """
                }
                resp = requests.post(URL, json=body, auth=AUTH,
                                     headers={"Content-Type": "application/json"})
                data = resp.json()['data']['values']
                df_grafo = pd.DataFrame(data, columns=['Docente','Materias','Total'])
                st.dataframe(df_grafo, use_container_width=True)
                st.bar_chart(df_grafo.set_index('Docente')['Total'])
            except Exception as e:
                st.error(f"Error: {e}")
    
    # PageRank local con NetworkX
    st.subheader("PageRank Local (NetworkX)")
    if st.button("⚡ Calcular PageRank"):
        with st.spinner("Calculando..."):
            G = nx.Graph()
            for _, row in df.iterrows():
                G.add_edge(f"D:{row['NOMBRE']}", 
                           f"M:{row['ASIGNATURA']}",
                           weight=float(row.get('MONTO', 1)))
            
            pr = nx.pagerank(G, weight='weight')
            top5 = sorted(pr.items(), key=lambda x: x[1], reverse=True)[:5]
            
            fig, ax = plt.subplots(figsize=(8, 4))
            nodos = [x[0][:30] for x in top5]
            scores = [x[1] for x in top5]
            ax.barh(nodos, scores, color='#4A90E2')
            ax.set_xlabel('PageRank Score')
            ax.set_title('Top 5 Nodos por PageRank')
            plt.tight_layout()
            st.pyplot(fig)

# ── TAB 4: Análisis de Sentimientos ──────────────────
with tab4:
    st.header("Análisis de Sentimientos sobre Asignaturas")
    st.markdown("Clasifica el tono semántico de los nombres de asignaturas usando TextBlob.")
    
    try:
        from textblob import TextBlob
        
        df['SENTIMIENTO'] = df['ASIGNATURA'].apply(
            lambda x: TextBlob(str(x)).sentiment.polarity
        )
        df['CATEGORIA'] = df['SENTIMIENTO'].apply(
            lambda x: '🟢' if x > 0 else ('🔴' if x < 0 else '⚪')
        )
        
        conteo = df['CATEGORIA'].value_counts()
        col1, col2 = st.columns(2)
        with col1:
            st.dataframe(df[['ASIGNATURA','SENTIMIENTO','CATEGORIA']].head(20),
                        use_container_width=True)
        with col2:
            st.bar_chart(conteo)
    except ImportError:
        st.error("Instala TextBlob: pip install textblob")