# 🖥️ Guide d'Installation Locale - OceanPhenix V8

Ce guide vous accompagne dans l'installation complète d'OceanPhenix IA Souveraine V8 en local (Windows, Linux, macOS).

## 📋 Prérequis

### Configuration Matérielle Minimale

- **CPU** : 4 cores (8 cores recommandés)
- **RAM** : 8 GB minimum (16 GB recommandés)
- **Stockage** : 100 GB SSD (200 GB recommandés)
- **GPU** : Optionnel mais recommandé pour LLM (NVIDIA avec CUDA)

### Configuration Matérielle Recommandée

- **CPU** : Intel i7/AMD Ryzen 7 ou supérieur (8+ cores)
- **RAM** : 32 GB
- **Stockage** : 500 GB NVMe SSD
- **GPU** : NVIDIA RTX 3060 12GB ou supérieur

### Logiciels Requis

#### Windows 10/11

```powershell
# Docker Desktop (avec WSL2)
# Télécharger depuis : https://www.docker.com/products/docker-desktop

# Git
winget install Git.Git

# Make (optionnel)
choco install make
```

#### Linux (Ubuntu 22.04 LTS - Recommandé)

```bash
# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Git
sudo apt update
sudo apt install git make -y

# Redémarrer session pour groupe docker
newgrp docker
```

> **Note** : Compatible aussi avec Debian 11+, mais Ubuntu 22.04 LTS est recommandé pour une stabilité optimale.

#### macOS

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Docker Desktop
brew install --cask docker

# Git et Make
brew install git make
```

## 🚀 Installation Étape par Étape

### 1. Cloner le Repository

```bash
# Clone depuis GitHub
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git

# Entrer dans le dossier
cd oceanphenix-IA-souveraine-v8
```

### 2. Configuration Environnement

> **🔐 SÉCURITÉ : Ne JAMAIS commiter `.env` sur git**
>
> Le fichier `.env` contient vos credentials. Seul `.env.example` doit être versionné.

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer avec vos paramètres
nano .env  # ou notepad .env sur Windows
```

**Configuration minimale dans `.env`** :

```env
# ⚠️ REMPLACER PAR VOS VALEURS - Ne pas utiliser ces exemples en production

# MinIO - Générer: openssl rand -base64 24
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<GENERER_MOT_DE_PASSE>
MINIO_BUCKET_RAG=rag-documents

# Grafana - Générer: openssl rand -base64 24
GRAFANA_ADMIN_PASSWORD=<GENERER_MOT_DE_PASSE>

# Open WebUI (à remplir après premier démarrage)
OPENWEBUI_API_KEY=
```

**Générer des mots de passe sécurisés** :

```bash
# Linux/macOS
openssl rand -base64 24

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | % {[char]$_})
```

### 3. Vérifier Docker

```bash
# Vérifier installation Docker
docker --version
docker compose version

# Test Docker
docker run hello-world

# Vérifier ressources disponibles
docker info | grep -i memory
docker info | grep -i cpu
```

### 4. Démarrer la Stack

#### Démarrage Complet

```bash
# Démarrer tous les services
docker compose --profile all up -d

# Vérifier statut
docker compose ps

# Suivre les logs
docker compose logs -f
```

#### Démarrage Progressif (Recommandé pour première fois)

```bash
# 1. Core services (Proxy, MinIO, Qdrant)
docker compose up -d caddy minio qdrant

# Attendre 10 secondes, vérifier
docker compose ps

# 2. LLM Engine
docker compose up -d ollama

# 3. Open WebUI
docker compose up -d openwebui

# 4. Backend API
docker compose up -d backend

# 5. Monitoring
docker compose --profile monitoring up -d

# 6. Services optionnels
docker compose up -d n8n portainer
```

### 5. Installation des Modèles LLM

Une fois Ollama démarré :

```bash
# Modèle français recommandé : Mistral 7B
docker exec v8-ollama ollama pull mistral:latest

# Modèle léger : Llama 3.2 3B
docker exec v8-ollama ollama pull llama3.2:3b

# Modèle embedding pour RAG
docker exec v8-ollama ollama pull nomic-embed-text

# Vérifier installation
docker exec v8-ollama ollama list
```

**Temps d'installation** : 5-15 minutes selon connexion (Mistral : 4.4 GB)

### 6. Configuration Open WebUI

```bash
# Accéder à Open WebUI
# URL : http://localhost:3000

# 1. Créer compte admin (premier utilisateur)
# 2. Aller dans Settings > Account > API Keys
# 3. Créer une nouvelle clé API
# 4. Copier la clé (format : sk-...)
```

Ajouter la clé dans `.env` :

```env
OPENWEBUI_API_KEY=sk-votre-cle-api-ici
```

Redémarrer l'auto-indexer :

```bash
docker compose restart auto-indexer
```

### 7. Test de la Stack

#### Vérifier tous les services

```bash
# Status containers
docker compose ps

# Tous doivent être "Up" et "healthy"
```

#### Test Hub Frontend

```bash
# Ouvrir navigateur
# URL : http://localhost:8080

# Vérifier :
# - Dashboard s'affiche
# - AI Studio visible
# - Tous les liens fonctionnent
```

#### Test Open WebUI RAG

```bash
# URL : http://localhost:3000
# 1. Login avec compte créé
# 2. Sélectionner modèle (Mistral)
# 3. Envoyer un message de test
# 4. Vérifier réponse
```

#### Test MinIO Upload

```bash
# URL : http://localhost:9001
# Login : admin / [votre_password]
# 1. Vérifier bucket "rag-documents" existe
# 2. Upload un fichier PDF test
# 3. Vérifier dans logs auto-indexer :
docker logs v8-auto-indexer --tail 20
# Doit afficher : "✅ [filename] indexé avec succès"
```

#### Test RAG Query

```bash
# 1. Upload document dans MinIO
# 2. Attendre indexation (30 secondes)
# 3. Dans Open WebUI, poser question sur le document
# 4. Vérifier que réponse utilise contexte du document
```

## 🔧 Configuration Avancée

### Optimisation GPU NVIDIA

Si vous avez une carte NVIDIA :

```bash
# Installer NVIDIA Container Toolkit
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

Éditer `docker-compose.yml` pour Ollama :

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

Redémarrer :

```bash
docker compose up -d ollama
```

### Augmenter Mémoire Docker

#### Windows (Docker Desktop)

1. Settings > Resources
2. Memory : 16 GB minimum
3. CPUs : 6-8 cores
4. Swap : 2 GB
5. Apply & Restart

#### Linux

Configurer dans `/etc/docker/daemon.json` :

```json
{
  "default-runtime": "nvidia",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
```

### Backup Automatique

Créer script `backup.sh` :

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup volumes
docker run --rm \
  -v oceanphenix-v8_minio_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-$(date +%Y%m%d).tar.gz /data

docker exec v8-qdrant tar czf /tmp/qdrant.tar.gz /qdrant/storage
docker cp v8-qdrant:/tmp/qdrant.tar.gz $BACKUP_DIR/

# Backup config
tar czf $BACKUP_DIR/config.tar.gz .env docker-compose.yml

echo "✅ Backup completed: $BACKUP_DIR"
```

Ajouter cron job :

```bash
# Backup quotidien à 2h du matin
0 2 * * * /path/to/oceanphenix-v8/backup.sh
```

## 🐛 Troubleshooting Local

### Port déjà utilisé

```bash
# Windows - Trouver processus
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
sudo lsof -i :3000
sudo kill -9 <PID>

# Ou changer port dans docker-compose.yml
```

### Conteneur ne démarre pas

```bash
# Voir logs détaillés
docker logs v8-studio --tail 100

# Vérifier santé
docker inspect v8-studio | grep -i health

# Redémarrer
docker compose restart studio

# Recréer si nécessaire
docker compose up -d --force-recreate studio
```

### Problème de permissions (Linux)

```bash
# Ajouter user au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Permissions dossiers data
sudo chown -R $USER:$USER ./data
chmod -R 755 ./data
```

### Manque de RAM

```bash
# Vérifier utilisation
docker stats

# Arrêter services non essentiels
docker compose stop n8n portainer

# Ou utiliser profil minimal
docker compose --profile rag up -d
```

### Ollama modèle lent

```bash
# Vérifier si GPU utilisé
docker exec v8-ollama nvidia-smi

# Augmenter threads CPU
# Dans docker-compose.yml, section ollama :
environment:
  - OLLAMA_NUM_THREADS=8

# Utiliser modèle plus léger
docker exec v8-ollama ollama pull llama3.2:3b
```

## 📊 Monitoring Local

### Vérifier Health Status

```bash
# Script de vérification
#!/bin/bash
echo "🔍 Checking services..."

services=("openwebui:3000" "ollama:11434" "minio:9001" "qdrant:6333" "grafana:3001")

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  if curl -s "http://localhost:$port" > /dev/null; then
    echo "✅ $name (port $port) - OK"
  else
    echo "❌ $name (port $port) - DOWN"
  fi
done
```

### Dashboards Grafana

Une fois stack démarrée :

1. Accéder à http://localhost:3001
2. Login : admin / [password]
3. Dashboards disponibles :
   - **Platform Health** : Vue globale
   - **Docker Stats** : Métriques containers
   - **Ollama Performance** : Stats LLM

## 🎯 Next Steps

Une fois l'installation locale réussie :

1. ✅ Tester workflow RAG complet
2. ✅ Configurer automatisations n8n
3. ✅ Créer dashboards custom Grafana
4. ✅ Déployer en production (voir [INSTALL_HETZNER.md](INSTALL_HETZNER.md))

---

**Support** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues

**Documentation complète** : [README.md](../README.md)
