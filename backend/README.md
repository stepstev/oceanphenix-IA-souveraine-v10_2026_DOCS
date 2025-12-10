# 🔧 OceanPhenix V10 - Backend API

> API FastAPI pour RAG, indexation documents et endpoints BI

---

## 📋 Vue d'Ensemble

Le **Backend V10** fournit l'API REST pour la plateforme OceanPhenix :

- 🔌 **API REST** - FastAPI avec documentation auto-générée
- 📚 **RAG Pipeline** - Retrieval-Augmented Generation
- 🧠 **LLM Integration** - Ollama (Mistral, Llama, Qwen)
- 🗄️ **Vector Store** - Qdrant pour embeddings
- 📊 **BI Endpoints** - Requêtes bases de données
- 💾 **Storage** - MinIO S3 compatible
- 📈 **Monitoring** - Health checks, métriques Prometheus

---

## 🏗️ Structure

```
backend/
├── main.py                 # Application FastAPI principale
├── rag_pipeline.py        # Logique RAG (indexation, recherche)
├── models_manager.py      # Gestion modèles Ollama
├── documents.py           # Upload & traitement documents
├── bi_endpoints.py        # Endpoints Business Intelligence
├── health.py              # Health checks services
│
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Image Docker
├── .env                  # Configuration (ne pas commiter)
│
├── logs/                 # Logs application
│   ├── app.log
│   └── rag.log
│
└── tests/               # Tests unitaires
    ├── test_rag.py
    ├── test_health.py
    └── test_documents.py
```

---

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env
# ─────────────────────────────────────────────

# Ollama (LLM)
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=mistral:latest

# Qdrant (Vector DB)
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION=oceanphenix-docs

# MinIO (S3 Storage)
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=documents

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
API_DEBUG=false

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log

# CORS (Frontend URLs autorisées)
CORS_ORIGINS=["http://localhost:8080","https://votredomaine.com"]
```

---

## 🚀 Installation

### Option 1 : Docker (Recommandé)

```bash
# Déjà inclus dans docker-compose.yml
docker compose --profile all up -d

# API accessible sur http://localhost:8000
# Documentation Swagger: http://localhost:8000/docs
```

### Option 2 : Développement Local

```bash
# 1. Python 3.11+
python --version  # >= 3.11

# 2. Créer environnement virtuel
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# 3. Installer dépendances
pip install -r requirements.txt

# 4. Configuration
cp ../.env.example .env
# Éditer .env avec paramètres locaux

# 5. Lancer serveur
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 6. Accès
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

---

## 📡 API Endpoints

### Health & Status

```http
GET /health
GET /status
GET /metrics  # Prometheus format
```

### RAG (Retrieval-Augmented Generation)

```http
# Upload document
POST /api/rag/upload
Content-Type: multipart/form-data
Body: file (PDF, TXT, MD, DOCX)

Response:
{
  "file_id": "abc123",
  "filename": "document.pdf",
  "size": 1024000,
  "status": "uploaded"
}

# Indexer document dans Qdrant
POST /api/rag/index
Content-Type: application/json
Body: { "file_id": "abc123" }

Response:
{
  "file_id": "abc123",
  "chunks": 45,
  "embeddings": 45,
  "status": "indexed"
}

# Chat avec RAG
POST /api/rag/chat
Content-Type: application/json
Body: {
  "question": "Qu'est-ce que le RAG ?",
  "model": "mistral:latest",
  "max_tokens": 500
}

Response:
{
  "answer": "Le RAG (Retrieval-Augmented Generation)...",
  "sources": [
    {"document": "intro.pdf", "page": 3, "score": 0.92}
  ],
  "model": "mistral:latest",
  "tokens": 234
}

# Lister documents
GET /api/rag/documents?limit=10&offset=0

# Supprimer document
DELETE /api/rag/documents/{file_id}
```

### Models (Ollama)

```http
# Lister modèles disponibles
GET /api/models

Response:
{
  "models": [
    {"name": "mistral:latest", "size": "4.1GB"},
    {"name": "llama3:8b", "size": "4.7GB"}
  ]
}

# Télécharger modèle
POST /api/models/pull
Body: { "model": "qwen2.5:7b" }

# Générer texte
POST /api/generate
Body: {
  "prompt": "Écris un poème sur l'océan",
  "model": "mistral:latest",
  "stream": false
}
```

### Business Intelligence

```http
# Exécuter requête SQL
POST /api/bi/query
Body: {
  "database": "postgres",
  "query": "SELECT * FROM sales WHERE date > '2025-01-01'"
}

Response:
{
  "columns": ["id", "date", "amount"],
  "rows": [[1, "2025-01-15", 1500], ...],
  "count": 42
}

# Lister bases de données
GET /api/bi/databases

# Exporter résultats
POST /api/bi/export
Body: { "query_id": "abc123", "format": "csv" }
```

---

## 🔧 Composants

### 1. `main.py` - Application FastAPI

```python
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OceanPhenix API V10",
    description="API REST pour RAG et BI",
    version="10.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configurer en production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "10.0.0"}

# Inclure routers
app.include_router(rag_router, prefix="/api/rag")
app.include_router(bi_router, prefix="/api/bi")
app.include_router(models_router, prefix="/api/models")
```

### 2. `rag_pipeline.py` - Pipeline RAG

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from qdrant_client import QdrantClient

class RAGPipeline:
    def __init__(self):
        self.qdrant = QdrantClient(host="qdrant", port=6333)
        self.embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url="http://ollama:11434"
        )
    
    async def index_document(self, file_path: str, file_id: str):
        """Indexer document dans Qdrant"""
        # 1. Charger document
        text = load_document(file_path)
        
        # 2. Découper en chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_text(text)
        
        # 3. Générer embeddings
        vectors = self.embeddings.embed_documents(chunks)
        
        # 4. Stocker dans Qdrant
        self.qdrant.upsert(
            collection_name="oceanphenix-docs",
            points=[
                {
                    "id": f"{file_id}_{i}",
                    "vector": vec,
                    "payload": {"text": chunk, "file_id": file_id}
                }
                for i, (chunk, vec) in enumerate(zip(chunks, vectors))
            ]
        )
        
        return len(chunks)
    
    async def search(self, query: str, top_k: int = 5):
        """Recherche sémantique"""
        query_vector = self.embeddings.embed_query(query)
        
        results = self.qdrant.search(
            collection_name="oceanphenix-docs",
            query_vector=query_vector,
            limit=top_k
        )
        
        return [
            {
                "text": r.payload["text"],
                "score": r.score,
                "file_id": r.payload["file_id"]
            }
            for r in results
        ]
```

### 3. `models_manager.py` - Gestion Modèles

```python
import httpx

class ModelsManager:
    def __init__(self, ollama_host: str):
        self.base_url = ollama_host
    
    async def list_models(self):
        """Liste modèles installés"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/tags")
            return response.json()["models"]
    
    async def pull_model(self, model: str):
        """Télécharger modèle"""
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/pull",
                json={"name": model}
            ) as response:
                async for line in response.aiter_lines():
                    yield line  # Progress streaming
    
    async def generate(self, prompt: str, model: str):
        """Générer texte"""
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt}
            )
            return response.json()
```

### 4. `documents.py` - Gestion Documents

```python
from fastapi import UploadFile
import aiofiles

class DocumentsManager:
    def __init__(self, storage_path: str = "/app/data/documents"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
    
    async def upload(self, file: UploadFile) -> str:
        """Uploader fichier"""
        file_id = uuid.uuid4().hex
        file_path = self.storage_path / f"{file_id}_{file.filename}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return file_id
    
    async def list_documents(self):
        """Lister documents"""
        files = []
        for path in self.storage_path.iterdir():
            files.append({
                "file_id": path.stem.split("_")[0],
                "filename": "_".join(path.stem.split("_")[1:]),
                "size": path.stat().st_size,
                "uploaded_at": path.stat().st_mtime
            })
        return files
```

### 5. `health.py` - Health Checks

```python
async def check_ollama():
    """Vérifier Ollama disponible"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://ollama:11434/api/tags")
            return response.status_code == 200
    except:
        return False

async def check_qdrant():
    """Vérifier Qdrant disponible"""
    try:
        client = QdrantClient(host="qdrant", port=6333)
        client.get_collections()
        return True
    except:
        return False

@app.get("/status")
async def system_status():
    return {
        "ollama": await check_ollama(),
        "qdrant": await check_qdrant(),
        "minio": await check_minio(),
        "postgres": await check_postgres()
    }
```

---

## 🧪 Tests

### Tests unitaires

```bash
# Installer pytest
pip install pytest pytest-asyncio httpx

# Lancer tests
pytest tests/ -v

# Avec couverture
pytest tests/ --cov=. --cov-report=html
```

### Tests d'intégration

```python
# tests/test_rag.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_upload_document():
    async with AsyncClient(app=app, base_url="http://test") as client:
        files = {"file": ("test.txt", b"Hello World", "text/plain")}
        response = await client.post("/api/rag/upload", files=files)
        
        assert response.status_code == 200
        assert "file_id" in response.json()

@pytest.mark.asyncio
async def test_chat_rag():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/rag/chat",
            json={"question": "Test question", "model": "mistral:latest"}
        )
        
        assert response.status_code == 200
        assert "answer" in response.json()
```

---

## 📊 Monitoring

### Métriques Prometheus

```python
from prometheus_client import Counter, Histogram, generate_latest

# Compteurs
rag_queries = Counter('rag_queries_total', 'Total RAG queries')
documents_uploaded = Counter('documents_uploaded_total', 'Total documents uploaded')

# Histogrammes
query_duration = Histogram('rag_query_duration_seconds', 'RAG query duration')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Logs structurés

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.post("/api/rag/chat")
async def chat_rag(request: ChatRequest):
    logger.info(f"RAG query: {request.question[:50]}...")
    # ...
    logger.info(f"RAG response generated in {duration}s")
```

---

## 🐛 Dépannage

### Problème : Ollama non accessible

```bash
# Vérifier container Ollama
docker ps | grep ollama

# Vérifier logs
docker logs v10-ollama

# Tester connexion
curl http://localhost:11434/api/tags

# Dans container backend
docker exec v10-api curl http://ollama:11434/api/tags
```

### Problème : Qdrant erreur connexion

```bash
# Vérifier container
docker ps | grep qdrant

# Logs
docker logs v10-qdrant

# Tester API
curl http://localhost:6333/collections
```

### Problème : Import erreur

```bash
# Reconstruire image
docker compose build api

# Vérifier dépendances
docker exec v10-api pip list

# Installer manuellement
docker exec v10-api pip install package-name
```

---

## 📚 Dépendances

### requirements.txt

```txt
# API Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3

# RAG & LLM
langchain==0.1.4
langchain-community==0.0.16
qdrant-client==1.7.0

# HTTP Client
httpx==0.26.0
aiofiles==23.2.1

# Data Processing
pypdf==3.17.4
python-docx==1.1.0
python-multipart==0.0.6

# Monitoring
prometheus-client==0.19.0

# Logs
python-json-logger==2.0.7

# Tests
pytest==7.4.4
pytest-asyncio==0.23.3
```

---

## 🚢 Déploiement

### Build Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code application
COPY . .

# Créer dossiers
RUN mkdir -p logs data/documents

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD curl -f http://localhost:8000/health || exit 1

# Lancer app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variables production

```bash
# .env.production
API_DEBUG=false
LOG_LEVEL=WARNING
API_WORKERS=8  # CPU cores * 2

# Sécurité
CORS_ORIGINS=["https://votredomaine.com"]

# Performance
OLLAMA_NUM_THREADS=8
QDRANT_TIMEOUT=60
```

---

## 📄 Licence

MIT License - Voir [LICENSE](../LICENSE)

---

**🌊 OceanPhenix V10** - Backend API pour IA souveraine
