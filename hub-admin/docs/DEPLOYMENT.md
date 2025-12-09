# 🚀 Guide de Déploiement - OceanPhenix Admin Hub

## 📋 Checklist Pré-Déploiement

Avant de déployer sur O2Switch, vérifiez :

- [ ] Backend Hetzner opérationnel et accessible
- [ ] Domaines configurés (DNS pointant vers Hetzner)
- [ ] Certificats SSL actifs (Let's Encrypt)
- [ ] CORS configuré sur le backend pour votre domaine frontend
- [ ] Fichier `config.js` adapté avec vos URLs de production

---

## 🌐 Scénario 1 : Frontend sur O2Switch + Backend sur Hetzner

### Architecture

```
┌─────────────────────────┐
│   O2Switch (Mutualisé)  │
│   Frontend HTML/CSS/JS  │ ← Visiteurs
│   https://admin.votre-  │
│   domaine.fr            │
└──────────┬──────────────┘
           │ API Calls (HTTPS)
           ↓
┌─────────────────────────┐
│   Hetzner VPS           │
│   Backend Docker        │
│   https://api.votre-    │
│   domaine.fr            │
└─────────────────────────┘
```

### Étapes

#### 1. Préparer le Backend (Hetzner)

**A. Configurer CORS** dans `backend/main.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://admin.votre-domaine.fr",  # Frontend O2Switch
        "http://localhost:8080"            # Développement local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**B. Vérifier Caddy** (`core/proxy/Caddyfile`) :

```caddyfile
api.votre-domaine.fr {
    reverse_proxy api:8000
    
    header {
        Access-Control-Allow-Origin https://admin.votre-domaine.fr
    }
}
```

**C. Redémarrer les services** :

```bash
cd /path/to/oceanphenix
docker-compose restart api caddy
```

#### 2. Configurer le Frontend (Local)

**A. Modifier `assets/js/config.js`** :

```javascript
production: {
    API_URL: 'https://api.votre-domaine.fr',
    SERVICES: {
        minio: 'https://minio.votre-domaine.fr',
        openwebui: 'https://studio.votre-domaine.fr',
        n8n: 'https://n8n.votre-domaine.fr',
        portainer: 'https://portainer.votre-domaine.fr',
        grafana: 'https://grafana.votre-domaine.fr',
        superset: 'https://bi.votre-domaine.fr',
        strapi: 'https://cms.votre-domaine.fr'
    },
    MONITORING: {
        grafana_dashboard_platform: 'https://grafana.votre-domaine.fr/d/oceanphenix-platform',
        grafana_dashboard_containers: 'https://grafana.votre-domaine.fr/d/oceanphenix-containers'
    }
}
```

**B. Tester localement** :

```bash
# Forcer l'environnement production
# Dans la console du navigateur :
CONFIG.setEnvironment('production');
location.reload();

# Vérifier la connexion API
```

#### 3. Déployer sur O2Switch

**A. Connexion FTP/SFTP** :

```
Host: ftp.votre-domaine.fr
User: votre_user_o2switch
Password: ********
Port: 21 (FTP) ou 22 (SFTP)
```

**B. Upload des fichiers** :

```
Destination : /public_html/admin/
ou          : /public_html/ (si domaine racine)

Fichiers à uploader :
- index.html
- .htaccess
- assets/ (complet)
- pages/ (complet)
- docs/ (optionnel)
```

**C. Vérifier les permissions** :

```bash
# Via Terminal SSH O2Switch (si disponible)
chmod 755 /public_html/admin
chmod 644 /public_html/admin/.htaccess
chmod 644 /public_html/admin/index.html
chmod -R 755 /public_html/admin/assets
chmod -R 755 /public_html/admin/pages
```

#### 4. Configurer le Sous-Domaine (O2Switch)

**A. Dans cPanel > Sous-domaines** :

1. Créer `admin.votre-domaine.fr`
2. Racine du document : `/public_html/admin`
3. Activer SSL (Let's Encrypt - gratuit)

**B. Attendre la propagation DNS** (quelques minutes à quelques heures)

**C. Tester** :

```bash
# Depuis un terminal
curl -I https://admin.votre-domaine.fr

# Résultat attendu : HTTP/2 200
```

#### 5. Tests Finaux

**A. Ouvrir dans le navigateur** :

```
https://admin.votre-domaine.fr
```

**B. Vérifier** :
- ✅ Page d'accueil charge correctement
- ✅ Indicateur "API Connectée" vert
- ✅ Redirection automatique vers le dashboard
- ✅ Toutes les statistiques se chargent
- ✅ Menu de navigation fonctionnel
- ✅ Pas d'erreurs dans la console (F12)

---

## 🔧 Scénario 2 : Frontend et Backend sur le même Hetzner

Si vous préférez héberger aussi le frontend sur Hetzner (recommandé pour performance) :

### Étapes

#### 1. Ajouter un service Caddy pour le frontend

**Modifier `docker-compose.yml`** :

```yaml
services:
  # ... services existants ...
  
  admin-frontend:
    image: nginx:alpine
    container_name: v8-admin-frontend
    restart: unless-stopped
    profiles: [ core, all ]
    networks: [ proxy ]
    volumes:
      - ./hub-admin:/usr/share/nginx/html:ro
```

**Modifier `core/proxy/Caddyfile`** :

```caddyfile
admin.votre-domaine.fr {
    reverse_proxy admin-frontend:80
}
```

#### 2. Redémarrer

```bash
docker-compose --profile core up -d
```

#### 3. Tester

```
https://admin.votre-domaine.fr
```

**Avantages** :
- ✅ Tout sur le même serveur
- ✅ Pas de problèmes CORS
- ✅ Plus rapide (même réseau)
- ✅ Gestion simplifiée

---

## 🐛 Problèmes Courants

### 1. Erreur CORS

**Symptôme** :
```
Access to fetch at 'https://api.votre-domaine.fr/health' 
from origin 'https://admin.votre-domaine.fr' has been blocked by CORS policy
```

**Solution** :
- Vérifier la config CORS dans `backend/main.py`
- Ajouter l'origine exacte du frontend
- Redémarrer le backend : `docker-compose restart api`

### 2. API Non Accessible

**Symptôme** : "API Non Accessible" sur la page d'accueil

**Vérifications** :
```bash
# 1. Tester l'API depuis Hetzner
curl http://localhost:8000/health

# 2. Tester l'API depuis l'extérieur
curl https://api.votre-domaine.fr/health

# 3. Vérifier les logs
docker logs v8-api
docker logs v8-proxy
```

### 3. Page Blanche

**Symptôme** : Page blanche, rien ne s'affiche

**Vérifications** :
1. Console navigateur (F12) : erreurs JavaScript ?
2. Fichiers bien uploadés ?
3. Chemins corrects dans les imports :
   ```html
   <!-- Bon -->
   <link href="../assets/css/oceanphenix-theme.css" rel="stylesheet"/>
   
   <!-- Mauvais -->
   <link href="assets/css/oceanphenix-theme.css" rel="stylesheet"/>
   ```

### 4. SSL Non Actif

**Symptôme** : Avertissement "Non sécurisé"

**Solution** :
1. cPanel O2Switch > SSL/TLS > Activer Let's Encrypt
2. Attendre 5-10 minutes
3. Forcer HTTPS dans `.htaccess` :
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## 📊 Monitoring Post-Déploiement

### Vérifications Régulières

**Tous les jours** :
- [ ] Dashboard accessible
- [ ] API répond correctement
- [ ] Métriques système cohérentes

**Toutes les semaines** :
- [ ] Vérifier les logs d'erreur
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier l'espace disque O2Switch

**Tous les mois** :
- [ ] Mettre à jour les dépendances
- [ ] Sauvegarder la configuration
- [ ] Renouveler les certificats SSL (automatique avec Let's Encrypt)

---

## 🔄 Mise à Jour

### Procédure

1. **Tester localement** les modifications
2. **Sauvegarder** l'ancienne version sur O2Switch
3. **Uploader** les nouveaux fichiers
4. **Tester** immédiatement après upload
5. **Rollback** si problème (restaurer la sauvegarde)

### Script de déploiement (optionnel)

```bash
#!/bin/bash
# deploy-o2switch.sh

echo "🚀 Déploiement OceanPhenix Admin Hub"

# Variables
FTP_HOST="ftp.votre-domaine.fr"
FTP_USER="votre_user"
FTP_PASS="********"
LOCAL_DIR="./hub-admin"
REMOTE_DIR="/public_html/admin"

# Upload via FTP
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
mirror --reverse --delete --verbose $LOCAL_DIR $REMOTE_DIR
bye
EOF

echo "✅ Déploiement terminé"
```

---

## 📞 Checklist de Vérification Finale

Avant de déclarer le déploiement réussi :

- [ ] Page d'accueil charge sans erreur
- [ ] Connexion API fonctionnelle
- [ ] Dashboard affiche toutes les métriques
- [ ] Navigation entre les pages OK
- [ ] Mode sombre/clair fonctionne
- [ ] Responsive (mobile/tablette/desktop)
- [ ] Pas d'erreurs dans la console navigateur
- [ ] SSL actif (cadenas vert)
- [ ] Performance acceptable (< 3s chargement)
- [ ] Services externes accessibles (Grafana, N8N, etc.)

---

## 🎉 Félicitations !

Votre **OceanPhenix Admin Hub** est maintenant déployé et opérationnel !

**Prochaines étapes** :
- Configurer l'authentification (si nécessaire)
- Personnaliser les couleurs/logo
- Ajouter des métriques spécifiques à vos besoins
- Former les utilisateurs

---

**Questions ?** Consultez la documentation complète dans `docs/README.md`
