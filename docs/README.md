# 📚 Documentation OceanPhenix V8

Bienvenue dans la documentation complète d'OceanPhenix V8 - Plateforme IA Souveraine.

## 🎯 Point d'Entrée

### Pour commencer rapidement :

➡️ **[01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md)** ⭐ **RECOMMANDÉ**
- Frontend O2Switch + Backend Hetzner
- 30 minutes chrono
- Le plus simple possible

---

## 📖 Guides d'Installation

### 1️⃣ Guide Simple (Débutant)
**[01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md)**
- ⏱️ 30 minutes
- 🎯 Frontend statique O2Switch + Backend Docker Hetzner
- ✅ Pas de DNS complexe
- ✅ Configuration minimale
- 👥 **Idéal pour : Démarrage rapide, test production**

### 2️⃣ Installation Locale
**[02-INSTALLATION.md](02-INSTALLATION.md)**
- ⏱️ 15 minutes
- 💻 Tout en local avec Docker
- ✅ Windows, Mac, Linux
- ✅ Développement et test
- 👥 **Idéal pour : Développeurs, tests locaux**

### 3️⃣ Configuration Frontend
**[03-FRONTEND_SETUP.md](03-FRONTEND_SETUP.md)**
- ⏱️ 10 minutes
- 🎨 Hub Frontend détaillé
- ✅ Personnalisation
- ✅ Optimisation production
- 👥 **Idéal pour : Personnalisation interface**

### 4️⃣ Déploiement Hetzner
**[04-DEPLOY_HETZNER.md](04-DEPLOY_HETZNER.md)**
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

```
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

```
docs/
├── README.md                      ← Vous êtes ici
├── 01-GUIDE_SIMPLE.md            ⭐ Commencer ici
├── 02-INSTALLATION.md            Installation locale
├── 03-FRONTEND_SETUP.md          Configuration frontend
├── 04-DEPLOY_HETZNER.md          Déploiement Hetzner
├── 05-DEPLOY_PRODUCTION.md       Production complète
└── deploy-hetzner.sh             Script d'installation automatique
```

---

## 🎓 Parcours d'Apprentissage

### Débutant
1. **[01-GUIDE_SIMPLE.md](01-GUIDE_SIMPLE.md)** - Déploiement express
2. **[02-INSTALLATION.md](02-INSTALLATION.md)** - Comprendre les services
3. Utiliser l'interface : http://votredomaine.fr

### Intermédiaire
1. **[03-FRONTEND_SETUP.md](03-FRONTEND_SETUP.md)** - Personnaliser
2. **[04-DEPLOY_HETZNER.md](04-DEPLOY_HETZNER.md)** - Backend avancé
3. Explorer les dashboards Grafana

### Avancé
1. **[05-DEPLOY_PRODUCTION.md](05-DEPLOY_PRODUCTION.md)** - Production
2. Configurer DNS et SSL
3. Backup et haute disponibilité

---

## 🚀 Installation en 1 Minute

### Frontend sur O2Switch
```bash
# 1. Uploader hub-frontend/ via cPanel dans /public_html/
# 2. Modifier config.js avec l'IP Hetzner
# 3. Accéder à http://votredomaine.fr
```

### Backend sur Hetzner
```bash
ssh root@VOTRE_IP_HETZNER
curl -o /tmp/install.sh https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v8/main/docs/deploy-hetzner.sh
bash /tmp/install.sh
```

**C'est tout ! ✅**

---

## 🔗 Liens Utiles

- **GitHub Repository** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8
- **Issues** : https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues
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

**🌊 OceanPhenix V8 - Plateforme IA Souveraine**
**Documentation organisée et accessible**
