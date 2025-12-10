# 🎨 OceanPhenix V10 - Hub Frontend

> Interface utilisateur moderne et responsive pour la plateforme OceanPhenix

---

## 📋 Vue d'Ensemble

Le **Hub Frontend V10** est l'interface web principale d'OceanPhenix, offrant :

- 🎯 **Dashboard centralisé** - Accès à tous les services
- 🎨 **Design moderne** - Basé sur Tabler.io (Bootstrap 5)
- 📱 **Responsive** - Mobile, tablette, desktop
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌐 **Multi-pages** - Dashboard, RAG, BI, Chat, Studio

---

## 🏗️ Structure

```
hub-frontend-v2/
├── index.html                 # Page d'accueil (redirection)
├── config.js                  # Configuration API endpoints
├── config.prod.js            # Configuration production
├── config.prod.example.js    # Template configuration
│
├── pages/                     # Pages principales
│   ├── dashboard.html        # 🏠 Tableau de bord
│   ├── rag.html             # 📚 Interface RAG
│   ├── bi.html              # 📊 Business Intelligence
│   ├── chat.html            # 💬 Chat IA
│   ├── studio.html          # 🎨 Open WebUI
│   ├── monitoring.html      # 📈 Monitoring
│   └── settings.html        # ⚙️ Paramètres
│
├── assets/                    # Ressources statiques
│   ├── css/
│   │   ├── oceanphenix-theme.css     # Thème principal (5517 lignes)
│   │   └── styles-enhanced.css       # Améliorations visuelles
│   ├── js/
│   │   ├── app.js           # Application principale
│   │   ├── rag.js           # Logique RAG
│   │   └── bi.js            # Logique BI
│   └── images/              # Logos, icônes
│       ├── logo.png
│       ├── logo-white.png
│       └── favicon.ico
│
├── legal/                     # Pages légales
│   ├── cgu.html             # Conditions Générales d'Utilisation
│   ├── mentions-legales.html # Mentions légales
│   ├── confidentialite.html  # Politique de confidentialité
│   └── licence.html         # Licence MIT
│
└── docs/                      # Documentation frontend
    ├── STRUCTURE.md          # Architecture détaillée
    └── LEGAL_INTEGRATION.md  # Intégration pages légales
```

---

## 🎨 Design System

### Palette de Couleurs

```css
/* Couleurs principales */
--primary: #0891b2;      /* Cyan principal */
--secondary: #06b6d4;    /* Cyan secondaire */
--success: #10b981;      /* Vert succès */
--warning: #f59e0b;      /* Orange warning */
--danger: #ef4444;       /* Rouge erreur */

/* Thème clair */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1e293b;

/* Thème sombre */
--bg-primary-dark: #0f172a;
--bg-secondary-dark: #1e293b;
--text-primary-dark: #f1f5f9;
```

### Composants UI

- **Buttons** : Unicolores, padding `0.55rem 1.25rem`, border-radius `6px`
- **Cards** : Transparentes, ombres subtiles, hover effects
- **Forms** : Labels visibles, validation inline, accessibilité
- **Icons** : Font Awesome 6.4.0, taille `56px` pour API icons
- **Typography** : Inter font, responsive scaling

---

## ⚙️ Configuration

### config.js (Développement)

```javascript
window.API_CONFIG = {
  // Backend API
  API_URL: "http://localhost:8000",
  
  // Services externes
  OPENWEBUI_URL: "http://localhost:3000",
  GRAFANA_URL: "http://localhost:3001",
  MINIO_URL: "http://localhost:9001",
  N8N_URL: "http://localhost:5678",
  SUPERSET_URL: "http://localhost:8088",
  
  // Options
  API_TIMEOUT: 30000,
  ENABLE_DEBUG: true
};
```

### config.prod.js (Production)

```javascript
window.API_CONFIG = {
  // URLs production avec domaines
  API_URL: "https://api.votredomaine.com",
  OPENWEBUI_URL: "https://studio.votredomaine.com",
  GRAFANA_URL: "https://monitoring.votredomaine.com",
  
  // Désactiver debug
  ENABLE_DEBUG: false
};
```

---

## 🚀 Déploiement

### Option 1 : Nginx (Docker)

Le frontend est automatiquement servi via Docker Compose :

```yaml
# docker-compose.yml
dashboard:
  image: nginx:alpine
  container_name: v10-frontend
  volumes:
    - ./hub-frontend-v2:/usr/share/nginx/html:ro
  networks: [ proxy ]
```

**Accès** : `http://localhost` (via Caddy proxy)

### Option 2 : Serveur Statique

```bash
# Python
cd hub-frontend-v2
python -m http.server 8080

# Node.js
npx serve -s . -l 8080

# PHP (O2Switch)
# Upload via FTP/SFTP vers public_html/
```

### Option 3 : O2Switch (Hébergement web)

```bash
# 1. Connexion FTP
sftp user@ftp.votredomaine.com

# 2. Upload
put -r hub-frontend-v2/* public_html/

# 3. Configuration
# Copier config.prod.js → config.js
# Éditer avec URLs production
```

---

## 🔧 Développement

### Prérequis

- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+)
- Éditeur code (VS Code recommandé)
- Extensions utiles :
  - Live Server (VS Code)
  - HTML CSS Support
  - Auto Rename Tag

### Lancer en développement

```bash
# 1. Aller dans le dossier
cd hub-frontend-v2

# 2. Option A : Live Server VS Code
# Clic droit sur index.html → "Open with Live Server"

# 2. Option B : Python
python -m http.server 8080

# 3. Ouvrir
# http://localhost:8080
```

### Structure de développement

```javascript
// app.js - Point d'entrée
window.addEventListener('DOMContentLoaded', () => {
  initTheme();        // Thème clair/sombre
  checkAuth();        // Vérification authentification
  loadDashboard();    // Chargement données
});

// Appels API
async function fetchServices() {
  const response = await fetch(`${API_CONFIG.API_URL}/health`);
  return response.json();
}
```

---

## 📱 Pages Principales

### 1. Dashboard (`dashboard.html`)

**Fonctionnalités** :
- Vue d'ensemble services
- Cartes d'accès rapide
- Statut système temps réel
- Navigation vers autres pages

**Composants** :
- Hero section avec logo
- Grid 3 colonnes responsive
- Service cards avec icônes
- Footer avec liens légaux

### 2. RAG (`rag.html`)

**Fonctionnalités** :
- Upload documents (PDF, TXT, MD, DOCX)
- Indexation vectorielle
- Chat avec contexte documentaire
- Historique conversations

**API Endpoints** :
```javascript
POST /api/rag/upload       // Upload document
POST /api/rag/index        // Indexer dans Qdrant
POST /api/rag/chat         // Chat avec RAG
GET  /api/rag/documents    // Liste documents
```

### 3. BI (`bi.html`)

**Fonctionnalités** :
- Connexion bases de données
- Requêtes SQL personnalisées
- Visualisations interactives
- Export données (CSV, Excel)

**Graphiques** :
- Chart.js pour visualisations
- Tableaux avec tri/filtrage
- Dashboards configurables

### 4. Chat (`chat.html`)

**Fonctionnalités** :
- Interface conversationnelle
- Streaming responses
- Multi-modèles (Mistral, Llama, Qwen)
- Historique sauvegardé

### 5. Studio (`studio.html`)

**Fonctionnalités** :
- iFrame vers Open WebUI
- Interface complète Open WebUI
- Gestion modèles
- Partage conversations

---

## 🎨 Personnalisation

### Changer le thème

```css
/* assets/css/oceanphenix-theme.css */

/* Modifier les couleurs principales */
:root {
  --primary: #your-color;     /* Couleur principale */
  --secondary: #your-color;   /* Couleur secondaire */
}

/* Modifier le logo */
.logo-image {
  content: url('../images/your-logo.png');
}
```

### Ajouter une nouvelle page

```bash
# 1. Créer le fichier HTML
touch pages/nouvelle-page.html

# 2. Template de base
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Nouvelle Page - OceanPhenix V10</title>
  <link rel="stylesheet" href="../assets/css/oceanphenix-theme.css">
</head>
<body>
  <div class="page-wrapper">
    <!-- Contenu -->
  </div>
  <script src="../config.js"></script>
  <script src="../assets/js/app.js"></script>
</body>
</html>

# 3. Ajouter dans dashboard.html
<a href="pages/nouvelle-page.html" class="card">
  <i class="fas fa-icon"></i>
  <h3>Nouvelle Page</h3>
</a>
```

---

## ♿ Accessibilité

### Standards respectés

- ✅ WCAG 2.1 Level AA
- ✅ Labels ARIA sur tous les contrôles
- ✅ Navigation clavier complète
- ✅ Contraste couleurs > 4.5:1
- ✅ Textes alternatifs images

### Tests d'accessibilité

```bash
# Lighthouse (Chrome DevTools)
# Performance, Accessibility, Best Practices, SEO

# Axe DevTools (Extension)
# Scan automatique des problèmes ARIA

# Wave (Extension)
# Analyse visuelle accessibilité
```

---

## 🧪 Tests

### Tests manuels

```bash
# Checklist avant déploiement
□ Toutes les pages chargent
□ Navigation fonctionne
□ API endpoints répondent
□ Thème clair/sombre
□ Responsive mobile/tablette
□ Pas d'erreurs console
□ Pages légales accessibles
```

### Tests automatisés (à venir)

```javascript
// Avec Playwright ou Cypress
describe('Dashboard', () => {
  it('should load all service cards', () => {
    cy.visit('/pages/dashboard.html');
    cy.get('.service-card').should('have.length', 8);
  });
});
```

---

## 📊 Performance

### Optimisations

- ✅ **CSS minifié** en production
- ✅ **Images optimisées** (WebP, compression)
- ✅ **Lazy loading** iframes
- ✅ **Cache navigateur** (1 an assets statiques)
- ✅ **CDN** Font Awesome, Bootstrap

### Métriques cibles

- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1
- **Lighthouse Score** : > 90/100

---

## 🐛 Dépannage

### Problème : API non accessible

```javascript
// Vérifier config.js
console.log(API_CONFIG.API_URL);

// Tester endpoint
fetch(`${API_CONFIG.API_URL}/health`)
  .then(r => r.json())
  .then(console.log);

// Vérifier CORS backend
// backend/main.py doit avoir :
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou URL frontend
)
```

### Problème : Page blanche

```bash
# Vérifier console navigateur (F12)
# Erreurs JavaScript ?
# Fichiers CSS/JS chargés ?

# Vérifier chemins relatifs
# Dans pages/, liens doivent être ../assets/
```

### Problème : Thème cassé

```css
/* Vérifier oceanphenix-theme.css chargé */
<link rel="stylesheet" href="../assets/css/oceanphenix-theme.css">

/* Vérifier variables CSS définies */
:root {
  --primary: #0891b2;
}
```

---

## 📚 Ressources

### Documentation

- [Structure Frontend](docs/STRUCTURE.md) - Architecture détaillée
- [Intégration Légale](docs/LEGAL_INTEGRATION.md) - Pages CGU/Mentions
- [Installation Principale](../README.md) - Documentation globale

### Dépendances

- **Bootstrap 5.3** : https://getbootstrap.com/
- **Tabler.io** : https://tabler.io/
- **Font Awesome 6.4** : https://fontawesome.com/
- **Chart.js 4.4** : https://www.chartjs.org/

### Support

- **Issues** : https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues
- **Discussions** : https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/discussions

---

## 📄 Licence

MIT License - Voir [LICENSE](../LICENSE)

---

**🌊 OceanPhenix V10** - Frontend moderne pour IA souveraine
