# 🚀 Installation Locale Rapide - OceanPhenix V10

Guide d'installation simplifié pour démarrer **OceanPhenix V10** en local sur Windows.

---

## 📋 Prérequis

- ✅ **Docker Desktop** installé et démarré ([Télécharger](https://www.docker.com/products/docker-desktop))
- ✅ **Git** installé ([Télécharger](https://git-scm.com/downloads))
- ✅ Minimum **16 GB RAM** recommandés
- ✅ **50 GB** d'espace disque libre

---

## ⚡ Installation en 3 Étapes

### 1️⃣ Cloner le Dépôt

```powershell
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git
cd oceanphenix-IA-souveraine-v10_2026
```

### 2️⃣ Installer l'Environnement

```powershell
.\install-local-v10.ps1 install
```

Cette commande :
- ✅ Vérifie que Docker est installé
- ✅ Crée le fichier `.env` depuis `.env.example`
- ✅ Crée les réseaux Docker (`v10_proxy`, `v10_internal`)
- ✅ Crée les dossiers nécessaires

### 3️⃣ Démarrer les Services

```powershell
.\install-local-v10.ps1 start
```

**⏱️ Premier démarrage : 5-10 minutes** (téléchargement des images Docker + build)

---

## 🌐 Accéder à la Plateforme

Une fois les services démarrés :

| Service | URL | Description |
|---------|-----|-------------|
| 🎨 **Frontend** | http://localhost:8080 | Interface principale |
| 🔌 **API Backend** | http://localhost:8000 | API FastAPI |
| 📊 **Grafana** | http://localhost:3001 | Monitoring |
| 🗄️ **MinIO Console** | http://localhost:9001 | Stockage S3 |

### Identifiants par défaut

Consultez le fichier `.env` pour les identifiants (créé automatiquement lors de l'installation).

---

## 🛠️ Commandes Utiles

### Gérer les Services

```powershell
# Voir l'état des services
.\install-local-v10.ps1 status

# Voir les logs en temps réel
.\install-local-v10.ps1 logs

# Redémarrer tous les services
.\install-local-v10.ps1 restart

# Arrêter tous les services
.\install-local-v10.ps1 stop

# Nettoyer l'environnement
.\install-local-v10.ps1 clean
```

### Aide

```powershell
.\install-local-v10.ps1 help
```

---

## 📦 Architecture de la Stack V10

```
OceanPhenix V10
├── 🌐 Caddy (Proxy Reverse)
├── 🤖 Ollama (Modèles IA locaux)
├── 🗄️ Qdrant (Base vectorielle)
├── 🔌 API Backend (FastAPI + RAG)
├── 🎨 Frontend (Hub Studio)
├── 📊 Grafana + Prometheus (Monitoring)
├── 🗃️ MinIO (Stockage S3)
└── 🔔 Alertmanager (Alertes)
```

---

## 🔧 Configuration Avancée

### Modifier les Ports

Éditez le fichier `.env` pour changer les ports par défaut :

```ini
FRONTEND_PORT=8080
API_PORT=8000
GRAFANA_PORT=3001
MINIO_CONSOLE_PORT=9001
```

### Ajouter des Modèles Ollama

```powershell
docker exec -it v10-ollama ollama pull mistral:latest
docker exec -it v10-ollama ollama pull llama3:latest
```

---

## ❓ Dépannage

### Docker n'est pas reconnu

➡️ Installez Docker Desktop et assurez-vous qu'il est démarré.

### Erreur "Port already in use"

➡️ Vérifiez qu'aucun autre service n'utilise les ports 8080, 8000, etc.  
Modifiez les ports dans `.env` si nécessaire.

### Services ne démarrent pas

```powershell
# Voir les logs détaillés
.\install-local-v10.ps1 logs

# Nettoyer et redémarrer
.\install-local-v10.ps1 clean
.\install-local-v10.ps1 start
```

---

## 📚 Documentation Complète

Pour une documentation détaillée, consultez :

- 📖 [Guide d'Installation Locale Complète](docs/INSTALL_LOCAL.md)
- 🚀 [Guide de Démarrage Rapide](QUICK_START.md)
- 📋 [Documentation Générale](docs/README.md)

---

## 🆘 Support

- 🐛 **Issues GitHub** : [Signaler un problème](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues)
- 📧 **Email** : support@oceanphenix.fr
- 💬 **Discussions** : [Forum GitHub](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/discussions)

---

## 📄 Licence

OceanPhenix V10 - Plateforme IA Souveraine 🇫🇷

**Version** : V10 (Décembre 2025)  
**Dépôt** : https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026
