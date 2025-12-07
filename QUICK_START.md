# ⚡ OceanPhenix V8 - Guide Installation Rapide

> **Installation complète en 15 minutes** - Choisissez votre mode de déploiement

---

## 🎯 Modes d'Installation

| Mode | Durée | Complexité | Usage |
|------|-------|------------|-------|
| **🖥️ Local** | 5 min | ⭐ Facile | Dev/Test |
| **🌐 Hetzner VPS** | 20 min | ⭐⭐ Moyen | Production complète |
| **☁️ O2Switch** | 10 min | ⭐ Facile | Frontend uniquement |

---

## 🖥️ Mode 1 : Installation Locale (5 minutes)

### Prérequis
- Docker Desktop installé
- 8GB RAM minimum
- 50GB espace disque

### Installation Express

```bash
# 1. Cloner
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git
cd oceanphenix-IA-souveraine-v8

# 2. Configurer
cp .env.example .env
# ⚠️ Éditer .env et remplir les mots de passe (voir ci-dessous)

# 3. Démarrer
docker compose --profile all up -d

# 4. Installer un modèle LLM
docker exec v8-ollama ollama pull mistral:latest

# 5. ✅ Accéder
# http://localhost:8080  (Hub Frontend)
# http://localhost:3000  (Open WebUI)
```

### ⚙️ Configuration `.env` Minimale

```bash
# Générer des mots de passe sécurisés
openssl rand -base64 24

# Remplir dans .env :
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<GENERER_ICI>
GRAFANA_ADMIN_PASSWORD=<GENERER_ICI>
```

### ✅ Vérification

```bash
docker compose ps           # Tous les services "Up"
curl http://localhost:8000/health  # {"status": "healthy"}
```

**🎉 Terminé !** Ouvrir http://localhost:8080

📖 **Guide complet** : [docs/INSTALL_LOCAL.md](docs/INSTALL_LOCAL.md)

---

## 🌐 Mode 2 : Déploiement Hetzner VPS (20 minutes)

### Prérequis
- Compte Hetzner Cloud
- Domaine avec accès DNS
- Clé SSH

### Installation Express

```bash
# 1. Créer serveur Hetzner
hcloud server create --name oceanphenix \
  --type cx31 \
  --image ubuntu-22.04 \
  --ssh-key votre-cle

# 2. Connexion SSH
ssh root@<IP_SERVEUR>

# 3. Installation automatique
curl -fsSL https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v8/main/scripts/install-hetzner.sh | bash

# 4. Configuration domaine
nano .env
# ROOT_DOMAIN=votredomaine.com
# ACME_EMAIL=admin@votredomaine.com

# 5. Démarrer
docker compose --profile all up -d

# 6. Installer modèle
docker exec v8-ollama ollama pull mistral:latest
```

### 🌍 Configuration DNS

**Créer ces enregistrements A** pointant vers votre IP Hetzner :

```
api.votredomaine.com       → <IP_SERVEUR>
studio.votredomaine.com    → <IP_SERVEUR>
grafana.votredomaine.com   → <IP_SERVEUR>
minio.votredomaine.com     → <IP_SERVEUR>
```

### 🔐 Sécurité Firewall

```bash
# UFW configuré automatiquement
ufw status
# 22/tcp (SSH), 80/tcp (HTTP), 443/tcp (HTTPS) ALLOW
```

### ✅ Vérification

```bash
curl https://api.votredomaine.com/health
# {"status": "healthy"}
```

**🎉 Terminé !** Ouvrir https://studio.votredomaine.com

📖 **Guide complet** : [docs/INSTALL_HETZNER.md](docs/INSTALL_HETZNER.md)

---

## ☁️ Mode 3 : Frontend O2Switch (10 minutes)

> **Prérequis** : Backend déjà déployé sur Hetzner (voir Mode 2)

### Installation Express

```bash
# 1. Cloner en local
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git
cd oceanphenix-IA-souveraine-v8/hub-frontend

# 2. Configurer API
cp config.prod.js config.js
nano config.js

# Remplacer "votredomaine.com" par votre domaine :
# apiUrlDefault: 'https://api.VOTRE-DOMAINE.com',
```

### 📤 Upload FTP (FileZilla)

1. **Connexion FTP**
   - Hôte : `ftp.votredomaine.com`
   - Utilisateur : login cPanel
   - Mot de passe : mot de passe cPanel
   - Port : `21`

2. **Upload fichiers**
   - Naviguer vers `/public_html/ia/`
   - Uploader TOUS les fichiers de `hub-frontend/`

### 🔗 Configuration CORS Backend

**Sur serveur Hetzner** :

```bash
ssh root@serveur-hetzner
cd /root/oceanphenix-IA-souveraine-v8
nano backend/main.py
```

Ajouter après `app = FastAPI()` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ia.votredomaine.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redémarrer :

```bash
docker compose restart backend
```

### ✅ Vérification

1. Ouvrir : https://ia.votredomaine.com
2. Console navigateur (F12) :

```javascript
fetch('https://api.votredomaine.com/health')
  .then(r => r.json())
  .then(console.log)
// ✅ {"status": "healthy"}
```

**🎉 Terminé !** Frontend connecté au backend Hetzner

📖 **Guide complet** : [docs/INSTALL_O2SWITCH_SIMPLE.md](docs/INSTALL_O2SWITCH_SIMPLE.md)

---

## 🎛️ Services Inclus

| Service | Port Local | URL Production | Description |
|---------|-----------|----------------|-------------|
| **Hub Frontend** | 8080 | ia.domain.com | Interface principale |
| **Open WebUI** | 3000 | studio.domain.com | Chat IA |
| **API Backend** | 8000 | api.domain.com | RAG Pipeline |
| **Grafana** | 3001 | grafana.domain.com | Monitoring |
| **MinIO Console** | 9001 | minio.domain.com | Stockage S3 |
| **n8n** | 5678 | n8n.domain.com | Automatisation |
| **Portainer** | 9443 | portainer.domain.com | Gestion Docker |

---

## 🔧 Commandes Utiles

### Docker Compose

```bash
# Voir les services
docker compose ps

# Logs en temps réel
docker compose logs -f

# Redémarrer un service
docker compose restart backend

# Arrêter tout
docker compose down

# Mise à jour
git pull
docker compose pull
docker compose up -d
```

### Ollama (LLM)

```bash
# Lister modèles installés
docker exec v8-ollama ollama list

# Installer modèle
docker exec v8-ollama ollama pull llama3.2

# Tester modèle
docker exec -it v8-ollama ollama run mistral "Bonjour"
```

### Santé du Système

```bash
# Backend API
curl http://localhost:8000/health

# Ollama
curl http://localhost:11434/api/tags

# Qdrant
curl http://localhost:6333/health

# MinIO
curl http://localhost:9000/minio/health/live
```

---

## 🐛 Dépannage Express

### Services ne démarrent pas

```bash
# Vérifier logs
docker compose logs backend

# Vérifier ports
netstat -tulpn | grep LISTEN

# Nettoyer et relancer
docker compose down
docker compose up -d --force-recreate
```

### Erreur CORS Frontend → Backend

```bash
# Sur serveur backend, vérifier CORS
nano backend/main.py
# allow_origins=["https://ia.votredomaine.com"]

docker compose restart backend
```

### Ollama ne répond pas

```bash
# Vérifier modèles installés
docker exec v8-ollama ollama list

# Réinstaller modèle
docker exec v8-ollama ollama pull mistral:latest

# Vérifier logs
docker logs v8-ollama -f
```

### Mémoire insuffisante

```bash
# Voir utilisation RAM
docker stats

# Arrêter services non essentiels
docker compose stop superset n8n portainer

# Redémarrer services core
docker compose restart backend ollama qdrant
```

---

## 📊 Architecture Simplifiée

```
┌─────────────────────────────────────────────────────────────┐
│                      🌐 INTERNET                            │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐         ┌─────────────────────┐
    │   O2Switch     │         │   Hetzner VPS       │
    │   (Frontend)   │────────>│   (Backend)         │
    │                │  CORS   │                     │
    │  📱 Hub UI     │         │  🤖 Ollama          │
    │  HTML/CSS/JS   │         │  🔮 Qdrant          │
    └────────────────┘         │  💾 MinIO           │
                               │  📊 Grafana         │
                               └─────────────────────┘
```

---

## 🔐 Sécurité - Checklist

- [ ] `.env` **jamais commité** sur git (vérifié par `.gitignore`)
- [ ] Mots de passe générés avec `openssl rand -base64 24`
- [ ] UFW firewall activé (Hetzner : ports 22, 80, 443 seulement)
- [ ] SSL Let's Encrypt automatique (Caddy)
- [ ] CORS configuré pour domaines frontend uniquement
- [ ] Backup réguliers activés (voir guides complets)

---

## 📚 Documentation Complète

| Guide | Description |
|-------|-------------|
| [README.md](README.md) | Vue d'ensemble complète |
| [INSTALL_LOCAL.md](docs/INSTALL_LOCAL.md) | Installation locale détaillée |
| [INSTALL_HETZNER.md](docs/INSTALL_HETZNER.md) | Déploiement VPS production |
| [INSTALL_O2SWITCH_SIMPLE.md](docs/INSTALL_O2SWITCH_SIMPLE.md) | Frontend O2Switch |
| [DIAGRAMS_MERMAID.md](docs/DIAGRAMS_MERMAID.md) | Diagrammes architecture |

---

## 🆘 Support

- **Issues** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues
- **Documentation** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8
- **Discussions** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8/discussions

---

## ✅ Checklist Post-Installation

### Installation Locale
- [ ] Docker Desktop lancé
- [ ] Services UP : `docker compose ps`
- [ ] Modèle LLM installé : `docker exec v8-ollama ollama list`
- [ ] Hub accessible : http://localhost:8080
- [ ] API santé OK : http://localhost:8000/health

### Installation Hetzner
- [ ] DNS configurés (A records pointent vers IP)
- [ ] SSL actif (cadenas vert navigateur)
- [ ] Firewall UFW actif : `ufw status`
- [ ] Backups configurés
- [ ] API accessible : https://api.votredomaine.com/health

### Installation O2Switch
- [ ] Fichiers uploadés sur O2Switch
- [ ] `config.js` édité avec domaines corrects
- [ ] CORS backend configuré
- [ ] Frontend accessible : https://ia.votredomaine.com
- [ ] API connectée (test console navigateur)

---

**🌊 OceanPhenix V8** - Plateforme IA Souveraine Open Source

*Développé avec ❤️ par l'équipe OceanPhenix*

Version 8.0.0 - Décembre 2025
