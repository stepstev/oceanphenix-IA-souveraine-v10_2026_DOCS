/**
 * 🌊 OceanPhenix Hub Frontend
 * Gestion de l'interface, appels API et navigation
 */

// Configuration
const CONFIG = {
    API_URL: localStorage.getItem('oceanphenix_api_url') || 'http://localhost:8000',
    REFRESH_INTERVAL: 30000, // 30 secondes
    SERVICES_ENDPOINTS: {
        // Core Services
        ollama: 'http://localhost:11434/api/tags',
        qdrant: 'http://localhost:6333/health',
        api: 'http://localhost:8000/health',
        minio: 'http://localhost:9000/minio/health/live',
        openwebui: 'http://localhost:3000/health',
        n8n: 'http://localhost:5678/healthz',
        portainer: 'http://localhost:9002/api/status',
        caddy: null, // Pas d'endpoint health direct

        // Monitoring
        prometheus: 'http://localhost:9090/-/healthy',
        grafana: 'http://localhost:3001/api/health',
        cadvisor: 'http://localhost:8080/healthz',
        'node-exporter': 'http://localhost:9100/metrics',
        alertmanager: 'http://localhost:9093/-/healthy',

        // BI & CMS
        superset: 'http://localhost:8088/health',
        strapi: 'http://localhost:1337/_health',
        postgres: null // Vérification via API backend
    }
};

// État de l'application
const state = {
    services: [],
    stats: null
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initAboutModal();
    checkConfig();
    updateApiDisplay();
    populateQuickUrls(); // Nouvelle fonction
    startPolling();
    startMonitoring();
    checkServicesHealth(); // Vérification statut services
    startServicesHealthPolling(); // Polling régulier
});

/**
 * Met à jour l'affichage de la configuration API
 */
function updateApiDisplay() {
    const apiUrl = localStorage.getItem('oceanphenix_api_url');
    const urlDisplay = document.getElementById('current-api-url');
    const statusIcon = document.getElementById('api-status-icon');
    const statusText = document.getElementById('api-status-text');

    if (apiUrl) {
        urlDisplay.textContent = apiUrl;
        urlDisplay.style.color = 'var(--accent-cyan)';
    } else {
        urlDisplay.textContent = 'Non configuré';
        urlDisplay.style.color = 'var(--danger)';
    }

    // Mise à jour du statut (sera mis à jour par fetchData)
    updateApiStatus(false);
}

/**
 * Met à jour le statut de connexion API
 */
function updateApiStatus(isConnected) {
    const statusIcon = document.getElementById('api-status-icon');
    const statusText = document.getElementById('api-status-text');
    const lastCheckTime = document.getElementById('last-check-time');

    // Éléments du header
    const headerApiStatus = document.getElementById('header-api-status');
    const headerApiIcon = document.getElementById('header-api-icon');
    const headerLastCheck = document.getElementById('header-last-check');
    const headerApiStatusItem = document.getElementById('header-api-status-item');

    if (isConnected) {
        statusIcon.className = 'fas fa-circle connected';
        statusText.textContent = 'Connecté';
        statusText.style.color = 'var(--success)';

        // Mise à jour du header
        if (headerApiStatus) headerApiStatus.textContent = 'API Connectée';
        if (headerApiStatusItem) {
            headerApiStatusItem.classList.add('connected');
            headerApiStatusItem.classList.remove('disconnected');
        }
    } else {
        statusIcon.className = 'fas fa-circle disconnected';
        statusText.textContent = 'Déconnecté';
        statusText.style.color = 'var(--danger)';

        // Mise à jour du header
        if (headerApiStatus) headerApiStatus.textContent = 'API Déconnectée';
        if (headerApiStatusItem) {
            headerApiStatusItem.classList.add('disconnected');
            headerApiStatusItem.classList.remove('connected');
        }
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

    lastCheckTime.textContent = timeString;
    if (headerLastCheck) headerLastCheck.textContent = `${timeString} - ${dateString}`;
}

/**
 * Ouvre la modal de configuration
 */
function openConfigModal() {
    document.getElementById('config-modal').style.display = 'flex';
    const apiUrl = localStorage.getItem('oceanphenix_api_url');
    if (apiUrl) {
        document.getElementById('api-url-input').value = apiUrl;
    }
}

/**
 * Actualise le dashboard
 */
function refreshDashboard() {
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');

    // Animation rotation
    icon.classList.add('fa-spin');

    fetchData().then(() => {
        setTimeout(() => {
            icon.classList.remove('fa-spin');
        }, 1000);
    }).catch(() => {
        icon.classList.remove('fa-spin');
    });
}

/**
 * Initialise le menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');

    // Ouvrir/fermer le menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Fermer au clic sur l'overlay
    overlay.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Fermer le menu au clic sur un lien de navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

/**
 * Vérifie si l'URL de l'API est configurée
 */
function checkConfig() {
    if (!localStorage.getItem('oceanphenix_api_url')) {
        document.getElementById('config-modal').style.display = 'flex';
    } else {
        fetchData();
    }

    // Gestionnaire sauvegarde config
    document.getElementById('save-config-btn').addEventListener('click', () => {
        const url = document.getElementById('api-url-input').value.trim();
        if (url) {
            // Retirer le slash final si présent
            const cleanUrl = url.replace(/\/$/, '');
            localStorage.setItem('oceanphenix_api_url', cleanUrl);
            CONFIG.API_URL = cleanUrl;
            document.getElementById('config-modal').style.display = 'none';
            updateApiDisplay();
            fetchData();
        }
    });
}

/**
 * Gestion de la navigation (Tabs)
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show target view
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(`view-${targetId}`).classList.add('active');

            // Update title
            const titleMap = {
                'dashboard': 'Tableau de bord',
                'studio': 'AI Studio',
                'architecture': 'Architecture Complète',
                'components': 'Composants Techniques',
                'admin': 'Administration'
            };
            document.getElementById('page-title').innerText = titleMap[targetId];
        });
    });
}

/**
 * Récupération des données depuis l'API
 */
async function fetchData() {
    try {
        await Promise.all([
            fetchServices(),
            fetchStats()
        ]);
        updateUI();
        updateApiStatus(true); // Connexion réussie
    } catch (error) {
        console.warn('[loadData] API non disponible, mode local activé');
        showErrorState();
        updateApiStatus(false); // Échec de connexion
    }
}

/**
 * Polling régulier des données
 */
function startPolling() {
    setInterval(fetchData, CONFIG.REFRESH_INTERVAL);
}

// ═══════════════════════════════════════════════════════════════════════════
// API Calls
// ═══════════════════════════════════════════════════════════════════════════

async function fetchServices() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/bi/services`);
        if (response.ok) {
            state.services = await response.json();
        }
    } catch (e) {
        // Mode local : API backend non disponible
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/bi/metrics/summary`);
        if (response.ok) {
            state.stats = await response.json();
        }
    } catch (e) {
        // Mode local : API backend non disponible
    }
}



// ═══════════════════════════════════════════════════════════════════════════
// UI Updates
// ═══════════════════════════════════════════════════════════════════════════

function updateUI() {
    updateKPIs();
    updateGlobalStatus();
    updateLinks();
    updateMonitoringKPIs();
}

/**
 * Met à jour les KPIs de la vue Monitoring
 */
function updateMonitoringKPIs() {
    if (!state.stats) return;

    // KPI Santé Globale
    const healthKpi = document.getElementById('kpi-health');
    if (healthKpi && state.stats.services) {
        const healthPercent = state.stats.services.health_percentage || 0;
        healthKpi.textContent = `${Math.round(healthPercent)}%`;

        if (healthPercent >= 80) {
            healthKpi.style.color = '#10b981';
        } else if (healthPercent >= 50) {
            healthKpi.style.color = '#f59e0b';
        } else {
            healthKpi.style.color = '#ef4444';
        }
    }

    // KPI Services UP
    const servicesKpi = document.getElementById('kpi-services');
    if (servicesKpi && state.stats.services) {
        const up = state.stats.services.up || 0;
        const total = state.stats.services.total || 0;
        servicesKpi.textContent = `${up} / ${total}`;
    }

    // KPI Vecteurs (nouvelle métrique)
    const vectorsKpi = document.getElementById('kpi-vectors');
    if (vectorsKpi && state.stats.vectors) {
        const totalVectors = state.stats.vectors.count || 0;
        vectorsKpi.textContent = totalVectors.toLocaleString();
    }

    // KPI Storage
    const storageKpi = document.getElementById('kpi-storage');
    if (storageKpi && state.stats.storage) {
        const totalSizeMb = state.stats.storage.total_size_mb || 0;
        storageKpi.textContent = `${totalSizeMb.toFixed(1)} MB`;
    }
}

function updateKPIs() {
    if (!state.stats) return;

    // Health %
    const health = state.stats.services.health_percentage;
    document.getElementById('kpi-health').innerText = `${Math.round(health)}%`;

    // Models (simulé pour l'instant ou via API si dispo)
    document.getElementById('kpi-models').innerText = "2"; // Llama + Embed
}





function updateGlobalStatus() {
    const dot = document.getElementById('global-status-dot');
    const text = document.getElementById('global-status-text');

    // Détecter l'environnement (Local ou Production)
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    // Toujours afficher le point vert et le mode d'installation
    dot.className = 'dot up';
    text.innerText = isLocal ? 'Local' : 'Production';

    // Update status indicators in architecture diagram
    updateServiceIndicators();
}

function updateServiceIndicators() {
    if (!state.services) return;

    // Liste des services internes non exposés (API uniquement)
    const internalServices = ['prometheus', 'ollama', 'minio'];

    const indicators = document.querySelectorAll('.status-indicator');
    indicators.forEach(indicator => {
        const serviceName = indicator.getAttribute('data-service');

        // Si c'est un service interne, mettre en gris
        if (internalServices.includes(serviceName)) {
            indicator.classList.remove('online', 'offline');
            indicator.classList.add('internal');
            return;
        }

        const service = state.services.find(s => s.name.toLowerCase().includes(serviceName));

        if (service) {
            indicator.classList.remove('online', 'offline', 'internal');
            indicator.classList.add(service.status === 'up' ? 'online' : 'offline');
        }
    });
}

function updateLinks() {
    // Met à jour les liens dynamiques basés sur le domaine de l'API
    let apiUrl = CONFIG.API_URL;

    console.log('[updateLinks] API URL configurée:', apiUrl);

    // Extraire le domaine de base proprement
    try {
        const url = new URL(apiUrl);
        let hostname = url.hostname; // Récupère juste le hostname sans protocole ni port ni path

        console.log('[updateLinks] Hostname extrait:', hostname);

        // Enlever le préfixe 'api.' si présent
        if (hostname.startsWith('api.')) {
            hostname = hostname.substring(4); // Enlève 'api.'
            console.log('[updateLinks] Hostname après suppression api.:', hostname);
        }

        // Si on a un domaine valide (pas localhost)
        if (hostname && hostname.includes('.') && !hostname.includes('localhost')) {
            // Toujours utiliser https en production
            const protocol = 'https';

            console.log('[updateLinks] Mode production - Protocol:', protocol, 'Domain:', hostname);

            const studioUrl = `${protocol}://studio.${hostname}`;

            // Liens externes et diagramme
            const studioExternal = document.getElementById('link-studio-external');
            const studioDiagram = document.getElementById('link-studio-diagram');
            if (studioExternal) studioExternal.href = studioUrl;
            if (studioDiagram) studioDiagram.href = studioUrl;

            const ollamaDiagram = document.getElementById('link-ollama-diagram');
            const qdrantDiagram = document.getElementById('link-qdrant-diagram');
            const minioLink = document.getElementById('link-minio');
            const minioDiagram = document.getElementById('link-minio-diagram');
            const n8nLink = document.getElementById('link-n8n');
            const n8nDiagram = document.getElementById('link-n8n-diagram');
            const grafanaLink = document.getElementById('link-grafana');
            const grafanaDiagram = document.getElementById('link-grafana-diagram');
            const portainerLink = document.getElementById('link-portainer');
            const portainerDiagram = document.getElementById('link-portainer-diagram');
            const prometheusDiagram = document.getElementById('link-prometheus-diagram');
            const alertmanagerDiagram = document.getElementById('link-alertmanager-diagram');
            const strapiDiagram = document.getElementById('link-strapi-diagram');
            const supersetDiagram = document.getElementById('link-superset-diagram');

            if (ollamaDiagram) ollamaDiagram.href = `${protocol}://ollama.${hostname}`;
            if (qdrantDiagram) qdrantDiagram.href = `${protocol}://qdrant.${hostname}`;
            if (minioLink) minioLink.href = `${protocol}://minio.${hostname}`;
            if (minioDiagram) minioDiagram.href = `${protocol}://minio.${hostname}`;
            if (n8nLink) n8nLink.href = `${protocol}://n8n.${hostname}`;
            if (n8nDiagram) n8nDiagram.href = `${protocol}://n8n.${hostname}`;
            if (grafanaLink) grafanaLink.href = `${protocol}://grafana.${hostname}/d/oceanphenix-platform-health`;
            if (grafanaDiagram) grafanaDiagram.href = `${protocol}://grafana.${hostname}/d/oceanphenix-platform-health`;
            if (portainerLink) portainerLink.href = `${protocol}://portainer.${hostname}`;
            if (portainerDiagram) portainerDiagram.href = `${protocol}://portainer.${hostname}`;
            if (prometheusDiagram) prometheusDiagram.href = `${protocol}://prometheus.${hostname}`;
            if (alertmanagerDiagram) alertmanagerDiagram.href = `${protocol}://alertmanager.${hostname}`;
            if (strapiDiagram) strapiDiagram.href = `${protocol}://strapi.${hostname}`;
            if (supersetDiagram) supersetDiagram.href = `${protocol}://superset.${hostname}`;

            console.log('[updateLinks] Liens générés - Studio:', studioUrl, 'MinIO:', `${protocol}://minio.${hostname}`);

            return; // Sortie si succès
        }
    } catch (e) {
        console.error('[updateLinks] Erreur de parsing URL:', e);
        console.warn('Impossible de parser l\'URL API, utilisation du mode local', e);
    }

    console.log('[updateLinks] Mode développement local');

    // Mode développement local (fallback)
    const protocol = 'http';

    const studioExternal = document.getElementById('link-studio-external');
    const studioDiagram = document.getElementById('link-studio-diagram');
    if (studioExternal) studioExternal.href = `${protocol}://localhost:3000`;
    if (studioDiagram) studioDiagram.href = `${protocol}://localhost:3000`;

    const ollamaDiagram = document.getElementById('link-ollama-diagram');
    const qdrantDiagram = document.getElementById('link-qdrant-diagram');
    const minioLink = document.getElementById('link-minio');
    const minioDiagram = document.getElementById('link-minio-diagram');
    const n8nLink = document.getElementById('link-n8n');
    const n8nDiagram = document.getElementById('link-n8n-diagram');
    const grafanaLink = document.getElementById('link-grafana');
    const grafanaDiagram = document.getElementById('link-grafana-diagram');
    const grafanaKpi = document.getElementById('link-grafana-kpi');
    const portainerLink = document.getElementById('link-portainer');
    const portainerDiagram = document.getElementById('link-portainer-diagram');
    const prometheusDiagram = document.getElementById('link-prometheus-diagram');
    const alertmanagerDiagram = document.getElementById('link-alertmanager-diagram');
    const strapiDiagram = document.getElementById('link-strapi-diagram');
    const supersetDiagram = document.getElementById('link-superset-diagram');

    // Note: Ollama n'a pas de WebUI, lien vers l'API
    if (ollamaDiagram) ollamaDiagram.href = `${protocol}://localhost:11434`;
    if (qdrantDiagram) qdrantDiagram.href = `${protocol}://localhost:6333/dashboard`;
    if (minioLink) minioLink.href = `${protocol}://localhost:9001`;
    if (minioDiagram) minioDiagram.href = `${protocol}://localhost:9001`;
    if (n8nLink) n8nLink.href = `${protocol}://localhost:5678`;
    if (n8nDiagram) n8nDiagram.href = `${protocol}://localhost:5678`;
    if (grafanaLink) grafanaLink.href = `${protocol}://localhost:3001/d/oceanphenix-platform-health`;
    if (grafanaDiagram) grafanaDiagram.href = `${protocol}://localhost:3001/d/oceanphenix-platform-health`;
    if (grafanaKpi) grafanaKpi.href = `${protocol}://localhost:3001/d/oceanphenix-platform-health`;
    if (portainerLink) portainerLink.href = `https://localhost:9443`;
    if (portainerDiagram) portainerDiagram.href = `https://localhost:9443`;
    if (prometheusDiagram) prometheusDiagram.href = `${protocol}://localhost:9090`;
    if (alertmanagerDiagram) alertmanagerDiagram.href = `${protocol}://localhost:9093`;
    if (strapiDiagram) strapiDiagram.href = `${protocol}://localhost:1337`;
    if (supersetDiagram) supersetDiagram.href = `${protocol}://localhost:8088`;
}

function showErrorState() {
    document.getElementById('global-status-text').innerText = 'Déconnecté';
    document.getElementById('global-status-dot').className = 'dot down';
}

/**
 * Met à jour les métriques de monitoring en temps réel
 */
function updateMonitoringMetrics() {
    if (!state.stats) return;

    // Mise à jour du CPU
    const cpuUsage = state.stats.system?.cpu_percent || 45;
    updateProgressBar('cpu', cpuUsage);

    // Mise à jour de la RAM
    const ramUsed = state.stats.system?.memory_used_gb || 19.8;
    const ramTotal = state.stats.system?.memory_total_gb || 32;
    const ramPercent = (ramUsed / ramTotal) * 100;
    updateProgressBar('ram', ramPercent, `${ramUsed.toFixed(1)}GB / ${ramTotal}GB`);

    // Mise à jour du disque
    const diskUsed = state.stats.system?.disk_used_gb || 140;
    const diskTotal = state.stats.system?.disk_total_gb || 400;
    const diskPercent = (diskUsed / diskTotal) * 100;
    updateProgressBar('disk', diskPercent, `${diskUsed}GB / ${diskTotal}GB`);
}

/**
 * Met à jour une barre de progression
 */
function updateProgressBar(type, percent, label) {
    const containers = document.querySelectorAll('.progress-group');
    containers.forEach(container => {
        const labelElem = container.querySelector('label');
        if (labelElem?.textContent.toLowerCase().includes(type)) {
            const fill = container.querySelector('.progress-fill');
            const span = container.querySelector('span');
            if (fill) fill.style.width = `${percent}%`;
            if (span && label) span.textContent = label;
            else if (span) span.textContent = `${Math.round(percent)}%`;
        }
    });
}

/**
 * Simule l'ajout de logs en temps réel (sera remplacé par WebSocket)
 */
function addLogEntry(time, level, message) {
    const logsContainer = document.querySelector('.logs-container');
    if (!logsContainer) return;

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${level.toLowerCase()}`;
    logEntry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-level">${level}</span>
        <span class="log-message">${message}</span>
    `;

    logsContainer.insertBefore(logEntry, logsContainer.firstChild);

    // Limiter à 50 logs
    while (logsContainer.children.length > 50) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

/**
 * Initialise le monitoring automatique
 */
function startMonitoring() {
    // Mise à jour toutes les 5 secondes
    setInterval(() => {
        updateMonitoringMetrics();
    }, 5000);

    // Simulation de logs (en production, utiliser WebSocket)
    setInterval(() => {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const messages = [
            'FastAPI: Health check successful - All services running',
            'Qdrant: Vector search completed in 42ms',
            'Ollama: Model inference completed - 1.85s',
            'MinIO: Document uploaded successfully',
            'n8n: Workflow executed successfully'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(time, 'INFO', message);
    }, 10000);
}

// ═══════════════════════════════════════════════════════════════════════════
// Services Health Checking
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie le statut de tous les services
 */
async function checkServicesHealth() {
    const services = Object.keys(CONFIG.SERVICES_ENDPOINTS);

    for (const service of services) {
        const endpoint = CONFIG.SERVICES_ENDPOINTS[service];
        if (!endpoint) {
            updateServiceStatus(service, 'unknown');
            continue;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch(endpoint, {
                method: 'GET',
                signal: controller.signal,
                mode: 'no-cors' // Permet les requêtes cross-origin sans CORS
            });

            clearTimeout(timeoutId);

            // En mode no-cors, on ne peut pas lire la réponse
            // Si la requête aboutit, on considère le service UP
            updateServiceStatus(service, 'up');
        } catch (error) {
            if (error.name === 'AbortError') {
                updateServiceStatus(service, 'timeout');
            } else {
                updateServiceStatus(service, 'down');
            }
        }
    }
}

/**
 * Met à jour le badge de statut d'un service
 */
function updateServiceStatus(serviceName, status) {
    const cards = document.querySelectorAll(`[data-service="${serviceName}"]`);

    cards.forEach(card => {
        const badge = card.querySelector('.service-status-badge');
        if (!badge) return;

        // Retirer les anciennes classes
        badge.classList.remove('status-up', 'status-down', 'status-timeout', 'status-unknown');

        // Appliquer la nouvelle classe et texte
        switch (status) {
            case 'up':
                badge.classList.add('status-up');
                badge.textContent = '✓ Opérationnel';
                break;
            case 'down':
                badge.classList.add('status-down');
                badge.textContent = '✗ Hors ligne';
                break;
            case 'timeout':
                badge.classList.add('status-timeout');
                badge.textContent = '⏱ Timeout';
                break;
            default:
                badge.classList.add('status-unknown');
                badge.textContent = '? Inconnu';
        }
    });
}

/**
 * Démarre le polling régulier des statuts
 */
function startServicesHealthPolling() {
    // Vérification toutes les 30 secondes
    setInterval(checkServicesHealth, 30000);
}

/**
 * Initialise le modal À propos
 */
function initAboutModal() {
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const aboutModalClose = document.getElementById('about-modal-close');

    // Ouvrir le modal
    aboutBtn?.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
        // Animation d'entrée
        setTimeout(() => {
            aboutModal.querySelector('.about-modal-content').style.opacity = '1';
            aboutModal.querySelector('.about-modal-content').style.transform = 'scale(1)';
        }, 10);
    });

    // Fermer le modal avec le bouton X
    aboutModalClose?.addEventListener('click', () => {
        closeAboutModal();
    });

    // Fermer le modal en cliquant en dehors
    aboutModal?.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            closeAboutModal();
        }
    });

    // Fermer le modal avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.style.display === 'flex') {
            closeAboutModal();
        }
    });

    // Style initial pour l'animation
    const modalContent = aboutModal?.querySelector('.about-modal-content');
    if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    function closeAboutModal() {
        const modalContent = aboutModal.querySelector('.about-modal-content');
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.9)';
        setTimeout(() => {
            aboutModal.style.display = 'none';
        }, 300);
    }
}

// Populate Quick Access URLs
function populateQuickUrls() {
    // Détection de l'environnement
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' ||
        hostname.startsWith('192.168') ||
        hostname.startsWith('127.0') ||
        hostname === '';

    // Définition des services avec URLs
    const services = {
        main: [
            {
                name: 'Open WebUI',
                icon: 'fas fa-comments',
                local: 'http://localhost:8080',
                prod: 'https://chatbot.example.com',
                status: 'public'
            },
            {
                name: 'Strapi CMS',
                icon: 'fas fa-file-alt',
                local: 'http://localhost:1337',
                prod: 'https://cms.example.com',
                status: 'auth'
            },
            {
                name: 'n8n Workflows',
                icon: 'fas fa-project-diagram',
                local: 'http://localhost:5678',
                prod: 'https://n8n.example.com',
                status: 'auth'
            },
            {
                name: 'Portainer',
                icon: 'fas fa-cubes',
                local: 'http://localhost:9002',
                prod: 'https://portainer.example.com',
                status: 'auth'
            }
        ],
        monitoring: [
            {
                name: 'Grafana',
                icon: 'fas fa-chart-area',
                local: 'http://localhost:3000',
                prod: 'https://grafana.example.com',
                status: 'auth'
            },
            {
                name: 'Prometheus',
                icon: 'fas fa-search',
                local: 'http://localhost:9090',
                prod: 'https://prometheus.example.com',
                status: 'internal',
                skipHealthCheck: true
            },
            {
                name: 'Node Exporter',
                icon: 'fas fa-chart-line',
                local: 'http://localhost:9100',
                prod: 'https://node-exporter.example.com',
                status: 'internal',
                skipHealthCheck: true
            },
            {
                name: 'cAdvisor',
                icon: 'fas fa-server',
                local: 'http://localhost:9200',
                prod: 'https://cadvisor.example.com',
                status: 'internal',
                skipHealthCheck: true
            }
        ],
        premium: [
            {
                name: 'Superset BI',
                icon: 'fas fa-chart-bar',
                local: 'http://localhost:8088',
                prod: 'https://bi.example.com',
                status: 'auth'
            },
            {
                name: 'Qdrant Vector DB',
                icon: 'fas fa-database',
                local: 'http://localhost:6333',
                prod: 'https://qdrant.example.com',
                status: 'internal',
                skipHealthCheck: true
            },
            {
                name: 'PostgreSQL',
                icon: 'fas fa-table',
                local: 'http://localhost:5432',
                prod: 'https://postgres.example.com',
                status: 'internal',
                skipHealthCheck: true
            }
        ],
        internal: [
            {
                name: 'Ollama API',
                icon: 'fas fa-brain',
                local: 'http://localhost:11434',
                prod: 'https://ollama.example.com',
                status: 'internal',
                skipHealthCheck: true
            },
            {
                name: 'API Backend',
                icon: 'fas fa-cog',
                local: 'http://localhost:8000',
                prod: 'https://api.example.com',
                status: 'internal'
            },
            {
                name: 'MinIO Storage',
                icon: 'fas fa-hdd',
                local: 'http://localhost:9000',
                prod: 'https://minio.example.com',
                status: 'internal',
                skipHealthCheck: true
            }
        ]
    };

    // Fonction pour générer le HTML d'un item avec indicateur d'état
    function generateUrlItem(service, isLocal) {
        const url = isLocal ? service.local : service.prod;
        const statusClass = service.status;
        const statusText = {
            'public': 'Public',
            'auth': 'Auth',
            'internal': 'Internal'
        }[service.status];

        // Extraire le nom court du service pour la vérification de santé
        const serviceKey = service.name.toLowerCase().replace(/\s+/g, '-');
        const healthId = `health-${serviceKey}`;

        // Désactiver le lien pour les services internes
        const isInternal = service.status === 'internal';
        const linkDisabled = isInternal ? 'disabled' : '';
        const linkHref = isInternal ? '#' : url;
        const linkClick = isInternal ? 'onclick="return false;"' : '';

        return `
            <div class="url-item">
                <div class="url-item-left">
                    <span class="url-item-icon"><i class="${service.icon}"></i></span>
                    <span class="url-item-name">${service.name}</span>
                    <span class="url-health-dot" id="${healthId}" title="Vérification...">
                        <i class="fas fa-circle" style="color: #6b7280; font-size: 8px;"></i>
                    </span>
                </div>
                <div class="url-item-right">
                    <span class="url-status-badge ${statusClass}">${statusText}</span>
                    <a href="${linkHref}" target="_blank" class="url-link-btn ${linkDisabled}" ${linkClick} title="${isInternal ? 'Service interne non accessible' : 'Ouvrir ' + service.name}">
                        <i class="fas fa-${isInternal ? 'lock' : 'external-link-alt'}"></i>
                    </a>
                </div>
            </div>
        `;
    }

    // Peupler chaque catégorie
    const mainList = document.getElementById('mainUrlsList');
    const monitoringList = document.getElementById('monitoringUrlsList');
    const premiumList = document.getElementById('premiumUrlsList');
    const internalList = document.getElementById('internalUrlsList');

    if (mainList) {
        mainList.innerHTML = services.main.map(service => generateUrlItem(service, isLocal)).join('');
    }

    if (monitoringList) {
        monitoringList.innerHTML = services.monitoring.map(service => generateUrlItem(service, isLocal)).join('');
    }

    if (premiumList) {
        premiumList.innerHTML = services.premium.map(service => generateUrlItem(service, isLocal)).join('');
    }

    if (internalList) {
        internalList.innerHTML = services.internal.map(service => generateUrlItem(service, isLocal)).join('');
    }

    // Vérifier la santé des services après le rendu
    setTimeout(() => checkQuickUrlsHealth(services, isLocal), 500);
}

// Vérifier la santé des services dans Quick URLs
async function checkQuickUrlsHealth(services, isLocal) {
    const allServices = [
        ...services.main,
        ...services.monitoring,
        ...services.premium,
        ...services.internal
    ];

    for (const service of allServices) {
        const serviceKey = service.name.toLowerCase().replace(/\s+/g, '-');
        const healthId = `health-${serviceKey}`;
        const healthDot = document.getElementById(healthId);

        if (!healthDot) continue;

        // Si le service doit ignorer le healthcheck (service interne non exposé)
        if (service.skipHealthCheck) {
            healthDot.innerHTML = '<i class="fas fa-circle" style="color: #6b7280; font-size: 8px;"></i>';
            healthDot.title = 'Service interne (non vérifié)';
            continue;
        }

        const url = isLocal ? service.local : service.prod;

        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: AbortSignal.timeout(2000)
            });

            // Mode no-cors retourne toujours opaque, donc on considère que le service répond
            healthDot.innerHTML = '<i class="fas fa-circle" style="color: #10b981; font-size: 8px;"></i>';
            healthDot.title = 'En ligne';
        } catch (error) {
            healthDot.innerHTML = '<i class="fas fa-circle" style="color: #ef4444; font-size: 8px;"></i>';
            healthDot.title = 'Hors ligne ou non accessible';
        }
    }
}
