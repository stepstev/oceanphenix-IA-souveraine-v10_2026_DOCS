"""
═══════════════════════════════════════════════════════════════════════════
🏥 Health Check & Status Endpoints
═══════════════════════════════════════════════════════════════════════════
Endpoints pour vérifier l'état de santé de la plateforme
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
import httpx
import os
from loguru import logger

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# Models Pydantic
# ═══════════════════════════════════════════════════════════════════════════

class ServiceHealth(BaseModel):
    """État de santé d'un service"""
    name: str
    status: str
    url: Optional[str] = None
    response_time_ms: Optional[float] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Réponse globale de santé"""
    status: str
    timestamp: str
    services: Dict[str, ServiceHealth]
    healthy_count: int
    total_count: int
    health_percentage: float

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

SERVICES_TO_CHECK = {
    "ollama": f"http://{os.getenv('OLLAMA_BASE_URL', 'ollama:11434').replace('http://', '')}/api/tags",
    "qdrant": f"http://{os.getenv('QDRANT_HOST', 'qdrant')}:{os.getenv('QDRANT_PORT', '6333')}/health",
    "minio": f"http://{os.getenv('MINIO_ENDPOINT', 'minio:9000').replace('http://', '')}/minio/health/live",
}

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

async def check_service_health(name: str, url: str) -> ServiceHealth:
    """Vérifie la santé d'un service"""
    try:
        start_time = datetime.now()
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            
        end_time = datetime.now()
        response_time_ms = (end_time - start_time).total_seconds() * 1000
        
        service_status = "healthy" if response.status_code == 200 else "degraded"
        
        return ServiceHealth(
            name=name,
            status=service_status,
            url=url,
            response_time_ms=round(response_time_ms, 2)
        )
        
    except Exception as e:
        logger.error(f"Service {name} check failed: {e}")
        return ServiceHealth(
            name=name,
            status="unhealthy",
            url=url,
            error=str(e)
        )

# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """
    Endpoint de santé global de la plateforme
    
    Vérifie tous les services CORE et retourne un statut global
    """
    services_health = {}
    
    # Check tous les services
    for service_name, service_url in SERVICES_TO_CHECK.items():
        service_health = await check_service_health(service_name, service_url)
        services_health[service_name] = service_health
    
    # Calculer les métriques
    total_count = len(services_health)
    healthy_count = sum(1 for s in services_health.values() if s.status == "healthy")
    health_percentage = (healthy_count / total_count * 100) if total_count > 0 else 0
    
    # Déterminer le statut global
    if health_percentage == 100:
        global_status = "healthy"
    elif health_percentage >= 50:
        global_status = "degraded"
    else:
        global_status = "unhealthy"
    
    return HealthResponse(
        status=global_status,
        timestamp=datetime.utcnow().isoformat(),
        services=services_health,
        healthy_count=healthy_count,
        total_count=total_count,
        health_percentage=round(health_percentage, 2)
    )

@router.get("/health/simple", status_code=status.HTTP_200_OK)
async def health_simple():
    """
    Health check simple pour monitoring externe
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check():
    """
    Readiness probe - vérifie si l'API est prête à recevoir du trafic
    """
    # On pourrait ajouter des checks plus spécifiques ici
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    Liveness probe - vérifie si l'API est vivante
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }
