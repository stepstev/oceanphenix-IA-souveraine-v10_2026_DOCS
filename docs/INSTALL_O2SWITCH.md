# 🌐 Guide de Déploiement O2Switch (Frontend) - OceanPhenix V8

Guide **complet** pour déployer le Hub Frontend d'OceanPhenix sur hébergement mutualisé O2Switch.

> **⚡ Besoin d'un guide rapide ?** Voir [INSTALL_O2SWITCH_SIMPLE.md](INSTALL_O2SWITCH_SIMPLE.md) (10 minutes)
>
> Ce guide contient les détails avancés : optimisations, CDN, PWA, CI/CD, etc.

## 🎯 Vue d'Ensemble

Cette configuration permet de :
- ✅ Héberger le Hub Frontend statique sur O2Switch
- ✅ Connecter à l'API backend sur Hetzner
- ✅ SSL automatique inclus
- ✅ Performance optimale avec CDN

**Architecture** :
```text
┌─────────────────┐         ┌──────────────────┐
│   O2Switch      │         │     Hetzner      │
│                 │         │                  │
│  Hub Frontend   │────────>│  Backend API     │
│  (Static HTML)  │  HTTPS  │  Open WebUI      │
│  ia.domain.com  │         │  Ollama, etc.    │
└─────────────────┘         └──────────────────┘
```

## 📋 Prérequis

### Compte O2Switch

- Offre O2Switch active (hébergement mutualisé)
- Accès cPanel : <https://cpanel.o2switch.net>
- FTP configuré

### Domaine

- Domaine principal ou sous-domaine dédié
- Exemple : `ia.votredomaine.com`

### Backend API (Hetzner)

- Stack OceanPhenix déployée sur Hetzner (voir [INSTALL_HETZNER.md](INSTALL_HETZNER.md))
- API accessible : `<https://api.votredomaine.com`>
- CORS configuré pour accepter le domaine frontend

## 🚀 Étape 1 : Préparation Frontend

### Cloner Repository en Local

```bash
# Clone projet
git clone <https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git>
cd oceanphenix-IA-souveraine-v8/hub-frontend
```

### Configuration API Endpoints

Éditer `hub-frontend/config.js` :

```javascript
// Configuration Production O2Switch
const CONFIG = {
    // API Backend sur Hetzner
    API_URL: '<https://api.votredomaine.com',>
    
    // Open WebUI sur Hetzner
    OPENWEBUI_URL: '<https://ia-backend.votredomaine.com',>
    
    // MinIO Console
    MINIO_CONSOLE_URL: '<https://minio.votredomaine.com',>
    
    // Grafana
    GRAFANA_URL: '<https://grafana.votredomaine.com',>
    
    // Services additionnels
    N8N_URL: '<https://n8n.votredomaine.com',>
    PORTAINER_URL: '<https://portainer.votredomaine.com',>
    QDRANT_URL: '<https://qdrant.votredomaine.com',>
    
    // Environment
    ENV: 'production',
    
    // Features
    ENABLE_ANALYTICS: false,
    ENABLE_DEBUG: false
};

// Export config
window.OCEANPHENIX_CONFIG = CONFIG;
```

### Créer config.prod.js

```bash
cp config.js config.prod.js
```

Éditer `index.html` pour charger la bonne config :

```html
<!-- Avant </head> -->
<script src="config.prod.js"></script>
<script src="app.js"></script>
```

### Optimiser Assets

```bash
# Minifier CSS (optionnel)
npm install -g cssnano-cli
cat styles.css styles-enhanced.css | cssnano > styles.min.css

# Minifier JS (optionnel)
npm install -g terser
terser app.js -o app.min.js -c -m
```

Mettre à jour `index.html` si minifié :

```html
<link rel="stylesheet" href="styles.min.css">
<script src="app.min.js"></script>
```

## 🌐 Étape 2 : Configuration DNS

### Via cPanel O2Switch

1. **cPanel** → **Zone Editor**
2. **Gérer** le domaine principal
3. Ajouter enregistrement :

```
Type: A
Nom: ia (ou sous-domaine choisi)
Adresse IPv4: [IP O2Switch fournie]
TTL: 14400
```

4. Enregistrer

Attendre propagation DNS (5-30 minutes)

```bash
# Vérifier
dig ia.votredomaine.com +short
```

## 📁 Étape 3 : Upload via FTP

### Méthode 1 : FileZilla

1. **Télécharger** FileZilla : <https://filezilla-project.org>

2. **Connexion** :

   - Hôte : `ftp.votredomaine.com` ou `IP O2Switch`
   - Utilisateur : Votre login cPanel
   - Mot de passe : Votre mot de passe cPanel
   - Port : 21

3. **Naviguer** vers `/public_html/ia/` (créer si nécessaire)


4. **Upload** tous les fichiers :

   ```text
   hub-frontend/
   ├── index.html
   ├── config.prod.js
   ├── app.js (ou app.min.js)
   ├── styles.css (ou styles.min.css)
   ├── styles-enhanced.css
   ├── legal-modals.css
   ├── legal-modals.js
   ├── studio-architecture.js
   ├── assets/
   ├── images/
   └── legal/
   ```

### Méthode 2 : cPanel File Manager

1. **cPanel** → **Gestionnaire de fichiers**
2. **Naviguer** vers `public_html`
3. **Créer dossier** : `ia`
4. **Upload** → Sélectionner tous les fichiers
5. **Extraire** si archive ZIP

### Méthode 3 : SFTP (Recommandé)

```bash
# Via terminal
sftp user@votredomaine.com

# Naviguer
cd public_html/ia

# Upload récursif
put -r hub-frontend/*

# Vérifier
ls -la

# Exit
quit
```

## 🔧 Étape 4 : Configuration cPanel

### Créer Sous-Domaine

1. **cPanel** → Sous-domaines

2. **Créer sous-domaine** :

   - Sous-domaine : `ia`
   - Domaine : `votredomaine.com`
   - Racine du document : `/public_html/ia`
3. Créer

### SSL/TLS (Let's Encrypt)

1. **cPanel** → **SSL/TLS Status**
2. **Cocher** : `ia.votredomaine.com`
3. **Run AutoSSL**
4. **Attendre** installation (1-2 minutes)

Vérifier certificat :

```bash
curl -I <https://ia.votredomaine.com>
# HTTP/2 200 attendu
```

### .htaccess pour Redirection HTTPS

Créer `/public_html/ia/.htaccess` :

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ <https://%{HTTP_HOST}%{REQUEST_URI}> [L,R=301]

# Activer compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Sécurité headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Désactiver listing directories
Options -Indexes

# Protection .env et fichiers sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

## 🔗 Étape 5 : Configuration CORS Backend

Pour que le frontend O2Switch puisse appeler l'API Hetzner, configurer CORS sur le backend.

### Sur Serveur Hetzner

Éditer `backend/main.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "<https://ia.votredomaine.com",>  # Frontend O2Switch
        "<http://localhost:8080",>         # Dev local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redémarrer backend :

```bash
docker compose restart backend
```

### Caddy CORS Headers (Alternative)

Éditer `core/proxy/Caddyfile` sur Hetzner :

```caddyfile
api.votredomaine.com {
    reverse_proxy backend:8000
    
    header {
        Access-Control-Allow-Origin "<https://ia.votredomaine.com">
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization"
        Access-Control-Allow-Credentials "true"
    }
    
    @options method OPTIONS
    respond @options 204
}
```

Reload Caddy :

```bash
docker exec v8-caddy caddy reload --config /etc/caddy/Caddyfile
```

## ✅ Étape 6 : Tests & Validation

### Test Frontend

1. **Ouvrir** : <https://ia.votredomaine.com>

2. **Vérifier** :

   - ✅ Page s'affiche correctement
   - ✅ Styles chargés
   - ✅ JavaScript fonctionnel
   - ✅ Navigation entre sections

### Test API Connexion

Ouvrir Console navigateur (F12) :

```javascript
// Test fetch API
fetch('<https://api.votredomaine.com/health'>)
    .then(r => r.json())
    .then(data => console.log('API OK:', data))
    .catch(err => console.error('API Error:', err));
```

Si CORS error visible → Revoir configuration CORS backend

### Test Services

Cliquer sur les liens services dans le Hub :
- ✅ Open WebUI accessible
- ✅ Grafana accessible
- ✅ MinIO Console accessible
- ✅ Tous les popups fonctionnent

## 📊 Étape 7 : Monitoring & Analytics

### Google Analytics (Optionnel)

Ajouter avant `</head>` dans `index.html` :

```html
<!-- Google Analytics -->
<script async src="<https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring

**UptimeRobot** (Gratuit) :
1. <https://uptimerobot.com>

2. Add Monitor :

   - Type : HTTPS
   - URL : <https://ia.votredomaine.com>
   - Interval : 5 minutes
3. Alert contacts : votre email

### cPanel Analytics

- **cPanel** → **Awstats**
- Voir statistiques visiteurs, pages vues, bandwidth

## 🔄 Étape 8 : Déploiement Continu

### Script de Déploiement Local

```bash
# deploy.sh
#!/bin/bash
set -e

echo "🚀 Deploying to O2Switch..."

# Build
npm run build  # Si nécessaire

# Upload via SFTP
lftp -u $FTP_USER,$FTP_PASS sftp://votredomaine.com <<EOF
mirror -R hub-frontend/ /public_html/ia/ --delete --verbose
quit
EOF

echo "✅ Deployment completed"
```

### GitHub Actions (Automatisation)

Créer `.github/workflows/deploy-o2switch.yml` :

```yaml
name: Deploy to O2Switch

on:
  push:
    branches: [main]
    paths:
      - 'hub-frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ftp.votredomaine.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./hub-frontend/
          server-dir: /public_html/ia/
```

Configurer secrets dans GitHub :
- **Settings** → **Secrets** → **Actions**
- Ajouter : `FTP_USERNAME`, `FTP_PASSWORD`

## 🐛 Troubleshooting

### Page blanche après upload

```bash
# Vérifier permissions
# Via cPanel File Manager, sélectionner tous fichiers
# Change Permissions → 644 pour fichiers, 755 pour dossiers
```

### CORS errors

```bash
# Vérifier headers API
curl -I <https://api.votredomaine.com/health>

# Doit contenir :
# Access-Control-Allow-Origin: <https://ia.votredomaine.com>
```

### CSS/JS non chargés

Vérifier chemins dans `index.html` :

```html
<!-- Chemins relatifs corrects -->
<link rel="stylesheet" href="styles.css">
<script src="app.js"></script>

<!-- PAS de / au début si dans sous-dossier -->
```

### SSL non activé

```bash
# cPanel → SSL/TLS Status
# Forcer réémission certificat
# Ou attendre AutoSSL cycle (toutes les 2h)
```

## 🎯 Optimisations Production

### CDN Cloudflare (Recommandé)

1. **Cloudflare** → Add Site : votredomaine.com
2. Changer nameservers chez registrar

3. **Speed** → **Optimization** :

   - Auto Minify : ✅ JS, CSS, HTML
   - Rocket Loader : ✅
   - Brotli : ✅
4. **Caching** → Browser Cache TTL : 1 year

### Images WebP

Convertir images en WebP :

```bash
# Installer cwebp
brew install webp

# Convertir
cwebp logo.png -q 80 -o logo.webp
```

Utiliser dans HTML :

```html
<picture>
  <source srcset="images/logo.webp" type="image/webp">
  <img src="images/logo.png" alt="Logo">
</picture>
```

### Service Worker (PWA)

Créer `sw.js` :

```javascript
const CACHE_NAME = 'oceanphenix-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js',
  '/images/logo.png'
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

Enregistrer dans `app.js` :

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 📚 Ressources

- **O2Switch cPanel** : <https://cpanel.o2switch.net>
- **Documentation O2Switch** : <https://faq.o2switch.fr>
- **Repository GitHub** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v8>

---

**Support** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues>
