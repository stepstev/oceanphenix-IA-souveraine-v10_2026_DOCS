/**
 * 🌊 OceanPhenix Admin Hub - Application Principale
 * ==================================================
 * Initialisation globale et gestion de l'interface
 */

const App = {
    // État de l'application
    state: {
        isLoading: false,
        currentPage: null,
        user: null,
        services: [],
        lastUpdate: null
    },
    
    // Intervalles de rafraîchissement
    intervals: {
        main: null
    },
    
    /**
     * Initialisation de l'application
     */
    init() {
        console.log('🚀 Initialisation de l\'application...');
        
        // Charger le thème
        this.loadTheme();
        
        // Initialiser les composants
        this.initSidebar();
        this.initThemeToggle();
        this.initUserMenu();
        
        // Détecter la page actuelle
        this.detectCurrentPage();
        
        // Vérifier la connexion API
        this.checkAPIConnection();
        
        // Démarrer le rafraîchissement auto
        if (CONFIG.SETTINGS.REFRESH_INTERVAL > 0) {
            this.startAutoRefresh();
        }
        
        console.log('✓ Application initialisée');
    },
    
    /**
     * Détection de la page actuelle
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        this.state.currentPage = page;
        
        console.log(`📄 Page actuelle : ${page}`);
        
        // Marquer le lien actif dans la sidebar
        this.setActiveNavLink(page);
    },
    
    /**
     * Marquer le lien actif dans la navigation
     */
    setActiveNavLink(page) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(page)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    /**
     * Vérifier la connexion à l'API
     */
    async checkAPIConnection() {
        try {
            const health = await API.getHealthSimple();
            
            if (health && health.status === 'healthy') {
                this.updateAPIStatus(true);
                console.log('✓ API connectée');
            } else {
                this.updateAPIStatus(false);
                console.warn('⚠️ API en mode dégradé');
            }
        } catch (error) {
            this.updateAPIStatus(false);
            console.error('✗ API non accessible', error.message);
        }
    },
    
    /**
     * Mettre à jour le statut API dans l'interface
     */
    updateAPIStatus(isConnected) {
        const statusIndicator = document.getElementById('api-status-indicator');
        const statusText = document.getElementById('api-status-text');
        
        if (statusIndicator) {
            statusIndicator.className = isConnected 
                ? 'status-dot status-dot-animated bg-success' 
                : 'status-dot bg-danger';
        }
        
        if (statusText) {
            statusText.textContent = isConnected ? 'API Connectée' : 'API Déconnectée';
            statusText.className = isConnected ? 'text-success' : 'text-danger';
        }
    },
    
    /**
     * Démarrer le rafraîchissement automatique
     */
    startAutoRefresh() {
        const interval = CONFIG.SETTINGS.REFRESH_INTERVAL;
        
        this.intervals.main = setInterval(() => {
            console.log('🔄 Rafraîchissement automatique...');
            this.refreshCurrentPage();
        }, interval);
        
        console.log(`✓ Auto-refresh activé (${interval / 1000}s)`);
    },
    
    /**
     * Arrêter le rafraîchissement automatique
     */
    stopAutoRefresh() {
        if (this.intervals.main) {
            clearInterval(this.intervals.main);
            this.intervals.main = null;
            console.log('✓ Auto-refresh désactivé');
        }
    },
    
    /**
     * Rafraîchir la page actuelle
     */
    refreshCurrentPage() {
        // Dispatch event pour que chaque page gère son refresh
        const event = new CustomEvent('app:refresh');
        window.dispatchEvent(event);
        
        this.state.lastUpdate = new Date();
    },
    
    /**
     * Initialisation de la sidebar
     */
    initSidebar() {
        const sidebar = document.querySelector('.navbar-menu');
        const toggle = document.querySelector('[data-bs-toggle="collapse"]');
        
        if (sidebar && toggle) {
            // Mobile : fermer la sidebar au clic sur un lien
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992) {
                        const collapse = bootstrap.Collapse.getInstance(sidebar);
                        if (collapse) collapse.hide();
                    }
                });
            });
        }
    },
    
    /**
     * Initialisation du toggle thème
     */
    initThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    },
    
    /**
     * Charger le thème
     */
    loadTheme() {
        const theme = localStorage.getItem('opx_theme') || CONFIG.SETTINGS.DEFAULT_THEME;
        document.documentElement.setAttribute('data-bs-theme', theme);
        
        // Mettre à jour l'icône
        this.updateThemeIcon(theme);
    },
    
    /**
     * Basculer le thème
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('opx_theme', newTheme);
        
        this.updateThemeIcon(newTheme);
        
        Utils.showToast(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'success');
    },
    
    /**
     * Mettre à jour l'icône du thème
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    },
    
    /**
     * Initialisation du menu utilisateur
     */
    initUserMenu() {
        // Charger les infos utilisateur depuis localStorage
        const userName = localStorage.getItem('opx_user_name') || 'Administrateur';
        const userEmail = localStorage.getItem('opx_user_email') || 'admin@oceanphenix.fr';
        
        this.state.user = { name: userName, email: userEmail };
        
        // Mettre à jour l'interface
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        
        if (userNameEl) userNameEl.textContent = userName;
        if (userEmailEl) userEmailEl.textContent = userEmail;
    },
    
    /**
     * Déconnexion
     */
    logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Nettoyer le localStorage
            localStorage.removeItem('opx_auth_token');
            localStorage.removeItem('opx_user_name');
            localStorage.removeItem('opx_user_email');
            
            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
        }
    },
    
    /**
     * Ouvrir la configuration
     */
    openSettings() {
        window.location.href = 'pages/settings.html';
    }
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Gestion du beforeunload (nettoyage)
window.addEventListener('beforeunload', () => {
    App.stopAutoRefresh();
});

// Export global
window.App = App;

console.log('✓ App.js chargé');
