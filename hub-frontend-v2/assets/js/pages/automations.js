/**
 * 🤖 Automations Page - Logique spécifique
 * 
 * Gère l'interface des automations (n8n, workflows).
 */

const AutomationsPage = {
    async init() {
        console.log('🤖 Initialisation de la page Automations...');
        
        this.updatePageTitle();
        this.attachEvents();
        
        console.log('✅ Page Automations initialisée');
    },
    
    updatePageTitle() {
        const titleEl = document.getElementById('page-main-title');
        const subtitleEl = document.getElementById('page-subtitle');
        
        if (titleEl) titleEl.textContent = 'Automations & Workflows';
        if (subtitleEl) subtitleEl.textContent = 'Gestion des workflows automatisés avec n8n';
    },
    
    attachEvents() {
        // Ouvrir n8n
        const openN8nBtn = document.getElementById('open-n8n');
        openN8nBtn?.addEventListener('click', () => {
            window.open('http://localhost:5678', '_blank');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => AutomationsPage.init(), 300);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationsPage;
}
