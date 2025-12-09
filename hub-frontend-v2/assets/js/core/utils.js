/**
 * 🧰 OceanPhenix Hub - Fonctions Utilitaires
 * 
 * Ensemble de fonctions helper réutilisables dans toute l'application.
 */

const Utils = {
    /**
     * Formatte une date en format lisible
     * @param {Date|string} date - Date à formatter
     * @returns {string} Date formatée
     */
    formatDate(date) {
        if (!date) return '--';
        const d = new Date(date);
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Formatte un timestamp relatif (il y a X minutes)
     * @param {Date|string} date - Date de référence
     * @returns {string} Temps relatif
     */
    getRelativeTime(date) {
        if (!date) return '--';
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);
        
        if (seconds < 60) return 'à l\'instant';
        if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
        return `il y a ${Math.floor(seconds / 86400)}j`;
    },
    
    /**
     * Débounce une fonction (évite les appels trop fréquents)
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Délai en ms
     * @returns {Function} Fonction débouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Affiche une notification toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type: success, error, warning, info
     */
    showToast(message, type = 'info') {
        // Implémentation simple - peut être améliorée avec une lib comme Toastify
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Créer un toast simple
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    /**
     * Valide une URL
     * @param {string} url - URL à valider
     * @returns {boolean} true si valide
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * Copie du texte dans le presse-papier
     * @param {string} text - Texte à copier
     * @returns {Promise<boolean>} true si succès
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copié dans le presse-papier', 'success');
            return true;
        } catch (err) {
            console.error('Erreur de copie:', err);
            this.showToast('Erreur lors de la copie', 'error');
            return false;
        }
    },
    
    /**
     * Récupère un paramètre de l'URL
     * @param {string} name - Nom du paramètre
     * @returns {string|null} Valeur du paramètre
     */
    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    /**
     * Met à jour l'URL sans recharger la page
     * @param {string} param - Nom du paramètre
     * @param {string} value - Valeur du paramètre
     */
    setUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },
    
    /**
     * Génère un ID unique
     * @returns {string} ID unique
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Échappe les caractères HTML
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
