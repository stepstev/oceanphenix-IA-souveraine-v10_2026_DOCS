"""
═══════════════════════════════════════════════════════════════════════════
📊 Business Intelligence Endpoints
═══════════════════════════════════════════════════════════════════════════
Endpoints pour le Hub Frontend - Statistiques et état de la plateforme
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import httpx
import asyncio
import os
from loguru import logger
import math

try:
    import psutil
except ImportError:
    psutil = None

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# Models Pydantic
# ═══════════════════════════════════════════════════════════════════════════

class ServiceStatus(BaseModel):
    """Statut d'un service"""
    name: str
    type: str  # "core" ou "premium"
    status: str
    url: Optional[str] = None
    icon: str

class StackOverview(BaseModel):
    """Vue d'ensemble de la stack"""
    total_services: int
    core_services: List[ServiceStatus]
    premium_services: List[ServiceStatus]
    health_percentage: float
    last_update: str

class DocumentStats(BaseModel):
    """Statistiques documents"""
    total_documents: int
    total_size_mb: float
    by_type: Dict[str, int]

# ═══════════════════════════════════════════════════════════════════════════
# Configuration Services
# ═══════════════════════════════════════════════════════════════════════════

CORE_SERVICES = [
    {
        "name": "Ollama",
        "type": "core",
        "url": f"http://{os.getenv('OLLAMA_BASE_URL', 'ollama:11434').replace('http://', '')}/api/tags",
        "icon": "🧠"
    },
    {
        "name": "Qdrant",
        "type": "core",
        "url": f"http://{os.getenv('QDRANT_HOST', 'qdrant')}:{os.getenv('QDRANT_PORT', '6333')}/health",
        "icon": "🗄️"
    },
    {
        "name": "MinIO",
        "type": "core",
        "url": f"http://{os.getenv('MINIO_ENDPOINT', 'minio:9000').replace('http://', '')}/minio/health/live",
        "icon": "📦"
    },
    {
        "name": "OpenWebUI",
        "type": "core",
        "url": "http://openwebui:8080/health",
        "icon": "🎨"
    },
    {
        "name": "API FastAPI",
        "type": "core",
        "url": "http://localhost:8000/health/simple",
        "icon": "⚡"
    }
]

PREMIUM_SERVICES = [
    {
        "name": "n8n",
        "type": "premium",
        "url": "http://n8n:5678/healthz",
        "icon": "🔄"
    },
    {
        "name": "Grafana",
        "type": "premium",
        "url": "http://grafana:3000/api/health",
        "icon": "📊"
    },
    {
        "name": "Portainer",
        "type": "premium",
        "url": "http://portainer:9000/api/status",
        "icon": "🐳"
    }
]

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

async def check_single_service(service: dict) -> ServiceStatus:
    """Vérifie un service individuel avec timeout court et sans bloquer les autres"""
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(1.5)) as client:
            response = await client.get(service["url"])
            service_status = "UP" if response.status_code == 200 else "DOWN"
    except Exception as e:
        logger.debug(f"Service {service['name']} check failed: {e}")
        service_status = "DOWN"
    
    return ServiceStatus(
        name=service["name"],
        type=service["type"],
        status=service_status,
        url=service.get("url"),
        icon=service["icon"]
    )

# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/services", response_model=List[ServiceStatus], status_code=status.HTTP_200_OK)
async def get_services_status():
    """
    Liste tous les services avec leur statut
    
    Utilisé par le Hub Frontend pour afficher l'état en temps réel
    """
    all_services = CORE_SERVICES + PREMIUM_SERVICES
    # Vérifications en parallèle pour répondre vite même si un service traîne
    services_status = await asyncio.gather(*(check_single_service(s) for s in all_services))
    return services_status

@router.get("/stack-overview", response_model=StackOverview, status_code=status.HTTP_200_OK)
async def get_stack_overview():
    """
    Vue d'ensemble complète de la stack
    
    Retourne tous les services groupés par type avec métriques globales
    """
    # Check core/premium en parallèle
    core_status, premium_status = await asyncio.gather(
        asyncio.gather(*(check_single_service(s) for s in CORE_SERVICES)),
        asyncio.gather(*(check_single_service(s) for s in PREMIUM_SERVICES))
    )
    
    # Calculer le pourcentage de santé
    total_services = len(core_status) + len(premium_status)
    up_services = sum(1 for s in core_status + premium_status if s.status == "UP")
    health_percentage = (up_services / total_services * 100) if total_services > 0 else 0
    
    return StackOverview(
        total_services=total_services,
        core_services=core_status,
        premium_services=premium_status,
        health_percentage=round(health_percentage, 2),
        last_update=datetime.utcnow().isoformat()
    )

@router.get("/stats/documents", response_model=DocumentStats, status_code=status.HTTP_200_OK)
async def get_documents_stats():
    """
    Statistiques sur les documents stockés
    
    Retourne le nombre total, taille et répartition par type
    """
    try:
        # Importer le client MinIO du module documents
        from documents import get_minio_stats
        
        stats = await get_minio_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        # Retourner des stats vides en cas d'erreur
        return DocumentStats(
            total_documents=0,
            total_size_mb=0.0,
            by_type={}
        )

@router.get("/metrics/summary", status_code=status.HTTP_200_OK)
async def get_metrics_summary():
    """
    Résumé des métriques principales
    
    Utilisé pour afficher rapidement les KPIs sur le Hub
    """
    # Récupérer le stack overview
    stack = await get_stack_overview()
    
    # Récupérer les stats documents
    docs = await get_documents_stats()
    
    system_metrics = {}
    try:
        if psutil:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            system_metrics = {
                "cpu_percent": round(cpu_percent, 2),
                "memory_used_gb": round(mem.used / 1e9, 2),
                "memory_total_gb": round(mem.total / 1e9, 2),
                "disk_used_gb": round(disk.used / 1e9, 2),
                "disk_total_gb": round(disk.total / 1e9, 2)
            }
    except Exception as e:
        logger.debug(f"Unable to collect system metrics: {e}")

    return {
        "platform": {
            "name": "OceanPhenix IA Souveraine",
            "version": "1.0.0",
            "status": "Opérationnel" if stack.health_percentage >= 80 else "Dégradé"
        },
        "services": {
            "total": stack.total_services,
            "up": sum(1 for s in stack.core_services + stack.premium_services if s.status == "UP"),
            "health_percentage": stack.health_percentage
        },
        "documents": {
            "total": docs.total_documents,
            "total_size_mb": docs.total_size_mb
        },
        "system": system_metrics,
        "timestamp": datetime.utcnow().isoformat()
    }
