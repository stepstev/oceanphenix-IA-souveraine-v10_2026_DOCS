# 🔌 API Documentation - OceanPhenix Admin Hub

## 📋 Vue d'Ensemble

Le client API JavaScript (`api-client.js`) fournit une interface unifiée pour communiquer avec le backend OceanPhenix.

**Objet global** : `window.API`

---

## 🛠️ Configuration

### Initialisation Automatique

Le client API est initialisé automatiquement au chargement de `api-client.js` :

```javascript
window.API = new OceanPhenixAPI();
```

### Paramètres

- **Base URL** : Définie automatiquement selon l'environnement (via `CONFIG`)
- **Timeout** : 10 secondes (configurable)
- **Max Retries** : 3 tentatives en cas d'échec
- **Token** : Récupéré depuis `localStorage` si disponible

---

## 📡 Endpoints Disponibles

### Health & Status

#### `getHealth()`
Récupère l'état de santé complet de tous les services.

```javascript
const health = await API.getHealth();
console.log(health);
```

**Réponse** :
```json
{
    "status": "healthy",
    "timestamp": "2025-12-09T10:30:00Z",
    "services": {
        "ollama": {
            "name": "Ollama",
            "status": "healthy",
            "url": "http://ollama:11434",
            "response_time_ms": 45.2
        },
        "qdrant": { ... },
        "minio": { ... }
    },
    "healthy_count": 5,
    "total_count": 7,
    "health_percentage": 71.4
}
```

#### `getHealthSimple()`
Version simplifiée du health check.

```javascript
const health = await API.getHealthSimple();
```

**Réponse** :
```json
{
    "status": "healthy"
}
```

---

### Métriques Globales

#### `getMetrics()`
Récupère toutes les métriques de la plateforme.

```javascript
const metrics = await API.getMetrics();
```

#### `getStackOverview()`
Vue d'ensemble de la stack (services core et premium).

```javascript
const overview = await API.getStackOverview();
```

**Réponse** :
```json
{
    "total_services": 10,
    "core_services": [
        {
            "name": "Ollama",
            "type": "core",
            "status": "healthy",
            "url": "http://ollama:11434",
            "icon": "🧠"
        }
    ],
    "premium_services": [ ... ],
    "health_percentage": 90.0,
    "last_update": "2025-12-09T10:30:00Z"
}
```

#### `getSystemHealth()`
Métriques système (CPU, RAM, disque).

```javascript
const system = await API.getSystemHealth();
```

**Réponse** :
```json
{
    "cpu_percent": 45.2,
    "memory_percent": 62.8,
    "disk_percent": 35.1,
    "load_average": [1.5, 1.3, 1.2],
    "uptime_seconds": 86400
}
```

---

### Documents (RAG)

#### `getDocuments()`
Liste tous les documents stockés.

```javascript
const documents = await API.getDocuments();
```

**Réponse** :
```json
{
    "documents": [
        {
            "filename": "document.pdf",
            "size": 1024000,
            "upload_date": "2025-12-09T10:00:00Z",
            "description": "Mon document",
            "indexed": true
        }
    ]
}
```

#### `getDocumentStats()`
Statistiques sur les documents.

```javascript
const stats = await API.getDocumentStats();
```

**Réponse** :
```json
{
    "total_documents": 42,
    "total_size_mb": 128.5,
    "by_type": {
        "pdf": 25,
        "txt": 10,
        "docx": 7
    }
}
```

#### `uploadDocument(file, description)`
Upload un nouveau document.

```javascript
const fileInput = document.getElementById('file');
const file = fileInput.files[0];

const result = await API.uploadDocument(file, 'Description optionnelle');
console.log(result);
```

**Réponse** :
```json
{
    "filename": "document.pdf",
    "size": 1024000,
    "message": "Document uploaded successfully"
}
```

#### `deleteDocument(filename)`
Supprime un document.

```javascript
await API.deleteDocument('document.pdf');
```

---

### RAG Pipeline

#### `queryRAG(question, topK)`
Effectue une requête RAG.

```javascript
const response = await API.queryRAG('Quelle est la capitale de la France ?', 5);
console.log(response);
```

**Paramètres** :
- `question` : Question à poser
- `topK` : Nombre de documents similaires à récupérer (défaut: 5)

**Réponse** :
```json
{
    "answer": "La capitale de la France est Paris.",
    "sources": [
        {
            "document": "geographie.pdf",
            "page": 12,
            "score": 0.95
        }
    ],
    "processing_time_ms": 234
}
```

#### `indexDocument(filename)`
Indexe un document dans la base vectorielle.

```javascript
await API.indexDocument('document.pdf');
```

---

### Modèles IA (Ollama)

#### `getModels()`
Liste les modèles installés.

```javascript
const models = await API.getModels();
```

**Réponse** :
```json
{
    "models": [
        {
            "name": "llama2:7b",
            "size": "3.8 GB",
            "modified_at": "2025-12-09T10:00:00Z"
        }
    ]
}
```

#### `installModel(modelName)`
Installe un nouveau modèle.

```javascript
await API.installModel('mistral:7b');
```

#### `deleteModel(modelName)`
Supprime un modèle.

```javascript
await API.deleteModel('llama2:7b');
```

---

### N8N - Workflows

#### `getN8NWorkflows()`
Liste les workflows N8N.

```javascript
const workflows = await API.getN8NWorkflows();
```

**Réponse** :
```json
{
    "workflows": [
        {
            "id": "123",
            "name": "Mon workflow",
            "active": true,
            "tags": ["automation"]
        }
    ]
}
```

#### `getN8NExecutions()`
Historique des exécutions.

```javascript
const executions = await API.getN8NExecutions();
```

---

### Strapi - CMS

#### `getStrapiSpaces()`
Liste les espaces Strapi.

```javascript
const spaces = await API.getStrapiSpaces();
```

#### `getStrapiCollections()`
Liste les collections de contenu.

```javascript
const collections = await API.getStrapiCollections();
```

---

### Monitoring

#### `getSystemMetrics()`
Métriques système détaillées.

```javascript
const metrics = await API.getSystemMetrics();
```

#### `getContainers()`
Liste tous les conteneurs Docker.

```javascript
const containers = await API.getContainers();
```

**Réponse** :
```json
{
    "containers": [
        {
            "id": "abc123",
            "name": "v8-api",
            "status": "running",
            "image": "oceanphenix-api:latest",
            "cpu_percent": 12.5,
            "memory_mb": 256
        }
    ]
}
```

#### `getContainerStats(containerName)`
Stats d'un conteneur spécifique.

```javascript
const stats = await API.getContainerStats('v8-api');
```

---

## 🔐 Authentification

### Définir le Token

```javascript
API.setToken('votre-token-jwt');
```

Le token est automatiquement ajouté dans le header `Authorization: Bearer <token>` pour toutes les requêtes.

### Supprimer le Token

```javascript
API.clearToken();
```

---

## 📊 Statistiques du Client

Le client API maintient des statistiques d'utilisation :

```javascript
const stats = API.getStats();
console.log(stats);
```

**Réponse** :
```json
{
    "totalRequests": 150,
    "successRequests": 145,
    "failedRequests": 5,
    "averageResponseTime": 234.5,
    "successRate": "96.7"
}
```

---

## 🛡️ Gestion des Erreurs

### Try/Catch

```javascript
try {
    const data = await API.getHealth();
    console.log('Succès:', data);
} catch (error) {
    console.error('Erreur:', error.message);
    Utils.showToast('Erreur de chargement', 'error');
}
```

### Retry Automatique

Le client retente automatiquement 3 fois en cas d'échec (timeout, erreur réseau).

### Timeout

Par défaut : 10 secondes. Modifiable dans `CONFIG.SETTINGS.API_TIMEOUT`.

---

## 🔧 Méthodes HTTP de Base

Si un endpoint n'a pas de méthode dédiée :

### GET

```javascript
const data = await API.get('/mon-endpoint');
```

### POST

```javascript
const data = await API.post('/mon-endpoint', {
    key: 'value'
});
```

### PUT

```javascript
const data = await API.put('/mon-endpoint', {
    key: 'new-value'
});
```

### DELETE

```javascript
const data = await API.delete('/mon-endpoint');
```

---

## 📝 Ajouter un Nouvel Endpoint

### Étape 1 : Ajouter la méthode dans `api-client.js`

```javascript
class OceanPhenixAPI {
    // ...méthodes existantes...
    
    /**
     * Mon nouvel endpoint
     */
    async getMonNouvelEndpoint(param1, param2) {
        return this.get(`/mon-endpoint?param1=${param1}&param2=${param2}`);
    }
}
```

### Étape 2 : Utiliser dans votre page

```javascript
const result = await API.getMonNouvelEndpoint('valeur1', 'valeur2');
console.log(result);
```

---

## 🧪 Tests

### Test Manuel (Console)

```javascript
// Ouvrir la console du navigateur (F12)

// Test health check
API.getHealth().then(console.log);

// Test avec paramètres
API.queryRAG('Test question').then(console.log);

// Statistiques
console.log(API.getStats());
```

---

## 🔗 Liens Utiles

- **Backend API Doc** : `https://api.votre-domaine.fr/docs` (Swagger)
- **OpenAPI Spec** : `https://api.votre-domaine.fr/openapi.json`

---

## 💡 Bonnes Pratiques

1. **Toujours utiliser try/catch** pour les appels API
2. **Afficher un loader** pendant le chargement
3. **Gérer les erreurs** avec des messages utilisateur clairs
4. **Utiliser le debounce** pour les recherches en temps réel
5. **Mettre en cache** les données qui changent peu

### Exemple Complet

```javascript
// Fonction de chargement avec loader et gestion d'erreurs
async function loadDocuments() {
    const container = document.getElementById('documents-list');
    
    // Afficher le loader
    Utils.showLoader('documents-list');
    
    try {
        // Appel API
        const documents = await API.getDocuments();
        
        // Vérifier si vide
        if (documents.length === 0) {
            Utils.showEmpty('documents-list', 'Aucun document');
            return;
        }
        
        // Afficher les données
        let html = '<ul>';
        documents.forEach(doc => {
            html += `<li>${doc.filename} - ${Utils.formatBytes(doc.size)}</li>`;
        });
        html += '</ul>';
        
        container.innerHTML = html;
        
    } catch (error) {
        // Gérer l'erreur
        console.error('Erreur:', error);
        Utils.showError('documents-list', 'Impossible de charger les documents');
        Utils.showToast('Erreur de chargement', 'error');
    }
}
```

---

**🌊 OceanPhenix Admin Hub - API Documentation v1.0.0**
