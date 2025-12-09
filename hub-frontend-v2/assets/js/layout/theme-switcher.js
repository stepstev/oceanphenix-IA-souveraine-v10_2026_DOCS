/**
 * 🌓 OceanPhenix Hub - Gestionnaire de Thème
 * 
 * Gère le basculement entre mode clair et mode sombre.
 */

const ThemeSwitcher = {
    /**
     * Initialise le theme switcher
     */
    init() {
        console.log('🎨 Initialisation du theme switcher...');
        
        // Charger le thème sauvegardé
        this.loadSavedTheme();
        
        // Attacher les événements
        this.attachEvents();
        
        console.log('✅ Theme switcher initialisé');
    },
    
    /**
     * Charge le thème sauvegardé dans localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME.STORAGE_KEY) || CONFIG.THEME.DEFAULT;
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            this.updateIcon('light');
        } else {
            document.body.classList.remove('light-mode');
            this.updateIcon('dark');
        }
    },
    
    /**
     * Attache les événements au bouton de thème
     */
    attachEvents() {
        // Utiliser un setTimeout pour s'assurer que le bouton est chargé
        setTimeout(() => {
            const themeBtn = document.getElementById('theme-toggle-btn');
            
            if (!themeBtn) {
                console.warn('⚠️ Bouton de thème non trouvé');
                return;
            }
            
            themeBtn.addEventListener('click', () => this.toggle());
        }, 100);
    },
    
    /**
     * Bascule entre mode clair et mode sombre
     */
    toggle() {
        const body = document.body;
        const isLight = body.classList.toggle('light-mode');
        
        // Sauvegarder le choix
        const theme = isLight ? 'light' : 'dark';
        localStorage.setItem(CONFIG.THEME.STORAGE_KEY, theme);
        
        // Mettre à jour l'icône
        this.updateIcon(theme);
        
        // Feedback utilisateur
        Utils.showToast(
            `Mode ${isLight ? 'clair' : 'sombre'} activé`,
            'success'
        );
        
        console.log(`🎨 Thème basculé vers: ${theme}`);
    },
    
    /**
     * Met à jour l'icône du bouton selon le thème
     * @param {string} theme - 'light' ou 'dark'
     */
    updateIcon(theme) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        const icon = themeBtn?.querySelector('i');
        
        if (!icon) return;
        
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    },
    
    /**
     * Obtient le thème actuel
     * @returns {string} 'light' ou 'dark'
     */
    getCurrentTheme() {
        return document.body.classList.contains('light-mode') ? 'light' : 'dark';
    }
};

// Initialiser après chargement complet du DOM et des includes
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que les includes soient chargés
    setTimeout(() => {
        ThemeSwitcher.init();
    }, 200);
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSwitcher;
}
