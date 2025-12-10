# 🌊 OceanPhenix IA Souveraine V10

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Open WebUI](https://img.shields.io/badge/Open_WebUI-latest-00D9FF)](https://github.com/open-webui/open-webui)

> **Plateforme IA Souveraine complète** avec RAG (Retrieval-Augmented Generation), auto-hébergée, monitoring 360° et orchestration intelligente.

---

## ⚡ Démarrage Rapide

### 🖥️ Installation Locale (5 minutes)

```bash
# 1. Cloner le projet
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git
cd oceanphenix-IA-souveraine-v10_2026

# 2. Configuration
cp .env.example .env
# ⚠️ Éditer .env avec vos mots de passe

# 3. Démarrer tous les services
docker compose --profile all up -d

# 4. Installer un modèle LLM
docker exec v10-ollama ollama pull mistral:latest

# ✅ Accès aux interfaces
# http://localhost:8080  → Hub Frontend
# http://localhost:3000  → Open WebUI
# http://localhost:3001  → Grafana
# http://localhost:9090  → Prometheus
```

### 🚀 Déploiement Production

Voir les guides détaillés :
- 📖 **[Installation Locale Complète](docs/INSTALL_LOCAL.md)** (30 min)
- 📖 **[Déploiement Hetzner Production](docs/INSTALL_HETZNER.md)** (1h)
- 📖 **[Configuration O2Switch Frontend](docs/01-GUIDE_SIMPLE.md)** (20 min)

---

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#️-architecture)
- [Structure du Projet](#-structure-du-projet)
- [Services & Ports](#-services--ports)
- [Configuration](#️-configuration)
- [Documentation](#-documentation)
- [Maintenance](#-maintenance)
- [Support](#-support)

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
| **[INSTALL_LOCAL_RAPIDE.md](INSTALL_LOCAL_RAPIDE.md)** | Installation locale automatisée | ⚡ 10 min | Débutant |
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

## 🛠️ Maintenance

### Commandes Utiles

```bash
# Voir les logs d'un service
docker compose logs -f v10-api

# Redémarrer un service
docker compose restart v10-ollama

# Mettre à jour les images
docker compose pull
docker compose --profile all up -d

# Backup volumes
docker run --rm -v v10_minio_data:/data -v $(pwd)/backup:/backup \
  alpine tar czf /backup/minio_$(date +%Y%m%d).tar.gz /data

# Nettoyer
docker compose down
docker system prune -a --volumes
```

### Monitoring Santé

```bash
# Health check backend
curl http://localhost:8000/health

# Status Ollama
docker exec v10-ollama ollama list

# Métriques Prometheus
curl http://localhost:9090/metrics

# Logs Grafana
docker compose logs grafana | tail -50
```

### Mise à Jour

```bash
# 1. Sauvegarder
./scripts/backup.sh

# 2. Arrêter services
docker compose down

# 3. Mettre à jour code
git pull origin main

# 4. Redémarrer
docker compose --profile all up -d

# 5. Vérifier
docker compose ps
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

<details>
<summary><strong>❌ Erreur "address already in use"</strong></summary>

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

Les contributions sont les bienvenues ! 

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

<div align="center">

**🌊 OceanPhenix V10** - Plateforme IA Souveraine

[![GitHub stars](https://img.shields.io/github/stars/stepstev/oceanphenix-IA-souveraine-v10_2026?style=social)](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026)
[![GitHub forks](https://img.shields.io/github/forks/stepstev/oceanphenix-IA-souveraine-v10_2026?style=social)](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/fork)

Fait avec ❤️ par l'équipe OceanPhenix

</div>
