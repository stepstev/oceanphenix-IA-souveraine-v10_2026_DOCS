/**
 * ⚙️ Settings Page - Logique spécifique
 * 
 * Gère l'interface des paramètres et configuration.
 */

const SettingsPage = {
    async init() {
        console.log('⚙️ Initialisation de la page Settings...');
        
        this.updatePageTitle();
        this.loadSettings();
        this.attachEvents();
        
        console.log('✅ Page Settings initialisée');
    },
    
    updatePageTitle() {
        const titleEl = document.getElementById('page-main-title');
        const subtitleEl = document.getElementById('page-subtitle');
        
        if (titleEl) titleEl.textContent = 'Paramètres';
        if (subtitleEl) subtitleEl.textContent = 'Configuration de votre plateforme';
    },
    
    loadSettings() {
        // Charger l'URL API actuelle
        const apiUrlInput = document.getElementById('api-url-input');
        if (apiUrlInput) {
            apiUrlInput.value = CONFIG.API_URL;
        }
    },
    
    attachEvents() {
        // Sauvegarder la configuration API
        const saveConfigBtn = document.getElementById('save-api-config');
        saveConfigBtn?.addEventListener('click', () => {
            this.saveApiConfig();
        });
        
        // Test de connexion
        const testConnectionBtn = document.getElementById('test-connection');
        testConnectionBtn?.addEventListener('click', async () => {
            await this.testConnection();
        });
    },
    
    saveApiConfig() {
        const apiUrlInput = document.getElementById('api-url-input');
        const newUrl = apiUrlInput?.value;
        
        if (!newUrl || !Utils.isValidUrl(newUrl)) {
            Utils.showToast('URL invalide', 'error');
            return;
        }
        
        localStorage.setItem('oceanphenix_api_url', newUrl);
        CONFIG.API_URL = newUrl;
        
        Utils.showToast('Configuration sauvegardée', 'success');
    },
    
    async testConnection() {
        Utils.showToast('Test de connexion...', 'info');
        
        const result = await ApiClient.checkHealth();
        
        if (result.success) {
            Utils.showToast('Connexion réussie !', 'success');
        } else {
            Utils.showToast('Échec de la connexion', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => SettingsPage.init(), 300);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsPage;
}
