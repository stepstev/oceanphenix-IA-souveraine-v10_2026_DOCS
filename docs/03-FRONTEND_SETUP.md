# 🎨 Hub Frontend V2 - Installation et Configuration

## 📋 Vue d'ensemble

Le **Hub Frontend V2** est l'interface web principale d'OceanPhenix V10, basée sur **Tabler.io** (Bootstrap 5), déployée via **Nginx Alpine** dans Docker.

### Fonctionnalités

- 🎯 **Dashboard centralisé** - Accès à tous les services
- 🎨 **Design moderne** - Basé sur Tabler.io avec thème personnalisé
- 📱 **Responsive** - Mobile, tablette, desktop
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌐 **Multi-pages** - Dashboard, RAG, BI, Monitoring, Automatisation

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
│   ├── monitoring.html      # 📈 Monitoring (Grafana)
│   ├── automations.html     # ⚡ Automatisations (n8n)
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
│   ├── cgu.html             # CGU
│   ├── mentions-legales.html # Mentions légales
│   ├── confidentialite.html  # RGPD
│   └── licence.html         # Licence MIT
│
└── docs/                      # Documentation
    ├── STRUCTURE.md          # Architecture détaillée
    └── LEGAL_INTEGRATION.md  # Pages légales
```

---

## 🐳 Déploiement Docker

### Configuration dans docker-compose.yml

```yaml
dashboard:
  image: nginx:alpine
  container_name: v10-frontend
  restart: unless-stopped
  volumes:
    - ./hub-frontend-v2:/usr/share/nginx/html:ro
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

- **Local**: <http://localhost> (via Caddy proxy)
- **Direct**: <http://localhost:80> (si exposé)
- **Production**: <https://hub.votredomaine.fr>

---

## 🔧 Configuration

### 1. Configuration API (config.js)

```javascript
// hub-frontend-v2/config.js
const API_CONFIG = {
    // Backend API
    API_BASE_URL: 'http://localhost:8000',
    
    // Services externes
    SERVICES: {
        OPEN_WEBUI: 'http://localhost:3000',
        GRAFANA: 'http://localhost:3001',
        PROMETHEUS: 'http://localhost:9090',
        PORTAINER: 'https://localhost:9443',
        MINIO: 'http://localhost:9001',
        N8N: 'http://localhost:5678',
        SUPERSET: 'http://localhost:8088'
    },
    
    // Configuration RAG
    RAG: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['pdf', 'txt', 'md', 'docx'],
        CHUNK_SIZE: 1000
    }
};
```

Modification pour production (config.prod.js):

```javascript
// hub-frontend-v2/config.prod.js
const API_CONFIG = {
    API_BASE_URL: 'https://api.votredomaine.fr',
    
    SERVICES: {
        OPEN_WEBUI: 'https://studio.votredomaine.fr',
        GRAFANA: 'https://monitoring.votredomaine.fr',
        PROMETHEUS: 'https://prometheus.votredomaine.fr',
        PORTAINER: 'https://portainer.votredomaine.fr',
        MINIO: 'https://minio.votredomaine.fr',
        N8N: 'https://n8n.votredomaine.fr',
        SUPERSET: 'https://bi.votredomaine.fr'
    },
    
    RAG: {
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        ALLOWED_TYPES: ['pdf', 'txt', 'md', 'docx'],
        CHUNK_SIZE: 1000
    }
};

// Renommer config.js en config.js.bak
// Renommer config.prod.js en config.js
```

### 2. Configuration Nginx personnalisée (optionnel)

Si vous voulez personnaliser Nginx, créez un fichier de config:

```bash
# Créer un dossier nginx
mkdir -p hub-frontend-v2/nginx

# Créer la config
cat > hub-frontend-v2/nginx/default.conf << 'EOF'
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

Modifier docker-compose.yml:

```yaml
dashboard:
  image: nginx:alpine
  container_name: v10-frontend
  restart: unless-stopped
  volumes:
    - ./hub-frontend-v2:/usr/share/nginx/html:ro
    - ./hub-frontend-v2/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
  profiles: [ core, all ]
  networks: [ proxy ]
```

---

## 🎨 Personnalisation

### 1. Modifier le branding

**Logo:**
```bash
# Remplacer les logos
cp votre-logo.png hub-frontend-v2/assets/images/logo.png
cp votre-logo-blanc.png hub-frontend-v2/assets/images/logo-white.png
cp votre-favicon.ico hub-frontend-v2/assets/images/favicon.ico
```

**Couleurs principales (assets/css/oceanphenix-theme.css):**

```css
:root {
    /* Couleurs principales OceanPhenix */
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
    --dark-bg-primary: #0f172a;
    --dark-bg-secondary: #1e293b;
    --dark-text-primary: #f1f5f9;
}
```

### 2. Ajouter des services

Dans architecture.json:

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
      "healthcheck_url": "<http://localhost:XXXX/health">
    }
  ]
}
```

Dans app.js (serviceUrls):

```javascript
const serviceUrls = {
    'nouveau-service': '<http://localhost:XXXX',>
    // ...
};
```

### 3. Personnaliser le thème Tabler

Le thème est basé sur Tabler.io. Pour personnaliser :

```css
/* hub-frontend-v2/assets/css/oceanphenix-theme.css */

/* Modifier les cartes */
.card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Modifier les boutons */
.btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border: none;
}

/* Ajouter des animations */
.card:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
}
```

---

## 🔄 Mise à jour

### Mise à jour locale

```bash
# Modifier les fichiers dans hub-frontend-v2/
# Les modifications sont visibles immédiatement (volume monté)

# Si les changements ne s'affichent pas, redémarrer :
docker-compose restart dashboard

# Vider le cache du navigateur : Ctrl + F5
```

### Mise à jour production (Hetzner)

```bash
ssh root@VOTRE_IP_HETZNER
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
docker exec v10-frontend rm -rf /tmp/nginx-cache

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
docker exec -it v10-frontend sh

# Vérifier les fichiers
ls -la /usr/share/nginx/html/

# Tester la config Nginx
nginx -t

# Recharger Nginx
nginx -s reload
```

### Problèmes courants

1. Page blanche

```bash
# Vérifier les fichiers
docker exec v10-frontend ls -la /usr/share/nginx/html/

# Vérifier les permissions
docker exec v10-frontend cat /usr/share/nginx/html/index.html
```

2. CSS ne charge pas

```bash
# Vérifier les chemins dans index.html
# Ils doivent être relatifs:
<link rel="stylesheet" href="styles.css">
# Pas: <link rel="stylesheet" href="/styles.css">
```

3. JavaScript erreurs

```bash
# Ouvrir la console navigateur (F12)
# Voir les erreurs JavaScript
# Vérifier config.js est chargé
```

4. API non accessible

```javascript
// Vérifier config.js
console.log(CONFIG.API_URL);

// Tester l'API directement
curl <http://localhost:8000/health>
```

---

## 🚀 Optimisation Production

### 1. Minification

Installer les outils:

```bash
npm install -g terser csso-cli html-minifier
```

Minifier les fichiers:

```bash
cd hub-frontend-v2

# JavaScript
terser assets/js/app.js -o assets/js/app.min.js -c -m
terser assets/js/rag.js -o assets/js/rag.min.js -c -m
terser assets/js/bi.js -o assets/js/bi.min.js -c -m
terser config.js -o config.min.js -c -m

# CSS
csso assets/css/oceanphenix-theme.css -o assets/css/oceanphenix-theme.min.css
csso assets/css/styles-enhanced.css -o assets/css/styles-enhanced.min.css

# HTML (pages)
for file in pages/*.html; do
    html-minifier --collapse-whitespace --remove-comments "$file" -o "${file%.html}.min.html"
done
```

Utiliser les versions minifiées dans index.html:

```html
<link rel="stylesheet" href="styles.min.css">
<script src="app.min.js"></script>
```

### 2. Compression Gzip

Configuré automatiquement dans Nginx Alpine, mais vérifier:

```bash
# Tester la compression
curl -H "Accept-Encoding: gzip" -I <http://localhost/styles.css>
# Doit contenir: Content-Encoding: gzip
```

### 3. CDN pour assets lourds

Utiliser des CDN pour les bibliothèques:

```html
<!-- Font Awesome -->
<link href="<https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"> rel="stylesheet">

<!-- Fonts -->
<link href="<https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"> rel="stylesheet">
```

---

## 📦 Build personnalisé

Si vous voulez créer votre propre image Docker:

Créer Dockerfile:

```dockerfile
# hub-frontend-v2/Dockerfile
FROM nginx:alpine

# Copier les fichiers
COPY . /usr/share/nginx/html/

# Config Nginx personnalisée (si elle existe)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

Builder:

```bash
cd hub-frontend-v2
docker build -t oceanphenix-frontend-v2:latest .
```

Modifier docker-compose.yml:

```yaml
dashboard:
  image: oceanphenix-frontend:latest
  # Plus besoin de volumes si tout est dans l'image
  container_name: v10-frontend
  restart: unless-stopped
  profiles: [ core, all ]
  networks: [ proxy ]
```

---

## 📊 Monitoring du Frontend

### 1. Métriques Nginx

```bash
# Voir les logs d'accès
docker exec v10-frontend tail -f /var/log/nginx/access.log

# Statistiques
docker exec v10-frontend sh -c "cat /var/log/nginx/access.log | wc -l"
```

### 2. Intégration Prometheus

Ajouter nginx-exporter (optionnel):

```yaml
# Dans docker-compose.yml
nginx-exporter:
  image: nginx/nginx-prometheus-exporter:latest
  container_name: v10-nginx-exporter
  command:
    - '-nginx.scrape-uri=<http://v10-frontend:80/stub_status'>
  networks: [ internal ]
```

---

## 📚 Ressources

- **Nginx Docs**: <https://nginx.org/en/docs/>
- **Docker Nginx**: <https://hub.docker.com/_/nginx>
- **Font Awesome Icons**: <https://fontawesome.com/icons>
- **Google Fonts**: <https://fonts.google.com/>

---

## ✅ Checklist Installation

- [ ] Fichiers hub-frontend-v2/ présents
- [ ] docker-compose.yml configuré avec le bon volume
- [ ] Container v10-frontend démarré
- [ ] Accessible sur http://localhost (via Caddy)
- [ ] config.js configuré (API_BASE_URL correct)
- [ ] Page dashboard.html accessible
- [ ] Page rag.html fonctionnelle (upload documents)
- [ ] Page monitoring.html affiche Grafana
- [ ] Page automations.html affiche n8n
- [ ] Documents légaux accessibles (legal/)
- [ ] Thème Tabler.io chargé correctement
- [ ] Mode sombre/clair fonctionnel

### Pages à vérifier

- [ ] **Dashboard** - http://localhost/pages/dashboard.html
- [ ] **RAG** - http://localhost/pages/rag.html
- [ ] **Monitoring** - http://localhost/pages/monitoring.html
- [ ] **Automatisations** - http://localhost/pages/automations.html
- [ ] **Paramètres** - http://localhost/pages/settings.html

---

**🌊 Hub Frontend V2 OceanPhenix V10**
**Interface moderne Tabler.io - Responsive - 100% RGPD - Multi-pages**
