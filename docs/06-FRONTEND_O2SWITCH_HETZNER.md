# 🌐 Installation Hub Frontend (O2Switch) + Backend (Hetzner)

Document unique pour déployer **hub-frontend-v2** sur `ia.oceanphenix.fr` (hébergement O2Switch) et la **stack OceanPhenix V10** complète sur Hetzner.

---

## 1. Architecture cible

```text
Navigateur ➜ ia.oceanphenix.fr (O2Switch)
                 │
                 └──➡ Requêtes HTTPS vers api.oceanphenix.fr (Hetzner)
                           ├─ studio.oceanphenix.fr (OpenWebUI)
                           ├─ minio.oceanphenix.fr (MinIO)
                           ├─ monitor.oceanphenix.fr (Grafana/Prometheus)
                           └─ portainer.oceanphenix.fr, n8n.oceanphenix.fr, bi.oceanphenix.fr
```

- **Frontend statique** : hébergé chez O2Switch (`ia.oceanphenix.fr`).
- **Backend + services IA** : serveur Hetzner (Ubuntu 22.04+) via Docker Compose.
- **CORS** : l'API Hetzner doit autoriser `https://ia.oceanphenix.fr`.

---

## 2. Pré-requis

| Élément | Détails |
| --- | --- |
| Domaine | `oceanphenix.fr` géré côté O2Switch (DNS) |
| Sous-domaines | `ia`, `api`, `studio`, `minio`, `monitor`, `portainer`, `n8n`, `bi` |
| O2Switch | Accès cPanel + FTP / File Manager |
| Hetzner | Serveur CPX41+ Ubuntu 22.04, accès root SSH |
| Poste local | Git, éditeur de texte, client FTP (FileZilla) |

Créer les enregistrements DNS (type A) qui pointent :
- `ia` vers IP O2Switch (gérée automatiquement).
- Tous les autres sous-domaines vers l'IP du serveur Hetzner.

---

## 3. Étape 1 — Déploiement du hub sur O2Switch

### 3.1 Préparer les fichiers

```bash
# Cloner et préparer la configuration
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git
cd oceanphenix-IA-souveraine-v10_2026/hub-frontend-v2
cp config.prod.example.js config.js
```

Éditer `config.js` (extrait) :

```javascript
const OCEANPHENIX_MODE = 'production';

window.OCEANPHENIX_CONFIG = {
  apiUrlDefault: 'https://api.oceanphenix.fr',
  apiAuthToken: null,
  useProxy: false,
  services: {
    api: 'https://api.oceanphenix.fr/health',
    openwebui: 'https://studio.oceanphenix.fr/health',
    minio: 'https://minio.oceanphenix.fr/minio/health/live',
    grafana: 'https://monitor.oceanphenix.fr/api/health',
    n8n: 'https://n8n.oceanphenix.fr/',
    bi: 'https://bi.oceanphenix.fr/',
    portainer: 'https://portainer.oceanphenix.fr/'
  }
};
```

### 3.2 Upload via FTP ou cPanel

1. Se connecter en FTP (`ftp.votredomaine.com`, port 21) ou via **Gestionnaire de fichiers**.
2. Créer le dossier `public_html/ia` (ou utiliser le sous-domaine créé dans cPanel → Sous-domaines).
3. Uploader **tout le contenu** de `hub-frontend-v2/` (HTML, CSS, JS, dossiers `assets/`, `legal/`, `pages/`, etc.).

### 3.3 SSL et redirection HTTPS

Dans cPanel → **SSL/TLS Status** → lancer AutoSSL pour `ia.oceanphenix.fr`.

Créer `public_html/ia/.htaccess` :

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
Options -Indexes
```

### 3.4 Tests rapides

- Naviguer vers `https://ia.oceanphenix.fr` → l'interface doit s'afficher.
- Ouvrir la console navigateur (F12) et exécuter :

```javascript
fetch('https://api.oceanphenix.fr/health').then(r => r.json()).then(console.log);
```

Si erreur CORS → voir §5 pour la configuration backend.

---

## 4. Étape 2 — Backend complet sur Hetzner

### 4.1 Connexion et script automatique

```powershell
ssh root@VOTRE_IP_HETZNER
```

```bash
export ROOT_DOMAIN=oceanphenix.fr
export ACME_EMAIL=ops@oceanphenix.fr
curl -fsSL https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/scripts/deploy-hetzner.sh -o /tmp/deploy-hetzner.sh
chmod +x /tmp/deploy-hetzner.sh
/tmp/deploy-hetzner.sh
```

Le script :
- installe Docker + Compose,
- crée l'utilisateur `oceanphenix`,
- clone le dépôt dans `/opt/oceanphenix`,
- génère un `.env` complet (avec `ROOT_DOMAIN=oceanphenix.fr`),
- crée les réseaux Docker `v10_proxy` & `v10_internal`,
- lance tous les services (`docker compose --profile all up -d`).

### 4.2 Vérifications

```bash
cd /opt/oceanphenix
docker compose --profile all ps
docker compose logs -f api
curl -k https://api.oceanphenix.fr/health
```

### 4.3 Services exposés

| Service | URL |
| --- | --- |
| Hub (via Caddy) | `https://app.oceanphenix.fr` (optionnel) |
| API | `https://api.oceanphenix.fr` |
| OpenWebUI | `https://studio.oceanphenix.fr` |
| Grafana | `https://monitor.oceanphenix.fr` |
| Prometheus | `https://monitor.oceanphenix.fr:9090` |
| Portainer | `https://portainer.oceanphenix.fr` |
| MinIO | `https://minio.oceanphenix.fr` |
| n8n | `https://n8n.oceanphenix.fr` |
| Superset | `https://bi.oceanphenix.fr` |

Configurer la zone DNS pour que ces sous-domaines pointent vers l'IP Hetzner.

---

## 5. Connexion Front ↔ Back (CORS & sécurité)

### 5.1 CORS FastAPI

Sur Hetzner :

```bash
cd /opt/oceanphenix/backend
sed -n '1,80p' main.py  # vérifier la section CORS
```

Ajouter/mettre à jour :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ia.oceanphenix.fr",
        "https://app.oceanphenix.fr"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Puis redémarrer :

```bash
cd /opt/oceanphenix
docker compose restart api
```

### 5.2 Caddy (optionnel)

Dans `core/proxy/Caddyfile` :

```caddy
api.oceanphenix.fr {
    reverse_proxy api:8000
    header Access-Control-Allow-Origin "https://ia.oceanphenix.fr"
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"
    @options method OPTIONS
    respond @options 204
}
```

Recharger : `docker exec v10-proxy caddy reload --config /etc/caddy/Caddyfile`.

---

## 6. Validation complète

1. **Frontend** : `https://ia.oceanphenix.fr` → vérifier navigation, cartes statut, modales légales.
2. **API Health** : `https://api.oceanphenix.fr/health` → doit retourner un JSON `status: ok`.
3. **OpenWebUI** : `https://studio.oceanphenix.fr` → se connecter, vérifier modèle `mistral:7b` installé (`docker exec v10-ollama ollama list`).
4. **Grafana** : `https://monitor.oceanphenix.fr` → login `admin` / mot de passe présent dans `/opt/oceanphenix/.env`.
5. **MinIO** : `https://minio.oceanphenix.fr` → identifiants `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`.
6. **Logs** :

```bash
docker compose logs -f api dashboard ollama
```

---

## 7. Maintenance & mises à jour

- Frontend : modifier les fichiers localement puis ré-upload via FTP ou utiliser un ZIP + extract dans cPanel.
- Backend :

```bash
cd /opt/oceanphenix
git pull
COMPOSE_PROFILES=all docker compose pull
COMPOSE_PROFILES=all docker compose up -d
```

- Sauvegardes : prévoir un `cron` qui archive les volumes (`scripts/backup.sh` ou snapshots Hetzner).
- Monitoring : configurer Alertmanager (SMTP) dans `.env` pour recevoir les alertes.

---

## 8. Résumé des URLs finales

| Type | URL | Hébergeur |
| --- | --- | --- |
| Hub public | `https://ia.oceanphenix.fr` | O2Switch |
| API | `https://api.oceanphenix.fr` | Hetzner |
| Studio | `https://studio.oceanphenix.fr` | Hetzner |
| MinIO | `https://minio.oceanphenix.fr` | Hetzner |
| Monitoring | `https://monitor.oceanphenix.fr` | Hetzner |
| Portainer | `https://portainer.oceanphenix.fr` | Hetzner |
| Automations (n8n) | `https://n8n.oceanphenix.fr` | Hetzner |
| BI (Superset) | `https://bi.oceanphenix.fr` | Hetzner |

---

## 9. Aller plus loin

- Personnaliser le thème `hub-frontend-v2/assets/css/oceanphenix-theme.css`.
- Ajouter du monitoring de disponibilité (UptimeRobot) sur `ia` et `api`.
- Mettre en place un workflow CI/CD pour pousser automatiquement le frontend via FTP ou S3 (rclone).
- Configurer les alertes Slack/Teams via Alertmanager pour les métriques critiques.

---

📬 **Support** : ouvrir une issue GitHub → <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues>
