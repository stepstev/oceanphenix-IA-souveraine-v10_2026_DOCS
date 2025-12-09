/**
 * 🌊 OceanPhenix Admin Hub - Client API
 * ======================================
 * Client centralisé pour tous les appels à l'API backend
 * Gestion automatique des erreurs, retry, timeout
 */

class OceanPhenixAPI {
    constructor() {
        this.baseURL = CONFIG.getApiUrl();
        this.timeout = CONFIG.SETTINGS.API_TIMEOUT;
        this.maxRetries = CONFIG.SETTINGS.MAX_RETRIES;
        this.token = localStorage.getItem('opx_auth_token');
        
        // Statistiques
        this.stats = {
            totalRequests: 0,
            successRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0
        };
    }
    
    /**
     * Requête HTTP générique avec retry et timeout
     */
    async request(endpoint, options = {}, retryCount = 0) {
        const url = `${this.baseURL}${endpoint}`;
        const startTime = performance.now();
        
        // Headers par défaut
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Ajout du token si disponible
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // Configuration de la requête avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            this.stats.totalRequests++;
            
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // Mise à jour des stats
            this.updateStats(true, responseTime);
            
            // Gestion des erreurs HTTP
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parse JSON
            const data = await response.json();
            
            if (CONFIG.SETTINGS.DEBUG) {
                console.log(`✓ API [${endpoint}] ${responseTime.toFixed(0)}ms`, data);
            }
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Gestion du timeout
            if (error.name === 'AbortError') {
                console.error(`⏱️ Timeout API [${endpoint}]`);
                
                // Retry si possible
                if (retryCount < this.maxRetries) {
                    console.log(`🔄 Tentative ${retryCount + 1}/${this.maxRetries}...`);
                    await this.sleep(1000 * (retryCount + 1)); // Backoff exponentiel
                    return this.request(endpoint, options, retryCount + 1);
                }
            }
            
            this.updateStats(false, 0);
            
            if (CONFIG.SETTINGS.DEBUG) {
                console.error(`✗ API [${endpoint}]`, error.message);
            }
            
            throw error;
        }
    }
    
    /**
     * Méthodes HTTP de base
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    /**
     * ═══════════════════════════════════════════════════════════
     * ENDPOINTS SPÉCIFIQUES
     * ═══════════════════════════════════════════════════════════
     */
    
    // Health & Status
    async getHealth() {
        return this.get('/health');
    }
    
    async getHealthSimple() {
        return this.get('/health/simple');
    }
    
    // Métriques globales
    async getMetrics() {
        return this.get('/bi/metrics');
    }
    
    async getStackOverview() {
        return this.get('/bi/stack-overview');
    }
    
    async getSystemHealth() {
        return this.get('/bi/system-health');
    }
    
    // RAG - Documents
    async getDocuments() {
        return this.get('/documents');
    }
    
    async getDocumentStats() {
        return this.get('/bi/documents-stats');
    }
    
    async uploadDocument(file, description = '') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        
        const response = await fetch(`${this.baseURL}/documents/upload`, {
            method: 'POST',
            body: formData,
            headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
        });
        
        if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
        return response.json();
    }
    
    async deleteDocument(filename) {
        return this.delete(`/documents/${filename}`);
    }
    
    // RAG - Pipeline
    async queryRAG(question, topK = 5) {
        return this.post('/rag/query', { question, top_k: topK });
    }
    
    async indexDocument(filename) {
        return this.post('/rag/index', { filename });
    }
    
    // Modèles IA (Ollama)
    async getModels() {
        return this.get('/models');
    }
    
    async installModel(modelName) {
        return this.post('/models/install', { model_name: modelName });
    }
    
    async deleteModel(modelName) {
        return this.delete(`/models/${modelName}`);
    }
    
    // N8N - Workflows
    async getN8NWorkflows() {
        return this.get('/metrics/n8n/workflows');
    }
    
    async getN8NExecutions() {
        return this.get('/metrics/n8n/executions');
    }
    
    // Strapi - CMS
    async getStrapiSpaces() {
        return this.get('/metrics/strapi/spaces');
    }
    
    async getStrapiCollections() {
        return this.get('/metrics/strapi/collections');
    }
    
    // Monitoring - Système
    async getSystemMetrics() {
        return this.get('/metrics/system');
    }
    
    async getContainers() {
        return this.get('/metrics/containers');
    }
    
    async getContainerStats(containerName) {
        return this.get(`/metrics/containers/${containerName}`);
    }
    
    /**
     * Utilitaires
     */
    
    // Mise à jour des statistiques
    updateStats(success, responseTime) {
        if (success) {
            this.stats.successRequests++;
        } else {
            this.stats.failedRequests++;
        }
        
        // Calcul de la moyenne (moyenne mobile simple)
        const totalTime = this.stats.averageResponseTime * (this.stats.totalRequests - 1);
        this.stats.averageResponseTime = (totalTime + responseTime) / this.stats.totalRequests;
    }
    
    // Récupérer les statistiques
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalRequests > 0 
                ? (this.stats.successRequests / this.stats.totalRequests * 100).toFixed(1) 
                : 0
        };
    }
    
    // Définir le token d'authentification
    setToken(token) {
        this.token = token;
        localStorage.setItem('opx_auth_token', token);
    }
    
    // Supprimer le token
    clearToken() {
        this.token = null;
        localStorage.removeItem('opx_auth_token');
    }
    
    // Sleep utilitaire pour retry
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export global
window.API = new OceanPhenixAPI();

console.log('✓ API Client initialisé');
