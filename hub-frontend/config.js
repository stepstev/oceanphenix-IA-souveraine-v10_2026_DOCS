// OceanPhenix Hub Frontend - Configuration globale (local / prod)

// Mode: 'local' ou 'prod' (par défaut: local)
const OCEANPHENIX_MODE = localStorage.getItem('oceanphenix_mode') || 'local';

// Configuration des endpoints selon le mode
typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = OCEANPHENIX_MODE === 'prod'
  ? {
      apiUrlDefault: 'https://api.ton-domaine.fr',
      apiAuthToken: null, // Renseigner via build/secret si besoin
      services: {
        // Core (proxifiés derrière Caddy / domaines)
        ollama: null,
        qdrant: null,
        api: 'https://api.ton-domaine.fr/health',
        minio: 'https://minio.ton-domaine.fr/minio/health/live',
        openwebui: 'https://studio.ton-domaine.fr/health',
        n8n: 'https://n8n.ton-domaine.fr/healthz',
        portainer: 'https://portainer.ton-domaine.fr/api/status',
        // Monitoring (souvent derrière un domaine dédié)
        prometheus: null,
        grafana: 'https://grafana.ton-domaine.fr/api/health',
        cadvisor: null,
        nodeExporter: null,
        alertmanager: null,
        // BI & CMS
        superset: 'https://bi.ton-domaine.fr/health',
        strapi: 'https://cms.ton-domaine.fr/_health'
      }
    }
  : {
      apiUrlDefault: 'http://localhost:8000',
      apiAuthToken: null, // Peut être stocké en localStorage pour dev
      services: {
        // Core (local)
        ollama: 'http://localhost:11434/api/tags',
        qdrant: 'http://localhost:6333/health',
        api: 'http://localhost:8000/health',
        minio: 'http://localhost:9000/minio/health/live',
        openwebui: 'http://localhost:3000/health',
        n8n: 'http://localhost:5678/healthz',
        portainer: 'http://localhost:9000/api/status',
        // Monitoring
        prometheus: 'http://localhost:9090/-/healthy',
        grafana: 'http://localhost:3001/api/health',
        cadvisor: 'http://localhost:8080/healthz',
        nodeExporter: 'http://localhost:9100/metrics',
        alertmanager: 'http://localhost:9093/-/healthy',
        // BI & CMS
        superset: 'http://localhost:8088/health',
        strapi: 'http://localhost:1337/_health'
      }
    });

typeof window !== 'undefined' && (window.OCEANPHENIX_MODE = OCEANPHENIX_MODE);
