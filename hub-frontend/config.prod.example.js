// Exemple de configuration production pour le Hub (à déployer sur O2Switch)
// Copiez/renommez en config.js puis ajustez les domaines et le token.

const OCEANPHENIX_MODE = 'prod';

typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = {
  apiUrlDefault: 'https://api.votre-domaine.fr',
  // Idéalement, ne pas committer le token. Injectez-le au build ou saisissez-le via la modal du Hub.
  apiAuthToken: null,
  services: {
    api: 'https://api.votre-domaine.fr/health',
    minio: 'https://minio.votre-domaine.fr/minio/health/live',
    openwebui: 'https://studio.votre-domaine.fr/health',
    n8n: 'https://n8n.votre-domaine.fr/healthz',
    portainer: 'https://portainer.votre-domaine.fr/api/status',
    grafana: 'https://grafana.votre-domaine.fr/api/health',
    superset: 'https://bi.votre-domaine.fr/health',
    strapi: 'https://cms.votre-domaine.fr/_health',
    // Endpoints non exposés ou internes : laisser à null
    ollama: null,
    qdrant: null,
    prometheus: null,
    cadvisor: null,
    nodeExporter: null,
    alertmanager: null
  }
});

typeof window !== 'undefined' && (window.OCEANPHENIX_MODE = OCEANPHENIX_MODE);
