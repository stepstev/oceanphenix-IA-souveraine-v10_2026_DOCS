# 🌊 Ocean Phenix - Frontend V2

## 📋 Vue d'ensemble

**Ocean Phenix Frontend V2** est une refonte complète de l'interface utilisateur basée sur une architecture modulaire moderne, tout en préservant 100% du design visuel existant.

### Objectifs de la V2

- ✅ **Architecture modulaire** : Séparation layout / pages / composants / API
- ✅ **Maintenabilité accrue** : Code organisé, réutilisable, documenté
- ✅ **Compatibilité O2Switch** : Hébergement statique sans build tools
- ✅ **Design préservé** : Zéro changement visuel (classes CSS inchangées)
- ✅ **Performance optimisée** : Lazy loading, cache, compression

---

## 🏗️ Architecture

### Structure du projet

```
hub-frontend-v2/
├── index.html                    # Point d'entrée (redirection)
├── .htaccess                     # Configuration Apache O2Switch
│
├── assets/
│   ├── css/
│   │   ├── oceanphenix-theme.css           # CSS principal (copié de v1)
│   │   ├── oceanphenix-theme-standard.css  # CSS amélioré (copié de v1)
│   │   └── vendors/                        # Librairies tierces (Tabler, etc.)
│   │
│   ├── js/
│   │   ├── core/
│   │   │   ├── config.js         # Configuration centralisée (API, services)
│   │   │   ├── app.js            # Contrôleur principal (init, navigation)
│   │   │   └── utils.js          # Utilitaires réutilisables (dates, toast, etc.)
│   │   │
│   │   ├── layout/
│   │   │   ├── includes.js       # Chargement dynamique header/sidebar
│   │   │   └── theme-switcher.js # Gestion thème clair/sombre
│   │   │
│   │   ├── api/
│   │   │   └── api-client.js     # Wrapper API REST (GET/POST/RAG/Health)
│   │   │
│   │   └── pages/
│   │       ├── dashboard.js      # Logique page dashboard
│   │       ├── rag.js            # Logique page RAG
│   │       ├── automations.js    # Logique page automations (n8n)
│   │       ├── monitoring.js     # Logique page monitoring (Grafana)
│   │       └── settings.js       # Logique page paramètres
│   │
│   ├── img/
│   │   └── logo-oceanphenix.svg  # Logo officiel
│   │
│   └── fonts/                    # Polices personnalisées
│
├── includes/
│   ├── header.html               # En-tête avec thème toggle + statut système
│   └── sidebar.html              # Menu latéral avec navigation
│
├── pages/
│   ├── dashboard.html            # Tableau de bord principal
│   ├── rag.html                  # Interface RAG (upload/search documents)
│   ├── automations.html          # Gestion workflows n8n
│   ├── monitoring.html           # Dashboards Grafana
│   └── settings.html             # Configuration API + paramètres
│
├── components/                   # Composants réutilisables
│   ├── cards/                    # Cartes de statistiques
│   ├── modals/                   # Fenêtres modales
│   └── tables/                   # Tableaux de données
│
└── docs/                         # Documentation
    ├── README.md                 # Ce fichier
    ├── MIGRATION.md              # Guide migration V1 → V2
    └── DEPLOYMENT.md             # Guide déploiement O2Switch
```

---

## 🎯 Composants principaux

### 1. **Core (Cœur)**

#### `config.js`
- URL API Hetzner
- Endpoints (RAG, health, stats)
- URLs services (Open WebUI, Grafana, n8n)
- Configuration thème (dark par défaut)

#### `app.js`
- Initialisation application
- Gestion navigation et états actifs
- Mise à jour statut API en temps réel
- Handlers événements globaux

#### `utils.js`
- Formatage dates (formatDate, getRelativeTime)
- Notifications toast
- Gestion clipboard
- Debounce, échappement HTML

### 2. **Layout (Mise en page)**

#### `includes.js`
- Charge dynamiquement `sidebar.html` et `header.html` via fetch
- Injection dans `#sidebar-container` et `#header-container`
- Gestion timing asynchrone (setTimeout pour synchronisation)

#### `theme-switcher.js`
- Toggle clair/sombre avec persistance localStorage
- Classe `body.light-mode`
- Animation transitions 0.4s
- Changement icône (fa-moon ↔ fa-sun)

### 3. **API Client**

#### `api-client.js`
- Wrapper REST complet : `get()`, `post()`, `put()`, `delete()`
- Méthodes spécialisées :
  - `checkHealth()` : Vérification backend
  - `getStats()` : KPIs dashboard
  - `getServicesStatus()` : Statut services Docker
  - `indexDocuments()` : Indexation RAG
  - `searchRAG()` : Recherche documents
  - `getDocuments()`, `deleteDocument()` : Gestion documents

### 4. **Pages**

Chaque page suit le pattern :
```javascript
const PageName = {
    init() { /* Initialisation */ },
    loadData() { /* Fetch API */ },
    displayData() { /* Affichage DOM */ },
    attachEvents() { /* Event listeners */ }
};
```

#### `dashboard.js`
- Affichage KPIs (documents, requêtes, uptime)
- Liste services avec statut (vert/rouge)
- URLs rapides (Open WebUI, Grafana, n8n)
- Auto-refresh toutes les 30s

#### `rag.js`
- Upload de documents (PDF, DOCX, TXT)
- Recherche sémantique
- Affichage résultats avec score pertinence
- Gestion liste documents indexés

#### `automations.js`
- Ouverture n8n dans nouvel onglet
- Lien vers création workflow
- Intégration iframe si nécessaire

#### `monitoring.js`
- Liens dashboards Grafana :
  - Platform Health (CPU/RAM/Disque)
  - Containers Monitoring (Docker)
- Ouverture dans nouvel onglet

#### `settings.js`
- Configuration URL API
- Test connexion backend
- Sauvegarde localStorage
- Réinitialisation paramètres

---

## 🚀 Démarrage rapide

### Installation locale

1. **Cloner et naviguer**
```bash
cd hub-frontend-v2
```

2. **Ouvrir avec serveur local (VS Code Live Server ou Python)**
```bash
# Avec Python 3
python -m http.server 8080

# Avec Node.js http-server
npx http-server -p 8080 -c-1
```

3. **Ouvrir navigateur**
```
http://localhost:8080
```

### Configuration API

Modifier `assets/js/core/config.js` :
```javascript
const CONFIG = {
    API_URL: 'https://votre-backend.hetzner.com/api',
    // ... autres paramètres
};
```

---

## 🔧 Développement

### Ordre de chargement des scripts

**Respecter cet ordre dans chaque page HTML :**
```html
<!-- 1. Configuration -->
<script src="../assets/js/core/config.js"></script>

<!-- 2. Utilitaires -->
<script src="../assets/js/core/utils.js"></script>

<!-- 3. API Client -->
<script src="../assets/js/api/api-client.js"></script>

<!-- 4. Système d'includes -->
<script src="../assets/js/layout/includes.js"></script>

<!-- 5. Thème -->
<script src="../assets/js/layout/theme-switcher.js"></script>

<!-- 6. App principale -->
<script src="../assets/js/core/app.js"></script>

<!-- 7. Page spécifique -->
<script src="../assets/js/pages/dashboard.js"></script>
```

### Ajouter une nouvelle page

1. **Créer le HTML** dans `pages/ma-page.html`
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ocean Phenix - Ma Page</title>
    <link href="../assets/css/oceanphenix-theme.css" rel="stylesheet">
</head>
<body>
    <div id="sidebar-container"></div>
    
    <div class="page">
        <div id="header-container"></div>
        
        <div class="page-wrapper">
            <div class="page-body">
                <!-- Contenu de la page -->
            </div>
        </div>
    </div>
    
    <!-- Scripts (ordre important) -->
    <script src="../assets/js/core/config.js"></script>
    <!-- ... autres scripts ... -->
    <script src="../assets/js/pages/ma-page.js"></script>
</body>
</html>
```

2. **Créer le JavaScript** dans `assets/js/pages/ma-page.js`
```javascript
const MaPage = {
    init() {
        console.log('Ma page initialisée');
        this.attachEvents();
        this.loadData();
    },
    
    loadData() {
        // Chargement données API
    },
    
    attachEvents() {
        // Event listeners
    }
};

// Initialisation après chargement includes
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => MaPage.init(), 300);
});
```

3. **Ajouter au menu** dans `includes/sidebar.html`
```html
<li class="nav-item">
    <a class="nav-link" href="ma-page.html" data-page="ma-page">
        <span class="nav-link-icon">
            <i class="ti ti-icon-name"></i>
        </span>
        <span class="nav-link-title">Ma Page</span>
    </a>
</li>
```

---

## 🎨 Personnalisation du thème

### Mode clair

Le mode clair utilise la classe `body.light-mode` avec variables CSS :
```css
/* Dans oceanphenix-theme.css */
body.light-mode {
    --tblr-bg-surface: #ffffff;
    --tblr-body-color: #1e293b;
    /* ... autres variables ... */
}
```

### Toggle thème

Le bouton est dans `includes/header.html` :
```html
<button id="theme-toggle" class="btn">
    <i id="theme-icon" class="ti ti-moon"></i>
</button>
```

Logique dans `theme-switcher.js` :
- Sauvegarde dans `localStorage.getItem('theme')`
- Application classe `body.light-mode`
- Changement icône soleil/lune

---

## 📦 Dépendances externes

### CDN utilisés (dans HTML)

- **Tabler CSS** : `https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css`
- **Tabler Icons** : `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons-webfont/tabler-icons.min.css`
- **Font Awesome** : `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`
- **Google Fonts** : Inter (400, 500, 700)

### Bibliothèques JavaScript

Aucune (100% Vanilla JS) - Pas de React, Vue, Angular, jQuery

---

## 🔒 Sécurité

### En-têtes HTTP (via .htaccess)

```apache
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

### CORS

Autorisé via `.htaccess` pour API externe Hetzner :
```apache
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Protection fichiers sensibles

```apache
# Bloquer accès .htaccess, .env, etc.
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## 🐛 Débogage

### Erreurs communes

#### 1. **Includes ne chargent pas**
- Vérifier URL relative : `../includes/sidebar.html` depuis pages/
- Vérifier CORS si serveur local strict
- Ajouter setTimeout(200) avant initialisation thème

#### 2. **API non accessible**
- Vérifier `CONFIG.API_URL` dans config.js
- Tester backend : `curl https://api.hetzner.com/health`
- Vérifier en-têtes CORS sur backend

#### 3. **Thème ne persiste pas**
- Vérifier localStorage navigateur (F12 → Application)
- Tester : `localStorage.getItem('theme')`

#### 4. **Styles cassés**
- Chemins CSS relatifs : `../assets/css/oceanphenix-theme.css`
- Vérifier classes originales préservées (ex: `.kpi-grid`)

### Console développeur

Activer logs détaillés dans `config.js` :
```javascript
const CONFIG = {
    DEBUG_MODE: true,
    // ...
};
```

---

## 📚 Documentation complémentaire

- **[MIGRATION.md](./MIGRATION.md)** : Guide migration V1 → V2 étape par étape
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** : Déploiement O2Switch + configuration serveur

---

## 🤝 Contribution

### Standards de code

- **Indentation** : 4 espaces
- **Nommage** : camelCase pour fonctions, PascalCase pour objets/classes
- **Commentaires** : JSDoc pour fonctions publiques
- **Pas de console.log** en production (utiliser CONFIG.DEBUG_MODE)

### Workflow Git

```bash
# Créer branche feature
git checkout -b feature/ma-fonctionnalite

# Commit atomiques
git commit -m "feat: ajouter page XYZ"

# Push et Pull Request
git push origin feature/ma-fonctionnalite
```

---

## 📜 Licence

© 2025 Ocean Phenix - Tous droits réservés

---

## 📞 Support

**Équipe Ocean Phenix**
- Documentation : [docs/](./docs/)
- Issues : Voir gestionnaire de projet interne
