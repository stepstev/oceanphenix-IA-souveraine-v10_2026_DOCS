# 🚀 Quick Start - OceanPhenix Admin Hub

## ⚡ Test en 30 secondes

### 1. Démarrer le Backend
```powershell
# Terminal 1
cd d:\Projets_oceanphenix_stacks_2026_V_Finales\oceanphenix-IA-souveraine-v10_model_Tabler
docker-compose up -d
```

### 2. Démarrer le Frontend
```powershell
# Terminal 2
cd hub-admin
python -m http.server 8080
```

### 3. Ouvrir dans le Navigateur
```
http://localhost:8080
```

**Résultat attendu** :
- ✅ Page d'accueil avec logo OceanPhenix
- ✅ Voyant vert "API Connectée"
- ✅ Redirection automatique vers le dashboard après 2 secondes

---

## 🧪 Tests Rapides

### Test 1 : Connexion API
```javascript
// Dans la console du navigateur (F12)
API.getHealth().then(console.log)
```

**Résultat attendu** :
```json
{
    "status": "healthy",
    "services": { ... },
    "health_percentage": 85.7
}
```

### Test 2 : Configuration
```javascript
// Vérifier l'environnement
console.log('Environnement:', CONFIG.ENV);
console.log('API URL:', CONFIG.getApiUrl());
console.log('Services:', CONFIG.getActive().SERVICES);
```

### Test 3 : Statistiques API
```javascript
// Statistiques du client API
console.log(API.getStats());
```

---

## 🎯 Commandes Utiles

### Démarrer les services backend
```powershell
# Core uniquement
docker-compose --profile core up -d

# Tout (avec monitoring)
docker-compose --profile all up -d

# Vérifier les services
docker ps
```

### Arrêter les services
```powershell
docker-compose down
```

### Voir les logs
```powershell
# API
docker logs v8-api

# Tous les conteneurs
docker-compose logs -f
```

### Redémarrer un service
```powershell
docker-compose restart api
```

---

## 📊 URLs Locales

| Service | URL | Description |
|---------|-----|-------------|
| **Admin Hub** | http://localhost:8080 | Nouveau dashboard |
| **API Backend** | http://localhost:8000 | API FastAPI |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Grafana** | http://localhost:3001 | Monitoring |
| **N8N** | http://localhost:5678 | Automations |
| **Portainer** | http://localhost:9002 | Docker UI |
| **OpenWebUI** | http://localhost:3000 | Chat IA |
| **MinIO** | http://localhost:9001 | S3 Storage |

---

## 🔧 Configuration Rapide

### Changer l'environnement
```javascript
// Console navigateur (F12)
CONFIG.setEnvironment('production');
location.reload();
```

### Tester avec données fictives
```javascript
// Si le backend n'est pas disponible, utilisez des données de test
const fakeHealth = {
    status: 'healthy',
    health_percentage: 95,
    services: {
        ollama: { name: 'Ollama', status: 'healthy' },
        qdrant: { name: 'Qdrant', status: 'healthy' }
    }
};

// Simuler un appel API
async function fakeAPI() {
    return new Promise(resolve => {
        setTimeout(() => resolve(fakeHealth), 500);
    });
}
```

---

## 🐛 Dépannage Express

### Problème : "API Non Accessible"
```powershell
# Vérifier si l'API tourne
curl http://localhost:8000/health

# Si non, démarrer
docker-compose up -d api

# Voir les logs
docker logs v8-api
```

### Problème : Page blanche
```
1. Ouvrir la console (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que tous les fichiers JS sont chargés
4. Vider le cache : Ctrl+Shift+R
```

### Problème : CORS
```python
# Ajouter dans backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redémarrer l'API
docker-compose restart api
```

---

## 📝 Checklist de Test

### Page d'Accueil (index.html)
- [ ] Logo affiché
- [ ] Texte "OceanPhenix Admin Hub"
- [ ] Badge "100% Souverain"
- [ ] Voyant vert si API OK
- [ ] Bouton "Accéder au Dashboard" visible
- [ ] Redirection automatique vers dashboard

### Dashboard (pages/dashboard.html)
- [ ] Header avec menu de navigation
- [ ] 4 cards de statistiques
- [ ] Liste des services avec statuts
- [ ] Métriques système (CPU, RAM, Disque)
- [ ] Accès rapides fonctionnels
- [ ] Footer avec version

### Fonctionnalités Globales
- [ ] Menu responsive (mobile)
- [ ] Toggle thème sombre/clair
- [ ] Menu utilisateur (dropdown)
- [ ] Pas d'erreurs console
- [ ] Rafraîchissement auto (30s)

---

## 🚀 Déploiement Rapide O2Switch

### 1. Préparer les fichiers
```powershell
# Modifier la config pour production
# Fichier : hub-admin\assets\js\config.js
# Remplacer les URLs par vos domaines
```

### 2. Upload FTP
```
Host: ftp.votre-domaine.fr
User: votre_user_o2switch
Pass: ********
Path: /public_html/admin/
```

### 3. Vérifier
```
https://admin.votre-domaine.fr
```

---

## 💡 Tips

### Développement
```powershell
# Auto-reload avec VS Code
# 1. Installer extension "Live Server"
# 2. Clic droit sur index.html > "Open with Live Server"
```

### Debug
```javascript
// Activer les logs détaillés
CONFIG.SETTINGS.DEBUG = true;

// Voir toutes les requêtes API
console.log(API.getStats());
```

### Performance
```javascript
// Désactiver le rafraîchissement auto
App.stopAutoRefresh();

// Le réactiver
App.startAutoRefresh();
```

---

## 📞 Ressources

| Document | Lien |
|----------|------|
| Guide Utilisateur | `docs/README.md` |
| Guide Déploiement | `docs/DEPLOYMENT.md` |
| Documentation API | `docs/API.md` |
| Guide Migration | `docs/MIGRATION.md` |

---

## 🎉 C'est Parti !

```powershell
# Démarrer tout en une commande
docker-compose up -d; cd hub-admin; python -m http.server 8080
```

Puis ouvrir : **http://localhost:8080** 🚀

---

**Questions ?** Consultez les docs ou ouvrez une issue ! 🆘
