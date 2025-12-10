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

### 2.1 Domaine et DNS

| Élément | Détails |
| --- | --- |
| Domaine | `oceanphenix.fr` géré côté O2Switch (DNS) |
| Sous-domaines | `ia`, `api`, `studio`, `minio`, `monitor`, `portainer`, `n8n`, `bi` |
| O2Switch | Accès cPanel + FTP / File Manager |
| Poste local | Git, éditeur de texte, client FTP (FileZilla) |

### 2.2 Serveur Hetzner

**Configuration recommandée : CX43 (ou CPX41)**

| Caractéristique | Valeur |
| --- | --- |
| **Modèle** | CX43 (AMD) ou CPX41 (Intel) |
| **vCPU** | 8 cœurs |
| **RAM** | 16 GB |
| **Stockage** | 160 GB NVMe (local) + 100 GB volume (optionnel) |
| **Trafic** | 20 TB/mois inclus |
| **Prix** | ~10,79 €/mois |
| **OS** | Ubuntu 22.04 LTS (recommandé) ou 24.04 |
| **IP** | IPv4 publique + IPv6 /64 |

**Exemple de configuration actuelle :**
- Serveur : `XXXXXXX` (#XXXXXXX)
- IP : `XXX.XXX.XXX.XXX`
- IPv6 : `XXXX:XXXX:XXXX:XXXX::/64`

### 2.3 Configuration DNS

Créer les enregistrements DNS (type A) qui pointent :
- `ia.oceanphenix.fr` → IP O2Switch (gérée automatiquement via cPanel)
- **Tous les sous-domaines suivants vers `XXX.XXX.XXX.XXX` (IP Hetzner) :**
  - `api.oceanphenix.fr`
  - `studio.oceanphenix.fr`
  - `minio.oceanphenix.fr`
  - `monitor.oceanphenix.fr`
  - `portainer.oceanphenix.fr`
  - `n8n.oceanphenix.fr`
  - `bi.oceanphenix.fr`

**Vérification DNS :**
```bash
# Depuis votre poste local
nslookup api.oceanphenix.fr
# Doit retourner : XXX.XXX.XXX.XXX (votre IP Hetzner)

dig +short studio.oceanphenix.fr
# Doit retourner : XXX.XXX.XXX.XXX (votre IP Hetzner)
```

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

#### Option A : Upload via cPanel File Manager (recommandé pour débutants)

1. **Connexion cPanel**
   - Accéder à `https://cpanel.o2switch.net`
   - Login : votre identifiant cPanel O2Switch
   - Mot de passe : votre mot de passe cPanel

2. **Créer le sous-domaine**
   - Cliquer sur **« Sous-domaines »** (section Domaines)
   - Sous-domaine : `ia`
   - Domaine : `oceanphenix.fr` (sélectionner votre domaine)
   - Racine du document : `/public_html/ia` (automatique)
   - Cliquer **« Créer »**

3. **Upload des fichiers**
   - Cliquer sur **« Gestionnaire de fichiers »** (section Fichiers)
   - Naviguer vers `public_html/ia/`
   - Cliquer **« Téléverser »** (bouton en haut)
   - Glisser-déposer **tous les fichiers** de votre dossier local `hub-frontend-v2/` :
     - `index.html`
     - `config.js` (le fichier que vous venez d'éditer)
     - Tous les fichiers `.js`, `.css`
     - Dossiers `assets/`, `legal/`, `pages/`, `components/`, `includes/`
   - Attendre la fin de l'upload (barre de progression verte)
   - Cliquer **« Retour à /public_html/ia »**

4. **Vérifier la structure** (doit ressembler à) :
   ```
   /public_html/ia/
   ├── index.html
   ├── config.js
   ├── assets/
   ├── legal/
   ├── pages/
   ├── components/
   └── includes/
   ```

#### Option B : Upload via FTP (FileZilla)

1. **Télécharger FileZilla**
   - Site : <https://filezilla-project.org>
   - Version : FileZilla Client (gratuit)

2. **Configuration connexion FTP**
   - Hôte : `ftp.oceanphenix.fr` (ou `ftp.votredomaine.com`)
   - Utilisateur : votre login cPanel O2Switch
   - Mot de passe : votre mot de passe cPanel
   - Port : `21` (FTP standard)
   - Cliquer **« Connexion rapide »**

3. **Navigation et upload**
   - Dans le panneau de droite (serveur distant) :
     - Naviguer vers `/public_html/`
     - Créer le dossier `ia` (clic droit → Créer un répertoire)
     - Entrer dans `/public_html/ia/`
   - Dans le panneau de gauche (local) :
     - Naviguer vers votre dossier `hub-frontend-v2/`
   - Sélectionner **tous les fichiers et dossiers** (Ctrl+A)
   - Glisser-déposer du panneau gauche vers le panneau droit
   - Attendre la fin du transfert (queue en bas)

4. **Vérifier les permissions** (important)
   - Clic droit sur `public_html/ia` → Permissions du fichier
   - Dossiers : `755` (rwxr-xr-x)
   - Fichiers : `644` (rw-r--r--)
   - Cocher **« Appliquer récursivement aux sous-répertoires »**
   - OK

#### Option C : Upload via SFTP (avancé, plus sécurisé)

Si votre offre O2Switch supporte SFTP (SSH) :

1. **FileZilla SFTP**
   - Hôte : `sftp://oceanphenix.fr`
   - Utilisateur : votre login SSH O2Switch
   - Mot de passe : votre mot de passe SSH
   - Port : `22`

2. **Ligne de commande (alternative)**
   ```bash
   # Depuis votre poste local
   cd oceanphenix-IA-souveraine-v10_2026/hub-frontend-v2
   
   # Upload récursif via scp
   scp -r * votre_login@oceanphenix.fr:/home/votre_login/public_html/ia/
   ```

**⚠️ Notes importantes :**
- Toujours uploader le fichier `config.js` **édité** (pas `config.prod.example.js`).
- Ne pas uploader `.git/`, `node_modules/` ou fichiers `.env` si présents.
- Vérifier que `index.html` est bien à la racine de `/public_html/ia/`.

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

### 4.1 Connexion SSH au serveur

```powershell
# Depuis PowerShell (Windows) ou Terminal (Mac/Linux)
ssh root@XXX.XXX.XXX.XXX
```

Si première connexion, accepter la clé SSH (fingerprint) en tapant `yes`.

### 4.2 Lancement du script d'installation automatique

```bash
# Définir les variables d'environnement
export ROOT_DOMAIN=oceanphenix.fr
export ACME_EMAIL=contact@oceanphenix.fr

# Télécharger le script d'installation
curl -fsSL https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/scripts/deploy-hetzner.sh -o /tmp/deploy-hetzner.sh

# Rendre le script exécutable
chmod +x /tmp/deploy-hetzner.sh

# Lancer l'installation (durée : 5-10 minutes)
/tmp/deploy-hetzner.sh
```

**Le script exécute automatiquement :**
1. Mise à jour système Ubuntu (`apt update && apt upgrade`)
2. Installation Docker + Docker Compose v2.24
3. Création utilisateur système `oceanphenix` (groupe docker)
4. Clone du repository dans `/opt/oceanphenix`
5. Génération `.env` avec secrets aléatoires (JWT, Grafana, MinIO, etc.)
6. Création réseaux Docker externes (`v10_proxy`, `v10_internal`)
7. Configuration firewall UFW (ports 22, 80, 443)
8. Pull de toutes les images Docker
9. Lancement de la stack complète (`docker compose --profile all up -d`)

**Ressources serveur CX43 utilisées après installation :**
- CPU : ~15-20% idle (pics à 60% lors du démarrage)
- RAM : ~8-10 GB utilisés / 16 GB
- Disque : ~25-30 GB utilisés / 160 GB
- Conteneurs actifs : 15-20 selon profils

### 4.3 Vérifications post-installation

```bash
cd /opt/oceanphenix

# Vérifier tous les conteneurs actifs
docker compose --profile all ps

# Logs de l'API (doit afficher "Application startup complete")
docker compose logs -f api

# Test API depuis le serveur
curl -k https://api.oceanphenix.fr/health
```

**État attendu après 5 minutes :**
```
NAME                STATUS    PORTS
v10-proxy          Up         0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
v10-api            Up         0.0.0.0:8000->8000/tcp
v10-frontend       Up         
v10-ollama         Up         0.0.0.0:11434->11434/tcp
v10-qdrant         Up         0.0.0.0:6333->6333/tcp
v10-minio          Up         0.0.0.0:9000-9001->9000-9001/tcp
v10-studio         Up         0.0.0.0:3000->8080/tcp
v10-grafana        Up         0.0.0.0:3001->3000/tcp
v10-prometheus     Up         0.0.0.0:9090->9090/tcp
v10-portainer      Up         0.0.0.0:9002->9000/tcp, 0.0.0.0:9443->9443/tcp
v10-n8n            Up         0.0.0.0:5678->5678/tcp
v10-db             Up         5432/tcp
v10-cache          Up         6379/tcp
... (autres services selon profils)
```

### 4.4 Services exposés et URLs de production

| Service | URL Publique | IP/Port Interne | Statut |
| --- | --- | --- | --- |
| **Hub Frontend** | `https://ia.oceanphenix.fr` | O2Switch | ✅ Actif |
| **API REST** | `https://api.oceanphenix.fr` | `XXX.XXX.XXX.XXX:8000` | ✅ Actif |
| **OpenWebUI Studio** | `https://studio.oceanphenix.fr` | `XXX.XXX.XXX.XXX:3000` | ✅ Actif |
| **Grafana** | `https://monitor.oceanphenix.fr` | `XXX.XXX.XXX.XXX:3001` | ✅ Actif |
| **Prometheus** | `https://monitor.oceanphenix.fr:9090` | `XXX.XXX.XXX.XXX:9090` | ✅ Actif |
| **Portainer** | `https://portainer.oceanphenix.fr` | `XXX.XXX.XXX.XXX:9443` | ✅ Actif |
| **MinIO Console** | `https://minio.oceanphenix.fr` | `XXX.XXX.XXX.XXX:9001` | ✅ Actif |
| **n8n Workflows** | `https://n8n.oceanphenix.fr` | `XXX.XXX.XXX.XXX:5678` | ✅ Actif |
| **Superset BI** | `https://bi.oceanphenix.fr` | `XXX.XXX.XXX.XXX:8088` | ✅ Actif |

**Services internes (réseau privé Docker) :**
- Qdrant : `qdrant:6333`
- Ollama : `ollama:11434`
- PostgreSQL : `postgres:5432`
- Valkey/Redis : `valkey:6379`

**Vérifier DNS depuis votre poste :**
```bash
nslookup api.oceanphenix.fr
# Doit retourner : XXX.XXX.XXX.XXX (votre IP Hetzner)

curl -I https://api.oceanphenix.fr/health
# Doit retourner : HTTP/2 200
```

### 4.5 Informations d'accès (stockées dans `/opt/oceanphenix/.env`)

```bash
# Afficher les mots de passe générés
cd /opt/oceanphenix
grep -E "PASSWORD|SECRET" .env | head -20

# Exemples de clés importantes :
# GRAFANA_ADMIN_PASSWORD=...
# PORTAINER_ADMIN_PASSWORD=...
# MINIO_ROOT_PASSWORD=...
# N8N_BASIC_AUTH_PASSWORD=...
```

**⚠️ IMPORTANT : Sauvegarder ce fichier `.env` localement de manière sécurisée !**

```bash
# Télécharger .env localement (depuis votre poste)
scp root@XXX.XXX.XXX.XXX:/opt/oceanphenix/.env ./oceanphenix-prod.env
```

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

## 8. Résumé de la configuration finale

### 8.1 Infrastructure

| Composant | Hébergeur | Modèle/Plan | IP | URL |
| --- | --- | --- | --- | --- |
| **Frontend Hub** | O2Switch | Hébergement mutualisé | (O2Switch) | `https://ia.oceanphenix.fr` |
| **Backend Stack** | Hetzner | CX43 (#XXXXXXX) | `XXX.XXX.XXX.XXX` | Tous sous-domaines API |

**Détails serveur Hetzner CX43 :**
- **Nom** : `XXXXXXX`
- **ID** : #XXXXXXX
- **vCPU** : 8 cœurs AMD
- **RAM** : 16 GB
- **Stockage** : 160 GB NVMe local + 100 GB volume additionnel
- **IPv4** : `XXX.XXX.XXX.XXX`
- **IPv6** : `XXXX:XXXX:XXXX:XXXX::/64`
- **Trafic** : 20 TB/mois (usage actuel : 1.07 GB)
- **Prix** : 10,79 €/mois

### 8.2 URLs et services actifs

| Type | URL | IP:Port | Hébergeur |
| --- | --- | --- | --- |
| **Hub public** | `https://ia.oceanphenix.fr` | O2Switch | O2Switch |
| **API REST** | `https://api.oceanphenix.fr` | `XXX.XXX.XXX.XXX:8000` | Hetzner CX43 |
| **Studio IA** | `https://studio.oceanphenix.fr` | `XXX.XXX.XXX.XXX:3000` | Hetzner CX43 |
| **MinIO S3** | `https://minio.oceanphenix.fr` | `XXX.XXX.XXX.XXX:9001` | Hetzner CX43 |
| **Monitoring** | `https://monitor.oceanphenix.fr` | `XXX.XXX.XXX.XXX:3001` | Hetzner CX43 |
| **Portainer** | `https://portainer.oceanphenix.fr` | `XXX.XXX.XXX.XXX:9443` | Hetzner CX43 |
| **Automations** | `https://n8n.oceanphenix.fr` | `XXX.XXX.XXX.XXX:5678` | Hetzner CX43 |
| **BI Analytics** | `https://bi.oceanphenix.fr` | `XXX.XXX.XXX.XXX:8088` | Hetzner CX43 |

### 8.3 Utilisation ressources (estimation après déploiement complet)

**Serveur Hetzner CX43 :**
- **CPU** : 15-25% moyenne (pics à 60% lors indexation/requêtes IA)
- **RAM** : 10-12 GB utilisés / 16 GB (80% avec tous profils actifs)
- **Disque** : 35-45 GB utilisés / 160 GB (données, images, volumes)
- **Trafic mensuel** : ~100-500 GB selon usage (largement sous les 20 TB)
- **Conteneurs** : 18-22 actifs selon profils (core + rag + monitoring + bi + automation)

**Marge de croissance :**
- ✅ CPU : confortable pour 100-200 utilisateurs simultanés
- ✅ RAM : ajouter swap ou upgrade CX51 si >200 users actifs
- ✅ Stockage : 110 GB disponibles (ajout volume 100 GB déjà présent)
- ✅ Trafic : très large marge (usage <1% de la limite mensuelle)

---

## 9. Aller plus loin

- Personnaliser le thème `hub-frontend-v2/assets/css/oceanphenix-theme.css`.
- Ajouter du monitoring de disponibilité (UptimeRobot) sur `ia` et `api`.
- Mettre en place un workflow CI/CD pour pousser automatiquement le frontend via FTP ou S3 (rclone).
- Configurer les alertes Slack/Teams via Alertmanager pour les métriques critiques.

---

📬 **Support** : ouvrir une issue GitHub → <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues>
