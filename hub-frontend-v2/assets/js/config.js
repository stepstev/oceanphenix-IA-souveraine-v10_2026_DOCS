// OceanPhenix Hub Frontend - Configuration globale (local / prod / o2switch)

// Mode: 'local', 'prod', ou 'o2switch' (par défaut: auto-détection)
const OCEANPHENIX_MODE = localStorage.getItem('oceanphenix_mode') || detectMode();

function detectMode() {
  const hostname = window.location.hostname;
  // Auto-détection O2switch (hébergement mutualisé)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168')) {
    return 'o2switch';
  }
  return 'local';
}

// Configuration des endpoints selon le mode
typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = OCEANPHENIX_MODE === 'o2switch'
  ? {
    // Mode O2switch : appels API directs (CORS configuré sur backend)
    apiUrlDefault: 'https://api.oceanphenix.fr',
    useProxy: false,
    apiAuthToken: null,
    services: {
      // Services publics (CORS autorisé sur backend)
      api: 'https://api.oceanphenix.fr/health',
      minio: 'https://minio.oceanphenix.fr/minio/health/live',
      openwebui: 'https://studio.oceanphenix.fr/health',
      n8n: 'https://n8n.oceanphenix.fr/healthz',
      portainer: 'https://portainer.oceanphenix.fr/api/status',
      grafana: 'https://grafana.oceanphenix.fr/api/health',
      superset: 'https://bi.oceanphenix.fr/health',
      strapi: 'https://cms.oceanphenix.fr/_health',
      // Services internes (pas exposés publiquement)
      ollama: null,
      qdrant: null,
      prometheus: null,
      cadvisor: null,
      nodeExporter: null,
      alertmanager: null
    }
  }
  : OCEANPHENIX_MODE === 'prod'
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
      portainer: 'http://localhost:9002/api/status',
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
