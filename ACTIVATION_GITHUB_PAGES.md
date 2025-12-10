# 🚀 Guide Activation GitHub Pages - Étape par Étape

## ✅ Étapes Déjà Complétées

- ✅ Fichiers poussés sur GitHub
- ✅ Workflow Actions créé (`.github/workflows/deploy-docs.yml`)
- ✅ Configuration Jekyll créée (`docs/_config.yml`)
- ✅ Page d'accueil créée (`docs/index.html`)

---

## 📋 ÉTAPES À SUIVRE MAINTENANT

### Étape 1: Accéder aux Settings du Repository

1. **Ouvrir votre navigateur** et aller sur:
   ```
   https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026
   ```

2. **Cliquer sur l'onglet "Settings"** (en haut à droite du repository)

---

### Étape 2: Activer GitHub Pages

1. **Dans le menu latéral gauche**, faire défiler jusqu'à trouver **"Pages"**
   - C'est dans la section "Code and automation"

2. **Cliquer sur "Pages"**

---

### Étape 3: Configurer la Source

Vous verrez une section **"Build and deployment"**:

#### Option A: GitHub Actions (⭐ Recommandée)

```
Source: ▼ GitHub Actions
```

**C'est tout!** Le workflow est déjà configuré et se lancera automatiquement.

#### Option B: Deploy from Branch

Si GitHub Actions n'est pas disponible:

```
Source: ▼ Deploy from a branch

Branch: 
  ▼ main    /docs    [Save]
```

- **Branch**: Sélectionner `main`
- **Folder**: Sélectionner `/docs`
- Cliquer sur **"Save"**

---

### Étape 4: Attendre le Déploiement

1. **GitHub va maintenant déployer votre site** (1-2 minutes)

2. **Vérifier le déploiement**:
   - Aller dans l'onglet **"Actions"** du repository
   - Vous verrez le workflow **"Deploy Documentation to GitHub Pages"** en cours
   - Attendre qu'il soit ✅ vert

3. **Une fois terminé**, retourner dans **Settings → Pages**

4. **Vous verrez un bandeau vert**:
   ```
   ✅ Your site is live at https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/
   ```

---

## 🌐 Accéder à Votre Site

**URL Principale**:
```
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/
```

**Pages Documentation**:
```
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/01-GUIDE_SIMPLE
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/ANALYSE_ARCHITECTURE_EXPERT
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/DIAGRAMS_MERMAID
```

---

## 🎨 Aperçu du Site

Votre site documentation comprend:

### 🏠 Page d'Accueil (index.html)
- Design moderne dark theme
- 9 cartes cliquables vers documentation
- Section Architecture 5-Tiers
- Tech Stack visuel
- Statistiques projet
- Footer avec liens

### 📚 Documentation
- **01-GUIDE_SIMPLE.md** → Guide démarrage rapide
- **02-INSTALLATION.md** → Installation détaillée
- **03-FRONTEND_SETUP.md** → Setup frontend
- **04-DEPLOY_HETZNER.md** → Déploiement Hetzner
- **05-DEPLOY_PRODUCTION.md** → Production
- **ANALYSE_ARCHITECTURE_EXPERT.md** → Analyse N-Tiers
- **DIAGRAMS_MERMAID.md** → Diagrammes architecture
- **ANALYSE_PROJET.md** → Analyse qualité projet

---

## 🔄 Mises à Jour Automatiques

À partir de maintenant, **chaque fois que vous modifiez un fichier dans `docs/`** et que vous poussez sur `main`:

```bash
# 1. Modifier documentation
vim docs/01-GUIDE_SIMPLE.md

# 2. Commit & Push
git add docs/
git commit -m "docs: Mise à jour guide"
git push origin main

# 3. GitHub Actions redéploie automatiquement (1-2 min)
# 4. Votre site est à jour!
```

**Vérifier déploiement**:
```
https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/actions
```

---

## 🎯 Personnalisation

### Modifier le Design

**Fichier**: `docs/index.html`

**Changer les couleurs**:
```css
/* Ligne 28-38 */
:root {
    --primary: #0066cc;        /* Bleu principal */
    --secondary: #00cc88;      /* Vert secondaire */
    --dark: #1a1a2e;           /* Fond sombre */
}
```

**Modifier le titre**:
```html
<!-- Ligne 11 -->
<title>Votre Titre Personnalisé</title>

<!-- Ligne 79 -->
<h1>Votre Titre</h1>
```

### Ajouter un Logo

```bash
# 1. Créer dossier assets
mkdir docs/assets

# 2. Copier votre logo
# docs/assets/logo.png

# 3. Modifier index.html ligne 23
<link rel="icon" type="image/png" href="assets/logo.png">
```

### Ajouter Google Analytics

Dans `docs/index.html`, avant `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔧 Commandes Utiles

### Forcer un Rebuild

```bash
git commit --allow-empty -m "docs: Force rebuild GitHub Pages"
git push origin main
```

### Tester en Local

```bash
# Avec Python
cd docs
python -m http.server 8000
# → http://localhost:8000

# Avec Node.js
npm install -g http-server
cd docs
http-server -p 8000
```

---

## 🐛 Troubleshooting

### Erreur 404 après déploiement

**Solution**:
1. Vérifier Settings → Pages → Source = `main` + `/docs`
2. Vérifier que `docs/index.html` existe
3. Attendre 2-3 minutes

### Workflow Actions en erreur

**Vérifier logs**:
```
https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/actions
```

**Si erreur permissions**:
- Settings → Actions → General
- Workflow permissions → "Read and write permissions"

### Mermaid diagrams ne s'affichent pas

**Ajouter dans vos fichiers .md**:
```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

---

## 📱 Domaine Personnalisé (Optionnel)

Si vous voulez `docs.oceanphenix.fr` au lieu de `stepstev.github.io/...`:

### 1. Créer fichier CNAME

```bash
# docs/CNAME
docs.oceanphenix.fr
```

### 2. Configurer DNS

Chez votre registrar (OVH, Gandi, etc.):

```
Type: CNAME
Name: docs
Value: stepstev.github.io
TTL: 3600
```

### 3. Activer dans GitHub

Settings → Pages → Custom domain:
- Entrer `docs.oceanphenix.fr`
- Cocher "Enforce HTTPS"
- Save

Attendre propagation DNS (1-24h).

---

## 📊 Résumé Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Vous êtes ici:                                        │
│  ✅ Fichiers poussés sur GitHub                        │
│  ✅ Workflow configuré                                 │
│                                                         │
│  Prochaines étapes:                                    │
│  1️⃣ Aller sur GitHub Settings → Pages                 │
│  2️⃣ Source: GitHub Actions (ou main + /docs)          │
│  3️⃣ Attendre déploiement (1-2 min)                    │
│  4️⃣ Visiter votre site! 🎉                            │
│                                                         │
│  URL: https://stepstev.github.io/...                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎉 Checklist Finale

- [ ] Aller sur GitHub Settings → Pages
- [ ] Configurer Source (GitHub Actions ou Branch)
- [ ] Attendre déploiement (Actions tab)
- [ ] Visiter le site
- [ ] Tester liens documentation
- [ ] Vérifier responsive (mobile/tablet)
- [ ] Partager URL! 🚀

---

<div align="center">

**🌊 OceanPhenix V10 - GitHub Pages Ready!**

[🏠 Visiter le Site](https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/) | [⚙️ Settings](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/settings/pages) | [📊 Actions](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/actions)

**Besoin d'aide?** Ouvrir une [Issue GitHub](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues)

</div>
