/**
 * 🌐 OceanPhenix Hub - Client API
 * 
 * Wrapper autour de fetch() pour simplifier les appels API
 * vers le backend Hetzner.
 */

const ApiClient = {
    /**
     * Effectue une requête GET
     * @param {string} endpoint - Endpoint de l'API (ex: '/health')
     * @param {Object} options - Options fetch supplémentaires
     * @returns {Promise<Object>} Réponse JSON
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    },
    
    /**
     * Effectue une requête POST
     * @param {string} endpoint - Endpoint de l'API
     * @param {Object} data - Données à envoyer
     * @param {Object} options - Options fetch supplémentaires
     * @returns {Promise<Object>} Réponse JSON
     */
    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    },
    
    /**
     * Effectue une requête PUT
     * @param {string} endpoint - Endpoint de l'API
     * @param {Object} data - Données à envoyer
     * @param {Object} options - Options fetch supplémentaires
     * @returns {Promise<Object>} Réponse JSON
     */
    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    },
    
    /**
     * Effectue une requête DELETE
     * @param {string} endpoint - Endpoint de l'API
     * @param {Object} options - Options fetch supplémentaires
     * @returns {Promise<Object>} Réponse JSON
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    },
    
    /**
     * Requête générique
     * @private
     * @param {string} method - Méthode HTTP
     * @param {string} endpoint - Endpoint de l'API
     * @param {Object} data - Données à envoyer
     * @param {Object} options - Options fetch supplémentaires
     * @returns {Promise<Object>} Réponse JSON
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        try {
            console.log(`🌐 ${method} ${url}`);
            
            const response = await fetch(url, config);
            
            // Vérifier le statut
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parser la réponse
            const json = await response.json();
            
            console.log(`✅ ${method} ${url} - Success`);
            
            return {
                success: true,
                data: json,
                status: response.status
            };
            
        } catch (error) {
            console.error(`❌ ${method} ${url} - Error:`, error);
            
            return {
                success: false,
                error: error.message,
                status: 0
            };
        }
    },
    
    /**
     * Vérifie la santé de l'API
     * @returns {Promise<Object>} État de santé
     */
    async checkHealth() {
        const result = await this.get('/health');
        
        if (result.success) {
            App.updateApiStatus(true, CONFIG.MESSAGES.API_CONNECTED);
        } else {
            App.updateApiStatus(false, CONFIG.MESSAGES.API_DISCONNECTED);
        }
        
        return result;
    },
    
    /**
     * Récupère les statistiques de la plateforme
     * @returns {Promise<Object>} Statistiques
     */
    async getStats() {
        return this.get('/stats');
    },
    
    /**
     * Récupère l'état des services
     * @returns {Promise<Object>} État des services
     */
    async getServicesStatus() {
        return this.get('/services/status');
    },
    
    /**
     * Indexe des documents dans le système RAG
     * @param {FormData} formData - Formulaire contenant les fichiers
     * @returns {Promise<Object>} Résultat de l'indexation
     */
    async indexDocuments(formData) {
        const url = `${CONFIG.API_URL}/documents/index`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
                // Ne pas définir Content-Type, fetch le fera automatiquement pour FormData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ Erreur indexation:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Effectue une recherche RAG
     * @param {string} query - Requête de recherche
     * @param {number} topK - Nombre de résultats
     * @returns {Promise<Object>} Résultats de recherche
     */
    async searchRAG(query, topK = 5) {
        return this.post('/rag/search', { query, top_k: topK });
    },
    
    /**
     * Obtient la liste des documents indexés
     * @returns {Promise<Object>} Liste des documents
     */
    async getDocuments() {
        return this.get('/documents');
    },
    
    /**
     * Supprime un document
     * @param {string} documentId - ID du document
     * @returns {Promise<Object>} Résultat de la suppression
     */
    async deleteDocument(documentId) {
        return this.delete(`/documents/${documentId}`);
    }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
