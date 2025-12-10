# 🚀 Guide Simple : Frontend O2Switch + Backend Hetzner

## 📋 Vue d'ensemble

```
┌─────────────────────┐
│   O2Switch          │
│   Frontend HTML/JS  │ ← Visiteurs
│   votredomaine.fr   │
└──────────┬──────────┘
           │ API Calls
           ↓
┌─────────────────────┐
│   Hetzner           │
│   Backend Docker    │
│   VOTRE_IP_HETZNER      │
└─────────────────────┘
```

**Durée totale : 30 minutes**

---

## 🎯 Partie 1 : Frontend sur O2Switch (15 min)

### Étape 1 : Télécharger le frontend

**Sur votre PC Windows :**

```powershell
# Aller dans le projet
cd D:\Projets_oceanphenix_stacks_2026_V_Finales\oceanphenix-IA-souveraine-v10_2026

# Le dossier à uploader est : hub-frontend/
```

### Étape 2 : Connexion à O2Switch

1. **cPanel O2Switch** : https://www.o2switch.fr/cpanel/
2. Login avec vos identifiants O2Switch
3. Chercher **"Gestionnaire de fichiers"**

### Étape 3 : Upload des fichiers

Dans le gestionnaire de fichiers :

```
1. Aller dans : /public_html/
2. Supprimer index.html par défaut (si existe)
3. Cliquer "Téléverser"
4. Sélectionner TOUS les fichiers de hub-frontend/ :
   ✓ index.html
   ✓ app.js
   ✓ config.js
   ✓ styles.css
   ✓ styles-enhanced.css
   ✓ architecture.json
   ✓ studio-architecture.js
   ✓ dossier assets/
   ✓ dossier legal/
5. Attendre la fin de l'upload
```

### Étape 4 : Configuration de l'API

Dans le gestionnaire de fichiers O2Switch :

```
1. Éditer le fichier : config.js
2. Modifier la ligne :
   
   API_URL: localStorage.getItem('oceanphenix_api_url') || 'http://localhost:8000',
   
   Par :
   
   API_URL: localStorage.getItem('oceanphenix_api_url') || 'http://VOTRE_IP_HETZNER:8000',

3. Sauvegarder
```

### Étape 5 : Tester

```
Ouvrir : http://votredomaine.fr
```

✅ **Vous devez voir l'interface OceanPhenix !**

---

## 🚀 Partie 2 : Backend sur Hetzner (15 min)

### Étape 1 : Connexion SSH

**Depuis Windows PowerShell :**

```powershell
ssh root@VOTRE_IP_HETZNER
```

### Étape 2 : Installation automatique

**Copier-coller ces commandes UNE PAR UNE :**

```bash
# 1. Télécharger le script
curl -o /tmp/install.sh https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/deploy-hetzner.sh

# 2. Rendre exécutable
chmod +x /tmp/install.sh

# 3. Lancer l'installation
bash /tmp/install.sh
```

**⏱️ Attendre 5-10 minutes** (le script installe tout automatiquement)

### Étape 3 : Vérifier

```bash
# Vérifier que les services sont lancés
docker ps

# Vous devez voir environ 15 conteneurs dont :
# ✓ v10-api (backend)
# ✓ v10-ollama
# ✓ v10-qdrant
# ✓ v10-grafana
# etc...
```

### Étape 4 : Tester l'API

```bash
# Tester la santé de l'API
curl http://localhost:8000/health

# Résultat attendu :
# {"status":"ok","timestamp":"..."}
```

✅ **Backend opérationnel !**

---

## 🔗 Partie 3 : Connexion Frontend ↔ Backend

### Test depuis votre navigateur

```
1. Ouvrir : http://votredomaine.fr
2. F12 (console développeur)
3. Cliquer sur "AI Studio" ou un service
4. Vérifier qu'il n'y a pas d'erreur "CORS" ou "Network Error"
```

### Si erreur CORS

**Sur le serveur Hetzner :**

```bash
ssh root@VOTRE_IP_HETZNER
cd /opt/oceanphenix

# Éditer la config backend
nano backend/main.py

# Ajouter après les imports (ligne ~10) :
from fastapi.middleware.cors import CORSMiddleware

# Ajouter après app = FastAPI() (ligne ~20) :
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://votredomaine.fr", "https://votredomaine.fr"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sauvegarder (Ctrl+O, Enter, Ctrl+X)

# Redémarrer le backend
docker-compose restart api
```

---

## 🌐 Partie 4 : Domaine avec HTTPS (Optionnel)

### Si vous voulez HTTPS sur O2Switch

O2Switch active automatiquement Let's Encrypt :

```
1. cPanel → "SSL/TLS Status"
2. Chercher votre domaine
3. Cliquer "Run AutoSSL"
4. Attendre 2-3 minutes
5. Votre site sera en HTTPS automatiquement
```

### Modifier config.js pour HTTPS

```javascript
API_URL: 'http://VOTRE_IP_HETZNER:8000',  // Garder HTTP pour le backend
```

---

## ✅ Vérification Complète

### Checklist Frontend (O2Switch)

```
✓ Fichiers uploadés dans /public_html/
✓ index.html accessible
✓ config.js modifié avec l'IP Hetzner
✓ Pas d'erreur 404
✓ Interface s'affiche correctement
```

### Checklist Backend (Hetzner)

```
✓ Script install.sh exécuté
✓ docker ps montre ~15 conteneurs
✓ curl http://localhost:8000/health → {"status":"ok"}
✓ Grafana accessible : http://VOTRE_IP_HETZNER:3001
✓ Portainer accessible : https://VOTRE_IP_HETZNER:9443
```

### Test de bout en bout

```
1. Ouvrir http://votredomaine.fr
2. Cliquer "AI Studio"
3. Doit ouvrir http://VOTRE_IP_HETZNER:3000
4. Pas d'erreur dans la console (F12)
```

---

## 🔧 Maintenance Simple

### Mettre à jour le Frontend

```
1. Modifier les fichiers en local (hub-frontend/)
2. Re-uploader sur O2Switch via cPanel
3. F5 (actualiser) dans le navigateur
```

### Mettre à jour le Backend

```bash
ssh root@VOTRE_IP_HETZNER
cd /opt/oceanphenix
git pull
docker-compose restart
```

### Voir les logs

```bash
# Backend
docker-compose logs -f api

# Tous les services
docker-compose logs -f
```

---

## 🆘 Problèmes Courants

### 1. Frontend affiche page blanche

**Solution :**
```
- Vérifier que index.html est bien dans /public_html/
- Pas dans un sous-dossier /public_html/hub-frontend/
- F5 + Ctrl (vider le cache)
```

### 2. Erreur "API not accessible"

**Solution :**
```bash
# Sur Hetzner, vérifier que l'API tourne
docker ps | grep v10-api

# Redémarrer si besoin
docker restart v10-api
```

### 3. Services ne s'ouvrent pas

**Vérifier config.js :**
```javascript
// Les URLs doivent pointer vers Hetzner
const serviceUrls = {
    'studio': 'http://VOTRE_IP_HETZNER:3000',
    'grafana': 'http://VOTRE_IP_HETZNER:3001',
    // ...
};
```

### 4. CORS Error

**Appliquer la fix CORS (voir Partie 3)**

---

## 📊 URLs Finales

### Frontend (O2Switch)
- **Site principal** : http://votredomaine.fr
- **Avec HTTPS** : https://votredomaine.fr

### Backend & Services (Hetzner)
- **API Backend** : http://VOTRE_IP_HETZNER:8000
- **OpenWebUI** : http://VOTRE_IP_HETZNER:3000
- **Grafana** : http://VOTRE_IP_HETZNER:3001
- **Prometheus** : http://VOTRE_IP_HETZNER:9090
- **Portainer** : https://VOTRE_IP_HETZNER:9443
- **MinIO** : http://VOTRE_IP_HETZNER:9001

---

## 📞 Support

**Problème avec le script ?**
```bash
# Voir les logs détaillés
tail -f /var/log/syslog | grep docker
```

**Backend ne démarre pas ?**
```bash
cd /opt/oceanphenix
docker-compose ps
docker-compose logs
```

**O2Switch questions ?**
- Support O2Switch : https://www.o2switch.fr/support/

---

## 🎉 Félicitations !

Vous avez maintenant :

```
✅ Frontend sur O2Switch (HTML/CSS/JS statique)
✅ Backend sur Hetzner (Docker + tous les services IA)
✅ Communication Frontend ↔ Backend
✅ Interface accessible publiquement
✅ Services de monitoring opérationnels
```

**Architecture finale :**

```
Visiteurs
    ↓
[O2Switch] votredomaine.fr
    ↓ Appels API
[Hetzner] VOTRE_IP_HETZNER
    ├─ Backend Python
    ├─ Ollama (LLM)
    ├─ Qdrant (Vectoriel)
    ├─ Grafana (Monitoring)
    └─ Tous les services Docker
```

---

**🌊 OceanPhenix V10 - Simple & Efficace**
**Frontend statique O2Switch + Backend Docker Hetzner**
