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
        studio: 'http://localhost:3000/health',
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

        postgres: null, // Vérification via API backend
        valkey: null
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
    initWebUIModal();
    initThemeToggle(); // Gestionnaire du changement de thème
    initMonitoringButtons(); // Nouvelle fonction pour les boutons monitoring
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
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
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
 * Initialisation des boutons de monitoring
 */
function initMonitoringButtons() {
    const monitoringPlatform = document.getElementById('monitoring-platform');
    const monitoringContainers = document.getElementById('monitoring-containers');

    if (monitoringPlatform) {
        monitoringPlatform.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(
                'http://localhost:3001/d/oceanphenix-platform-health/oceanphenix-platform-health?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s&kiosk',
                'Monitoring - Santé Plateforme'
            );
        });
    }

    if (monitoringContainers) {
        monitoringContainers.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(
                'http://localhost:3001/d/oceanphenix-containers-monitoring/oceanphenix-containers-monitoring?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s&kiosk',
                'Monitoring - Conteneurs Docker'
            );
        });
    }
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
            populateQuickUrls(); // Mettre à jour l'affichage des services
        } else {
            // Si l'API backend n'est pas disponible, vérifier les services localement
            await checkServicesHealthLocal();
        }
    } catch (e) {
        // Mode local : API backend non disponible, vérifier localement
        await checkServicesHealthLocal();
    }
}

// Vérification locale de la santé des services
async function checkServicesHealthLocal() {
    const services = [];

    for (const [serviceName, endpoint] of Object.entries(CONFIG.SERVICES_ENDPOINTS)) {
        let status = 'unknown';

        if (!endpoint) {
            status = 'internal';
        } else {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const response = await fetch(endpoint, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                // En mode no-cors, la requête réussit si le service répond
                status = 'up';
            } catch (error) {
                status = 'down';
            }
        }

        services.push({
            name: serviceName,
            status: status,
            healthcheck_url: endpoint
        });
    }

    state.services = services;
    populateQuickUrls();
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

    const supersetDiagram = document.getElementById('link-superset-diagram');

    // Note: Ollama n'a pas de WebUI, lien vers l'API
    if (ollamaDiagram) ollamaDiagram.href = `${protocol}://localhost:11434`;

    // Gestionnaires d'événements pour ouvrir les services en popup centrée
    if (qdrantDiagram) {
        qdrantDiagram.href = '#';
        qdrantDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:6333/dashboard`, 'Qdrant Dashboard');
        });
    }

    if (minioLink) {
        minioLink.href = '#';
        minioLink.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:9001`, 'MinIO Console');
        });
    }

    if (minioDiagram) {
        minioDiagram.href = '#';
        minioDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:9001`, 'MinIO Console');
        });
    }

    if (n8nLink) {
        n8nLink.href = '#';
        n8nLink.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:5678`, 'n8n Workflow');
        });
    }

    if (n8nDiagram) {
        n8nDiagram.href = '#';
        n8nDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:5678`, 'n8n Workflow');
        });
    }

    if (grafanaLink) {
        grafanaLink.href = '#';
        grafanaLink.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup('http://localhost:3001/d/oceanphenix-platform-health/oceanphenix-platform-health?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s', 'Grafana - OceanPhenix Health');
        });
    }

    if (grafanaDiagram) {
        grafanaDiagram.href = '#';
        grafanaDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup('http://localhost:3001/d/oceanphenix-platform-health/oceanphenix-platform-health?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s', 'Grafana - OceanPhenix Health');
        });
    }

    if (grafanaKpi) {
        grafanaKpi.href = '#';
        grafanaKpi.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup('http://localhost:3001/d/oceanphenix-platform-health/oceanphenix-platform-health?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s', 'Grafana - OceanPhenix Health');
        });
    }

    if (portainerLink) {
        portainerLink.href = '#';
        portainerLink.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup('https://localhost:9443', 'Portainer');
        });
    }

    if (portainerDiagram) {
        portainerDiagram.href = '#';
        portainerDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup('https://localhost:9443', 'Portainer');
        });
    }

    if (prometheusDiagram) {
        prometheusDiagram.href = '#';
        prometheusDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:9090`, 'Prometheus');
        });
    }

    if (alertmanagerDiagram) {
        alertmanagerDiagram.href = '#';
        alertmanagerDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:9093`, 'Alertmanager');
        });
    }



    if (supersetDiagram) {
        supersetDiagram.href = '#';
        supersetDiagram.addEventListener('click', (e) => {
            e.preventDefault();
            openServicePopup(`${protocol}://localhost:8088`, 'Apache Superset');
        });
    }
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
 * Ouvre un service dans une fenêtre popup centrée
 * @param {string} url - URL du service à ouvrir
 * @param {string} serviceName - Nom du service (pour le titre de la fenêtre)
 * @param {number} widthPercent - Largeur en pourcentage de l'écran (par défaut 75%)
 * @param {number} heightPercent - Hauteur en pourcentage de l'écran (par défaut 75%)
 */
function openServicePopup(url, serviceName = 'Service', widthPercent = 75, heightPercent = 75) {
    const screenWidth = window.screen.availWidth || window.screen.width;
    const screenHeight = window.screen.availHeight || window.screen.height;
    const width = Math.round(screenWidth * (widthPercent / 100));
    const height = Math.round(screenHeight * (heightPercent / 100));
    const left = Math.round((screenWidth - width) / 2) + (window.screen.availLeft || 0);
    const top = Math.round((screenHeight - height) / 2) + (window.screen.availTop || 0);

    const popup = window.open(
        url,
        serviceName.replace(/\s+/g, '_'),
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no`
    );

    if (popup) popup.focus();
    else window.open(url, '_blank');
}

/**
 * Initialise le modal Open WebUI
 */
function initWebUIModal() {
    const webuiModal = document.getElementById('webui-modal');
    const webuiModalClose = document.getElementById('webui-modal-close');
    const webuiIframe = document.getElementById('webui-iframe');

    // Links qui déclenchent la modal
    const studioLinks = [
        document.getElementById('link-studio-diagram'),
        document.getElementById('link-studio-external')
    ];

    // Vérifier le mode (o2switch = popup, local = modal ou popup)
    const isO2switch = window.OCEANPHENIX_CONFIG?.apiUrlDefault?.includes('oceanphenix.fr') ||
        window.location.hostname !== 'localhost';

    // Ouvrir la modal ou popup selon le mode
    studioLinks.forEach(link => {
        link?.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href || 'http://localhost:3000';
            openServicePopup(url, 'Open WebUI Studio', 75, 75);
        });
    });

    // Fermer le modal avec le bouton X (garde pour compatibilité)
    webuiModalClose?.addEventListener('click', () => {
        closeWebUIModal();
    });

    // Fermer le modal en cliquant en dehors
    webuiModal?.addEventListener('click', (e) => {
        if (e.target === webuiModal) {
            closeWebUIModal();
        }
    });

    // Fermer le modal avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && webuiModal.style.display === 'flex') {
            closeWebUIModal();
        }
    });

    // Style initial pour l'animation
    const modalContent = webuiModal?.querySelector('.webui-modal-content');
    if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    function closeWebUIModal() {
        const modalContent = webuiModal.querySelector('.webui-modal-content');
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            webuiModal.style.display = 'none';
            webuiIframe.src = ''; // Libérer les ressources
        }, 300);
    }
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

    // Fermer le modal en dehors
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

/**
 * Initialise le bouton de changement de thème
 */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('oceanphenix_theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateThemeIcon(themeToggleBtn, 'light');
    }

    // Événement de changement de thème
    themeToggleBtn?.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        
        // Sauvegarder le thème
        localStorage.setItem('oceanphenix_theme', isLight ? 'light' : 'dark');
        
        // Mettre à jour l'icône
        updateThemeIcon(themeToggleBtn, isLight ? 'light' : 'dark');
    });
}

/**
 * Met à jour l'icône du bouton de thème
 */
function updateThemeIcon(button, theme) {
    const icon = button?.querySelector('i');
    if (icon) {
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Populate Quick Access URLs
function populateQuickUrls() {
    // Définir les catégories de services
    const serviceCategories = {
        main: ['studio', 'openwebui', 'ollama', 'qdrant', 'api'],
        monitoring: ['grafana', 'prometheus', 'cadvisor', 'node-exporter', 'alertmanager'],
        bi: ['superset'],
        infra: ['minio', 'portainer', 'n8n', 'caddy', 'postgres', 'valkey']
    };

    // Créer la liste complète des services depuis CONFIG.SERVICES_ENDPOINTS
    const allServices = [];

    for (const [serviceName, endpoint] of Object.entries(CONFIG.SERVICES_ENDPOINTS)) {
        const serviceInfo = state.services?.find(s => s.name.toLowerCase() === serviceName.toLowerCase());

        const service = {
            name: serviceName,
            status: serviceInfo?.status || 'unknown',
            healthcheck_url: endpoint,
            displayName: serviceName.charAt(0).toUpperCase() + serviceName.slice(1).replace(/-/g, ' ')
        };

        allServices.push(service);
    }

    // Organiser les services par catégorie
    const categorizedServices = {
        main: [],
        monitoring: [],
        bi: [],
        infra: []
    };

    allServices.forEach(service => {
        for (const [category, serviceNames] of Object.entries(serviceCategories)) {
            if (serviceNames.includes(service.name.toLowerCase())) {
                categorizedServices[category].push(service);
                break;
            }
        }
    });

    // Fonction pour générer le HTML d'un service avec puce colorée
    function generateServiceItem(service) {
        let statusColor = '#6b7280'; // Gris par défaut (non exposé/unknown)
        let statusIcon = 'fa-circle';

        // Déterminer la couleur selon le statut
        if (!service.healthcheck_url) {
            statusColor = '#6b7280'; // Gris - Non exposé
        } else if (service.status === 'up' || service.status === 'healthy') {
            statusColor = '#10b981'; // Vert - Actif
        } else if (service.status === 'down' || service.status === 'unhealthy') {
            statusColor = '#ef4444'; // Rouge - Inactif
        } else {
            statusColor = '#6b7280'; // Gris - Statut inconnu
        }

        // Badge type de service
        let badge = '';
        if (!service.healthcheck_url) {
            badge = '<span class="url-status-badge internal">Internal</span>';
        } else if (['grafana', 'portainer', 'n8n', 'superset'].includes(service.name.toLowerCase())) {
            badge = '<span class="url-status-badge auth">Auth</span>';
        } else {
            badge = '<span class="url-status-badge public">Public</span>';
        }

        // Déterminer l'URL du service
        const serviceUrls = {
            'studio': 'http://localhost:3000',
            'openwebui': 'http://localhost:3000',
            'grafana': 'http://localhost:3001/d/oceanphenix-platform-health/oceanphenix-platform-health?orgId=1&from=now-6h&to=now&timezone=Europe%2FParis&refresh=30s',
            'prometheus': 'http://localhost:9090',
            'portainer': 'https://localhost:9443',
            'minio': 'http://localhost:9001',
            'n8n': 'http://localhost:5678',
            'superset': 'http://localhost:8088',
            'cadvisor': 'http://localhost:8080',
            'ollama': 'http://localhost:11434',
            'qdrant': 'http://localhost:6333/dashboard'
        };

        const serviceUrl = serviceUrls[service.name.toLowerCase()];
        const isClickable = serviceUrl && (service.status === 'up' || service.status === 'healthy' || service.status === 'unknown');
        const cursorStyle = isClickable ? 'cursor: pointer;' : 'cursor: default; opacity: 0.6;';

        return `
            <div class="url-item" style="${cursorStyle}" data-service-url="${serviceUrl || ''}" data-service-name="${service.displayName}">
                <div class="url-item-left">
                    <span class="url-health-dot">
                        <i class="fas ${statusIcon}" style="color: ${statusColor}; font-size: 10px;"></i>
                    </span>
                    <span class="url-item-name">${service.displayName}</span>
                </div>
                <div class="url-item-right">
                    ${badge}
                    ${isClickable ? '<i class="fas fa-external-link-alt" style="margin-left: 8px; font-size: 12px; color: #0c4a6e; opacity: 0.8;"></i>' : ''}
                </div>
            </div>
        `;
    }

    // Fonction pour attacher les événements de clic aux services
    function attachServiceClickHandlers(listElement) {
        if (!listElement) return;

        const serviceItems = listElement.querySelectorAll('.url-item[data-service-url]');
        serviceItems.forEach(item => {
            const url = item.getAttribute('data-service-url');
            const serviceName = item.getAttribute('data-service-name');

            if (url) {
                item.addEventListener('click', () => {
                    openServicePopup(url, serviceName, 80, 85);
                });

                // Ajouter un effet hover
                item.addEventListener('mouseenter', () => {
                    item.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.backgroundColor = '';
                });
            }
        });
    }

    // Peupler chaque catégorie
    const mainList = document.getElementById('mainServicesList');
    const monitoringList = document.getElementById('monitoringServicesList');
    const biList = document.getElementById('biServicesList');
    const infraList = document.getElementById('infraServicesList');

    if (mainList) {
        mainList.innerHTML = categorizedServices.main.length > 0
            ? categorizedServices.main.map(service => generateServiceItem(service)).join('')
            : '<div class="url-item"><span class="url-item-name" style="color: #6b7280;">Aucun service</span></div>';
        attachServiceClickHandlers(mainList);
    }

    if (monitoringList) {
        monitoringList.innerHTML = categorizedServices.monitoring.length > 0
            ? categorizedServices.monitoring.map(service => generateServiceItem(service)).join('')
            : '<div class="url-item"><span class="url-item-name" style="color: #6b7280;">Aucun service</span></div>';
        attachServiceClickHandlers(monitoringList);
    }

    if (biList) {
        biList.innerHTML = categorizedServices.bi.length > 0
            ? categorizedServices.bi.map(service => generateServiceItem(service)).join('')
            : '<div class="url-item"><span class="url-item-name" style="color: #6b7280;">Aucun service</span></div>';
        attachServiceClickHandlers(biList);
    }

    if (infraList) {
        infraList.innerHTML = categorizedServices.infra.length > 0
            ? categorizedServices.infra.map(service => generateServiceItem(service)).join('')
            : '<div class="url-item"><span class="url-item-name" style="color: #6b7280;">Aucun service</span></div>';
        attachServiceClickHandlers(infraList);
    }
}

/**
 * Initialise les liens de documentation API dans la sidebar
 */
function initAPIDocLinks() {
    const apiDocLinks = document.querySelectorAll('.api-doc-link');
    
    apiDocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('data-api-url');
            const name = link.getAttribute('data-api-name');
            
            // Ouvrir dans une popup centrée à 70% de largeur
            openServicePopup(url, name, 70, 90);
        });
    });
}

// Appeler l'initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initAPIDocLinks();
});

