#!/bin/bash
# Synchronisation automatique MinIO → Open WebUI Documents

set -e

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_USER="${MINIO_ROOT_USER:-admin}"
MINIO_PASSWORD="${MINIO_ROOT_PASSWORD:-Mini0P@ssw0rd2026}"
BUCKET="${MINIO_BUCKET_RAG:-rag-documents}"
TARGET_DIR="/docs"

echo "🔄 Configuration MinIO Client..."
mc alias set minio "$MINIO_ENDPOINT" "$MINIO_USER" "$MINIO_PASSWORD"

echo "📥 Synchronisation de $BUCKET vers $TARGET_DIR..."
mc mirror --watch --overwrite minio/$BUCKET/ $TARGET_DIR/

echo "✅ Synchronisation terminée"
