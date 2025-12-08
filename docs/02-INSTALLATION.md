# 🌊 OceanPhenix V8 - Guide d'Installation

## 📋 Table des matières

1. [Installation Locale (Windows/Mac/Linux)](#installation-locale)
2. [Installation sur Serveur Hetzner](#installation-hetzner)
3. [Configuration Post-Installation](#configuration-post-installation)
4. [Utilisation](#utilisation)
5. [Maintenance](#maintenance)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Installation Locale

### Prérequis

- **Docker Desktop** 4.25+ installé
- **Docker Compose** 2.20+ installé
- **Git** installé
- **8GB RAM minimum** (16GB recommandé)
- **50GB espace disque** disponible

### Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git
cd oceanphenix-IA-souveraine-v8

# 2. Lancer la stack
docker-compose up -d

# 3. Vérifier le statut
docker-compose ps

# 4. Voir les logs
docker-compose logs -f
```

### Services disponibles

| Service | URL | Description |
|---------|-----|-------------|
| **Hub Frontend** | http://localhost:8000 | Interface principale |
| **OpenWebUI** | http://localhost:3000 | Studio IA |
| **Grafana** | http://localhost:3001 | Monitoring (admin/admin) |
| **Prometheus** | http://localhost:9090 | Métriques |
| **Portainer** | https://localhost:9443 | Gestion Docker |
| **MinIO** | http://localhost:9001 | Stockage S3 |
| **Qdrant** | http://localhost:6333 | Base vectorielle |
| **Ollama** | http://localhost:11434 | Moteur LLM |
| **cAdvisor** | http://localhost:8080 | Métriques conteneurs |

### Configuration initiale

#### 1. Portainer (première utilisation)

```bash
# Redémarrer si timeout
docker restart v8-portainer

# Puis dans le navigateur: https://localhost:9443
# - Créer compte admin (password 12+ caractères)
# - Sélectionner "Get Started" pour Docker local
```

#### 2. Grafana Dashboards

```bash
# Accéder à Grafana: http://localhost:3001
# Login: admin / Password: admin (changer au 1er login)

# Importer les dashboards:
# 1. Menu → Dashboards → Import
# 2. Importer: core/monitoring/dashboards/oceanphenix-platform-health.json
# 3. Importer: core/monitoring/dashboards/oceanphenix-containers-monitoring.json
```

#### 3. Hub Frontend

```bash
# Ouvrir: http://localhost:8000
# Dans la sidebar:
# - Section "Monitoring" pour accéder aux dashboards Grafana
# - "AI Studio" pour OpenWebUI
# - "Architecture" pour voir le diagramme complet
```

---

## 🚀 Installation Hetzner

### Serveur recommandé

- **CPX41**: 8 vCPU, 16GB RAM, 240GB NVMe (~25€/mois)
- **OS**: Ubuntu 24.04 LTS
- **Localisation**: Falkenstein (DE) ou Helsinki (FI)

### Installation automatique

```bash
# 1. Se connecter au serveur
ssh root@VOTRE_IP

# 2. Télécharger et exécuter le script
curl -o /tmp/deploy.sh https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v8/main/deploy-hetzner.sh
chmod +x /tmp/deploy.sh
bash /tmp/deploy.sh
```

Le script installe automatiquement:
- ✅ Docker & Docker Compose
- ✅ Configuration firewall (UFW)
- ✅ Fail2ban pour SSH
- ✅ Utilisateur système dédié
- ✅ Clone du projet depuis GitHub
- ✅ Démarrage de tous les services

### Services accessibles (Hetzner)

Remplacez `VOTRE_IP` par votre adresse IP:

- **Hub Frontend**: http://VOTRE_IP:8000
- **OpenWebUI**: http://VOTRE_IP:3000
- **Grafana**: http://VOTRE_IP:3001
- **Prometheus**: http://VOTRE_IP:9090
- **Portainer**: https://VOTRE_IP:9443
- **MinIO**: http://VOTRE_IP:9001

### Sécurité Hetzner

Le script configure automatiquement:

```bash
# Firewall UFW
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# Fail2ban actif pour SSH
# Mots de passe aléatoires générés dans /opt/oceanphenix/.env
```

---

## ⚙️ Configuration Post-Installation

### 1. Variables d'environnement

Créer/modifier `.env` à la racine:

```bash
# Projet
COMPOSE_PROJECT_NAME=oceanphenix-ia-souveraine-v8

# Sécurité
GRAFANA_ADMIN_PASSWORD=VotreMotDePasse
PORTAINER_ADMIN_PASSWORD=VotreMotDePasse

# SMTP (optionnel pour alertes)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=password
SMTP_FROM=noreply@oceanphenix.fr
```

### 2. Configurer Ollama

```bash
# Télécharger un modèle LLM
docker exec -it v8-ollama ollama pull llama2

# Lister les modèles disponibles
docker exec -it v8-ollama ollama list

# Tester le modèle
docker exec -it v8-ollama ollama run llama2 "Bonjour"
```

### 3. Importer les dashboards Grafana

**Via l'interface web:**

1. Ouvrir http://localhost:3001 (ou VOTRE_IP:3001)
2. Login: `admin` / `admin` (changer au premier login)
3. Menu → Dashboards → Import
4. Upload JSON:
   - `core/monitoring/dashboards/oceanphenix-platform-health.json`
   - `core/monitoring/dashboards/oceanphenix-containers-monitoring.json`

**Via provisioning (automatique):**

Les dashboards sont automatiquement chargés depuis `core/monitoring/grafana/provisioning/`.

---

## 🎯 Utilisation

### Commandes Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend

# Voir le statut
docker-compose ps

# Reconstruire après modification
docker-compose build
docker-compose up -d
```

### Accéder aux services

#### Hub Frontend

Le point d'entrée principal avec:
- Tableau de bord des services
- Liens rapides vers tous les services
- Architecture complète
- Section monitoring intégrée

```
http://localhost:8000
```

#### OpenWebUI (AI Studio)

Interface conversationnelle pour:
- Chat avec les LLM locaux (Ollama)
- RAG avec vos documents
- Gestion des prompts

```
http://localhost:3000
```

#### Grafana (Monitoring)

Dashboards de surveillance:
- **Platform Health**: Vue globale de la plateforme
- **Container Monitoring**: Métriques détaillées des conteneurs

```
http://localhost:3001
Login: admin / admin
```

### API Backend

```bash
# Health check
curl http://localhost:8000/health

# Exemple RAG query
curl -X POST http://localhost:8000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Votre question"}'

# Upload document
curl -X POST http://localhost:8000/api/documents/upload \
  -F "file=@document.pdf"
```

---

## 🔧 Maintenance

### Mise à jour

```bash
# Local
cd oceanphenix-IA-souveraine-v8
git pull
docker-compose pull
docker-compose up -d

# Hetzner
cd /opt/oceanphenix
git pull
docker-compose pull
docker-compose up -d
```

### Backup

```bash
# Backup des volumes Docker
docker run --rm \
  -v oceanphenix-qdrant-data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/qdrant-$(date +%Y%m%d).tar.gz /data

# Backup MinIO
docker exec v8-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec v8-minio mc mirror local/documents /backup/minio/
```

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker system prune -a

# Nettoyer les volumes orphelins
docker volume prune

# Voir l'espace utilisé
docker system df
```

### Logs

```bash
# Tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Dernières 100 lignes
docker-compose logs --tail=100 backend

# Logs depuis une date
docker-compose logs --since 2024-12-01 backend
```

---

## 🔍 Troubleshooting

### Services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs -f

# Vérifier les ports
netstat -tulpn | grep :8000

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# Modifier le port dans docker-compose.yml
ports:
  - "8001:8000"  # Utiliser 8001 au lieu de 8000
```

### Espace disque insuffisant

```bash
# Vérifier l'espace
df -h

# Nettoyer Docker
docker system prune -a --volumes

# Voir l'utilisation Docker
docker system df
```

### Grafana "No data"

```bash
# Vérifier Prometheus
curl http://localhost:9090/-/healthy

# Vérifier cAdvisor
curl http://localhost:8080/metrics

# Redémarrer le monitoring
docker-compose restart prometheus grafana cadvisor
```

### Portainer timeout

```bash
# Redémarrer Portainer
docker restart v8-portainer

# Accéder rapidement (5 min)
# https://localhost:9443
# Créer compte admin immédiatement
```

### Backend API erreur

```bash
# Vérifier les logs
docker-compose logs backend

# Redémarrer le backend
docker-compose restart backend

# Reconstruire si code modifié
docker-compose build backend
docker-compose up -d backend
```

### Ollama modèle manquant

```bash
# Lister les modèles
docker exec -it v8-ollama ollama list

# Télécharger un modèle
docker exec -it v8-ollama ollama pull llama2

# Vérifier le stockage
docker exec -it v8-ollama df -h
```

---

## 📚 Documentation

- **Architecture**: Voir `hub-frontend/index.html` section Architecture
- **API**: Documentation dans `backend/README.md` (si disponible)
- **Monitoring**: Dashboards Grafana pré-configurés
- **Docker Compose**: `docker-compose.yml` commenté

## 🆘 Support

- **GitHub Issues**: https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues
- **Documentation**: Ce README
- **Logs**: `docker-compose logs -f`

## 📄 Licence

Voir `hub-frontend/legal/licence.html` pour les détails de la licence Ocean Phenix.

---

**🌊 OceanPhenix V8 - Plateforme IA Souveraine 100% RGPD**
