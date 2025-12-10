# 🌐 GitHub Pages - Documentation OceanPhenix V10

## 📋 Activation GitHub Pages

### Étape 1: Pousser les fichiers sur GitHub

```bash
# Ajouter tous les nouveaux fichiers
git add docs/index.html
git add docs/_config.yml
git add .github/workflows/deploy-docs.yml
git add docs/README_GITHUB_PAGES.md

# Commit
git commit -m "feat: GitHub Pages - Site documentation complet"

# Push vers GitHub
git push origin main
```

### Étape 2: Activer GitHub Pages dans les Settings

1. **Aller sur votre repository GitHub**:
   ```
   https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026
   ```

2. **Cliquer sur "Settings"** (onglet en haut)

3. **Dans le menu latéral gauche, cliquer sur "Pages"**

4. **Configuration Source**:
   - **Source**: Deploy from a branch (ou GitHub Actions si disponible)
   - **Branch**: `main`
   - **Folder**: `/docs`
   - Cliquer sur **"Save"**

5. **Attendre le déploiement** (1-2 minutes)

6. **Accéder au site**:
   ```
   https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/
   ```

---

## 🚀 Méthode Alternative: GitHub Actions (Recommandée)

### Option 1: Utiliser le workflow automatique

Le fichier `.github/workflows/deploy-docs.yml` est déjà créé. Il déploie automatiquement à chaque push sur `main`.

**Pour activer**:

1. **Settings** → **Pages**
2. **Source**: GitHub Actions
3. Le workflow se lancera automatiquement

### Option 2: Déploiement manuel

```bash
# Lancer manuellement depuis GitHub
# Repository → Actions → "Deploy Documentation to GitHub Pages" → Run workflow
```

---

## 📁 Structure du Site

```
docs/
├── index.html                       # 🏠 Page d'accueil principale
├── _config.yml                      # ⚙️ Configuration Jekyll
├── 01-GUIDE_SIMPLE.md              # Converti en HTML automatiquement
├── 02-INSTALLATION.md
├── 03-FRONTEND_SETUP.md
├── 04-DEPLOY_HETZNER.md
├── 05-DEPLOY_PRODUCTION.md
├── ANALYSE_ARCHITECTURE_EXPERT.md  # ⭐ Analyse complète
├── DIAGRAMS_MERMAID.md
├── ANALYSE_PROJET.md
├── INSTALL_LOCAL.md
├── INSTALL_HETZNER.md
├── INSTALL_O2SWITCH.md
└── deployment/
    └── README_O2SWITCH.md
```

---

## 🎨 Personnalisation du Site

### Modifier l'index.html

Fichier: `docs/index.html`

**Changer le logo**:
```html
<!-- Ligne 23 - Remplacer le favicon -->
<link rel="icon" href="https://votresite.com/logo.png">
```

**Modifier les couleurs**:
```css
/* Ligne 28-38 - Variables CSS */
:root {
    --primary: #0066cc;        /* Couleur principale */
    --secondary: #00cc88;      /* Couleur secondaire */
    --dark: #1a1a2e;           /* Background */
}
```

**Ajouter des sections**:
```html
<!-- Avant </body> -->
<section class="new-section">
    <h2>Nouvelle Section</h2>
    <p>Contenu...</p>
</section>
```

### Ajouter un logo personnalisé

```bash
# Créer dossier assets
mkdir docs/assets

# Ajouter votre logo
# docs/assets/logo.png

# Modifier index.html ligne 23
<link rel="icon" type="image/png" href="assets/logo.png">
```

---

## 📊 Métriques & Analytics

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

### Ajouter Plausible Analytics (Privacy-friendly)

```html
<script defer data-domain="votredomaine.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🔗 URLs et Liens

### URL du site

**Production**:
```
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/
```

**Pages individuelles**:
```
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/01-GUIDE_SIMPLE.html
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/ANALYSE_ARCHITECTURE_EXPERT.html
https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/DIAGRAMS_MERMAID.html
```

### Domaine personnalisé (Optionnel)

**Ajouter un CNAME**:

1. Créer `docs/CNAME`:
```
docs.oceanphenix.fr
```

2. Configurer DNS chez votre registrar:
```
Type: CNAME
Name: docs
Value: stepstev.github.io
```

3. Attendre propagation DNS (1-24h)

4. Dans GitHub Settings → Pages → Custom domain:
   - Entrer `docs.oceanphenix.fr`
   - Cocher "Enforce HTTPS"

---

## 🧪 Tester en Local

### Avec Jekyll (Méthode 1)

```bash
# Installer Jekyll
gem install jekyll bundler

# Créer Gemfile dans docs/
cd docs
cat > Gemfile << 'EOF'
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
gem "webrick"
EOF

# Installer dépendances
bundle install

# Lancer serveur local
bundle exec jekyll serve

# Accéder à http://localhost:4000
```

### Avec Python SimpleHTTPServer (Méthode 2)

```bash
cd docs
python -m http.server 8000

# Accéder à http://localhost:8000
```

### Avec Node.js http-server (Méthode 3)

```bash
npm install -g http-server
cd docs
http-server -p 8000

# Accéder à http://localhost:8000
```

---

## 🔄 Workflow de Mise à Jour

### Mise à jour automatique

**Chaque push sur `main` dans `docs/` déclenche déploiement**:

```bash
# 1. Modifier fichiers
vim docs/01-GUIDE_SIMPLE.md

# 2. Commit & Push
git add docs/
git commit -m "docs: Mise à jour guide installation"
git push origin main

# 3. GitHub Actions déploie automatiquement (1-2 min)

# 4. Vérifier déploiement
# https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/actions
```

### Forcer un rebuild

```bash
# Créer commit vide pour forcer rebuild
git commit --allow-empty -m "docs: Force rebuild GitHub Pages"
git push origin main
```

---

## 📱 Responsive Design

Le site `index.html` est déjà responsive:

- **Desktop** (>768px): Grid 3 colonnes
- **Tablet** (768px): Grid 2 colonnes
- **Mobile** (<768px): Grid 1 colonne

**Tester**:
- Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Tester iPhone, iPad, Desktop

---

## 🎨 Templates Alternatifs

### Option 1: Docsify (SPA Documentation)

```bash
# Installer Docsify
npm i docsify-cli -g

# Initialiser
docsify init ./docs

# Serveur local
docsify serve docs
```

### Option 2: MkDocs Material

```bash
# Installer
pip install mkdocs-material

# Créer config
cat > mkdocs.yml << 'EOF'
site_name: OceanPhenix V10
theme:
  name: material
  palette:
    primary: blue
    accent: cyan
docs_dir: docs
EOF

# Serveur local
mkdocs serve

# Build pour GitHub Pages
mkdocs build
```

### Option 3: VuePress

```bash
# Installer
npm install -g vuepress

# Créer config
mkdir docs/.vuepress
cat > docs/.vuepress/config.js << 'EOF'
module.exports = {
  title: 'OceanPhenix V10',
  description: 'Documentation complète',
  base: '/oceanphenix-IA-souveraine-v10_2026/'
}
EOF

# Serveur local
vuepress dev docs

# Build
vuepress build docs
```

---

## 🐛 Troubleshooting

### Erreur 404 après déploiement

**Cause**: Branch/folder mal configuré

**Solution**:
1. Settings → Pages → Vérifier Source = `main` et Folder = `/docs`
2. Vérifier fichier `docs/index.html` existe

### CSS ne charge pas

**Cause**: Chemins relatifs incorrects

**Solution**:
```html
<!-- Utiliser chemins absolus -->
<link href="/oceanphenix-IA-souveraine-v10_2026/style.css" rel="stylesheet">
```

### Workflow Actions en erreur

**Voir logs**:
```
https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/actions
```

**Erreur permissions**:

Dans Settings → Actions → General → Workflow permissions:
- Cocher "Read and write permissions"

### Mermaid diagrams ne s'affichent pas

**Solution**: Ajouter script Mermaid dans `<head>`:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

---

## 📈 SEO & Performance

### Optimisation SEO

**Déjà inclus dans index.html**:
- ✅ Meta description
- ✅ Meta keywords
- ✅ Open Graph tags
- ✅ Responsive viewport

**Améliorer**:
```html
<!-- Ajouter dans <head> -->
<meta property="og:title" content="OceanPhenix V10 Documentation">
<meta property="og:description" content="Plateforme IA Souveraine...">
<meta property="og:image" content="https://votresite.com/preview.png">
<meta property="og:url" content="https://stepstev.github.io/...">
<meta name="twitter:card" content="summary_large_image">
```

### Performance

**Actuel**:
- ✅ CSS inline (pas de requête HTTP)
- ✅ Fonts Google CDN (cache navigateur)
- ✅ Pas de JavaScript lourd

**Améliorer**:
1. Compresser images (WebP)
2. Lazy loading images: `<img loading="lazy">`
3. Preload fonts critiques
4. Service Worker pour offline

---

## 🎯 Checklist Déploiement

- [ ] Fichiers poussés sur GitHub (`git push origin main`)
- [ ] GitHub Pages activé (Settings → Pages)
- [ ] Source configurée (`main` branch, `/docs` folder)
- [ ] Workflow Actions passé (✅ vert)
- [ ] Site accessible: `https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/`
- [ ] Liens internes fonctionnels
- [ ] Responsive testé (mobile, tablet, desktop)
- [ ] Mermaid diagrams s'affichent
- [ ] Analytics ajouté (optionnel)
- [ ] Domaine personnalisé configuré (optionnel)

---

## 📚 Ressources

- **GitHub Pages Docs**: https://docs.github.com/pages
- **Jekyll Docs**: https://jekyllrb.com/docs/
- **GitHub Actions**: https://docs.github.com/actions
- **Markdown Guide**: https://www.markdownguide.org/
- **Mermaid JS**: https://mermaid.js.org/

---

## 🆘 Support

**Issues GitHub**:
```
https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues
```

**Email**: contact@oceanphenix.fr

---

<div align="center">

**🌊 OceanPhenix V10 - GitHub Pages**

Déployé avec ❤️ sur GitHub Pages

[🏠 Site](https://stepstev.github.io/oceanphenix-IA-souveraine-v10_2026/) | [📂 Repository](https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026) | [📖 Documentation](README.md)

</div>
