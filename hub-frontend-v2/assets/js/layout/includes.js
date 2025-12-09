/**
 * 🧩 OceanPhenix Hub - Système d'Includes
 * 
 * Charge dynamiquement les composants HTML (header, sidebar, footer)
 * Compatible avec l'hébergement statique O2Switch.
 */

const Includes = {
    /**
     * Charge tous les includes de la page
     */
    async loadAll() {
        console.log('📦 Chargement des includes...');
        
        try {
            await Promise.all([
                this.loadSidebar(),
                this.loadHeader()
            ]);
            
            console.log('✅ Includes chargés');
            
            // Réinitialiser l'app après chargement des includes
            if (typeof App !== 'undefined' && App.init) {
                App.init();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des includes:', error);
        }
    },
    
    /**
     * Charge la sidebar
     */
    async loadSidebar() {
        const container = document.getElementById('sidebar-container');
        if (!container) {
            console.warn('⚠️ Container #sidebar-container non trouvé');
            return;
        }
        
        try {
            const response = await fetch('../includes/sidebar.html');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
            console.log('✓ Sidebar chargée');
        } catch (error) {
            console.error('❌ Erreur chargement sidebar:', error);
            container.innerHTML = '<p style="color: red;">Erreur de chargement de la sidebar</p>';
        }
    },
    
    /**
     * Charge le header
     */
    async loadHeader() {
        const container = document.getElementById('header-container');
        if (!container) {
            console.warn('⚠️ Container #header-container non trouvé');
            return;
        }
        
        try {
            const response = await fetch('../includes/header.html');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
            console.log('✓ Header chargé');
        } catch (error) {
            console.error('❌ Erreur chargement header:', error);
            container.innerHTML = '<p style="color: red;">Erreur de chargement du header</p>';
        }
    },
    
    /**
     * Charge un composant custom
     * @param {string} componentPath - Chemin vers le composant HTML
     * @param {string} containerId - ID du container de destination
     */
    async loadComponent(componentPath, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container #${containerId} non trouvé`);
            return;
        }
        
        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
            console.log(`✓ Composant ${componentPath} chargé`);
        } catch (error) {
            console.error(`❌ Erreur chargement composant ${componentPath}:`, error);
            container.innerHTML = `<p style="color: red;">Erreur de chargement du composant</p>`;
        }
    }
};

// Charger les includes au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    Includes.loadAll();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Includes;
}
