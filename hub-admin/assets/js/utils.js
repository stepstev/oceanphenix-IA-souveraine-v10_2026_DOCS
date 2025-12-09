/**
 * 🌊 OceanPhenix Admin Hub - Utilitaires
 * =======================================
 * Fonctions utilitaires réutilisables
 */

const Utils = {
    /**
     * Formatage des nombres
     */
    formatNumber(num) {
        if (num === null || num === undefined) return 'N/A';
        return new Intl.NumberFormat('fr-FR').format(num);
    },
    
    /**
     * Formatage de la taille des fichiers
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0 || bytes === null) return '0 Octets';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * Formatage de la date
     */
    formatDate(date, format = 'full') {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        
        if (format === 'full') {
            return d.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (format === 'short') {
            return d.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
        
        if (format === 'time') {
            return d.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        if (format === 'relative') {
            return this.timeAgo(d);
        }
        
        return d.toISOString();
    },
    
    /**
     * Temps relatif (il y a X minutes)
     */
    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' an' + (interval > 2 ? 's' : '');
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' mois';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' jour' + (interval > 2 ? 's' : '');
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' heure' + (interval > 2 ? 's' : '');
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minute' + (interval > 2 ? 's' : '');
        
        return 'À l\'instant';
    },
    
    /**
     * Formatage du pourcentage
     */
    formatPercent(value, decimals = 1) {
        if (value === null || value === undefined) return 'N/A';
        return value.toFixed(decimals) + '%';
    },
    
    /**
     * Arrondi
     */
    round(value, decimals = 2) {
        if (value === null || value === undefined) return 0;
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    /**
     * Couleur selon le statut
     */
    getStatusColor(status) {
        const statusLower = status.toLowerCase();
        
        if (statusLower === 'healthy' || statusLower === 'running' || statusLower === 'active') {
            return 'success';
        }
        if (statusLower === 'degraded' || statusLower === 'warning') {
            return 'warning';
        }
        if (statusLower === 'unhealthy' || statusLower === 'error' || statusLower === 'stopped') {
            return 'danger';
        }
        return 'secondary';
    },
    
    /**
     * Badge selon le statut
     */
    getStatusBadge(status) {
        const color = this.getStatusColor(status);
        const label = this.getStatusLabel(status);
        return `<span class="badge bg-${color}">${label}</span>`;
    },
    
    /**
     * Label selon le statut
     */
    getStatusLabel(status) {
        const labels = {
            'healthy': 'Opérationnel',
            'running': 'En cours',
            'active': 'Actif',
            'degraded': 'Dégradé',
            'warning': 'Attention',
            'unhealthy': 'Hors ligne',
            'error': 'Erreur',
            'stopped': 'Arrêté',
            'paused': 'En pause'
        };
        
        return labels[status.toLowerCase()] || status;
    },
    
    /**
     * Icône selon le statut
     */
    getStatusIcon(status) {
        const icons = {
            'healthy': 'ti-check',
            'running': 'ti-player-play',
            'active': 'ti-circle-check',
            'degraded': 'ti-alert-triangle',
            'warning': 'ti-alert-circle',
            'unhealthy': 'ti-circle-x',
            'error': 'ti-x',
            'stopped': 'ti-player-stop',
            'paused': 'ti-player-pause'
        };
        
        return icons[status.toLowerCase()] || 'ti-help';
    },
    
    /**
     * Notification toast
     */
    showToast(message, type = 'info') {
        // Simple alert pour l'instant (à remplacer par Tabler toast)
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const toast = document.createElement('div');
        toast.className = `alert ${alertClass} alert-dismissible fade show`;
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },
    
    /**
     * Loader spinner
     */
    showLoader(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="text-muted mt-3">Chargement des données...</p>
                </div>
            `;
        }
    },
    
    /**
     * Message d'erreur
     */
    showError(elementId, message = 'Une erreur est survenue') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="alert alert-danger">
                    <i class="ti ti-alert-circle me-2"></i>
                    ${message}
                </div>
            `;
        }
    },
    
    /**
     * Message "pas de données"
     */
    showEmpty(elementId, message = 'Aucune donnée disponible') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="ti ti-inbox fs-1 mb-3"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    /**
     * Copier dans le presse-papier
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copié dans le presse-papier', 'success');
            return true;
        } catch (err) {
            this.showToast('Erreur de copie', 'error');
            return false;
        }
    },
    
    /**
     * Télécharger un fichier JSON
     */
    downloadJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    /**
     * Debounce (limite le nombre d'appels d'une fonction)
     */
    debounce(func, wait = 300) {
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
     * Throttle (limite la fréquence d'exécution)
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Générer un ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Vérifier si un élément est visible dans le viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export global
window.Utils = Utils;

console.log('✓ Utilitaires chargés');
