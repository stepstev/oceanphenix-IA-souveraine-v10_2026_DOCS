/**
 * 🌊 OceanPhenix Hub - Configuration Centrale
 * 
 * Ce fichier contient toutes les constantes et configurations globales
 * de l'application frontend.
 */

const CONFIG = {
    // API Backend (Hetzner)
    API_URL: localStorage.getItem('oceanphenix_api_url') || 'http://localhost:8000',
    
    // Paramètres de rafraîchissement
    REFRESH_INTERVAL: 30000, // 30 secondes
    
    // Endpoints des services
    SERVICES_ENDPOINTS: {
        // Core Services
        ollama: '/api/tags',
        qdrant: '/health',
        api: '/health',
        minio: '/minio/health/live',
        openwebui: '/health',
        studio: '/health',
        n8n: '/healthz',
        portainer: '/api/status',
        
        // Monitoring
        prometheus: '/-/healthy',
        grafana: '/api/health',
        cadvisor: '/healthz',
        'node-exporter': '/metrics',
        alertmanager: '/-/healthy',
        
        // BI & CMS
        superset: '/health'
    },
    
    // URLs des services (pour affichage et navigation)
    SERVICES_URLS: {
        main: [
            { name: 'Open WebUI', url: 'http://localhost:3000', icon: 'brain', description: 'Interface de chat IA' },
            { name: 'AI Studio', url: 'http://localhost:3000', icon: 'palette', description: 'Studio créatif IA' },
            { name: 'n8n Automations', url: 'http://localhost:5678', icon: 'robot', description: 'Workflows automatisés' },
            { name: 'Superset BI', url: 'http://localhost:8088', icon: 'chart-bar', description: 'Business Intelligence' }
        ],
        monitoring: [
            { name: 'Grafana', url: 'http://localhost:3001', icon: 'chart-line', description: 'Dashboards de monitoring' },
            { name: 'Prometheus', url: 'http://localhost:9090', icon: 'database', description: 'Métriques système' },
            { name: 'Portainer', url: 'http://localhost:9002', icon: 'docker', description: 'Gestion conteneurs' },
            { name: 'Alertmanager', url: 'http://localhost:9093', icon: 'bell', description: 'Gestion des alertes' }
        ],
        storage: [
            { name: 'MinIO Console', url: 'http://localhost:9001', icon: 'hdd', description: 'Stockage S3' }
        ]
    },
    
    // Configuration du thème
    THEME: {
        DEFAULT: 'dark',
        STORAGE_KEY: 'oceanphenix_theme'
    },
    
    // Messages
    MESSAGES: {
        API_CONNECTED: 'API Connectée',
        API_DISCONNECTED: 'API Déconnectée',
        LOADING: 'Chargement...',
        ERROR: 'Erreur de connexion',
        SUCCESS: 'Opération réussie'
    },
    
    // Monitoring Grafana URLs
    GRAFANA_DASHBOARDS: {
        platform: 'http://localhost:3001/d/oceanphenix-platform/oceanphenix-platform-health',
        containers: 'http://localhost:3001/d/oceanphenix-containers/oceanphenix-containers-monitoring'
    }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
