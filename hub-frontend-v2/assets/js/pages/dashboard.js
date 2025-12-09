/**
 * 📊 Dashboard Page - Logique spécifique
 * 
 * Gère l'affichage du tableau de bord principal.
 */

const DashboardPage = {
    refreshInterval: null,
    
    /**
     * Initialise la page dashboard
     */
    async init() {
        console.log('📊 Initialisation de la page Dashboard...');
        
        // Mettre à jour le titre de la page
        this.updatePageTitle();
        
        // Charger les données initiales
        await this.loadData();
        
        // Démarrer le rafraîchissement automatique
        this.startAutoRefresh();
        
        // Attacher les événements
        this.attachEvents();
        
        console.log('✅ Page Dashboard initialisée');
    },
    
    /**
     * Met à jour le titre de la page dans le header
     */
    updatePageTitle() {
        const titleEl = document.getElementById('page-main-title');
        const subtitleEl = document.getElementById('page-subtitle');
        
        if (titleEl) titleEl.textContent = 'Tableau de Bord';
        if (subtitleEl) subtitleEl.textContent = 'Vue d\'ensemble de votre plateforme IA';
    },
    
    /**
     * Charge toutes les données du dashboard
     */
    async loadData() {
        console.log('🔄 Chargement des données du dashboard...');
        
        // Vérifier la santé de l'API
        await ApiClient.checkHealth();
        
        // Charger les statistiques
        const statsResult = await ApiClient.getStats();
        if (statsResult.success) {
            this.displayStats(statsResult.data);
        }
        
        // Charger l'état des services
        const servicesResult = await ApiClient.getServicesStatus();
        if (servicesResult.success) {
            this.displayServices(servicesResult.data);
        }
        
        // Charger les URLs rapides
        this.displayQuickUrls();
    },
    
    /**
     * Affiche les statistiques principales
     * @param {Object} stats - Données de statistiques
     */
    displayStats(stats) {
        // Exemple d'affichage des stats dans les KPI cards
        const kpiContainer = document.getElementById('kpi-stats');
        if (!kpiContainer) return;
        
        const html = `
            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-value">${stats.services_ok || 0}</h3>
                    <p class="kpi-label">Services Actifs</p>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-value">${stats.documents || 0}</h3>
                    <p class="kpi-label">Documents Indexés</p>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-value">${stats.ai_requests || 0}</h3>
                    <p class="kpi-label">Requêtes IA</p>
                </div>
            </div>
        `;
        
        kpiContainer.innerHTML = html;
    },
    
    /**
     * Affiche l'état des services
     * @param {Array} services - Liste des services
     */
    displayServices(services) {
        const container = document.getElementById('services-status');
        if (!container) return;
        
        let html = '';
        
        services.forEach(service => {
            const statusClass = service.status === 'online' ? 'status-ok' : 'status-error';
            const statusIcon = service.status === 'online' ? 'check-circle' : 'times-circle';
            
            html += `
                <div class="service-item">
                    <div class="service-icon ${statusClass}">
                        <i class="fas fa-${statusIcon}"></i>
                    </div>
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <p>${service.description || ''}</p>
                    </div>
                    <span class="service-status ${statusClass}">${service.status}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    /**
     * Affiche les URLs d'accès rapide aux services
     */
    displayQuickUrls() {
        this.displayUrlCategory('mainServicesList', CONFIG.SERVICES_URLS.main);
        this.displayUrlCategory('monitoringServicesList', CONFIG.SERVICES_URLS.monitoring);
        this.displayUrlCategory('storageServicesList', CONFIG.SERVICES_URLS.storage);
    },
    
    /**
     * Affiche une catégorie d'URLs
     * @param {string} containerId - ID du container
     * @param {Array} urls - Liste des URLs
     */
    displayUrlCategory(containerId, urls) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        
        urls.forEach(item => {
            html += `
                <a href="${item.url}" target="_blank" rel="noopener" class="url-item">
                    <i class="fas fa-${item.icon}"></i>
                    <div class="url-info">
                        <h5>${item.name}</h5>
                        <p>${item.description}</p>
                    </div>
                    <i class="fas fa-external-link-alt"></i>
                </a>
            `;
        });
        
        container.innerHTML = html;
    },
    
    /**
     * Démarre le rafraîchissement automatique
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, CONFIG.REFRESH_INTERVAL);
    },
    
    /**
     * Arrête le rafraîchissement automatique
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    },
    
    /**
     * Attache les événements spécifiques à la page
     */
    attachEvents() {
        // Bouton de rafraîchissement manuel
        const refreshBtn = document.getElementById('refresh-dashboard');
        refreshBtn?.addEventListener('click', () => {
            Utils.showToast('Actualisation en cours...', 'info');
            this.loadData();
        });
    },
    
    /**
     * Nettoyage à la fermeture de la page
     */
    cleanup() {
        this.stopAutoRefresh();
    }
};

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que les includes soient chargés
    setTimeout(() => {
        DashboardPage.init();
    }, 300);
});

// Nettoyer avant de quitter la page
window.addEventListener('beforeunload', () => {
    DashboardPage.cleanup();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardPage;
}
