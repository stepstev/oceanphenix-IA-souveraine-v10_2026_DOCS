# 🔄 Guide de Migration - hub-frontend → hub-admin

## 📋 Vue d'Ensemble

Ce guide vous aide à migrer progressivement de l'ancien **hub-frontend** vers le nouveau **hub-admin** sans casser l'existant.

---

## 🎯 Stratégie de Migration

### Phase 1 : Test Parallèle (1-2 jours)
- ✅ Nouveau dashboard créé dans `hub-admin/`
- ✅ Ancien dashboard reste dans `hub-frontend/`
- ✅ Les deux coexistent pour tests

### Phase 2 : Validation (3-5 jours)
- Tester toutes les fonctionnalités du nouveau dashboard
- Corriger les bugs éventuels
- Former les utilisateurs

### Phase 3 : Basculement (1 jour)
- Sauvegarder l'ancien
- Basculer vers le nouveau
- Supprimer l'ancien après validation

---

## 🔍 Comparaison Ancien vs Nouveau

| Aspect | hub-frontend (ancien) | hub-admin (nouveau) |
|--------|----------------------|---------------------|
| **Framework** | Custom CSS | Tabler (Bootstrap 5) |
| **Structure** | Monolithique | Modulaire |
| **Config** | config.js complexe | config.js simplifié |
| **API Client** | Mélangé dans app.js | api-client.js dédié |
| **Thème** | Custom mixte | oceanphenix-theme.css |
| **Pages** | 1 page (index.html) | Multi-pages |
| **Documentation** | Limitée | Complète (3 guides) |
| **Maintenance** | Difficile | Facile |

---

## 📂 Correspondance des Fichiers

### Fichiers Conservés (réutilisables)

| Ancien | Nouveau | Action |
|--------|---------|--------|
| `hub-frontend/assets/logo-oceanphenix.svg` | `hub-admin/assets/img/logo-oceanphenix.svg` | ✅ Copié |
| `hub-frontend/legal/` | `hub-admin/legal/` (si besoin) | 📋 À copier si nécessaire |

### Fichiers Remplacés (nouvelle version)

| Ancien | Nouveau | Changements |
|--------|---------|-------------|
| `config.js` | `assets/js/config.js` | ✅ Simplifié, mieux structuré |
| `app.js` | `assets/js/app.js` + `api-client.js` | ✅ Séparé en modules |
| `styles.css` + `styles-enhanced.css` | `assets/css/oceanphenix-theme.css` | ✅ Unifié avec Tabler |
| `index.html` | `index.html` + `pages/dashboard.html` | ✅ Multi-pages |

### Fichiers Obsolètes (à ne pas migrer)

- ❌ `studio-architecture.js` (spécifique à l'ancien design)
- ❌ `styles-inline-fix.css` (plus nécessaire)
- ❌ `legal-modals.js` (à réimplémenter si besoin)

---

## 🔧 Adaptation de la Configuration

### Ancien `config.js`

```javascript
// Ancien (complexe)
const OCEANPHENIX_MODE = localStorage.getItem('oceanphenix_mode') || detectMode();
typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = OCEANPHENIX_MODE === 'o2switch' ? {...} : {...})
```

### Nouveau `config.js`

```javascript
// Nouveau (simple)
const CONFIG = {
    ENV: detectEnvironment(),
    local: { API_URL: '...', SERVICES: {...} },
    production: { API_URL: '...', SERVICES: {...} }
};
```

### Migration des URLs

**Copier vos URLs depuis l'ancien** `hub-frontend/config.js` :

```javascript
// Ancien
services: {
    api: 'https://api.oceanphenix.fr/health',
    minio: 'https://minio.oceanphenix.fr/minio/health/live',
    // ...
}

// Nouveau (dans hub-admin/assets/js/config.js)
production: {
    API_URL: 'https://api.oceanphenix.fr',
    SERVICES: {
        minio: 'https://minio.oceanphenix.fr',
        // ... (enlever les /health etc, juste les URLs de base)
    }
}
```

---

## 📊 Migration des Fonctionnalités

### 1. Health Check des Services

**Ancien** (`hub-frontend/app.js`) :
```javascript
async function checkServicesHealth() {
    const services = CONFIG.SERVICES_ENDPOINTS;
    // ... logique complexe
}
```

**Nouveau** (`hub-admin/pages/dashboard.html`) :
```javascript
const health = await API.getHealth();
// ... affichage simplifié
```

### 2. Affichage des Stats

**Ancien** : Cartes custom HTML/CSS
**Nouveau** : Cards Tabler standardisées

```html
<!-- Nouveau format -->
<div class="card card-stats">
    <div class="card-body">
        <div class="stats-icon bg-success-lt">
            <i class="ti ti-heart-rate-monitor"></i>
        </div>
        <div class="stats-value" id="stat-health">--</div>
        <div class="stats-label">Santé Globale</div>
    </div>
</div>
```

### 3. Modales et Popups

**À réimplémenter si nécessaire** avec les modales Tabler :

```html
<!-- Modal Tabler -->
<div class="modal modal-blur fade" id="modal-config">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Configuration</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <!-- Contenu -->
            </div>
        </div>
    </div>
</div>
```

---

## 🔀 Plan de Migration Étape par Étape

### Jour 1 : Installation et Test Local

1. ✅ **Vérifier** que `hub-admin/` est créé
2. ✅ **Copier** votre logo :
   ```bash
   Copy-Item hub-frontend\assets\logo-oceanphenix.svg hub-admin\assets\img\
   ```
3. ✅ **Adapter** `hub-admin/assets/js/config.js` avec vos URLs
4. ✅ **Tester** localement :
   ```bash
   cd hub-admin
   python -m http.server 8080
   # Ouvrir http://localhost:8080
   ```
5. ✅ **Vérifier** :
   - Page d'accueil charge
   - API connectée (voyant vert)
   - Dashboard affiche les données

### Jour 2-3 : Personnalisation

6. 🎨 **Personnaliser** les couleurs (si besoin) dans `oceanphenix-theme.css`
7. 📝 **Créer** les pages manquantes :
   - `pages/rag.html`
   - `pages/automations.html`
   - `pages/monitoring.html`
   - `pages/settings.html`
8. 🔗 **Migrer** les fonctionnalités spécifiques de votre ancien dashboard
9. 🧪 **Tester** toutes les fonctionnalités

### Jour 4-5 : Tests et Formation

10. 👥 **Former** les utilisateurs sur le nouveau dashboard
11. 🐛 **Corriger** les bugs trouvés
12. 📱 **Tester** sur mobile et tablette
13. ✅ **Valider** que tout fonctionne

### Jour 6 : Déploiement Production

14. 🔒 **Sauvegarder** l'ancien hub-frontend :
    ```bash
    # Sur O2Switch via cPanel
    Compresser /public_html/ en backup_hub_frontend.zip
    Télécharger le backup localement
    ```

15. 🚀 **Uploader** le nouveau hub-admin :
    ```bash
    # Via FTP
    Uploader tout le contenu de hub-admin/ vers /public_html/admin/
    ```

16. 🌐 **Configurer** le sous-domaine (si besoin)
    - cPanel > Sous-domaines
    - Créer `admin.votre-domaine.fr`
    - Pointer vers `/public_html/admin/`

17. 🔒 **Activer** SSL (Let's Encrypt)

18. 🧪 **Tester** en production :
    - `https://admin.votre-domaine.fr`
    - Vérifier toutes les fonctionnalités

### Jour 7 : Validation et Nettoyage

19. ✅ **Valider** avec les utilisateurs
20. 📧 **Communiquer** la nouvelle URL (si changée)
21. 🗑️ **Archiver** l'ancien (ne pas supprimer immédiatement)
    ```bash
    # Sur O2Switch
    Renommer /public_html/ en /public_html_old/
    Renommer /public_html/admin/ en /public_html/
    ```

22. 🎉 **Célébrer** la migration réussie ! 🎊

---

## ⚠️ Points d'Attention

### CORS
Si vous avez des erreurs CORS, vérifiez :
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://admin.votre-domaine.fr",  # Nouvelle URL
        "https://votre-domaine.fr"         # Ancienne (si différente)
    ]
)
```

### Chemins d'Imports
Dans les pages du dossier `pages/`, attention aux chemins :
```html
<!-- BON -->
<link href="../assets/css/oceanphenix-theme.css" rel="stylesheet"/>

<!-- MAUVAIS -->
<link href="assets/css/oceanphenix-theme.css" rel="stylesheet"/>
```

### localStorage
Les données en `localStorage` sont conservées par domaine :
```javascript
// Si vous changez de domaine, migrer manuellement :
const oldToken = localStorage.getItem('oceanphenix_api_url');
// Copier vers le nouveau domaine si nécessaire
```

---

## 🔄 Rollback (en cas de problème)

Si le nouveau dashboard ne fonctionne pas correctement :

### Sur O2Switch
1. **Restaurer** le backup :
   ```
   Supprimer /public_html/
   Décompresser backup_hub_frontend.zip
   ```

### En Local
1. **Revenir** sur l'ancien :
   ```bash
   cd hub-frontend
   python -m http.server 8080
   ```

---

## ✅ Checklist de Validation

Avant de déclarer la migration terminée :

### Fonctionnel
- [ ] Page d'accueil charge
- [ ] API connectée
- [ ] Dashboard affiche les stats
- [ ] Navigation entre pages OK
- [ ] Services externes accessibles
- [ ] Mode sombre/clair fonctionne

### Technique
- [ ] Pas d'erreurs dans la console
- [ ] Responsive mobile OK
- [ ] SSL actif (HTTPS)
- [ ] Performance acceptable
- [ ] Toutes les URLs correctes

### Utilisateurs
- [ ] Formation effectuée
- [ ] Documentation accessible
- [ ] Retours positifs
- [ ] Bugs corrigés

---

## 📞 Aide

**Problème pendant la migration ?**

1. Consultez `docs/README.md` (guide utilisateur)
2. Consultez `docs/DEPLOYMENT.md` (guide déploiement)
3. Consultez `docs/API.md` (documentation API)
4. Vérifiez les logs backend : `docker logs v8-api`
5. Vérifiez la console navigateur (F12)

---

## 🎉 Avantages de la Migration

Une fois migré, vous bénéficiez de :

✅ **Code plus maintenable** : Modulaire et commenté  
✅ **Design professionnel** : Tabler moderne  
✅ **Multi-pages** : Mieux organisé  
✅ **Documentation complète** : 3 guides détaillés  
✅ **Évolutivité** : Facile d'ajouter des fonctionnalités  
✅ **Performance** : Optimisé  
✅ **Support** : Framework Tabler bien maintenu  

---

**🌊 Bonne migration ! 🚀**
