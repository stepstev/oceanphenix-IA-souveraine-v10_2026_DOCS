/**
 * 📡 Monitoring Page - Logique spécifique
 * 
 * Gère l'interface de monitoring (Grafana, Prometheus, metrics).
 */

const MonitoringPage = {
    async init() {
        console.log('📡 Initialisation de la page Monitoring...');
        
        this.updatePageTitle();
        this.attachEvents();
        
        console.log('✅ Page Monitoring initialisée');
    },
    
    updatePageTitle() {
        const titleEl = document.getElementById('page-main-title');
        const subtitleEl = document.getElementById('page-subtitle');
        
        if (titleEl) titleEl.textContent = 'Monitoring & Santé';
        if (subtitleEl) subtitleEl.textContent = 'Surveillance de la plateforme en temps réel';
    },
    
    attachEvents() {
        // Ouvrir les dashboards Grafana
        const openPlatformBtn = document.getElementById('open-platform-dashboard');
        const openContainersBtn = document.getElementById('open-containers-dashboard');
        
        openPlatformBtn?.addEventListener('click', () => {
            window.open(CONFIG.GRAFANA_DASHBOARDS.platform, '_blank');
        });
        
        openContainersBtn?.addEventListener('click', () => {
            window.open(CONFIG.GRAFANA_DASHBOARDS.containers, '_blank');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => MonitoringPage.init(), 300);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonitoringPage;
}
