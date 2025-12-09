# 🚀 Guide de Déploiement - Ocean Phenix Frontend V2

## 📋 Vue d'ensemble

Ce guide couvre le déploiement de **hub-frontend-v2** sur hébergement statique **O2Switch** avec backend API sur **Hetzner**.

---

## 🏗️ Architecture de déploiement

```
┌─────────────────────────────────────────────────────┐
│               UTILISATEUR FINAL                      │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTPS
                     │
         ┌───────────▼───────────┐
         │   oceanphenix.com     │
         │   (O2Switch Apache)   │
         │                       │
         │  Frontend V2          │
         │  - HTML/CSS/JS        │
         │  - Fichiers statiques │
         └───────────┬───────────┘
                     │
                     │ API Requests (CORS)
                     │
         ┌───────────▼───────────┐
         │  api.oceanphenix.com  │
         │  (Hetzner VPS)        │
         │                       │
         │  Backend FastAPI      │
         │  - RAG Pipeline       │
         │  - MinIO Storage      │
         │  - Open WebUI         │
         └───────────────────────┘
```

---

## 🎯 Prérequis

### Serveur O2Switch (Frontend)
- ✅ Hébergement web mutualisé ou VPS
- ✅ Accès FTP/SSH
- ✅ Support Apache + .htaccess
- ✅ SSL/TLS activé (Let's Encrypt)
- ✅ Domaine configuré (ex: oceanphenix.com)

### Serveur Hetzner (Backend)
- ✅ VPS avec IP publique
- ✅ Docker + Docker Compose installés
- ✅ Sous-domaine API configuré (ex: api.oceanphenix.com)
- ✅ Certificat SSL (Caddy auto ou Let's Encrypt)
- ✅ Ports ouverts : 80, 443, 3000 (Open WebUI)

### Outils locaux
- Git
- Client FTP (FileZilla) ou SSH
- Navigateur web

---

## 📦 Étape 1 : Préparation des fichiers

### 1.1 Cloner le projet

```bash
cd /chemin/vers/projets
git clone https://github.com/oceanphenix/hub-frontend-v2.git
cd hub-frontend-v2
```

### 1.2 Configuration API

Éditer `assets/js/core/config.js` :

```javascript
const CONFIG = {
    // ⚠️ IMPORTANT : Remplacer par vraie URL API Hetzner
    API_URL: 'https://api.oceanphenix.com/api',
    
    SERVICES_ENDPOINTS: {
        HEALTH: '/health',
        STATS: '/stats',
        SERVICES: '/services/status',
        RAG_SEARCH: '/rag/search',
        RAG_INDEX: '/rag/index',
        RAG_DOCUMENTS: '/rag/documents'
    },
    
    SERVICES_URLS: {
        OPEN_WEBUI: 'https://chat.oceanphenix.com',
        GRAFANA: 'https://monitoring.oceanphenix.com:3001',
        N8N: 'https://automations.oceanphenix.com:5678'
    },
    
    GRAFANA_DASHBOARDS: {
        PLATFORM_HEALTH: '/d/oceanphenix-platform-health',
        CONTAINERS: '/d/oceanphenix-containers-monitoring'
    },
    
    THEME: {
        DEFAULT: 'dark',
        STORAGE_KEY: 'oceanphenix-theme'
    },
    
    REFRESH_INTERVAL: 30000, // 30 secondes
    
    DEBUG_MODE: false // ⚠️ Mettre à false en production
};
```

### 1.3 Vérification pré-déploiement

```bash
# Lister tous les fichiers à déployer
find . -type f -not -path '*/\.*' -not -path '*/node_modules/*'

# Vérifier structure
tree -L 3
```

**Résultat attendu** :
```
hub-frontend-v2/
├── index.html
├── .htaccess
├── assets/
│   ├── css/ (2 fichiers)
│   ├── js/ (14 fichiers)
│   └── img/ (logo)
├── includes/ (2 fichiers)
├── pages/ (5 fichiers)
└── docs/ (3 fichiers)
```

---

## 🌐 Étape 2 : Déploiement sur O2Switch

### 2.1 Connexion FTP

**Avec FileZilla** :
1. Hôte : `ftp.oceanphenix.com`
2. Utilisateur : `votreuser@oceanphenix.com`
3. Mot de passe : `[votre mot de passe]`
4. Port : `21` (FTP) ou `22` (SFTP)

**Avec ligne de commande** :
```bash
# SFTP recommandé
sftp votreuser@oceanphenix.com

# Naviguer vers public_html
cd public_html
```

### 2.2 Upload des fichiers

**Via FileZilla** :
1. Glisser-déposer `hub-frontend-v2/*` vers `/public_html/`
2. Attendre fin transfert (~50 fichiers)

**Via ligne de commande** :
```bash
# SCP (recommandé)
scp -r hub-frontend-v2/* votreuser@oceanphenix.com:/home/votreuser/public_html/

# Rsync (pour updates incrémentiels)
rsync -avz --progress hub-frontend-v2/ votreuser@oceanphenix.com:/home/votreuser/public_html/
```

### 2.3 Vérification des permissions

```bash
# Se connecter en SSH
ssh votreuser@oceanphenix.com

# Naviguer vers public_html
cd public_html

# Définir permissions correctes
find . -type d -exec chmod 755 {} \;  # Dossiers
find . -type f -exec chmod 644 {} \;  # Fichiers
chmod 644 .htaccess                   # .htaccess lisible
```

### 2.4 Test du site

Ouvrir navigateur :
```
https://oceanphenix.com
```

**Vérifications** :
- ✅ Redirection automatique vers `/pages/dashboard.html`
- ✅ Sidebar et header chargés
- ✅ Thème toggle fonctionne
- ✅ Aucune erreur console (F12)

---

## 🔧 Étape 3 : Configuration Apache (.htaccess)

Le fichier `.htaccess` est déjà inclus, voici les explications :

### 3.1 Redirections

```apache
RewriteEngine On

# Redirection racine → dashboard
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /pages/dashboard.html [L]

# URLs sans extension (ex: /dashboard → /pages/dashboard.html)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([a-z]+)$ pages/$1.html [L]
```

**Test** :
```
https://oceanphenix.com/dashboard  → fonctionne
https://oceanphenix.com/rag        → fonctionne
```

### 3.2 En-têtes CORS

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

**Pourquoi** : Autorise frontend O2Switch à appeler API Hetzner

### 3.3 Compression GZIP

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
    AddOutputFilterByType DEFLATE application/json image/svg+xml
</IfModule>
```

**Gain** : Réduction 60-80% taille fichiers transférés

### 3.4 Cache navigateur

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

**Résultat** : CSS/JS cachés 1 mois, HTML jamais caché

---

## 🖥️ Étape 4 : Configuration Backend Hetzner

### 4.1 Vérifier CORS côté API

**Dans `backend/main.py` (FastAPI)** :

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ⚠️ IMPORTANT : Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://oceanphenix.com",
        "https://www.oceanphenix.com",
        "http://localhost:8080"  # Pour dev local
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "API en ligne"}
```

### 4.2 Configurer Caddy (proxy)

**Dans `core/proxy/Caddyfile`** :

```caddy
# API Backend
api.oceanphenix.com {
    reverse_proxy backend:8000
    
    # CORS headers
    header {
        Access-Control-Allow-Origin "*"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "*"
    }
}

# Open WebUI
chat.oceanphenix.com {
    reverse_proxy open-webui:3000
}

# Grafana
monitoring.oceanphenix.com {
    reverse_proxy grafana:3001
}

# n8n
automations.oceanphenix.com {
    reverse_proxy n8n:5678
}
```

### 4.3 Redémarrer services

```bash
# Sur serveur Hetzner
cd /path/to/oceanphenix
docker-compose restart caddy backend
```

### 4.4 Tester API depuis O2Switch

```bash
# Depuis navigateur (console F12)
fetch('https://api.oceanphenix.com/api/health')
    .then(r => r.json())
    .then(d => console.log(d));

# Résultat attendu :
# { status: "ok", message: "API en ligne" }
```

---

## 🔐 Étape 5 : Sécurité et SSL

### 5.1 Vérifier SSL O2Switch

```bash
# Tester certificat
openssl s_client -connect oceanphenix.com:443

# Vérifier validité
curl -I https://oceanphenix.com
# Doit retourner HTTP/2 200
```

### 5.2 Forcer HTTPS

**Ajouter dans `.htaccess`** (déjà inclus) :

```apache
# Forcer HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 5.3 En-têtes de sécurité

```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

## 📊 Étape 6 : Monitoring et logs

### 6.1 Logs Apache O2Switch

**Accès via cPanel** :
1. Connexion cPanel
2. Section "Metrics" → "Raw Access Logs"
3. Télécharger `access_log` et `error_log`

**Ou via SSH** :
```bash
ssh votreuser@oceanphenix.com
tail -f ~/logs/access_log
tail -f ~/logs/error_log
```

### 6.2 Logs JavaScript (erreurs frontend)

**Ajouter système de logging** dans `core/app.js` :

```javascript
// Capturer erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    
    // Envoyer au backend pour logging
    if (CONFIG.DEBUG_MODE === false) {
        fetch(`${CONFIG.API_URL}/logs/frontend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: event.message,
                stack: event.error.stack,
                url: window.location.href,
                timestamp: new Date().toISOString()
            })
        });
    }
});
```

### 6.3 Monitoring performances

**Google Analytics (optionnel)** :

Ajouter dans `<head>` de `pages/dashboard.html` :

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚦 Étape 7 : Tests post-déploiement

### 7.1 Checklist fonctionnelle

| Fonctionnalité | Test | Résultat |
|----------------|------|----------|
| **Navigation** | Cliquer tous liens sidebar | ✅ / ❌ |
| **Thème** | Toggle clair/sombre | ✅ / ❌ |
| **API Health** | Vérifier badge "En ligne" | ✅ / ❌ |
| **Dashboard** | Affichage KPIs | ✅ / ❌ |
| **RAG Upload** | Uploader document test | ✅ / ❌ |
| **RAG Search** | Rechercher "test" | ✅ / ❌ |
| **Open WebUI** | Clic lien → ouvre chat | ✅ / ❌ |
| **Grafana** | Clic lien → ouvre monitoring | ✅ / ❌ |
| **n8n** | Clic lien → ouvre automations | ✅ / ❌ |

### 7.2 Tests navigateurs

**Desktop** :
- Chrome/Edge (dernière version)
- Firefox (dernière version)
- Safari (si Mac disponible)

**Mobile** :
- Chrome Android
- Safari iOS

**Commande utile** :
```bash
# Tester responsive avec Chrome DevTools
# F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```

### 7.3 Tests performances

**PageSpeed Insights** :
```
https://pagespeed.web.dev/
# Analyser : https://oceanphenix.com
```

**Objectifs** :
- Performance : >90
- Accessibility : >95
- Best Practices : >90
- SEO : >85

---

## 🐛 Dépannage

### Problème 1 : "Cannot read property of null"

**Cause** : Includes pas encore chargés

**Solution** :
```javascript
// Augmenter délai dans pages/dashboard.js
setTimeout(() => DashboardPage.init(), 500); // au lieu de 300
```

### Problème 2 : API CORS bloqué

**Erreur console** :
```
Access to fetch at 'https://api.oceanphenix.com' from origin 'https://oceanphenix.com' 
has been blocked by CORS policy
```

**Solution** :
1. Vérifier backend `main.py` (allow_origins)
2. Vérifier Caddy (header CORS)
3. Tester avec curl :
```bash
curl -H "Origin: https://oceanphenix.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.oceanphenix.com/api/health
```

### Problème 3 : Styles cassés

**Cause** : Chemin CSS incorrect

**Solution** :
```html
<!-- Vérifier dans pages/dashboard.html -->
<link href="../assets/css/oceanphenix-theme.css" rel="stylesheet">
<!-- Pas /assets/css/... -->
```

### Problème 4 : .htaccess non pris en compte

**Cause** : AllowOverride désactivé

**Solution O2Switch** :
1. Contacter support O2Switch
2. Ou créer `.htaccess` dans parent :
```apache
<Directory /home/votreuser/public_html>
    AllowOverride All
</Directory>
```

---

## 🔄 Mise à jour du site

### Workflow recommandé

```bash
# 1. Développer en local
cd hub-frontend-v2
# ... modifications ...

# 2. Tester localement
python -m http.server 8080

# 3. Commit Git
git add .
git commit -m "feat: ajout page XYZ"
git push origin main

# 4. Déployer sur O2Switch
rsync -avz --progress \
    --exclude '.git' \
    --exclude 'docs' \
    hub-frontend-v2/ \
    votreuser@oceanphenix.com:/home/votreuser/public_html/

# 5. Vérifier en production
curl -I https://oceanphenix.com
```

### Rollback en cas de problème

```bash
# Restaurer backup précédent
ssh votreuser@oceanphenix.com
cd public_html
rm -rf *
cp -r ../backup-20250125/* .
```

**⚠️ IMPORTANT** : Toujours faire backup avant déploiement :
```bash
ssh votreuser@oceanphenix.com
cd ~
tar -czf backup-$(date +%Y%m%d).tar.gz public_html/
```

---

## 📈 Optimisations post-déploiement

### 1. Minification CSS/JS

```bash
# Avec npm (optionnel)
npm install -g clean-css-cli uglify-js

# Minifier CSS
cleancss -o assets/css/oceanphenix-theme.min.css assets/css/oceanphenix-theme.css

# Minifier JS
uglifyjs assets/js/core/config.js -c -m -o assets/js/core/config.min.js
```

**Puis** : Modifier imports HTML pour utiliser `.min.css` et `.min.js`

### 2. Images optimisées

```bash
# Convertir PNG → WebP
cwebp assets/img/logo.png -o assets/img/logo.webp -q 80

# HTML responsive images
<picture>
    <source srcset="logo.webp" type="image/webp">
    <img src="logo.png" alt="Ocean Phenix">
</picture>
```

### 3. Service Worker (PWA)

**Créer `sw.js` à la racine** :

```javascript
const CACHE_NAME = 'oceanphenix-v1';
const urlsToCache = [
    '/',
    '/pages/dashboard.html',
    '/assets/css/oceanphenix-theme.css',
    '/assets/js/core/config.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

**Enregistrer dans `index.html`** :

```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

---

## 📞 Support O2Switch

**Documentation officielle** :
- [Centre d'aide O2Switch](https://faq.o2switch.fr)
- [Forum O2Switch](https://forum.o2switch.fr)

**Contact support** :
- Email : support@o2switch.fr
- Ticket : Via espace client

**Informations utiles à fournir** :
- Nom de domaine : oceanphenix.com
- Erreur console navigateur (capture F12)
- Logs Apache (`error_log`)
- Étapes reproduction problème

---

## ✅ Checklist finale

### Pré-déploiement
- [ ] Configuration `config.js` avec vraie URL API
- [ ] `DEBUG_MODE: false` en production
- [ ] Backup V1 si existant
- [ ] Tests locaux passés

### Déploiement
- [ ] Fichiers uploadés sur O2Switch
- [ ] Permissions correctes (755/644)
- [ ] `.htaccess` actif
- [ ] SSL/HTTPS fonctionnel

### Backend
- [ ] CORS configuré côté FastAPI
- [ ] Caddy reverse proxy opérationnel
- [ ] Endpoints API accessibles
- [ ] Services Docker actifs

### Tests
- [ ] Navigation entre pages
- [ ] Toggle thème
- [ ] Appels API réussis
- [ ] Responsive mobile
- [ ] Tests navigateurs multiples

### Monitoring
- [ ] Logs Apache consultables
- [ ] Erreurs JavaScript trackées
- [ ] Performances validées (PageSpeed)

---

**Déploiement réalisé par** : Équipe Ocean Phenix  
**Date** : Janvier 2025  
**Version** : 2.0.0  
**Environnement** : Production O2Switch + Hetzner
