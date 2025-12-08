"""
═══════════════════════════════════════════════════════════════════════════
🌊 OceanPhenix IA Souveraine - API FastAPI Principale
═══════════════════════════════════════════════════════════════════════════
API RAG complète avec gestion des modèles, BI, health checks
Architecture robuste et maintenable
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import sys
import os
from contextlib import asynccontextmanager

# Import des routers
from health import router as health_router
from documents import router as documents_router
from rag_pipeline import router as rag_router
from models_manager import router as models_router
from bi_endpoints import router as bi_router

# ═══════════════════════════════════════════════════════════════════════════
# Configuration Logging
# ═══════════════════════════════════════════════════════════════════════════

logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/api.log",
    rotation="100 MB",
    retention="30 days",
    compression="zip",
    level="INFO"
)

# ═══════════════════════════════════════════════════════════════════════════
# Lifecycle Management
# ═══════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    logger.info("🚀 Démarrage de l'API OceanPhenix IA Souveraine")
    
    # Initialisation au démarrage
    try:
        # Vérifier connexions aux services
        from models_manager import check_ollama_connection
        from rag_pipeline import check_qdrant_connection
        from documents import check_minio_connection
        
        await check_ollama_connection()
        logger.success("✓ Ollama connecté")
        
        await check_qdrant_connection()
        logger.success("✓ Qdrant connecté")
        
        await check_minio_connection()
        logger.success("✓ MinIO connecté")
        
        logger.success("✓ Tous les services sont opérationnels")
        
    except Exception as e:
        logger.error(f"❌ Erreur initialisation : {e}")
        logger.warning("⚠️ Certains services ne sont pas disponibles")
    
    yield
    
    # Nettoyage à l'arrêt
    logger.info("🛑 Arrêt de l'API OceanPhenix IA Souveraine")

# ═══════════════════════════════════════════════════════════════════════════
# Application FastAPI
# ═══════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="▸ OceanPhenix IA Souveraine API",
    description="""
# API REST pour Plateforme IA Souveraine

## ▸ Vue d'ensemble

API complète pour la gestion d'une plateforme d'intelligence artificielle souveraine avec RAG (Retrieval-Augmented Generation).

## ◆ Fonctionnalités principales

* **▹ RAG (Retrieval-Augmented Generation)** : Ingestion de documents et génération de réponses contextuelles
* **▹ Gestion des documents** : Upload, téléchargement et suppression de fichiers
* **▹ Gestion des modèles** : Installation, listage et suppression de modèles IA
* **▹ Business Intelligence** : Statistiques et métriques de la plateforme
* **▹ Health Checks** : Surveillance de l'état des services

## ◇ Architecture

La plateforme s'appuie sur :
- **Ollama** : Serveur de modèles IA locaux
- **Qdrant** : Base de données vectorielle
- **MinIO** : Stockage objet S3-compatible
- **FastAPI** : Framework web moderne et performant

## ◈ Authentification

Actuellement, l'API est en mode ouvert pour le développement. L'authentification sera ajoutée dans une version future.

## ■ Documentation

- **Swagger UI** : Interface interactive à [/docs](/docs)
- **ReDoc** : Documentation détaillée à [/redoc](/redoc)
- **OpenAPI Spec** : Spécification JSON à [/openapi.json](/openapi.json)

---

# 📚 Liens API Documentation

## Interface Interactive Swagger UI
**URL** : [http://localhost:8000/docs](http://localhost:8000/docs)

▹ Testez les endpoints directement depuis le navigateur  
▹ Essayez les requêtes avec des exemples  
▹ Interface complète pour explorer l'API  

## Documentation ReDoc Élégante
**URL** : [http://localhost:8000/redoc](http://localhost:8000/redoc)

▹ Vue complète avec descriptions détaillées  
▹ Navigation par tags (Health, RAG, Documents, Models, BI)  
▹ Design moderne et professionnel  

## Spécification OpenAPI JSON
**URL** : [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

▹ Spécification OpenAPI 3.1 complète  
▹ Format JSON pour intégration  
▹ Compatible avec tous les outils OpenAPI  

---

## ● Support

Pour toute question ou problème, contactez l'équipe OceanPhenix.
    """,
    version="1.0.0",
    contact={
        "name": "OceanPhenix Support",
        "url": "https://oceanphenix.com",
        "email": "support@oceanphenix.com"
    },
    license_info={
        "name": "Propriétaire - OceanPhenix",
        "url": "https://oceanphenix.com/licence"
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Health",
            "description": "◆ **Surveillance de la santé** - Endpoints pour vérifier l'état de santé de tous les services de la plateforme (Ollama, Qdrant, MinIO)."
        },
        {
            "name": "RAG",
            "description": "◆ **Retrieval-Augmented Generation** - Ingestion de documents et génération de réponses intelligentes basées sur le contenu indexé."
        },
        {
            "name": "Documents",
            "description": "◆ **Gestion documentaire** - Upload, listage, téléchargement et suppression de documents. Stockage sécurisé dans MinIO."
        },
        {
            "name": "Models",
            "description": "◆ **Gestion des modèles IA** - Installation (pull), listage et suppression de modèles Ollama. Recommandations de modèles optimisés."
        },
        {
            "name": "Business Intelligence",
            "description": "◆ **Analytics & Métriques** - Statistiques en temps réel sur l'utilisation de la plateforme, statut des services et métriques de performance."
        }
    ]
)

# ═══════════════════════════════════════════════════════════════════════════
# Middleware CORS - Configuration sécurisée
# ═══════════════════════════════════════════════════════════════════════════

# Liste restrictive des origines autorisées
ALLOWED_ORIGINS = [
    f"https://{os.getenv('STUDIO_DOMAIN', 'studio.oceanphenix.local')}",
    f"https://{os.getenv('API_DOMAIN', 'api.oceanphenix.local')}",
    f"https://{os.getenv('CMS_DOMAIN', 'cms.oceanphenix.local')}",
    f"https://{os.getenv('BI_DOMAIN', 'bi.oceanphenix.local')}",
    # Autoriser localhost uniquement en développement
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://localhost",
]

# Filtrer les origines None/vides
ALLOWED_ORIGINS = [origin for origin in ALLOWED_ORIGINS if origin and "None" not in origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════════
# Enregistrement des Routers
# ═══════════════════════════════════════════════════════════════════════════

app.include_router(health_router, tags=["Health"])
app.include_router(bi_router, prefix="/bi", tags=["Business Intelligence"])
app.include_router(documents_router, prefix="/documents", tags=["Documents"])
app.include_router(rag_router, prefix="/rag", tags=["RAG"])
app.include_router(models_router, prefix="/models", tags=["Models"])

# ═══════════════════════════════════════════════════════════════════════════
# Routes de base
# ═══════════════════════════════════════════════════════════════════════════

@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="▸ Page d'accueil de l'API",
    description="""
    Endpoint racine fournissant les informations générales sur l'API.
    
    Retourne :
    - Le nom du service
    - La version actuelle
    - Le statut opérationnel
    - La liste des endpoints disponibles
    """,
    response_description="Informations générales de l'API",
    tags=["General"]
)
async def root():
    """Route racine avec informations API"""
    return {
        "service": "OceanPhenix IA Souveraine API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "bi": "/bi/*",
            "documents": "/documents/*",
            "rag": "/rag/*",
            "models": "/models/*",
            "docs": "/docs"
        }
    }

@app.get(
    "/version",
    status_code=status.HTTP_200_OK,
    summary="■ Version de l'API",
    description="Retourne les informations de version de la plateforme OceanPhenix IA Souveraine.",
    response_description="Informations de version",
    tags=["General"]
)
async def version():
    """Version de l'API"""
    return {
        "version": "1.0.0",
        "platform": "OceanPhenix IA Souveraine",
        "build": "production"
    }

# ═══════════════════════════════════════════════════════════════════════════
# Exception Handlers
# ═══════════════════════════════════════════════════════════════════════════

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Gestion personnalisée des erreurs HTTP"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Gestion des erreurs générales"""
    logger.exception(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Erreur interne du serveur",
            "status_code": 500
        }
    )

# ═══════════════════════════════════════════════════════════════════════════
# Point d'entrée
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=2,
        log_level="info"
    )
