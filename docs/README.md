# 📖 Documentation OceanPhenix V10

> **Guide complet** pour installation, configuration, déploiement et utilisation de la plateforme IA Souveraine OceanPhenix V10

---

## 🗂️ Sommaire Structuré

### 🚀 1. Démarrage Rapide

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[../QUICK_START.md](../QUICK_START.md)** | Démarrage ultra-rapide en 5 minutes | ⚡ 5 min | Débutant |
| **[INSTALL_LOCAL_RAPIDE.md](INSTALL_LOCAL_RAPIDE.md)** | Installation locale automatisée | ⚡ 10 min | Débutant |
| **[01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md)** | Guide simple Frontend + Backend | ⏱️ 20 min | Débutant |

---

### 📦 2. Installation & Configuration

#### 2.1 Installation Locale (Développement)

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[INSTALL_LOCAL.md](INSTALL_LOCAL.md)** | Installation complète locale avec Docker Desktop | 🕐 30 min | Intermédiaire |
| **[02-INSTALLATION.md](02-INSTALLATION.md)** | Guide installation détaillé pas-à-pas | 🕐 30 min | Intermédiaire |

**Contenu:**
- ✅ Configuration Docker sur Windows/Mac/Linux
- ✅ Installation de tous les services (Ollama, Qdrant, MinIO, etc.)
- ✅ Configuration des variables d'environnement (.env)
- ✅ Premiers tests et validation
- ✅ Accès aux interfaces (Dashboard, Open WebUI, Grafana)

#### 2.2 Installation Production

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[INSTALL_HETZNER.md](INSTALL_HETZNER.md)** | Déploiement production sur serveur Hetzner | 🕑 1h | Avancé |
| **[04-DEPLOY_HETZNER.md](04-DEPLOY_HETZNER.md)** | Guide déploiement Hetzner avec SSL/DNS | 🕑 1h | Avancé |
| **[05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md)** | Checklist production complète | 🕐 45 min | Avancé |

**Contenu:**
- ✅ Provisioning serveur VPS Hetzner
- ✅ Configuration DNS et SSL automatique (Let's Encrypt)
- ✅ Sécurisation (Firewall UFW, SSH, mots de passe)
- ✅ Déploiement avec Caddy reverse proxy
- ✅ Monitoring et alertes production
- ✅ Backups automatiques

---

### 🎨 3. Frontend & Interface

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[03-FRONTEND_SETUP.md](03-FRONTEND_SETUP.md)** | Configuration et personnalisation du Hub Frontend | 🕐 20 min | Intermédiaire |
| **[06-FRONTEND_O2SWITCH_HETZNER.md](06-FRONTEND_O2SWITCH_HETZNER.md)** | Hub O2Switch + Backend Hetzner séparés | 🕐 45 min | Avancé |
| **[../hub-frontend-v2/README.md](../hub-frontend-v2/README.md)** | Documentation technique Frontend V2 | 🕐 15 min | Développeur |
| **[../hub-frontend-v2/docs/DEPLOYMENT.md](../hub-frontend-v2/docs/DEPLOYMENT.md)** | Déploiement Frontend standalone | 🕐 15 min | Développeur |

**Contenu:**
- ✅ Architecture Hub Frontend V2
- ✅ Personnalisation thème et branding
- ✅ Configuration pages (Dashboard, RAG, Monitoring, Settings)
- ✅ Déploiement sur hébergement mutualisé (O2Switch)
- ✅ Séparation Frontend/Backend pour scalabilité

---

### 🏗️ 4. Architecture & Technique

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md)** | Diagrammes d'architecture (conteneurs, réseaux, flux) | 🕐 20 min | Tous |
| **[../backend/README.md](../backend/README.md)** | Documentation API Backend FastAPI | 🕐 30 min | Développeur |
| **[../docker-compose.yml](../docker-compose.yml)** | Orchestration Docker complète | 🕐 30 min | DevOps |

**Contenu:**
- ✅ Architecture globale multi-services
- ✅ Diagrammes de flux (RAG, monitoring, réseau)
- ✅ Schémas Docker Compose avec profiles
- ✅ Documentation API REST (endpoints, authentification)
- ✅ Structure Backend Python (FastAPI, RAG pipeline)

---

### 📊 5. Monitoring & Alerting

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[ALERTMANAGER_CONFIG.md](ALERTMANAGER_CONFIG.md)** | Configuration Alertmanager (email, Slack, webhooks) | 🕐 30 min | Avancé |
| **[../core/monitoring/dashboards/README.md](../core/monitoring/dashboards/README.md)** | Dashboards Grafana personnalisés | 🕐 20 min | Intermédiaire |

**Contenu:**
- ✅ Configuration Prometheus (métriques, scraping)
- ✅ Dashboards Grafana préconçus (containers, services, health)
- ✅ Règles d'alerte personnalisées (CPU, RAM, disque, services down)
- ✅ Notifications multi-canaux (Email, Slack, webhooks)
- ✅ Retention et stockage métriques

---

### 🔧 6. Déploiement Spécialisé

| Document | Description | Durée | Niveau |
|----------|-------------|-------|--------|
| **[INSTALL_O2SWITCH.md](INSTALL_O2SWITCH.md)** | Frontend sur O2Switch mutualisé | 🕐 25 min | Intermédiaire |
| **[INSTALL_O2SWITCH_SIMPLE.md](INSTALL_O2SWITCH_SIMPLE.md)** | O2Switch simplifié (version light) | 🕐 15 min | Débutant |
| **[deployment/README_O2SWITCH.md](deployment/README_O2SWITCH.md)** | Guide déploiement O2Switch détaillé | 🕐 30 min | Intermédiaire |
| **[deploy-hetzner.sh](deploy-hetzner.sh)** | Script automatisation déploiement Hetzner | - | DevOps |

**Contenu:**
- ✅ Configuration hébergement mutualisé O2Switch
- ✅ Upload FTP/SFTP du Hub Frontend
- ✅ Configuration domaine et sous-domaines
- ✅ Connexion Frontend (O2Switch) ↔ Backend (Hetzner)
- ✅ Scripts de déploiement automatisé

---

### 🛠️ 7. Maintenance & Troubleshooting

**Contenu:**
- ✅ Résolution problèmes courants (ports, connexions, services)
- ✅ Commandes utiles Docker (logs, restart, cleanup)
- ✅ Backups et restauration données
- ✅ Mises à jour sécurité et services
- ✅ Diagnostic performances et optimisation

---

## 📋 Guide de Navigation Recommandé

### 🎯 Selon votre Profil

#### 👨‍💻 **Développeur / Test Local**

1. [QUICK_START.md](../QUICK_START.md) → Démarrage 5 min
2. [INSTALL_LOCAL.md](INSTALL_LOCAL.md) → Installation complète
3. [03-FRONTEND_SETUP.md](03-FRONTEND_SETUP.md) → Personnalisation UI
4. [DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md) → Comprendre l'architecture
5. [../backend/README.md](../backend/README.md) → Documentation API

#### 🚀 **Production / Entreprise**

1. [01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md) → Vue d'ensemble
2. [INSTALL_HETZNER.md](INSTALL_HETZNER.md) → Serveur production
3. [ALERTMANAGER_CONFIG.md](ALERTMANAGER_CONFIG.md) → Monitoring alertes
4. [05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md) → Checklist complète

#### 🎨 **Frontend Only (Hébergement Mutualisé)**

1. [INSTALL_O2SWITCH_SIMPLE.md](INSTALL_O2SWITCH_SIMPLE.md) → O2Switch rapide
2. [06-FRONTEND_O2SWITCH_HETZNER.md](06-FRONTEND_O2SWITCH_HETZNER.md) → Frontend + Backend séparés
3. [../hub-frontend-v2/docs/DEPLOYMENT.md](../hub-frontend-v2/docs/DEPLOYMENT.md) → Déploiement Frontend

#### ⚙️ **DevOps / Infrastructure**

1. [DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md) → Architecture système
2. [04-DEPLOY_HETZNER.md](04-DEPLOY_HETZNER.md) → Déploiement automatisé
3. [ALERTMANAGER_CONFIG.md](ALERTMANAGER_CONFIG.md) → Monitoring production
4. [../docker-compose.yml](../docker-compose.yml) → Orchestration Docker

---

## 🔗 Liens Rapides Essentiels

### 📚 Documentation Externe

| Ressource | Description | Lien |
|-----------|-------------|------|
| **Open WebUI** | Interface Chat IA | [docs.openwebui.com](https://docs.openwebui.com) |
| **Ollama** | Serveur LLM local | [ollama.ai/docs](https://ollama.ai/docs) |
| **Qdrant** | Base vectorielle | [qdrant.tech/documentation](https://qdrant.tech/documentation) |
| **MinIO** | Stockage S3 compatible | [min.io/docs](https://min.io/docs) |
| **Prometheus** | Monitoring métriques | [prometheus.io/docs](https://prometheus.io/docs) |
| **Grafana** | Dashboards visualisation | [grafana.com/docs](https://grafana.com/docs) |
| **Caddy** | Reverse proxy SSL | [caddyserver.com/docs](https://caddyserver.com/docs) |
| **n8n** | Automation workflows | [docs.n8n.io](https://docs.n8n.io) |

### 🛠️ Outils & Scripts

| Outil | Emplacement | Description |
|-------|-------------|-------------|
| **Auto-indexer** | `../scripts/auto-indexer.py` | Indexation automatique documents RAG |
| **Deploy Hetzner** | `../scripts/deploy-hetzner.sh` | Script déploiement automatisé Hetzner |
| **Sync MinIO** | `../scripts/sync-minio-to-openwebui.sh` | Synchronisation stockage MinIO ↔ OpenWebUI |
| **Install Local** | `../install-local-v10.ps1` | Script PowerShell installation Windows |

---

## 📊 Matrice des Versions

| Version | Date Release | Statut | Notes |
|---------|--------------|--------|-------|
| **V10** | Décembre 2025 | ✅ Stable | Version actuelle - Production ready |
| V9 | Novembre 2025 | 🔒 Archivée | Remplacée par V10 |
| V8 | Octobre 2025 | 🔒 Archivée | Legacy |

---

## 🆘 Support & Communauté

- **📧 Issues GitHub**: [Créer une issue](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/discussions)
- **📖 Wiki**: [Documentation complète](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/wiki)
- **🐛 Bug Report**: Utiliser le template d'issue
- **✨ Feature Request**: Proposer via Discussions

---

## 📝 Légende des Icônes

| Icône | Signification |
|-------|---------------|
| ⚡ | Ultra-rapide (< 10 min) |
| 🕐 | Rapide (< 30 min) |
| 🕑 | Moyen (30 min - 1h) |
| 🕒 | Long (> 1h) |
| ✅ | Validé et testé |
| ⚠️ | Attention requise |
| 🔴 | Critique |
| 🟡 | Important |
| 🟢 | Optionnel |
| 🚀 | Recommandé |
| 📦 | Prérequis |
| 🔧 | Configuration |
| 🛠️ | Maintenance |
| 🎨 | Frontend |
| 🧠 | Backend/IA |

---

## ✅ Checklist Documentation

### Pour Débutant
- [ ] Lire [QUICK_START.md](../QUICK_START.md)
- [ ] Suivre [INSTALL_LOCAL.md](INSTALL_LOCAL.md)
- [ ] Tester accès Dashboard (http://localhost:8080)
- [ ] Tester Open WebUI (http://localhost:3000)
- [ ] Consulter [01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md) si besoin

### Pour Production
- [ ] Lire [INSTALL_HETZNER.md](INSTALL_HETZNER.md)
- [ ] Configurer DNS et domaines
- [ ] Sécuriser avec SSL (Caddy automatique)
- [ ] Configurer [ALERTMANAGER_CONFIG.md](ALERTMANAGER_CONFIG.md)
- [ ] Valider avec [05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md)
- [ ] Backups automatiques configurés

### Pour Développeur
- [ ] Comprendre [DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md)
- [ ] Étudier [../backend/README.md](../backend/README.md)
- [ ] Analyser [../docker-compose.yml](../docker-compose.yml)
- [ ] Lire [../hub-frontend-v2/README.md](../hub-frontend-v2/README.md)

---

**📚 Documentation OceanPhenix V10**

Maintenue avec ❤️ par l'équipe OceanPhenix

[🏠 Retour au README Principal](../README.md) | [🚀 Quick Start](../QUICK_START.md)

</div>


- ⏱️ 20 minutes
- 🚀 Serveur Hetzner seul
- ✅ Script automatique
- ✅ Tous les services Docker
- 👥 **Idéal pour : Backend uniquement**

### 5️⃣ Production Complète

**[05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md)**

- ⏱️ 1 heure
- 🌐 DNS O2Switch + Serveur Hetzner
- ✅ SSL Let's Encrypt
- ✅ Sécurité complète
- ✅ Backup automatique
- 👥 **Idéal pour : Production finale**

---

## 🗺️ Quel Guide Choisir ?

```text
┌─────────────────────────────────────────────────┐
│ Vous voulez...                                  │
├─────────────────────────────────────────────────┤
│ 🏃 Démarrer vite en production                  │
│ → 01-GUIDE_SIMPLE.md                            │
│                                                 │
│ 💻 Tester en local sur mon PC                  │
│ → 02-INSTALLATION.md                            │
│                                                 │
│ 🎨 Personnaliser l'interface                   │
│ → 03-FRONTEND_SETUP.md                          │
│                                                 │
│ 🐳 Backend Docker seul (Hetzner)               │
│ → 04-DEPLOY_HETZNER.md                          │
│                                                 │
│ 🚀 Installation production complète avec DNS   │
│ → 05-DEPLOY_PRODUCTION.md                      │
└─────────────────────────────────────────────────┘
```

---

## 📂 Structure de la Documentation

```text
docs/
├── README.md                      ← Vous êtes ici
├── 01-GUIDE_SIMPLE.md            ⭐ Commencer ici
├── 02-INSTALLATION.md            Installation locale
├── 03-FRONTEND_SETUP.md          Configuration frontend
├── 04-DEPLOY_HETZNER.md          Déploiement Hetzner
├── 05-DEPLOY_PRODUCTION.md       Production complète
└── 06-FRONTEND_O2SWITCH_HETZNER.md Hub O2Switch + backend Hetzner

> ℹ️ Le script d'installation Hetzner est stocké dans `../scripts/deploy-hetzner.sh`.

---

## 🎓 Parcours d'Apprentissage

### Débutant

1. **[01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md)** - Déploiement express
2. **[02-INSTALLATION.md](02-INSTALLATION.md)** - Comprendre les services
3. Utiliser l'interface : <http://votredomaine.fr>

### Intermédiaire

1. **[03-FRONTEND_SETUP.md](03-FRONTEND_SETUP.md)** - Personnaliser
2. **[04-DEPLOY_HETZNER.md](04-DEPLOY_HETZNER.md)** - Backend avancé
3. Explorer les dashboards Grafana

### Avancé

1. **[05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md)** - Production
2. Configurer DNS et SSL
3. Backup et haute disponibilité
4. **[06-FRONTEND_O2SWITCH_HETZNER.md](06-FRONTEND_O2SWITCH_HETZNER.md)** - Frontend O2Switch + backend Hetzner (ia.oceanphenix.fr)

---

## 🚀 Installation en 1 Minute

### Frontend sur O2Switch

```bash
# 1. Uploader hub-frontend/ via cPanel dans /public_html/
# 2. Modifier config.js avec l'IP Hetzner
# 3. Accéder à <http://votredomaine.fr>
```

### Backend sur Hetzner

```bash
ssh root@VOTRE_IP_HETZNER
curl -o /tmp/install.sh https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/scripts/deploy-hetzner.sh
bash /tmp/install.sh
```

C'est tout ! ✅

---

## 📖 Documentation Technique

| Document | Contenu |
|----------|---------|
| **[DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md)** | Diagrammes d'architecture Mermaid (conteneurs, réseaux, flux) |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture détaillée de la plateforme |
| **[API.md](API.md)** | Documentation des endpoints API |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Résolution des problèmes courants |

---

## 🔗 Liens Utiles

- **GitHub Repository** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026>
- **Issues** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues>
- **README Principal** : [../README.md](../README.md)

---

## 🆘 Support

**Problème d'installation ?**

1. Consulter le guide correspondant
2. Vérifier la section "Troubleshooting"
3. Ouvrir une issue sur GitHub

**Questions fréquentes :**

- 🔧 Services ne démarrent pas → Voir logs Docker
- 🌐 Frontend page blanche → Vérifier chemin des fichiers
- 🔐 CORS error → Ajouter middleware CORS au backend
- 📊 Grafana "no data" → Vérifier Prometheus targets

---

## 📊 Tableau Récapitulatif

| Guide | Durée | Complexité | Pour Qui | Environnement |
|-------|-------|------------|----------|---------------|
| **01-GUIDE_SIMPLE** | 30 min | ⭐ Facile | Tous | O2Switch + Hetzner |
| 02-INSTALLATION | 15 min | ⭐⭐ Moyen | Développeurs | Local Docker |
| 03-FRONTEND_SETUP | 10 min | ⭐⭐ Moyen | Intégrateurs | O2Switch |
| 04-DEPLOY_HETZNER | 20 min | ⭐⭐⭐ Avancé | DevOps | Hetzner |
| 05-DEPLOY_PRODUCTION | 1h | ⭐⭐⭐⭐ Expert | Production | O2Switch + Hetzner + DNS |

---

## 🎉 Prêt à Commencer ?

➡️ **[Démarrer avec le Guide Simple (30 min)](01-GUIDE_SIMPLE.md)**

---

**🌊 OceanPhenix V10 - Plateforme IA Souveraine**
**Documentation organisée et accessible**
