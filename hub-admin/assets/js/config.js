/**
 * 🌊 OceanPhenix Admin Hub - Configuration Globale
 * ================================================
 * Configuration multi-environnement (local, production, O2Switch)
 * Auto-détection de l'environnement selon le hostname
 */

// Détection automatique de l'environnement
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    // Local : localhost ou IP locale
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168')) {
        return 'local';
    }
    
    // Production O2Switch : domaine personnalisé
    if (hostname.includes('oceanphenix.fr') || hostname.includes('votre-domaine')) {
        return 'production';
    }
    
    // Par défaut : local
    return 'local';
}

// Configuration par environnement
const CONFIG = {
    // Environnement actuel (auto-détecté ou forcé)
    ENV: localStorage.getItem('opx_environment') || detectEnvironment(),
    
    // Version de l'application
    VERSION: '1.0.0',
    APP_NAME: 'OceanPhenix Admin Hub',
    
    // Configuration locale (développement)
    local: {
        API_URL: 'http://localhost:8000',
        SERVICES: {
            ollama: 'http://localhost:11434',
            qdrant: 'http://localhost:6333',
            minio: 'http://localhost:9000',
            openwebui: 'http://localhost:3000',
            n8n: 'http://localhost:5678',
            portainer: 'http://localhost:9002',
            prometheus: 'http://localhost:9090',
            grafana: 'http://localhost:3001',
            alertmanager: 'http://localhost:9093',
            superset: 'http://localhost:8088',
            strapi: 'http://localhost:1337'
        },
        MONITORING: {
            grafana_dashboard_platform: 'http://localhost:3001/d/oceanphenix-platform',
            grafana_dashboard_containers: 'http://localhost:3001/d/oceanphenix-containers'
        }
    },
    
    // Configuration production (O2Switch + Hetzner)
    production: {
        API_URL: 'https://api.oceanphenix.fr',
        SERVICES: {
            ollama: null, // Service interne (pas exposé)
            qdrant: null, // Service interne
            minio: 'https://minio.oceanphenix.fr',
            openwebui: 'https://studio.oceanphenix.fr',
            n8n: 'https://n8n.oceanphenix.fr',
            portainer: 'https://portainer.oceanphenix.fr',
            prometheus: null, // Service interne
            grafana: 'https://grafana.oceanphenix.fr',
            alertmanager: null, // Service interne
            superset: 'https://bi.oceanphenix.fr',
            strapi: 'https://cms.oceanphenix.fr'
        },
        MONITORING: {
            grafana_dashboard_platform: 'https://grafana.oceanphenix.fr/d/oceanphenix-platform',
            grafana_dashboard_containers: 'https://grafana.oceanphenix.fr/d/oceanphenix-containers'
        }
    },
    
    // Paramètres globaux
    SETTINGS: {
        // Intervalle de rafraîchissement des données (ms)
        REFRESH_INTERVAL: 30000, // 30 secondes
        
        // Timeout des requêtes API (ms)
        API_TIMEOUT: 10000, // 10 secondes
        
        // Nombre max de tentatives en cas d'échec
        MAX_RETRIES: 3,
        
        // Affichage des logs en console
        DEBUG: true,
        
        // Thème par défaut
        DEFAULT_THEME: 'light', // 'light' ou 'dark'
        
        // Langue
        LANGUAGE: 'fr'
    }
};

// Getter pour obtenir la configuration active
CONFIG.getActive = function() {
    return this[this.ENV];
};

// Getter pour obtenir l'URL de l'API
CONFIG.getApiUrl = function() {
    return this.getActive().API_URL;
};

// Getter pour obtenir un service
CONFIG.getServiceUrl = function(serviceName) {
    return this.getActive().SERVICES[serviceName] || null;
};

// Getter pour obtenir les dashboards Grafana
CONFIG.getMonitoringUrls = function() {
    return this.getActive().MONITORING;
};

// Fonction pour changer d'environnement manuellement
CONFIG.setEnvironment = function(env) {
    if (env === 'local' || env === 'production') {
        this.ENV = env;
        localStorage.setItem('opx_environment', env);
        console.log(`✓ Environnement changé vers : ${env}`);
        return true;
    }
    console.error(`✗ Environnement invalide : ${env}`);
    return false;
};

// Log de l'environnement actuel
console.log(`🌊 OceanPhenix Admin Hub v${CONFIG.VERSION}`);
console.log(`📍 Environnement détecté : ${CONFIG.ENV}`);
console.log(`🔗 API URL : ${CONFIG.getApiUrl()}`);

// Export global
window.CONFIG = CONFIG;
