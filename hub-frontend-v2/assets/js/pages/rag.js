/**
 * 🧠 RAG Page - Logique spécifique
 * 
 * Gère l'interface RAG (indexation et recherche de documents).
 */

const RAGPage = {
    /**
     * Initialise la page RAG
     */
    async init() {
        console.log('🧠 Initialisation de la page RAG...');
        
        this.updatePageTitle();
        await this.loadDocuments();
        this.attachEvents();
        
        console.log('✅ Page RAG initialisée');
    },
    
    updatePageTitle() {
        const titleEl = document.getElementById('page-main-title');
        const subtitleEl = document.getElementById('page-subtitle');
        
        if (titleEl) titleEl.textContent = 'RAG & Intelligence Artificielle';
        if (subtitleEl) subtitleEl.textContent = 'Gestion des documents et recherche sémantique';
    },
    
    async loadDocuments() {
        const result = await ApiClient.getDocuments();
        if (result.success) {
            this.displayDocuments(result.data);
        }
    },
    
    displayDocuments(documents) {
        // Logique d'affichage des documents
        console.log('Documents:', documents);
    },
    
    attachEvents() {
        // Upload de documents
        const uploadForm = document.getElementById('upload-form');
        uploadForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpload(e.target);
        });
        
        // Recherche
        const searchForm = document.getElementById('search-form');
        searchForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSearch(e.target);
        });
    },
    
    async handleUpload(form) {
        const formData = new FormData(form);
        Utils.showToast('Upload en cours...', 'info');
        
        const result = await ApiClient.indexDocuments(formData);
        
        if (result.success) {
            Utils.showToast('Documents indexés avec succès', 'success');
            await this.loadDocuments();
        } else {
            Utils.showToast('Erreur lors de l\'indexation', 'error');
        }
    },
    
    async handleSearch(form) {
        const query = form.querySelector('input[name="query"]').value;
        const result = await ApiClient.searchRAG(query);
        
        if (result.success) {
            this.displaySearchResults(result.data);
        }
    },
    
    displaySearchResults(results) {
        console.log('Résultats:', results);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => RAGPage.init(), 300);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGPage;
}
