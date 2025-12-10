# 🌊 OceanPhenix IA Souveraine V10

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Open WebUI](https://img.shields.io/badge/Open_WebUI-latest-00D9FF)](https://github.com/open-webui/open-webui)

> **Plateforme IA Souveraine complète** avec RAG (Retrieval-Augmented Generation), auto-hébergée, monitoring 360° et orchestration intelligente.

---

## ⚡ Démarrage Ultra-Rapide (5 min)

```bash
# 1. Cloner et configurer
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git
cd oceanphenix-IA-souveraine-v10_2026
cp .env.example .env

# 2. Démarrer la stack complète
docker compose --profile all up -d

# 3. Installer le modèle IA
docker exec v10-ollama ollama pull mistral:latest

# ✅ Accédez à http://localhost:8080
```

📘 **[Guide de Démarrage Complet →](docs/QUICK_START.md)**

---

## 📋 Sommaire de la Documentation

### 📚 1. Installation & Configuration

| N° | Document | Description | Durée |
|----|----------|-------------|-------|
| 1.1 | **[Quick Start](docs/QUICK_START.md)** | Installation locale rapide (Docker) | 5 min |
| 1.2 | **[Installation Locale](docs/INSTALL_LOCAL.md)** | Guide complet environnement dev/test | 30 min |
| 1.3 | **[Installation Hetzner](docs/INSTALL_HETZNER.md)** | Déploiement production serveur dédié | 1h |
| 1.4 | **[Guide Simple](docs/01-GUIDE_SIMPLE.md)** | Configuration pas à pas débutant | 20 min |
| 1.5 | **[Installation O2Switch](docs/INSTALL_O2SWITCH.md)** | Frontend hébergement mutualisé | 15 min |

### 🎨 2. Frontend & Interface

| N° | Document | Description | Durée |
|----|----------|-------------|-------|
| 2.1 | **[Frontend Setup](docs/03-FRONTEND_SETUP.md)** | Configuration Hub Frontend V2 | 10 min |
| 2.2 | **[Deploy O2Switch](scripts/deploy-o2switch-frontend.md)** | Guide déploiement frontend séparé | 20 min |

### 🏗️ 3. Architecture & Technique

| N° | Document | Description | Niveau |
|----|----------|-------------|--------|
| 3.1 | **[Diagrammes Mermaid](docs/DIAGRAMS_MERMAID.md)** | Architecture visuelle complète | 📊 |
| 3.2 | **[README Docs](docs/README.md)** | Index complet documentation | 📖 |

### 📊 4. Monitoring & Alerting

| N° | Document | Description | Type |
|----|----------|-------------|------|
| 4.1 | **[AlertManager Config](docs/ALERTMANAGER_CONFIG.md)** | Configuration alertes emails/Slack | ⚠️ |
| 4.2 | **Dashboards Grafana** | [Containers](core/monitoring/dashboards/oceanphenix-containers-monitoring.json) / [Platform Health](core/monitoring/dashboards/oceanphenix-platform-health.json) | 📈 |

### 🚀 5. Déploiement Production

| N° | Document | Description | Environnement |
|----|----------|-------------|---------------|
| 5.1 | **[Deploy Production](docs/05-DEPLOY_PRODUCTION.md)** | Guide général production | 🏭 |
| 5.2 | **[Deploy Hetzner](docs/04-DEPLOY_HETZNER.md)** | Serveur dédié Hetzner CX43 | 🖥️ |
| 5.3 | **[Script Auto Hetzner](scripts/deploy-hetzner-auto.sh)** | Déploiement automatisé backend | 🤖 |
| 5.4 | **[O2Switch README](docs/deployment/README_O2SWITCH.md)** | Frontend hébergement mutualisé | 🌐 |

### 🔧 6. Maintenance & Mise à Jour

| N° | Opération | Commande | Fréquence |
|----|-----------|----------|-----------|
| 6.1 | **[Mise à jour services](#61-mise-à-jour-services)** | `docker compose pull && up -d` | Mensuelle |
| 6.2 | **[Gestion modèles Ollama](#-gestion-des-modèles-ollama)** | `ollama pull/list/rm` | À la demande |
| 6.3 | **[Sauvegarde données](#-sauvegarde-automatique)** | Scripts cron + volumes Docker | Quotidienne |
| 6.4 | **[Monitoring logs](#-surveillance-logs)** | `docker compose logs -f` | Continue |
| 6.5 | **[Nettoyage système](#-nettoyage-système)** | `docker system prune` | Hebdomadaire |

### 📖 7. Guides Spécialisés

| N° | Document | Description | Public |
|----|----------|-------------|--------|
| 7.1 | **[Installation Rapide Local](docs/INSTALL_LOCAL_RAPIDE.md)** | Setup express développeur | 👨‍💻 Dev |
| 7.2 | **[O2Switch Simple](docs/INSTALL_O2SWITCH_SIMPLE.md)** | Frontend sans backend | 🎨 Frontend |

---

## 🎯 Vue d'Ensemble

**OceanPhenix V10** est une plateforme d'intelligence artificielle **100% souveraine et auto-hébergée**, offrant une stack complète pour l'IA conversationnelle, l'analyse documentaire et l'automatisation métier.

### 🌟 Fonctionnalités Principales

| Fonctionnalité | Technologies | Description |
|----------------|--------------|-------------|
| 🤖 **Chat IA avec RAG** | Ollama + Qdrant + FastAPI | Interface conversationnelle avec contexte documentaire |
| 🧠 **LLM Locaux** | Ollama (Mistral, Llama3, Qwen2.5) | Modèles IA auto-hébergés sans API externe |
| 📊 **Base Vectorielle** | Qdrant | Embeddings et recherche sémantique temps réel |
| 🗄️ **Stockage S3** | MinIO | Stockage objet compatible AWS S3 |
| 📈 **Monitoring 360°** | Prometheus + Grafana + AlertManager | Surveillance infrastructure et alertes |
| ⚡ **Automatisation** | n8n (v1.120.0) | Workflows intelligents et intégrations |
| 📊 **Business Intelligence** | Apache Superset | Dashboards analytics et reporting |
| 🎨 **Hub Frontend** | JavaScript vanilla + API REST | Interface unifiée de gestion |
| 🐳 **Orchestration** | Docker Compose V2 | 12 services avec profiles modulaires |

### ✅ Cas d'Usage

- 💬 Assistance IA conversationnelle avec contexte métier personnalisé
- 📄 Analyse et extraction d'informations de documents (PDF, Office, Markdown)
- 🔄 Automatisation de workflows métier complexes
- 📊 Monitoring infrastructure et applications temps réel
- 🏢 Plateforme IA souveraine pour entreprises (conformité RGPD)
- 🎓 Environnement d'apprentissage et R&D en IA

---

## 🏗️ Architecture

---

## 🎯 Vue d'Ensemble

**OceanPhenix V10** est une plateforme d'intelligence artificielle complète, auto-hébergée et souveraine, offrant :

### Fonctionnalités Principales

- 🤖 **Chat IA avec RAG** - Interface conversationnelle avec contexte documentaire
- 🧠 **Modèles LLM Locaux** - Ollama (Mistral, Llama, Qwen, etc.)
- 📊 **Base Vectorielle** - Qdrant pour embeddings et recherche sémantique
- 🗄️ **Stockage S3** - MinIO compatible AWS S3
- 📈 **Monitoring Complet** - Prometheus + Grafana + AlertManager
- ⚡ **Automatisation** - n8n pour workflows intelligents
- 📊 **Business Intelligence** - Apache Superset pour analytics
- 🐳 **Infrastructure Docker** - Orchestration complète avec profiles

### Cas d'Usage

✅ Assistance IA conversationnelle avec contexte métier  
✅ Analyse de documents avec RAG (PDF, Markdown, Office)  
✅ Automatisation de workflows métier  
✅ Monitoring infrastructure temps réel  
✅ Plateforme IA souveraine pour entreprises (RGPD compliant)  

---

## 🏗️ Architecture

### Vue Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 INTERNET / DNS                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Caddy Proxy       │ ← SSL/TLS Automatique
                │   (Reverse Proxy)   │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
│   FRONTEND     │ │   BACKEND    │ │   SERVICES     │
│                │ │              │ │                │
│ • Hub V10      │ │ • API Python │ │ • Ollama       │
│ • Dashboard    │ │ • RAG Engine │ │ • Qdrant       │
│ • Monitoring   │ │ • Document   │ │ • MinIO        │
│                │ │   Processor  │ │ • PostgreSQL   │
└────────────────┘ └──────────────┘ └────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                           │
                ┌──────────▼──────────┐
                │   MONITORING        │
                │                     │
                │ • Prometheus        │
                │ • Grafana           │
                │ • AlertManager      │
                └─────────────────────┘
```

### Flux de Données RAG

```
User Question
     │
     ▼
┌────────────────┐
│  Open WebUI    │ ← Interface utilisateur
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Backend API   │ ← Traitement requête
└───────┬────────┘
        │
        ├─► Qdrant (Recherche vectorielle)
        │          ↓
        │     Documents pertinents
        │          ↓
        └─► Ollama (LLM avec contexte)
                   ↓
            Réponse augmentée
```

---

## 📁 Structure du Projet

```
oceanphenix-IA-souveraine-v10/
│
├── 📂 frontend/                    # Interface utilisateur
│   ├── hub-frontend-v2/            # Hub principal V10
│   │   ├── pages/                  # Pages HTML (dashboard, RAG, monitoring)
│   │   ├── assets/                 # CSS, JS, images
│   │   ├── legal/                  # CGU, confidentialité, mentions légales
│   │   └── includes/               # Composants réutilisables (header, sidebar)
│   └── tabler-dev/                 # Framework UI (Tabler)
│
├── 📂 backend/                     # API et logique métier
│   ├── main.py                     # FastAPI principal
│   ├── rag_pipeline.py             # Pipeline RAG
│   ├── documents.py                # Gestion documents
│   ├── models_manager.py           # Gestion modèles LLM
│   ├── bi_endpoints.py             # Endpoints analytics
│   ├── health.py                   # Health checks
│   ├── requirements.txt            # Dépendances Python
│   └── Dockerfile                  # Image Docker backend
│
├── 📂 core/                        # Configuration infrastructure
│   ├── proxy/                      # Caddy reverse proxy
│   │   ├── Caddyfile               # Config production
│   │   └── Caddyfile.o2switch      # Config O2Switch
│   └── monitoring/                 # Monitoring stack
│       ├── prometheus.yml          # Config Prometheus
│       ├── alertmanager.yml        # Config alertes
│       ├── alert_rules.yml         # Règles d'alerte
│       ├── dashboards/             # Dashboards Grafana
│       └── grafana/                # Provisioning Grafana
│
├── 📂 docs/                        # Documentation complète
│   ├── 01-INSTALLATION-LOCALE.md   # Guide installation locale
│   ├── 02-INSTALLATION-HETZNER.md  # Guide production Hetzner
│   ├── 03-INSTALLATION-O2SWITCH.md # Guide O2Switch frontend
│   ├── ARCHITECTURE.md             # Documentation architecture
│   ├── API.md                      # Documentation API
│   └── TROUBLESHOOTING.md          # Résolution problèmes
│
├── 📂 scripts/                     # Scripts utilitaires
│   ├── auto-indexer.py             # Indexation automatique documents
│   ├── deploy-hetzner.sh           # Déploiement automatisé Hetzner
│   └── sync-minio-to-openwebui.sh  # Sync stockage
│
├── 📂 data/                        # Données persistantes
│   └── documents/                  # Documents à indexer
│
├── docker-compose.yml              # Orchestration Docker
├── .env.example                    # Template configuration
├── README.md                       # Ce fichier
├── AUDIT_RAPPORT.md                # Rapport audit projet
└── LICENSE                         # Licence MIT
```

---

## 🔌 Services & Ports

### Services Principaux

| Service | Container | Port(s) | Description | Profile |
|---------|-----------|---------|-------------|---------|
| **Hub Frontend** | `v10-frontend` | `80, 443` | Interface principale | `core` |
| **API Backend** | `v10-api` | `8000` | FastAPI Python | `core` |
| **Open WebUI** | `v10-studio` | `3000` | Chat IA avec RAG | `rag` |
| **Ollama** | `v10-ollama` | `11434` | Serveur LLM | `rag` |
| **Qdrant** | `v10-qdrant` | `6333` | Base vectorielle | `rag` |
| **MinIO** | `v10-minio` | `9000, 9001` | Stockage S3 | `core` |
| **PostgreSQL** | `v10-db` | `5432` | Base de données | `core` |
| **Valkey** | `v10-cache` | `6379` | Cache Redis-compatible | `core` |

### Monitoring & Administration

| Service | Container | Port(s) | Description | Profile |
|---------|-----------|---------|-------------|---------|
| **Prometheus** | `v10-prometheus` | `9090` | Métriques système | `monitoring` |
| **Grafana** | `v10-grafana` | `3001` | Dashboards | `monitoring` |
| **AlertManager** | `v10-alertmanager` | `9093` | Gestion alertes | `monitoring` |
| **Node Exporter** | `v10-node-exporter` | `9100` | Métriques serveur | `monitoring` |
| **cAdvisor** | `v10-cadvisor` | `8081` | Métriques containers | `monitoring` |
| **Portainer** | `v10-portainer` | `9443, 9002` | Interface Docker | `core` |

### Automatisation & BI

| Service | Container | Port(s) | Description | Profile |
|---------|-----------|---------|-------------|---------|
| **n8n** | `v10-n8n` | `5678` | Workflows automation | `automation` |
| **Superset** | `v10-bi` | `8088` | Business Intelligence | `bi` |

### Profiles Docker Compose

```bash
# Profil CORE (services essentiels)
docker compose --profile core up -d

# Profil RAG (IA + Chat)
docker compose --profile rag up -d

# Profil MONITORING (métriques + alertes)
docker compose --profile monitoring up -d

# Profil BI (analytics)
docker compose --profile bi up -d

# Profil AUTOMATION (workflows)
docker compose --profile automation up -d

# TOUT en une commande
docker compose --profile all up -d
```

---

## ⚙️ Configuration

### Fichier `.env` Requis

Copier `.env.example` vers `.env` et configurer :

```bash
# === DOMAINES (Production) ===
ACME_EMAIL=votre@email.com
DOMAIN_DASHBOARD=oceanphenix.votredomaine.com
DOMAIN_API=api.votredomaine.com
DOMAIN_MINIO=s3.votredomaine.com

# === SÉCURITÉ ===
ADMIN_PASSWORD_HASH=VotreMotDePasseFort123!
GRAFANA_ADMIN_PASSWORD=GrafanaSecure456!
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=MinIOSecure789!

# === N8N ===
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8nSecure321!

# === SMTP (Alertes) ===
SMTP_PASSWORD=VotrePasswordSMTP
```

### Génération Mots de Passe Sécurisés

```bash
# Sous Linux/macOS
openssl rand -base64 32

# Sous Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 📚 Documentation

### 📖 Documentation Complète

**[📂 docs/README.md](docs/README.md)** - **Sommaire structuré de toute la documentation**

### 🚀 Guides d'Installation

| Guide | Description | Durée | Public |
|-------|-------------|-------|--------|
| **[QUICK_START.md](QUICK_START.md)** | Démarrage ultra-rapide 5 minutes | ⚡ 5 min | Tous |
| **[docs/INSTALL_LOCAL_RAPIDE.md](docs/INSTALL_LOCAL_RAPIDE.md)** | Installation locale automatisée | ⚡ 10 min | Débutant |
| **[docs/INSTALL_LOCAL.md](docs/INSTALL_LOCAL.md)** | Installation locale complète Docker Desktop | 🕐 30 min | Intermédiaire |
| **[docs/INSTALL_HETZNER.md](docs/INSTALL_HETZNER.md)** | Déploiement production serveur Hetzner + SSL | 🕑 1h | Avancé |
| **[docs/01-GUIDE_SIMPLE.md](docs/01-GUIDE_SIMPLE.md)** | Frontend O2Switch + Backend Hetzner séparés | 🕐 20 min | Intermédiaire |
| **[docs/06-FRONTEND_O2SWITCH_HETZNER.md](docs/06-FRONTEND_O2SWITCH_HETZNER.md)** | Architecture Frontend/Backend distribuée | 🕐 45 min | Avancé |

### 🏗️ Documentation Technique

| Document | Description |
|----------|-------------|
| **[docs/DIAGRAMS_MERMAID.md](docs/DIAGRAMS_MERMAID.md)** | Diagrammes d'architecture (conteneurs, réseaux, flux RAG) |
| **[docs/ALERTMANAGER_CONFIG.md](docs/ALERTMANAGER_CONFIG.md)** | Configuration monitoring et alertes (Prometheus, Grafana, Alertmanager) |
| **[backend/README.md](backend/README.md)** | Documentation API Backend FastAPI + Pipeline RAG |
| **[hub-frontend-v2/README.md](hub-frontend-v2/README.md)** | Documentation Hub Frontend V2 (architecture, pages, composants) |

### 🔧 Configuration & Déploiement

| Document | Description |
|----------|-------------|
| **[docs/02-INSTALLATION.md](docs/02-INSTALLATION.md)** | Guide installation détaillé pas-à-pas |
| **[docs/03-FRONTEND_SETUP.md](docs/03-FRONTEND_SETUP.md)** | Configuration et personnalisation Frontend |
| **[docs/04-DEPLOY_HETZNER.md](docs/04-DEPLOY_HETZNER.md)** | Déploiement Hetzner avec SSL/DNS automatique |
| **[docs/05-DEPLOY_PRODUCTION.md](docs/05-DEPLOY_PRODUCTION.md)** | Checklist production complète (sécurité, backups, monitoring) |
| **[docs/INSTALL_O2SWITCH.md](docs/INSTALL_O2SWITCH.md)** | Déploiement Frontend sur hébergement mutualisé O2Switch |
| **[docs/deployment/README_O2SWITCH.md](docs/deployment/README_O2SWITCH.md)** | Guide détaillé O2Switch avec FTP/SFTP |

---

## 🛠️ Maintenance & Mise à Jour

### 🔄 Maintenance - Mise à Jour Services

#### Mise à Jour Complète

```bash
# 1. Sauvegarder volumes importants
docker run --rm -v v10_minio_data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio_$(date +%Y%m%d).tar.gz /data

docker run --rm -v v10_qdrant_data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/qdrant_$(date +%Y%m%d).tar.gz /data

# 2. Mettre à jour le code
git pull origin main

# 3. Télécharger les nouvelles images
docker compose pull

# 4. Redémarrer avec les nouvelles versions
docker compose --profile all up -d

# 5. Vérifier que tout fonctionne
docker compose ps
docker compose logs --tail=50
```

#### Mise à Jour d'un Service Spécifique

```bash
# Exemple: Mettre à jour n8n
docker compose pull n8n
docker compose up -d n8n
docker logs v10-n8n --tail 30

# Exemple: Mettre à jour Grafana
docker compose pull grafana
docker compose up -d grafana
```

### 🧠 Gestion des Modèles Ollama

#### Lister les Modèles Installés

```bash
# Méthode 1: Via docker exec
docker exec v10-ollama ollama list

# Méthode 2: Via API
curl http://localhost:11434/api/tags
```

#### Installer de Nouveaux Modèles

```bash
# === MODÈLES RECOMMANDÉS ===

# 🔥 Mistral 7B (Recommandé - 4.1GB)
docker exec v10-ollama ollama pull mistral:latest

# 🦙 Llama 3.2 3B (Léger et performant - 2GB)
docker exec v10-ollama ollama pull llama3.2:latest

# 🇨🇳 Qwen2.5 7B (Multilingue excellent - 4.7GB)
docker exec v10-ollama ollama pull qwen2.5:7b

# 🎯 Phi-3 Mini (Ultra-léger - 2.3GB)
docker exec v10-ollama ollama pull phi3:mini

# 📊 Embeddings (pour RAG)
docker exec v10-ollama ollama pull nomic-embed-text

# === MODÈLES AVANCÉS ===

# Llama 3.1 8B (Plus récent - 4.7GB)
docker exec v10-ollama ollama pull llama3.1:8b

# Mixtral 8x7B (Très performant mais lourd - 26GB)
docker exec v10-ollama ollama pull mixtral:latest

# DeepSeek Coder (Spécialisé code - 6.7GB)
docker exec v10-ollama ollama pull deepseek-coder:6.7b

# Gemma 2 9B (Google - 5.4GB)
docker exec v10-ollama ollama pull gemma2:9b
```

#### Supprimer des Modèles

```bash
# Supprimer un modèle spécifique
docker exec v10-ollama ollama rm mistral:latest

# Lister avant suppression
docker exec v10-ollama ollama list

# Supprimer plusieurs modèles
docker exec v10-ollama ollama rm llama2:7b
docker exec v10-ollama ollama rm codellama:latest
```

#### Tester un Modèle

```bash
# Test interactif
docker exec -it v10-ollama ollama run mistral:latest

# Test via API
curl http://localhost:11434/api/generate -d '{
  "model": "mistral:latest",
  "prompt": "Explique-moi le machine learning en 3 phrases",
  "stream": false
}'
```

#### Informations sur un Modèle

```bash
# Détails complets d'un modèle
docker exec v10-ollama ollama show mistral:latest

# Via API
curl http://localhost:11434/api/show -d '{"name": "mistral:latest"}'
```

#### Benchmark Performance

```bash
# Tester vitesse génération
time docker exec v10-ollama ollama run mistral:latest "Écris un poème sur l'IA" --verbose

# Comparer plusieurs modèles
for model in mistral:latest llama3.2:latest qwen2.5:7b; do
  echo "=== Test $model ==="
  time docker exec v10-ollama ollama run $model "Bonjour, qui es-tu ?"
done
```

### 💾 Sauvegarde Automatique

#### Script de Backup Quotidien

Créer `scripts/backup-daily.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/oceanphenix"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MinIO (documents)
docker run --rm \
  -v v10_minio_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/minio_$DATE.tar.gz /data

# Backup Qdrant (base vectorielle)
docker run --rm \
  -v v10_qdrant_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/qdrant_$DATE.tar.gz /data

# Backup PostgreSQL
docker exec v10-db pg_dumpall -U postgres > $BACKUP_DIR/postgres_$DATE.sql

# Backup n8n workflows
docker run --rm \
  -v v10_n8n_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/n8n_$DATE.tar.gz /data

# Nettoyer backups > 30 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "✅ Backup terminé: $BACKUP_DIR"
```

#### Configurer Cron

```bash
# Éditer crontab
crontab -e

# Ajouter backup quotidien à 2h du matin
0 2 * * * /opt/oceanphenix-v10/scripts/backup-daily.sh >> /var/log/oceanphenix-backup.log 2>&1
```

#### Restaurer un Backup

```bash
# Restaurer MinIO
docker run --rm \
  -v v10_minio_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd / && tar xzf /backup/minio_20250110_020000.tar.gz"

# Restaurer PostgreSQL
docker exec -i v10-db psql -U postgres < backups/postgres_20250110_020000.sql

# Redémarrer services
docker compose restart
```

### 📊 Surveillance Logs

#### Logs en Temps Réel

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f v10-api
docker compose logs -f v10-ollama
docker compose logs -f v10-grafana

# Dernières 100 lignes
docker compose logs --tail=100

# Depuis une date
docker compose logs --since 2025-01-10T14:00:00
```

#### Recherche dans les Logs

```bash
# Chercher erreurs
docker compose logs | grep -i error

# Chercher dans un service spécifique
docker logs v10-api 2>&1 | grep "500"

# Exporter logs
docker compose logs --no-color > logs_$(date +%Y%m%d).txt
```

### 🧹 Nettoyage Système

#### Nettoyage Docker

```bash
# Supprimer containers arrêtés
docker container prune -f

# Supprimer images non utilisées
docker image prune -a -f

# Supprimer volumes non utilisés
docker volume prune -f

# Supprimer réseaux non utilisés
docker network prune -f

# Nettoyage complet (ATTENTION: supprime TOUT sauf volumes nommés)
docker system prune -a -f

# Voir espace disque utilisé
docker system df
```

#### Nettoyage Ollama

```bash
# Lister modèles et taille
docker exec v10-ollama ollama list

# Supprimer modèles inutilisés
docker exec v10-ollama ollama rm ancien-modele:tag

# Espace disque Ollama
du -sh /var/lib/docker/volumes/v10_ollama_data
```

#### Rotation Logs

Créer `/etc/logrotate.d/docker-oceanphenix`:

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

### 🔍 Health Checks

#### Vérification Automatique

```bash
# Script health-check.sh
#!/bin/bash

echo "=== OceanPhenix Health Check ==="

# API Backend
if curl -sf http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API: OK"
else
    echo "❌ Backend API: FAIL"
fi

# Ollama
if curl -sf http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama: OK"
else
    echo "❌ Ollama: FAIL"
fi

# Qdrant
if curl -sf http://localhost:6333/health > /dev/null; then
    echo "✅ Qdrant: OK"
else
    echo "❌ Qdrant: FAIL"
fi

# MinIO
if curl -sf http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ MinIO: OK"
else
    echo "❌ MinIO: FAIL"
fi

# Prometheus
if curl -sf http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus: OK"
else
    echo "❌ Prometheus: FAIL"
fi

# Grafana
if curl -sf http://localhost:3001/api/health > /dev/null; then
    echo "✅ Grafana: OK"
else
    echo "❌ Grafana: FAIL"
fi
```

### 📈 Monitoring Performance

#### Métriques Système

```bash
# Utilisation CPU/RAM par container
docker stats

# Top 5 containers par RAM
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | sort -k2 -h | tail -5

# Espace disque volumes
docker system df -v

# Logs par taille
docker ps -q | xargs -I {} sh -c 'echo "=== {} ==="; docker logs {} 2>&1 | wc -l'
```

---

## 🔒 Sécurité

### Recommandations Production

✅ **Firewall UFW** - Bloquer tous ports sauf 80, 443, 22  
✅ **SSL/TLS** - Certificats Let's Encrypt automatiques via Caddy  
✅ **Mots de passe forts** - 32 caractères minimum  
✅ **Backups automatiques** - Quotidiens avec rétention 30 jours  
✅ **Monitoring alertes** - Notifications Slack/Email  
✅ **Logs centralisés** - Rotation automatique  
✅ **Mise à jour régulière** - Images Docker et dépendances  

### Ports à Exposer (Production)

```bash
# Firewall UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🐛 Troubleshooting

### Problèmes Courants

**❌ Erreur "address already in use"**

```bash
# Identifier processus sur port 8000
sudo lsof -i :8000

# Arrêter conteneur conflictuel
docker stop $(docker ps -q --filter "publish=8000")
```
</details>

<details>
<summary><strong>❌ Ollama ne répond pas</strong></summary>

```bash
# Vérifier logs
docker logs v10-ollama

# Redémarrer
docker restart v10-ollama

# Tester connexion
docker exec v10-ollama ollama list
```
</details>

<details>
<summary><strong>❌ Grafana pas de données</strong></summary>

```bash
# Vérifier Prometheus
curl http://localhost:9090/-/healthy

# Vérifier datasource Grafana
# UI → Configuration → Data Sources → Prometheus
# URL: http://prometheus:9090
```
</details>

Voir **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues! 

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- **Issues GitHub** : [Créer une issue](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues)
- **Discussions** : [GitHub Discussions](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/discussions)
- **Documentation** : [Wiki](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/wiki)

---

## 📄 License

Ce projet est sous licence **MIT** - voir [LICENSE](LICENSE) pour détails.

---

## 🎯 Roadmap V10.1

- [ ] Interface mobile responsive complète
- [ ] Support multi-modèles simultanés
- [ ] Plugin système pour extensibilité
- [ ] API GraphQL en complément REST
- [ ] Intégration Kubernetes (Helm charts)
- [ ] Marketplace plugins communautaires
- [ ] Support multi-langues (i18n)
- [ ] Tests automatisés E2E

---

## 🙏 Remerciements

- [Open WebUI](https://github.com/open-webui/open-webui) - Interface chat IA
- [Ollama](https://ollama.ai/) - Serveur LLM local
- [Qdrant](https://qdrant.tech/) - Base vectorielle
- [Tabler](https://tabler.io/) - Framework UI
- [FastAPI](https://fastapi.tiangolo.com/) - Framework Python
- La communauté open source 💙

---

**🌊 OceanPhenix V10** - Plateforme IA Souveraine Open-Source

[![GitHub stars](https://img.shields.io/github/stars/stepstev/oceanphenix-IA-souveraine-v10_2026?style=social)](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026)
[![GitHub forks](https://img.shields.io/github/forks/stepstev/oceanphenix-IA-souveraine-v10_2026?style=social)](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/fork)

Fait avec ❤️ par l'équipe OceanPhenix

</div>
