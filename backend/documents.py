"""
═══════════════════════════════════════════════════════════════════════════
📄 Documents Management - Gestion documents MinIO
═══════════════════════════════════════════════════════════════════════════
Upload, liste, suppression de documents stockés sur MinIO S3
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from minio import Minio
from minio.error import S3Error
import os
import io
from loguru import logger

# Limites de sécurité pour les uploads
MAX_UPLOAD_MB = 20
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "md"}

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# Configuration MinIO
# ═══════════════════════════════════════════════════════════════════════════

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "rag-documents")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# Initialisation client MinIO
try:
    minio_client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE
    )
    logger.info(f"MinIO client initialized: {MINIO_ENDPOINT}")
except Exception as e:
    logger.error(f"Failed to initialize MinIO client: {e}")
    minio_client = None

# ═══════════════════════════════════════════════════════════════════════════
# Models Pydantic
# ═══════════════════════════════════════════════════════════════════════════

class DocumentInfo(BaseModel):
    """Information sur un document"""
    name: str
    size: int
    size_mb: float
    last_modified: str
    content_type: Optional[str] = None
    url: Optional[str] = None

class DocumentsListResponse(BaseModel):
    """Réponse liste documents"""
    documents: List[DocumentInfo]
    count: int
    total_size_mb: float

class UploadResponse(BaseModel):
    """Réponse upload"""
    success: bool
    message: str
    filename: str
    size_mb: float

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

async def check_minio_connection() -> bool:
    """Vérifie la connexion à MinIO"""
    if not minio_client:
        return False
    
    try:
        # Vérifier si le bucket existe, sinon le créer
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
            logger.info(f"Bucket {MINIO_BUCKET} created")
        return True
    except Exception as e:
        logger.error(f"MinIO connection check failed: {e}")
        return False

async def get_minio_stats():
    """Récupère les statistiques MinIO pour BI"""
    from bi_endpoints import DocumentStats
    
    if not minio_client:
        return DocumentStats(total_documents=0, total_size_mb=0.0, by_type={})
    
    try:
        objects = minio_client.list_objects(MINIO_BUCKET, recursive=True)
        
        total_size = 0
        total_docs = 0
        by_type = {}
        
        for obj in objects:
            total_docs += 1
            total_size += obj.size
            
            # Compter par extension
            ext = obj.object_name.split('.')[-1].lower() if '.' in obj.object_name else 'other'
            by_type[ext] = by_type.get(ext, 0) + 1
        
        return DocumentStats(
            total_documents=total_docs,
            total_size_mb=round(total_size / (1024 * 1024), 2),
            by_type=by_type
        )
        
    except Exception as e:
        logger.error(f"Error getting MinIO stats: {e}")
        return DocumentStats(total_documents=0, total_size_mb=0.0, by_type={})

# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/", response_model=DocumentsListResponse, status_code=status.HTTP_200_OK)
async def list_documents():
    """
    Liste tous les documents stockés sur MinIO
    """
    if not minio_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MinIO service not available"
        )
    
    try:
        # S'assurer que le bucket existe
        await check_minio_connection()
        
        # Lister les objets
        objects = minio_client.list_objects(MINIO_BUCKET, recursive=True)
        
        documents = []
        total_size = 0
        
        for obj in objects:
            size_mb = obj.size / (1024 * 1024)
            total_size += size_mb
            
            documents.append(DocumentInfo(
                name=obj.object_name,
                size=obj.size,
                size_mb=round(size_mb, 2),
                last_modified=obj.last_modified.isoformat(),
                content_type=obj.content_type
            ))
        
        return DocumentsListResponse(
            documents=documents,
            count=len(documents),
            total_size_mb=round(total_size, 2)
        )
        
    except S3Error as e:
        logger.error(f"MinIO S3 error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MinIO error: {str(e)}"
        )

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload un document vers MinIO
    
    Formats supportés: PDF, DOCX, TXT, MD, etc.
    """
    if not minio_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MinIO service not available"
        )
    
    try:
        # S'assurer que le bucket existe
        await check_minio_connection()
        
        # Validation type et taille
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {ext}"
            )

        # Lire le contenu du fichier
        content = await file.read()
        file_size = len(content)
        size_mb = file_size / (1024 * 1024)
        if size_mb > MAX_UPLOAD_MB:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large: {size_mb:.2f} MB (max {MAX_UPLOAD_MB} MB)"
            )
        
        # Upload vers MinIO
        minio_client.put_object(
            MINIO_BUCKET,
            file.filename,
            io.BytesIO(content),
            file_size,
            content_type=file.content_type
        )
        
        logger.success(f"File {file.filename} uploaded successfully ({size_mb:.2f} MB)")
        
        return UploadResponse(
            success=True,
            message=f"File uploaded successfully",
            filename=file.filename,
            size_mb=round(size_mb, 2)
        )
        
    except S3Error as e:
        logger.error(f"MinIO upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.delete("/{filename}", status_code=status.HTTP_200_OK)
async def delete_document(filename: str):
    """
    Supprime un document de MinIO
    """
    if not minio_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MinIO service not available"
        )
    
    try:
        minio_client.remove_object(MINIO_BUCKET, filename)
        
        logger.info(f"File {filename} deleted successfully")
        
        return {
            "success": True,
            "message": f"File {filename} deleted successfully",
            "filename": filename
        }
        
    except S3Error as e:
        logger.error(f"MinIO delete error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}"
        )

@router.get("/download/{filename}", status_code=status.HTTP_200_OK)
async def download_document(filename: str):
    """
    Génère une URL de téléchargement temporaire pour un document
    """
    if not minio_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MinIO service not available"
        )
    
    try:
        # Générer une URL pré-signée valide 1 heure
        url = minio_client.presigned_get_object(
            MINIO_BUCKET,
            filename,
            expires=3600  # 1 heure
        )
        
        return {
            "filename": filename,
            "download_url": url,
            "expires_in_seconds": 3600
        }
        
    except S3Error as e:
        logger.error(f"MinIO presigned URL error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )
