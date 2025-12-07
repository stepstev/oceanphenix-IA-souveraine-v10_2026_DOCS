"""
═══════════════════════════════════════════════════════════════════════════
🧠 Models Manager - Gestion des modèles Ollama
═══════════════════════════════════════════════════════════════════════════
Endpoints pour gérer les modèles LLM locaux
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import httpx
import os
from loguru import logger

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")

# ═══════════════════════════════════════════════════════════════════════════
# Models Pydantic
# ═══════════════════════════════════════════════════════════════════════════

class Model(BaseModel):
    """Représentation d'un modèle"""
    name: str
    size: Optional[int] = None
    modified_at: Optional[str] = None
    digest: Optional[str] = None
    details: Optional[Dict] = None

class ModelsListResponse(BaseModel):
    """Réponse liste des modèles"""
    models: List[Model]
    count: int

class PullModelRequest(BaseModel):
    """Requête pour pull un modèle"""
    name: str

class PullModelResponse(BaseModel):
    """Réponse pull modèle"""
    success: bool
    message: str
    model_name: str

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

async def check_ollama_connection() -> bool:
    """Vérifie la connexion à Ollama"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama connection check failed: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/", response_model=ModelsListResponse, status_code=status.HTTP_200_OK)
async def list_models():
    """
    Liste tous les modèles disponibles sur Ollama
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ollama service unavailable"
            )
        
        data = response.json()
        models = []
        
        for model_data in data.get("models", []):
            models.append(Model(
                name=model_data.get("name"),
                size=model_data.get("size"),
                modified_at=model_data.get("modified_at"),
                digest=model_data.get("digest"),
                details=model_data.get("details")
            ))
        
        return ModelsListResponse(
            models=models,
            count=len(models)
        )
        
    except httpx.RequestError as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot connect to Ollama service"
        )

@router.post("/pull", response_model=PullModelResponse, status_code=status.HTTP_200_OK)
async def pull_model(request: PullModelRequest):
    """
    Télécharge un modèle depuis Ollama registry
    
    Exemples de modèles:
    - llama3.2
    - llama3.2:3b
    - mistral
    - nomic-embed-text
    """
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Pull du modèle (peut prendre du temps)
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/pull",
                json={"name": request.name}
            )
            
        if response.status_code != 200:
            return PullModelResponse(
                success=False,
                message=f"Failed to pull model: {response.text}",
                model_name=request.name
            )
        
        logger.success(f"Model {request.name} pulled successfully")
        
        return PullModelResponse(
            success=True,
            message=f"Model {request.name} pulled successfully",
            model_name=request.name
        )
        
    except Exception as e:
        logger.error(f"Error pulling model {request.name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error pulling model: {str(e)}"
        )

@router.delete("/{model_name}", status_code=status.HTTP_200_OK)
async def delete_model(model_name: str):
    """
    Supprime un modèle d'Ollama
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{OLLAMA_BASE_URL}/api/delete",
                json={"name": model_name}
            )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete model: {response.text}"
            )
        
        logger.info(f"Model {model_name} deleted successfully")
        
        return {
            "success": True,
            "message": f"Model {model_name} deleted successfully",
            "model_name": model_name
        }
        
    except Exception as e:
        logger.error(f"Error deleting model {model_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting model: {str(e)}"
        )

@router.get("/recommended", status_code=status.HTTP_200_OK)
async def get_recommended_models():
    """
    Retourne la liste des modèles recommandés pour OceanPhenix
    """
    return {
        "recommended_models": {
            "embeddings": [
                {
                    "name": "nomic-embed-text",
                    "description": "Meilleur modèle d'embedding pour RAG",
                    "size": "274 MB",
                    "use_case": "Embeddings de documents"
                }
            ],
            "chat": [
                {
                    "name": "llama3.2",
                    "description": "Modèle conversationnel performant",
                    "size": "2.0 GB",
                    "use_case": "Réponses RAG et chat général"
                },
                {
                    "name": "llama3.2:3b",
                    "description": "Version légère et rapide",
                    "size": "2.0 GB",
                    "use_case": "Serveurs avec RAM limitée"
                },
                {
                    "name": "mistral",
                    "description": "Excellent pour le français",
                    "size": "4.1 GB",
                    "use_case": "Entreprises françaises"
                }
            ],
            "specialized": [
                {
                    "name": "codellama",
                    "description": "Spécialisé code et programmation",
                    "size": "3.8 GB",
                    "use_case": "Assistant développement"
                }
            ]
        }
    }

@router.get("/status", status_code=status.HTTP_200_OK)
async def get_ollama_status():
    """
    Statut du service Ollama
    """
    is_connected = await check_ollama_connection()
    
    return {
        "service": "Ollama",
        "status": "UP" if is_connected else "DOWN",
        "url": OLLAMA_BASE_URL,
        "timestamp": datetime.utcnow().isoformat()
    }
