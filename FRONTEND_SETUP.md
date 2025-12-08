# 🎨 Hub Frontend - Installation et Configuration

## 📋 Vue d'ensemble

Le **Hub Frontend** est l'interface web principale d'OceanPhenix V8, déployée via **Nginx Alpine** dans Docker.

```
hub-frontend/
├── index.html              # Page principale avec navigation
├── app.js                  # Logique JavaScript (services, monitoring)
├── config.js               # Configuration API
├── styles.css              # Styles principaux
├── styles-enhanced.css     # Styles modernes glassmorphism
├── architecture.json       # Définition de l'architecture
├── studio-architecture.js  # Génération du diagramme
├── assets/                 # Images et ressources
│   ├── logo-oceanphenix.svg
│   ├── cgu.html
│   └── ...
└── legal/                  # Documents légaux RGPD
    ├── licence.html
    ├── cgu.html
    ├── mentions-legales.html
    └── ...
```

---

## 🐳 Déploiement Docker

### Configuration dans docker-compose.yml

```yaml
dashboard:
  image: nginx:alpine
  container_name: v8-frontend
  restart: unless-stopped
  volumes:
    - ./hub-frontend:/usr/share/nginx/html:ro
  profiles: [ core, all ]
  networks: [ proxy ]
```

### Démarrage

```bash
# Avec le profil core (recommandé)
docker-compose --profile core up -d dashboard

# Ou avec tous les services
docker-compose --profile all up -d

# Vérifier le statut
docker-compose ps dashboard

# Voir les logs
docker-compose logs -f dashboard
```

### Accès

- **Local**: http://localhost (via Caddy proxy)
- **Direct**: http://localhost:80 (si exposé)
- **Production**: https://hub.votredomaine.fr

---

## 🔧 Configuration

### 1. Configuration API (config.js)

```javascript
// hub-frontend/config.js
const CONFIG = {
    API_URL: localStorage.getItem('oceanphenix_api_url') || 'http://localhost:8000',
    SERVICES: {
        'studio': 'http://localhost:3000',
        'grafana': 'http://localhost:3001',
        'prometheus': 'http://localhost:9090',
        'portainer': 'https://localhost:9443',
        'minio': 'http://localhost:9001',
        // ... autres services
    }
};
```

**Modification pour production:**

```javascript
const CONFIG = {
    API_URL: 'https://api.votredomaine.fr',
    SERVICES: {
        'studio': 'https://studio.votredomaine.fr',
        'grafana': 'https://monitoring.votredomaine.fr',
        // ...
    }
};
```

### 2. Configuration Nginx personnalisée (optionnel)

Si vous voulez personnaliser Nginx, créez un fichier de config:

```bash
# Créer un dossier nginx
mkdir -p hub-frontend/nginx

# Créer la config
cat > hub-frontend/nginx/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache statique
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
```

**Modifier docker-compose.yml:**

```yaml
dashboard:
  image: nginx:alpine
  container_name: v8-frontend
  restart: unless-stopped
  volumes:
    - ./hub-frontend:/usr/share/nginx/html:ro
    - ./hub-frontend/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
  profiles: [ core, all ]
  networks: [ proxy ]
```

---

## 🎨 Personnalisation

### 1. Modifier le branding

**Logo:**
```bash
# Remplacer le logo
cp votre-logo.svg hub-frontend/assets/logo-oceanphenix.svg

# Modifier dans index.html
# Ligne ~45: <img src="assets/logo-oceanphenix.svg" ...>
```

**Couleurs (styles.css):**

```css
:root {
    /* Couleurs principales Ocean Phenix */
    --primary-blue: #0284c7;    /* Votre couleur */
    --primary-dark: #0369a1;
    --primary-light: #38bdf8;
    --accent-cyan: #00d9ff;
    /* ... */
}
```

### 2. Ajouter des services

**Dans architecture.json:**

```json
{
  "nodes": [
    {
      "id": "nouveau-service",
      "name": "Nouveau Service",
      "type": "service",
      "status": "up",
      "description": "Description",
      "technologies": ["Tech1", "Tech2"],
      "healthcheck_url": "http://localhost:XXXX/health"
    }
  ]
}
```

**Dans app.js (serviceUrls):**

```javascript
const serviceUrls = {
    'nouveau-service': 'http://localhost:XXXX',
    // ...
};
```

### 3. Modifier la sidebar

**Dans index.html (lignes 50-75):**

```html
<nav class="nav-menu">
    <!-- Ajouter un nouvel item -->
    <a href="#votre-section" class="nav-item" data-tab="votre-section">
        <i class="fas fa-votre-icone"></i> Votre Section
    </a>
</nav>
```

**Ajouter la vue correspondante:**

```html
<!-- Dans main content -->
<div id="view-votre-section" class="view">
    <h2>Contenu de votre section</h2>
</div>
```

---

## 🔄 Mise à jour

### Mise à jour locale

```bash
# Modifier les fichiers dans hub-frontend/
# Redémarrer le conteneur
docker-compose restart dashboard

# Ou rebuild si Dockerfile modifié
docker-compose build dashboard
docker-compose up -d dashboard
```

### Mise à jour production (Hetzner)

```bash
ssh root@46.224.72.83
cd /opt/oceanphenix

# Pull depuis GitHub
git pull origin main

# Redémarrer
docker-compose restart dashboard

# Vérifier
docker-compose logs -f dashboard
```

### Cache navigateur

Si les modifications ne s'affichent pas:

```bash
# Vider le cache du conteneur
docker exec v8-frontend rm -rf /tmp/nginx-cache

# Ou redémarrer
docker-compose restart dashboard
```

**Dans le navigateur:**
- `Ctrl + F5` (hard refresh)
- Ou mode navigation privée

---

## 🔍 Debugging

### Logs Nginx

```bash
# Logs en direct
docker-compose logs -f dashboard

# Dernières 100 lignes
docker-compose logs --tail=100 dashboard

# Erreurs seulement
docker-compose logs dashboard | grep error
```

### Accès au conteneur

```bash
# Shell dans le conteneur
docker exec -it v8-frontend sh

# Vérifier les fichiers
ls -la /usr/share/nginx/html/

# Tester la config Nginx
nginx -t

# Recharger Nginx
nginx -s reload
```

### Problèmes courants

**1. Page blanche**

```bash
# Vérifier les fichiers
docker exec v8-frontend ls -la /usr/share/nginx/html/

# Vérifier les permissions
docker exec v8-frontend cat /usr/share/nginx/html/index.html
```

**2. CSS ne charge pas**

```bash
# Vérifier les chemins dans index.html
# Ils doivent être relatifs:
<link rel="stylesheet" href="styles.css">
# Pas: <link rel="stylesheet" href="/styles.css">
```

**3. JavaScript erreurs**

```bash
# Ouvrir la console navigateur (F12)
# Voir les erreurs JavaScript
# Vérifier config.js est chargé
```

**4. API non accessible**

```javascript
// Vérifier config.js
console.log(CONFIG.API_URL);

// Tester l'API directement
curl http://localhost:8000/health
```

---

## 🚀 Optimisation Production

### 1. Minification

**Installer les outils:**

```bash
npm install -g terser csso-cli html-minifier
```

**Minifier les fichiers:**

```bash
cd hub-frontend

# JavaScript
terser app.js -o app.min.js -c -m
terser config.js -o config.min.js -c -m

# CSS
csso styles.css -o styles.min.css
csso styles-enhanced.css -o styles-enhanced.min.css

# HTML
html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html
```

**Utiliser les versions minifiées dans index.html:**

```html
<link rel="stylesheet" href="styles.min.css">
<script src="app.min.js"></script>
```

### 2. Compression Gzip

Configuré automatiquement dans Nginx Alpine, mais vérifier:

```bash
# Tester la compression
curl -H "Accept-Encoding: gzip" -I http://localhost/styles.css
# Doit contenir: Content-Encoding: gzip
```

### 3. CDN pour assets lourds

**Utiliser des CDN pour les bibliothèques:**

```html
<!-- Font Awesome -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📦 Build personnalisé

Si vous voulez créer votre propre image Docker:

**Créer Dockerfile:**

```dockerfile
# hub-frontend/Dockerfile
FROM nginx:alpine

# Copier les fichiers
COPY . /usr/share/nginx/html/

# Config Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Builder:**

```bash
cd hub-frontend
docker build -t oceanphenix-frontend:latest .
```

**Modifier docker-compose.yml:**

```yaml
dashboard:
  image: oceanphenix-frontend:latest
  # Plus besoin de volumes si tout est dans l'image
  container_name: v8-frontend
  restart: unless-stopped
  profiles: [ core, all ]
  networks: [ proxy ]
```

---

## 📊 Monitoring du Frontend

### 1. Métriques Nginx

```bash
# Voir les logs d'accès
docker exec v8-frontend tail -f /var/log/nginx/access.log

# Statistiques
docker exec v8-frontend sh -c "cat /var/log/nginx/access.log | wc -l"
```

### 2. Intégration Prometheus

**Ajouter nginx-exporter (optionnel):**

```yaml
# Dans docker-compose.yml
nginx-exporter:
  image: nginx/nginx-prometheus-exporter:latest
  container_name: v8-nginx-exporter
  command:
    - '-nginx.scrape-uri=http://v8-frontend:80/stub_status'
  networks: [ internal ]
```

---

## 📚 Ressources

- **Nginx Docs**: https://nginx.org/en/docs/
- **Docker Nginx**: https://hub.docker.com/_/nginx
- **Font Awesome Icons**: https://fontawesome.com/icons
- **Google Fonts**: https://fonts.google.com/

---

## ✅ Checklist Installation

- [ ] Fichiers hub-frontend/ présents
- [ ] docker-compose.yml configuré
- [ ] Container dashboard démarré
- [ ] Accessible sur http://localhost
- [ ] config.js modifié pour production (si besoin)
- [ ] Dashboards Grafana importés
- [ ] Section Monitoring fonctionnelle
- [ ] Tous les liens de services opérationnels
- [ ] Documents légaux RGPD accessibles

---

**🌊 Hub Frontend OceanPhenix V8**
**Interface moderne glassmorphism - 100% RGPD - Monitoring intégré**
