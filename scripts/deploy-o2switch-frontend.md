# 🎨 Déploiement Frontend O2Switch - Guide Rapide

> **Guide complet** pour déployer le Hub Frontend V2 sur hébergement mutualisé O2Switch

---

## 📋 Informations Prérequises

### Configuration Backend Hetzner
- ✅ Domaine Backend: `ia.oceanphenix.fr`
- ✅ IP Serveur: `46.224.72.83`
- ✅ API: `api.oceanphenix.fr`

### Configuration Frontend O2Switch
- 🌐 Domaine Frontend: À définir (ex: `oceanphenix.fr` ou sous-domaine)
- 📧 Email O2Switch: Votre email de compte
- 🔑 FTP/SFTP: Credentials fournis par O2Switch

---

## 🚀 Étape 1: Configuration DNS sur O2Switch

### Accès à la Zone DNS

1. **Connexion cPanel O2Switch**
   - URL: `https://www.o2switch.fr/cpanel`
   - Login avec vos identifiants O2Switch

2. **Zone Editor**
   - Cliquer sur "Zone Editor" dans la section "Domaines"
   - Sélectionner votre domaine

### Enregistrements DNS à Créer

```
Type    Nom                     Valeur                  TTL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A       @                       IP_O2SWITCH             14400
CNAME   www                     votredomaine.com        14400
CNAME   api                     ia.oceanphenix.fr       14400
```

**Pointage Backend (IMPORTANT)**:
- `api.votredomaine.com` → CNAME vers `api.oceanphenix.fr`
- Cela permet au frontend d'accéder au backend Hetzner

⏱️ **Propagation DNS**: 5-30 minutes

---

## 🔧 Étape 2: Préparation des Fichiers Frontend

### Sur votre machine locale

```bash
# Naviguer vers le projet
cd d:\Projets_oceanphenix_stacks_2026_V_Finales\oceanphenix-IA-souveraine-v10_2026

# Aller dans le dossier frontend
cd hub-frontend-v2
```

### Configuration du fichier `config.prod.js`

Éditez `assets/js/config.prod.js`:

```javascript
// Configuration Production O2Switch + Backend Hetzner
const CONFIG = {
    // Backend API (Hetzner)
    API_BASE_URL: 'https://api.oceanphenix.fr',
    
    // Frontend (O2Switch)
    FRONTEND_URL: 'https://votredomaine.com',
    
    // Services (Backend Hetzner)
    SERVICES: {
        ollama: 'http://ia.oceanphenix.fr:11434',
        qdrant: 'http://ia.oceanphenix.fr:6333',
        minio: 'https://s3.oceanphenix.fr',
        grafana: 'https://grafana.oceanphenix.fr',
        prometheus: 'http://ia.oceanphenix.fr:9090',
        alertmanager: 'https://alertmanager.oceanphenix.fr',
        portainer: 'https://portainer.oceanphenix.fr',
        n8n: 'https://n8n.oceanphenix.fr',
        openwebui: 'http://ia.oceanphenix.fr:3000'
    },
    
    // Options
    ENABLE_MONITORING: true,
    ENABLE_RAG: true,
    ENABLE_AUTOMATION: true
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
```

### Renommer le fichier de config

```bash
# Copier config.prod.js vers config.js
cp assets/js/config.prod.js assets/js/config.js
```

---

## 📤 Étape 3: Upload FTP/SFTP vers O2Switch

### Option 1: FileZilla (Recommandé)

1. **Télécharger FileZilla**: https://filezilla-project.org/

2. **Configuration Connexion**:
   ```
   Hôte:      ftp.votredomaine.com (ou IP fournie par O2Switch)
   Protocole: SFTP - SSH File Transfer Protocol
   Type:      Normal
   User:      votre_username_o2switch
   Password:  votre_password_ftp
   Port:      22 (SFTP) ou 21 (FTP)
   ```

3. **Connexion**:
   - Cliquer sur "Connexion rapide"
   - Accepter le certificat si demandé

4. **Upload**:
   - Panneau gauche: Naviguer vers `hub-frontend-v2`
   - Panneau droit: Naviguer vers `/public_html` ou `/www`
   - Sélectionner TOUS les fichiers du frontend
   - Clic droit → "Envoyer"
   
   ⏱️ **Durée**: 2-5 minutes selon connexion

5. **Structure finale sur O2Switch**:
   ```
   /public_html/
   ├── index.html
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   │   └── config.js  ← Config production
   │   ├── img/
   │   └── fonts/
   ├── pages/
   │   ├── dashboard.html
   │   ├── rag.html
   │   ├── monitoring.html
   │   └── settings.html
   ├── components/
   ├── includes/
   └── legal/
   ```

### Option 2: Ligne de Commande (Linux/Mac/WSL)

```bash
# Se connecter via SFTP
sftp username@ftp.votredomaine.com

# Naviguer vers public_html
cd public_html

# Upload récursif
put -r hub-frontend-v2/*

# Quitter
exit
```

### Option 3: cPanel File Manager

1. Connexion cPanel O2Switch
2. "Gestionnaire de fichiers"
3. Naviguer vers `/public_html`
4. "Téléverser" → Sélectionner tous les fichiers
5. Upload (peut être lent pour nombreux fichiers)

---

## 🔒 Étape 4: Configuration SSL (Let's Encrypt)

### Via cPanel O2Switch

1. **Accès SSL/TLS**:
   - cPanel → Section "Sécurité"
   - Cliquer sur "SSL/TLS"

2. **Let's Encrypt (Gratuit)**:
   - O2Switch propose Let's Encrypt intégré
   - Sélectionner votre domaine
   - Cliquer sur "Installer certificat SSL gratuit"

3. **Auto-renouvellement**:
   - O2Switch gère automatiquement le renouvellement
   - Certificat valide 90 jours, renouvelé à 30 jours

### Vérification SSL

```bash
# Tester le certificat
curl -I https://votredomaine.com
```

**Résultat attendu**: HTTP/2 200 avec certificat valide

---

## ✅ Étape 5: Configuration .htaccess (Optionnel mais Recommandé)

Créer `/public_html/.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Force www (optionnel)
RewriteCond %{HTTP_HOST} !^www\.
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Gestion des erreurs
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html

# Compression GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache statique
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Sécurité
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 🧪 Étape 6: Tests de Fonctionnement

### Tests Basiques

1. **Accès Frontend**:
   ```
   https://votredomaine.com
   ```
   - Vérifier que la page d'accueil s'affiche
   - Pas d'erreurs console (F12)

2. **Test Dashboard**:
   ```
   https://votredomaine.com/pages/dashboard.html
   ```
   - Cartes de services visibles
   - KPI chargés

3. **Test Connexion Backend**:
   - Ouvrir Console (F12)
   - Vérifier appels API vers `api.oceanphenix.fr`
   - Pas d'erreurs CORS

### Tests Avancés

```bash
# Test performance
curl -I https://votredomaine.com

# Test SSL
openssl s_client -connect votredomaine.com:443 -servername votredomaine.com

# Test DNS
nslookup votredomaine.com
nslookup api.votredomaine.com
```

### Checklist Validation

- [ ] Frontend accessible en HTTPS
- [ ] Certificat SSL valide
- [ ] Pas d'erreurs console
- [ ] Images chargées correctement
- [ ] CSS appliqué
- [ ] JavaScript fonctionnel
- [ ] Connexion API backend OK
- [ ] Dashboard affiche données
- [ ] Pages RAG/Monitoring accessibles

---

## 🔧 Étape 7: Configuration CORS Backend (Si Nécessaire)

Si vous avez des erreurs CORS, configurer sur le backend Hetzner:

### Modifier `backend/main.py`

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://votredomaine.com",
        "https://www.votredomaine.com",
        "https://ia.oceanphenix.fr"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redémarrer backend:

```bash
# Sur serveur Hetzner
cd /opt/oceanphenix-v10
docker compose restart api
```

---

## 📊 Étape 8: Monitoring Post-Déploiement

### Vérifications Quotidiennes

1. **Uptime**:
   - Utiliser UptimeRobot: https://uptimerobot.com (gratuit)
   - Surveiller `https://votredomaine.com`

2. **SSL Expiration**:
   - O2Switch renouvelle automatiquement
   - Vérifier dans cPanel si besoin

3. **Logs O2Switch**:
   - cPanel → "Erreurs" sous "Métriques"
   - Vérifier logs Apache

### Performance

```bash
# Test vitesse
curl -w "@-" -o /dev/null -s https://votredomaine.com <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
         time_total:  %{time_total}\n
EOF
```

---

## 🆘 Dépannage

### Erreur 404 - Page non trouvée

**Cause**: Fichiers mal uploadés ou mauvais répertoire

**Solution**:
```bash
# Vérifier structure dans /public_html
# Fichier index.html doit être à la racine
```

### Erreur CORS

**Cause**: Backend n'autorise pas le domaine frontend

**Solution**: Modifier CORS dans `backend/main.py` (voir Étape 7)

### SSL Non Valide

**Cause**: Certificat non installé ou expiré

**Solution**:
```
cPanel → SSL/TLS → Réinstaller certificat Let's Encrypt
```

### CSS/JS Non Chargés

**Cause**: Chemins incorrects ou permissions

**Solution**:
```bash
# Vérifier permissions via FileZilla
# Dossiers: 755
# Fichiers: 644
```

### Backend Inaccessible

**Cause**: DNS mal configuré ou backend down

**Solution**:
```bash
# Tester DNS
nslookup api.oceanphenix.fr

# Tester backend
curl https://api.oceanphenix.fr/health
```

---

## 📝 Résumé Commandes Rapides

```bash
# === DEPUIS VOTRE MACHINE LOCALE ===

# 1. Préparer config production
cd hub-frontend-v2
cp assets/js/config.prod.js assets/js/config.js

# 2. Upload via SFTP
sftp username@ftp.votredomaine.com
cd public_html
put -r *
exit

# === SUR SERVEUR HETZNER (si CORS requis) ===

# 3. Mettre à jour CORS backend
ssh root@46.224.72.83
cd /opt/oceanphenix-v10
nano backend/main.py  # Ajouter votre domaine dans allow_origins
docker compose restart api

# === TESTS ===

# 4. Vérifier déploiement
curl -I https://votredomaine.com
curl https://api.oceanphenix.fr/health
```

---

## 🎯 Checklist Finale Déploiement

### Frontend O2Switch
- [ ] DNS configuré (A record + CNAME api)
- [ ] Fichiers uploadés dans `/public_html`
- [ ] `config.js` configuré avec bonne API URL
- [ ] SSL Let's Encrypt installé
- [ ] `.htaccess` créé (force HTTPS)
- [ ] Accès HTTPS fonctionnel
- [ ] Pas d'erreurs console F12

### Backend Hetzner
- [ ] Script `deploy-hetzner-auto.sh` exécuté
- [ ] Services Docker actifs
- [ ] SSL Caddy configuré
- [ ] CORS configuré pour domaine frontend
- [ ] API accessible: `https://api.oceanphenix.fr/health`

### Tests Intégration
- [ ] Frontend appelle backend sans erreur CORS
- [ ] Dashboard affiche données KPI
- [ ] Page RAG fonctionnelle
- [ ] Monitoring Grafana accessible
- [ ] Services externes accessibles (MinIO, n8n, etc.)

---

## 📚 Documentation Complète

- **[Guide Hetzner Complet](../docs/INSTALL_HETZNER.md)**
- **[Architecture Frontend/Backend](../docs/06-FRONTEND_O2SWITCH_HETZNER.md)**
- **[Configuration DNS](../docs/INSTALL_O2SWITCH.md)**
- **[Troubleshooting](../docs/README.md)**

---

## 🆘 Support

En cas de problème:

1. **Documentation**: `docs/README.md`
2. **Issues GitHub**: https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues
3. **Logs Backend**: `ssh root@46.224.72.83` → `docker compose logs -f api`
4. **Logs O2Switch**: cPanel → Erreurs

---

<div align="center">

**🌊 OceanPhenix V10 - Frontend O2Switch**

Déploiement Frontend + Backend Séparés

[🏠 Retour Documentation](../docs/README.md)

</div>
