# 🌊 OceanPhenix V8 - Architecture Souveraine Optimisée

## 📋 Analyse de l'Existant (V7)

### ✅ Points Forts
- Stack complète opérationnelle (RAG, UI, Monitoring, CMS, BI).
- Dockerisation avancée de tous les modules.
- Souveraineté respectée (Ollama local, MinIO, Qdrant).
- Documentation abondante.

### ⚠️ Points d'Optimisation (Traités en V8)
1. **Éparpillement des Configurations** : 
   - Fichiers dispersés dans `backend/stacks`, `backend/`, `local-dev/`.
   - **Solution V8** : Centralisation dans `oceanphenix-v8/docker-compose.yml` avec des profils Docker.
2. **Duplication des Scripts** : 
   - Maintenance double `.sh` (Linux) et `.ps1` (Windows).
   - **Solution V8** : Unification via un `Makefile` universel.
3. **Frontend Mixte** : 
   - `hub-frontend` mélange logique et assets.
   - **Solution V8** : Migration vers une architecture Dashboard propre utilisant le UI Kit **Tabler** (demandé).
4. **Fichiers Inutiles / Obsolètes** :
   - `.env.strapi-local` (Redondant).
   - `backend/docker-compose.core-optimized.yml` (Doublon).
   - `DEPLOY_CHECKLIST.md` (Obsolète, intégré dans docs V8).

---

## 🏗️ Architecture V8 Cible

L'architecture V8 est conçue pour être **Modulaire, Robuste et Simple**.

### 📂 Arborescence Normalisée

```bash
oceanphenix-v8/
├── .env.example            # Configuration unique et centralisée
├── docker-compose.yml      # Orchestrateur global (Profils: core, apps, monitoring, bi)
├── Makefile                # Commandes d'administration unifiées
├── apps/                   # Applications métier
│   ├── api/                # FastAPI (RAG Backend)
│   ├── dashboard/          # Frontend (Tabler UI)
│   ├── cms/                # Strapi (Gestion de contenu)
│   ├── automation/         # n8n (Workflows)
│   └── bi/                 # Superset (Business Intelligence)
├── core/                   # Infrastructure
│   ├── proxy/              # Caddy (HTTPS & Routing)
│   └── monitoring/         # Grafana & Prometheus
├── data/                   # Volumes persistants (Exclus du git)
└── docs/                   # Documentation consolidée
    ├── ARCHITECTURE.md
    └── GUIDE_ADMIN.md
```

### 🔌 Stack Technique V8

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Proxy** | **Caddy** | Reverse Proxy, HTTPS auto, Sécurité |
| **Front** | **Tabler** | Dashboard UI moderne et responsive |
| **Back** | **Strapi** | Headless CMS & Backend data |
| **RAG** | **Ollama + Qdrant** | Intelligence Artificielle Souveraine |
| **Storage** | **MinIO** | Stockage S3 compatible |
| **Auto** | **n8n** | Automatisation des flux |
| **BI** | **Superset** | Visualisation de données |

---

## 🚀 Migration V7 vers V8

1. **Initialisation** : Ce dossier `oceanphenix-v8` a été créé avec la structure cible.
2. **Données** : Les volumes Docker sont compatibles. Il suffira de pointer le `docker-compose.yml` V8 vers les mêmes données ou de les migrer.
3. **Configuration** : Copiez `.env.example` vers `.env` et ajustez les secrets.

---

## 🛠️ CI/CD & Déploiement

- **GitHub Actions** : Pipeline simple (Build -> Test -> Deploy SSH).
- **Hetzner** : Déploiement via SSH + Docker Compose.

---

**Antigravity - Décembre 2025**
