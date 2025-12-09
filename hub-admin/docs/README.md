# 🌊 OceanPhenix Admin Hub - Guide d'Utilisation

## 📋 Vue d'Ensemble

**OceanPhenix Admin Hub** est une interface d'administration moderne et professionnelle pour gérer votre plateforme IA Souveraine. Basée sur le framework Tabler (Bootstrap 5), elle offre une expérience utilisateur fluide et intuitive.

### Caractéristiques

✅ **Responsive** : Compatible mobile, tablette, desktop  
✅ **Mode sombre/clair** : Thème adaptatif  
✅ **Multi-environnement** : Local et Production (O2Switch)  
✅ **Temps réel** : Rafraîchissement automatique des données  
✅ **API centralisée** : Client API unifié  
✅ **100% statique** : HTML/CSS/JS pur (pas de framework lourd)  

---

## 🚀 Installation

### 1. Développement Local

#### Prérequis
- Backend OceanPhenix démarré (`docker-compose up -d`)
- Serveur web local (Live Server, Python http.server, etc.)

#### Démarrage
```bash
# Option 1 : VS Code Live Server
# Ouvrir le dossier hub-admin/ et cliquer sur "Go Live"

# Option 2 : Python
cd hub-admin
python -m http.server 8080

# Option 3 : Node.js
npx serve hub-admin -p 8080
```

Accédez à `http://localhost:8080`

---

### 2. Déploiement O2Switch

#### A. Préparation des fichiers

1. **Adapter la configuration** :
   - Ouvrir `assets/js/config.js`
   - Vérifier les URLs de production dans `production: { ... }`
   - Remplacer `oceanphenix.fr` par votre domaine

2. **Vérifier les endpoints** :
   ```javascript
   production: {
       API_URL: 'https://api.votre-domaine.fr',
       SERVICES: {
           grafana: 'https://grafana.votre-domaine.fr',
           n8n: 'https://n8n.votre-domaine.fr',
           // ...
       }
   }
   ```

#### B. Upload via FTP

1. **Connexion cPanel O2Switch** :
   - URL : `https://www.o2switch.fr/cpanel/`
   - Identifiants O2Switch

2. **Gestionnaire de fichiers** :
   - Aller dans `/public_html/`
   - Créer un dossier `admin/` (ou uploader directement dans `public_html/`)

3. **Upload des fichiers** :
   - Sélectionner tous les fichiers du dossier `hub-admin/`
   - Uploader via "Téléverser"
   - Vérifier la structure :
     ```
     public_html/admin/
     ├── index.html
     ├── .htaccess
     ├── assets/
     ├── pages/
     └── ...
     ```

4. **Permissions** :
   - Vérifier que `.htaccess` a les permissions 644
   - Les dossiers doivent être en 755

#### C. Configuration DNS (si sous-domaine)

Si vous voulez `admin.votre-domaine.fr` :

1. **Créer un sous-domaine** dans cPanel O2Switch
2. **Pointer vers** `/public_html/admin/`
3. **Activer SSL** (Let's Encrypt gratuit dans cPanel)

---

## 🎯 Utilisation

### Pages Disponibles

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/index.html` | Page de connexion/vérification API |
| **Dashboard** | `/pages/dashboard.html` | Vue d'ensemble générale |
| **RAG** | `/pages/rag.html` | Gestion documents et requêtes RAG |
| **Automations** | `/pages/automations.html` | Workflows N8N |
| **Contenu** | `/pages/content.html` | CMS Strapi |
| **Monitoring** | `/pages/monitoring.html` | Santé système et conteneurs |
| **Paramètres** | `/pages/settings.html` | Configuration |

### Navigation

1. **Première visite** :
   - Ouvrir `index.html`
   - Le système vérifie automatiquement la connexion API
   - Redirection vers le dashboard si OK

2. **Menu de navigation** :
   - Menu horizontal responsive
   - Icônes Tabler pour chaque section
   - Lien actif automatiquement mis en surbrillance

3. **Fonctionnalités communes** :
   - **Rafraîchissement auto** : Toutes les 30 secondes (configurable)
   - **Toggle thème** : Icône lune/soleil dans le header
   - **Statut API** : Indicateur en temps réel
   - **Menu utilisateur** : Paramètres et déconnexion

---

## ⚙️ Configuration

### Changer l'environnement manuellement

Ouvrir la console du navigateur :

```javascript
// Forcer l'environnement local
CONFIG.setEnvironment('local');

// Forcer l'environnement production
CONFIG.setEnvironment('production');

// Recharger la page
location.reload();
```

### Modifier l'intervalle de rafraîchissement

Dans `assets/js/config.js` :

```javascript
SETTINGS: {
    REFRESH_INTERVAL: 30000, // 30 secondes (modifier ici)
}
```

### Ajouter un nouveau service

Dans `assets/js/config.js`, section `SERVICES` :

```javascript
local: {
    SERVICES: {
        // ...services existants
        monNouveauService: 'http://localhost:PORT'
    }
},
production: {
    SERVICES: {
        // ...services existants
        monNouveauService: 'https://service.votre-domaine.fr'
    }
}
```

---

## 🔌 Appels API

### Utiliser le client API

Toutes les pages ont accès à l'objet global `API` :

```javascript
// Exemple : Récupérer la santé
const health = await API.getHealth();

// Exemple : Lister les documents
const documents = await API.getDocuments();

// Exemple : Upload d'un document
const file = document.getElementById('fileInput').files[0];
const result = await API.uploadDocument(file, 'Ma description');
```

### Ajouter un nouvel endpoint

Dans `assets/js/api-client.js` :

```javascript
class OceanPhenixAPI {
    // ...méthodes existantes
    
    // Nouveau endpoint
    async getMonNouveauEndpoint() {
        return this.get('/mon-endpoint');
    }
}
```

Utilisation :

```javascript
const data = await API.getMonNouveauEndpoint();
```

---

## 🎨 Personnalisation

### Changer les couleurs OceanPhenix

Dans `assets/css/oceanphenix-theme.css` :

```css
:root {
    --opx-blue: #0066cc;        /* Bleu principal */
    --opx-purple: #8b5cf6;      /* Violet secondaire */
    --opx-ocean: #006994;       /* Bleu océan */
    /* Modifier ces valeurs */
}
```

### Ajouter une nouvelle page

1. **Créer le fichier** : `pages/ma-page.html`
2. **Copier le template** de `dashboard.html`
3. **Modifier le contenu** dans la section `<div class="page-body">`
4. **Ajouter au menu** dans toutes les pages :

```html
<li class="nav-item">
    <a class="nav-link" href="ma-page.html">
        <span class="nav-link-icon">
            <i class="ti ti-mon-icone"></i>
        </span>
        <span class="nav-link-title">Ma Page</span>
    </a>
</li>
```

---

## 🐛 Dépannage

### Problème : "API Non Accessible"

**Causes possibles** :
1. Backend non démarré
2. Mauvaise URL dans `config.js`
3. Problème CORS

**Solutions** :
```bash
# Vérifier le backend
docker ps | grep oceanphenix

# Vérifier les logs
docker logs v8-api

# Tester l'API manuellement
curl http://localhost:8000/health
```

### Problème : "Services non visibles"

**Vérifier** :
1. Console du navigateur (F12) pour les erreurs
2. URLs des services dans `config.js`
3. CORS configuré sur le backend

### Problème : "Thème ne change pas"

**Solution** :
```javascript
// Nettoyer le localStorage
localStorage.clear();
location.reload();
```

---

## 📊 Structure des Données

### Format Health Check

```json
{
    "status": "healthy",
    "timestamp": "2025-12-09T...",
    "services": {
        "ollama": {
            "name": "Ollama",
            "status": "healthy",
            "response_time_ms": 45.2
        }
    },
    "healthy_count": 5,
    "total_count": 7,
    "health_percentage": 71.4
}
```

### Format Documents

```json
{
    "documents": [
        {
            "filename": "doc.pdf",
            "size": 1024000,
            "upload_date": "2025-12-09T...",
            "indexed": true
        }
    ]
}
```

---

## 🔒 Sécurité

### Recommandations Production

1. **HTTPS obligatoire** : Activez SSL sur O2Switch
2. **Authentification** : À implémenter selon vos besoins
3. **Token API** : Stocker dans `localStorage` ou cookies sécurisés
4. **CORS** : Configurer correctement sur le backend
5. **Rate limiting** : Limiter les appels API

### .htaccess (Production)

Le fichier `.htaccess` inclut :
- Redirection HTTPS (à activer)
- Compression GZIP
- Cache navigateur
- Headers de sécurité

---

## 📝 Changelog

### v1.0.0 - Décembre 2025
- ✅ Interface complète basée sur Tabler
- ✅ Dashboard avec stats en temps réel
- ✅ Pages RAG, Automations, Monitoring
- ✅ Multi-environnement (local/prod)
- ✅ Client API centralisé
- ✅ Thème OceanPhenix personnalisé
- ✅ Mode sombre/clair

---

## 🆘 Support

- **Documentation API** : `/docs` sur votre backend
- **Issues GitHub** : (à définir)
- **Email** : admin@oceanphenix.fr

---

## 📜 Licence

© 2025 OceanPhenix - Tous droits réservés
