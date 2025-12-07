# 🚀 Guide Simplifié O2Switch - Déploiement Frontend en 10 Minutes

Guide ultra-simplifié pour déployer le Hub Frontend OceanPhenix V8 sur O2Switch et le connecter au backend Hetzner.

## 📦 Checklist Rapide

- [ ] Backend OceanPhenix déployé sur Hetzner (voir [INSTALL_HETZNER.md](INSTALL_HETZNER.md))
- [ ] Compte O2Switch actif avec accès cPanel
- [ ] Domaine configuré (ex: `ia.votredomaine.com`)
- [ ] Accès FTP O2Switch

---

## ⚡ Installation Express (3 Étapes)

### 📥 Étape 1 : Préparation (2 minutes)

```bash
# 1. Cloner le projet
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git
cd oceanphenix-IA-souveraine-v8/hub-frontend

# 2. Configurer l'API (remplacer votredomaine.com)
cp config.prod.js config.js
nano config.js  # ou notepad sur Windows

# Éditer ces lignes :
# apiUrlDefault: 'https://api.VOTRE-DOMAINE.com',
# openwebui: 'https://studio.VOTRE-DOMAINE.com/health',
# minio: 'https://minio.VOTRE-DOMAINE.com/minio/health/live',
# grafana: 'https://grafana.VOTRE-DOMAINE.com/api/health',
```

**Exemple de configuration :**

```javascript
// Dans config.js
const OCEANPHENIX_MODE = 'production';

typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = {
  apiUrlDefault: 'https://api.oceanphenix.fr',  // ← Votre domaine
  apiAuthToken: null,
  useProxy: false,
  
  services: {
    api: 'https://api.oceanphenix.fr/health',
    openwebui: 'https://studio.oceanphenix.fr/health',
    minio: 'https://minio.oceanphenix.fr/minio/health/live',
    grafana: 'https://grafana.oceanphenix.fr/api/health',
    // ... autres services
  }
});
```

---

### 🌐 Étape 2 : Upload FTP (3 minutes)

**Option A : FileZilla (Interface graphique)**

1. Télécharger FileZilla : <https://filezilla-project.org>
2. Connexion :
   - Hôte : `ftp.votredomaine.com` (ou IP fournie par O2Switch)
   - Utilisateur : Votre login cPanel
   - Mot de passe : Votre mot de passe cPanel
   - Port : `21`
3. Naviguer vers `/public_html/`
4. Créer dossier `ia/` (ou `studio/`)
5. Uploader TOUS les fichiers du dossier `hub-frontend/` :

```
📁 Fichiers à uploader :
├── index.html
├── config.js (le fichier que vous venez d'éditer !)
├── app.js
├── styles.css
├── styles-enhanced.css
├── legal-modals.css
├── legal-modals.js
├── studio-architecture.js
├── 📁 assets/
├── 📁 images/
└── 📁 legal/
```

**Option B : cPanel File Manager (Sans logiciel)**

1. Connexion : <https://cpanel.o2switch.net>
2. **Gestionnaire de fichiers**
3. **public_html/** → **Nouveau dossier** : `ia`
4. **Upload** → Sélectionner tous les fichiers du dossier `hub-frontend/`
5. Attendre fin upload (barre de progression)

---

### 🔗 Étape 3 : Configuration CORS Backend (2 minutes)

> **IMPORTANT** : Le frontend O2Switch doit pouvoir appeler l'API backend Hetzner.

**Sur votre serveur Hetzner**, éditer le fichier backend :

```bash
ssh root@votre-serveur-hetzner.com
cd /root/oceanphenix-IA-souveraine-v8
nano backend/main.py
```

Ajouter après `app = FastAPI()` :

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS pour frontend O2Switch
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ia.votredomaine.com",      # ← Frontend O2Switch
        "https://studio.votredomaine.com",   # ← Alternative
        "http://localhost:8080",             # Dev local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redémarrer le backend :

```bash
docker compose restart backend
```

---

## ✅ Vérification & Tests

### 1. Tester l'accès frontend

Ouvrir dans un navigateur :

```
https://ia.votredomaine.com
```

**✅ Vous devriez voir :**

- Le Hub Frontend OceanPhenix
- Interface propre et stylée
- Navigation fonctionnelle

### 2. Tester la connexion API

Ouvrir la **Console du navigateur** (F12) et exécuter :

```javascript
fetch('https://api.votredomaine.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ API OK:', data))
  .catch(err => console.error('❌ API Error:', err));
```

**✅ Résultat attendu :**

```json
{
  "status": "healthy",
  "services": {
    "ollama": "ok",
    "qdrant": "ok",
    "minio": "ok"
  }
}
```

**❌ Si erreur CORS :**

```
Access to fetch at 'https://api...' from origin 'https://ia...' has been blocked by CORS
```

→ Retourner à l'Étape 3 et vérifier la configuration CORS backend

### 3. Tester les services

Cliquer sur les tuiles du Hub :

- ✅ Open WebUI → Ouvre `https://studio.votredomaine.com`
- ✅ Grafana → Ouvre `https://grafana.votredomaine.com`
- ✅ MinIO Console → Ouvre `https://minio.votredomaine.com`

---

## 🔧 Configuration Optionnelle

### SSL Automatique (Let's Encrypt)

O2Switch gère automatiquement le SSL. Si besoin de forcer :

1. **cPanel** → **SSL/TLS Status**
2. Cocher `ia.votredomaine.com`
3. **Run AutoSSL**
4. Attendre 1-2 minutes

### Redirection HTTPS Automatique

Créer `/public_html/ia/.htaccess` :

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Désactiver listing
Options -Indexes

# Protection fichiers sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Performance (Cache statique)

Ajouter dans `.htaccess` :

```apache
# Cache 1 an pour images
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🐛 Problèmes Fréquents

### Page blanche après upload

**Cause** : Permissions fichiers incorrectes

**Solution** :

```bash
# Via cPanel File Manager
# Sélectionner tous les fichiers → Change Permissions
# Fichiers : 644
# Dossiers : 755
```

### CORS errors dans la console

**Cause** : Backend Hetzner ne permet pas le domaine frontend

**Solution** :

1. Vérifier `backend/main.py` contient votre domaine dans `allow_origins`
2. Redémarrer backend : `docker compose restart backend`
3. Tester : `curl -I https://api.votredomaine.com/health`

### Services ne s'ouvrent pas

**Cause** : URLs incorrectes dans `config.js`

**Solution** :

1. Éditer `config.js` sur O2Switch
2. Vérifier les URLs correspondent à votre Caddyfile Hetzner
3. Re-upload via FTP

---

## 📊 Schéma de Connexion

```
┌─────────────────────────────────────────────────────────────────────┐
│                         🌐 INTERNET                                 │
└────────────────────┬────────────────────────────────┬───────────────┘
                     │                                │
                     ▼                                ▼
        ┌────────────────────────┐      ┌────────────────────────────┐
        │     O2Switch (🇫🇷)      │      │    Hetzner VPS (🇩🇪)       │
        │                        │      │                            │
        │  📱 Frontend Hub       │──────│  🔧 Backend API            │
        │  ia.votredomaine.com   │ CORS │  api.votredomaine.com      │
        │                        │      │                            │
        │  ✅ HTML/CSS/JS        │      │  🤖 Ollama                 │
        │  ✅ Static Assets      │      │  🔮 Qdrant                 │
        │                        │      │  💾 MinIO                  │
        │                        │      │  📊 Grafana                │
        └────────────────────────┘      └────────────────────────────┘
             Static Hosting                 Docker Services
```

**Flux de communication :**

1. **Utilisateur** → Accède à `https://ia.votredomaine.com` (O2Switch)
2. **Frontend** → Charge HTML/CSS/JS depuis O2Switch
3. **JavaScript** → Appelle API `https://api.votredomaine.com` (Hetzner)
4. **Backend Hetzner** → Vérifie CORS → Répond avec données
5. **Frontend** → Affiche les données

---

## 🎯 Résumé des URLs

| Type | URL | Hébergement |
|------|-----|-------------|
| 🎨 **Frontend Hub** | `https://ia.votredomaine.com` | O2Switch |
| 🔌 **API Backend** | `https://api.votredomaine.com` | Hetzner |
| 💬 **Open WebUI** | `https://studio.votredomaine.com` | Hetzner |
| 📊 **Grafana** | `https://grafana.votredomaine.com` | Hetzner |
| 💾 **MinIO Console** | `https://minio.votredomaine.com` | Hetzner |
| 🔄 **n8n** | `https://n8n.votredomaine.com` | Hetzner |

---

## 📚 Documentation Complète

Pour configuration avancée, voir :

- **Installation Backend** : [INSTALL_HETZNER.md](INSTALL_HETZNER.md)
- **Installation Locale** : [INSTALL_LOCAL.md](INSTALL_LOCAL.md)
- **Guide O2Switch Complet** : [INSTALL_O2SWITCH.md](INSTALL_O2SWITCH.md)
- **Architecture Complète** : [DIAGRAMS_MERMAID.md](DIAGRAMS_MERMAID.md)

---

**Support** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues>

**Développé avec ❤️ par l'équipe OceanPhenix**
