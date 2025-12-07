"""
═══════════════════════════════════════════════════════════════════════════
🧩 RAG Pipeline - Retrieval Augmented Generation
═══════════════════════════════════════════════════════════════════════════
Pipeline complète : ingestion documents → embeddings → recherche → réponse
═══════════════════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import httpx
import os
from loguru import logger
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from minio import Minio
import io
import hashlib

# Document processors
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
import re

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "rag-documents")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

RAG_COLLECTION_NAME = os.getenv("RAG_COLLECTION_NAME", "oceanphenix_rag")
RAG_EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "nomic-embed-text")
RAG_CHAT_MODEL = os.getenv("RAG_CHAT_MODEL", "llama3.2")
EMBEDDING_DIMENSION = 768  # nomic-embed-text dimension

# Initialisation clients
try:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    logger.info(f"Qdrant client initialized: {QDRANT_HOST}:{QDRANT_PORT}")
except Exception as e:
    logger.error(f"Failed to initialize Qdrant client: {e}")
    qdrant_client = None

try:
    minio_client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE
    )
except Exception as e:
    logger.error(f"Failed to initialize MinIO client: {e}")
    minio_client = None

# ═══════════════════════════════════════════════════════════════════════════
# Models Pydantic
# ═══════════════════════════════════════════════════════════════════════════

class IngestRequest(BaseModel):
    """Requête d'ingestion"""
    filename: str
    force_reindex: bool = False

class IngestResponse(BaseModel):
    """Réponse ingestion"""
    success: bool
    message: str
    filename: str
    chunks_count: int
    vectors_indexed: int

class RAGQuestion(BaseModel):
    """Question RAG"""
    question: str
    top_k: int = 3
    include_sources: bool = True

class RAGAnswer(BaseModel):
    """Réponse RAG"""
    question: str
    answer: str
    sources: Optional[List[dict]] = None
    chunks_used: int
    model_used: str

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions - Document Processing
# ═══════════════════════════════════════════════════════════════════════════

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extrait le texte d'un PDF"""
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extrait le texte d'un DOCX"""
    try:
        doc = DocxDocument(io.BytesIO(file_content))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        return ""

def extract_text_from_txt(file_content: bytes) -> str:
    """Extrait le texte d'un fichier texte"""
    try:
        return file_content.decode('utf-8').strip()
    except Exception as e:
        logger.error(f"TXT extraction error: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Découpe le texte en chunks avec overlap"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    
    return chunks

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions - Embeddings & Vectors
# ═══════════════════════════════════════════════════════════════════════════

async def generate_embedding(text: str) -> List[float]:
    """Génère un embedding avec Ollama"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/embeddings",
                json={
                    "model": RAG_EMBEDDING_MODEL,
                    "prompt": text
                }
            )
        
        if response.status_code != 200:
            raise Exception(f"Embedding generation failed: {response.text}")
        
        data = response.json()
        return data.get("embedding", [])
        
    except Exception as e:
        logger.error(f"Embedding generation error: {e}")
        raise

async def check_qdrant_connection() -> bool:
    """Vérifie la connexion Qdrant"""
    if not qdrant_client:
        return False
    
    try:
        # Créer la collection si elle n'existe pas
        collections = qdrant_client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if RAG_COLLECTION_NAME not in collection_names:
            qdrant_client.create_collection(
                collection_name=RAG_COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=EMBEDDING_DIMENSION,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Collection {RAG_COLLECTION_NAME} created")
        
        return True
        
    except Exception as e:
        logger.error(f"Qdrant connection check failed: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions - RAG
# ═══════════════════════════════════════════════════════════════════════════

async def generate_answer(question: str, context: str) -> str:
    """Génère une réponse avec le modèle de chat"""
    try:
        prompt = f"""Tu es un assistant IA expert. Utilise UNIQUEMENT le contexte suivant pour répondre à la question.
Si la réponse n'est pas dans le contexte, dis-le clairement.

CONTEXTE:
{context}

QUESTION: {question}

RÉPONSE:"""

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": RAG_CHAT_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )
        
        if response.status_code != 200:
            raise Exception(f"Answer generation failed: {response.text}")
        
        data = response.json()
        return data.get("response", "Désolé, je n'ai pas pu générer de réponse.")
        
    except Exception as e:
        logger.error(f"Answer generation error: {e}")
        raise

# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_document(request: IngestRequest):
    """
    Ingère un document depuis MinIO vers Qdrant
    
    1. Récupère le document depuis MinIO
    2. Extrait le texte
    3. Découpe en chunks
    4. Génère les embeddings
    5. Indexe dans Qdrant
    """
    if not minio_client or not qdrant_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG services not available"
        )
    
    try:
        # 1. Récupérer le document depuis MinIO
        logger.info(f"Fetching document: {request.filename}")
        response = minio_client.get_object(MINIO_BUCKET, request.filename)
        file_content = response.read()
        response.close()
        response.release_conn()
        
        # 2. Extraire le texte selon le type
        filename_lower = request.filename.lower()
        if filename_lower.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        elif filename_lower.endswith('.docx'):
            text = extract_text_from_docx(file_content)
        elif filename_lower.endswith(('.txt', '.md')):
            text = extract_text_from_txt(file_content)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {request.filename}"
            )
        
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text could be extracted from document"
            )
        
        logger.info(f"Extracted {len(text)} characters")
        
        # 3. Découper en chunks
        chunks = chunk_text(text)
        logger.info(f"Created {len(chunks)} chunks")
        
        # 4. Générer les embeddings et indexer
        points = []
        for i, chunk in enumerate(chunks):
            # Générer embedding
            embedding = await generate_embedding(chunk)
            
            # Créer un ID unique
            chunk_id = hashlib.md5(f"{request.filename}_{i}".encode()).hexdigest()
            
            # Créer le point Qdrant
            point = PointStruct(
                id=chunk_id,
                vector=embedding,
                payload={
                    "filename": request.filename,
                    "chunk_index": i,
                    "text": chunk,
                    "indexed_at": datetime.utcnow().isoformat()
                }
            )
            points.append(point)
        
        # 5. Upserter dans Qdrant
        qdrant_client.upsert(
            collection_name=RAG_COLLECTION_NAME,
            points=points
        )
        
        logger.success(f"Indexed {len(points)} vectors for {request.filename}")
        
        return IngestResponse(
            success=True,
            message=f"Document ingested successfully",
            filename=request.filename,
            chunks_count=len(chunks),
            vectors_indexed=len(points)
        )
        
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )

@router.post("/ask", response_model=RAGAnswer, status_code=status.HTTP_200_OK)
async def ask_question(question: RAGQuestion):
    """
    Pose une question au RAG
    
    1. Génère l'embedding de la question
    2. Recherche les chunks similaires dans Qdrant
    3. Construit le contexte
    4. Génère la réponse avec le LLM
    """
    if not qdrant_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Qdrant service not available"
        )
    
    try:
        # 1. Générer l'embedding de la question
        question_embedding = await generate_embedding(question.question)
        
        # 2. Rechercher dans Qdrant
        search_results = qdrant_client.search(
            collection_name=RAG_COLLECTION_NAME,
            query_vector=question_embedding,
            limit=question.top_k
        )
        
        if not search_results:
            return RAGAnswer(
                question=question.question,
                answer="Désolé, je n'ai trouvé aucune information pertinente dans les documents.",
                sources=[],
                chunks_used=0,
                model_used=RAG_CHAT_MODEL
            )
        
        # 3. Construire le contexte
        context_parts = []
        sources = []
        
        for result in search_results:
            context_parts.append(result.payload.get("text", ""))
            
            if question.include_sources:
                sources.append({
                    "filename": result.payload.get("filename"),
                    "chunk_index": result.payload.get("chunk_index"),
                    "score": round(result.score, 3),
                    "text_preview": result.payload.get("text", "")[:200] + "..."
                })
        
        context = "\n\n".join(context_parts)
        
        # 4. Générer la réponse
        answer = await generate_answer(question.question, context)
        
        return RAGAnswer(
            question=question.question,
            answer=answer,
            sources=sources if question.include_sources else None,
            chunks_used=len(search_results),
            model_used=RAG_CHAT_MODEL
        )
        
    except Exception as e:
        logger.error(f"RAG question error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG error: {str(e)}"
        )

@router.get("/status", status_code=status.HTTP_200_OK)
async def get_rag_status():
    """Statut du système RAG"""
    qdrant_ok = await check_qdrant_connection()
    
    # Compter les documents indexés
    vectors_count = 0
    if qdrant_ok:
        try:
            collection_info = qdrant_client.get_collection(RAG_COLLECTION_NAME)
            vectors_count = collection_info.points_count
        except:
            pass
    
    return {
        "rag_operational": qdrant_ok,
        "collection_name": RAG_COLLECTION_NAME,
        "vectors_indexed": vectors_count,
        "embedding_model": RAG_EMBEDDING_MODEL,
        "chat_model": RAG_CHAT_MODEL,
        "timestamp": datetime.utcnow().isoformat()
    }
