// ═══════════════════════════════════════════════════════════════════════════
// 🌊 OceanPhenix V10 - Configuration Production (O2Switch)
// ═══════════════════════════════════════════════════════════════════════════
// 📌 Ce fichier doit être renommé en config.js lors du déploiement sur O2Switch
// 🔧 Remplacer votredomaine.com par votre domaine réel
// ═══════════════════════════════════════════════════════════════════════════

const OCEANPHENIX_MODE = 'production';

typeof window !== 'undefined' && (window.OCEANPHENIX_CONFIG = {
  // 🌐 URL API Backend sur Hetzner
  apiUrlDefault: 'https://api.votredomaine.com',
  
  // 🔐 Token API (optionnel - peut être saisi via interface)
  apiAuthToken: null,
  
  // 🔗 Configuration CORS
  useProxy: false, // False car CORS configuré sur backend Hetzner
  
  // 📡 Services Backend (tous sur Hetzner)
  services: {
    // ✅ Services exposés publiquement (avec CORS)
    api: 'https://api.votredomaine.com/health',
    openwebui: 'https://studio.votredomaine.com/health',
    minio: 'https://minio.votredomaine.com/minio/health/live',
    grafana: 'https://grafana.votredomaine.com/api/health',
    n8n: 'https://n8n.votredomaine.com/healthz',
    portainer: 'https://portainer.votredomaine.com/api/status',
    superset: 'https://bi.votredomaine.com/health',
    
    // ❌ Services internes (non exposés publiquement)
    ollama: null,
    qdrant: null,
    prometheus: null,
    cadvisor: null,
    nodeExporter: null,
    alertmanager: null
  },
  
  // 🎨 Options interface
  ENV: 'production',
  ENABLE_ANALYTICS: false,
  ENABLE_DEBUG: false
});

typeof window !== 'undefined' && (window.OCEANPHENIX_MODE = OCEANPHENIX_MODE);

// ═══════════════════════════════════════════════════════════════════════════
// 📖 Instructions de déploiement :
// ═══════════════════════════════════════════════════════════════════════════
// 1. Copier ce fichier : cp config.prod.js config.js
// 2. Remplacer "votredomaine.com" par votre domaine réel
// 3. Uploader sur O2Switch via FTP dans /public_html/ia/
// 4. Vérifier que le backend Hetzner a CORS configuré pour votre domaine frontend
// ═══════════════════════════════════════════════════════════════════════════
