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
    title="OceanPhenix IA Souveraine API",
    description="API RAG complète pour plateforme IA souveraine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
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

@app.get("/", status_code=status.HTTP_200_OK)
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

@app.get("/version", status_code=status.HTTP_200_OK)
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
