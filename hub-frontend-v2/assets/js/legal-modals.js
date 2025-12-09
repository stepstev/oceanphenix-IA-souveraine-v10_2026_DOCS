// ═══════════════════════════════════════════════════════════════════════════
// 📜 JavaScript Modals Juridiques - OceanPhenix
// Compatible O2Switch - JavaScript Vanilla (pas de dépendances)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ouvre une modal juridique
 * @param {string} type - Type de modal : 'cgu', 'mentions', 'confidentialite', 'licence'
 */
function openLegalModal(type) {
    const modalId = 'legal-modal-' + type;
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.add('show');
        modal.classList.remove('hide');

        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';

        // Analytics (optionnel, compatible O2Switch)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'open_legal_modal', {
                'event_category': 'legal',
                'event_label': type
            });
        }

        console.log('✅ Modal juridique ouverte :', type);
    } else {
        console.error('❌ Modal introuvable :', modalId);
    }
}

/**
 * Ferme une modal juridique
 * @param {string} type - Type de modal : 'cgu', 'mentions', 'confidentialite', 'licence'
 */
function closeLegalModal(type) {
    const modalId = 'legal-modal-' + type;
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.add('hide');
        modal.classList.remove('show');

        // Réactiver le scroll du body
        document.body.style.overflow = '';

        // Supprimer la modal après l'animation
        setTimeout(() => {
            modal.classList.remove('hide');
        }, 300);

        console.log('✅ Modal juridique fermée :', type);
    }
}

/**
 * Ferme la modal en cliquant en dehors du contenu
 */
document.addEventListener('DOMContentLoaded', function () {
    const modals = ['cgu', 'mentions', 'confidentialite', 'licence'];

    modals.forEach(type => {
        const modalId = 'legal-modal-' + type;
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.addEventListener('click', function (e) {
                // Fermer si on clique sur l'overlay (pas sur le contenu)
                if (e.target === modal) {
                    closeLegalModal(type);
                }
            });
        }
    });

    console.log('✅ Modals juridiques initialisées');
});

/**
 * Gestion du clavier (ESC pour fermer)
 */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
        const modals = ['cgu', 'mentions', 'confidentialite', 'licence'];

        modals.forEach(type => {
            const modalId = 'legal-modal-' + type;
            const modal = document.getElementById(modalId);

            if (modal && modal.classList.contains('show')) {
                closeLegalModal(type);
            }
        });

        // Fermer aussi la modal services
        const servicesModal = document.getElementById('services-modal');
        if (servicesModal && servicesModal.classList.contains('show')) {
            closeServicesModal();
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// 💼 MODAL SERVICES (Offres Freelance)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ouvre la modal Services
 */
function openServicesModal() {
    const modal = document.getElementById('services-modal');

    if (modal) {
        modal.classList.add('show');
        modal.classList.remove('hide');

        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';

        console.log('✅ Modal Services ouverte');
    } else {
        console.error('❌ Modal Services introuvable');
    }
}

/**
 * Ferme la modal Services
 */
function closeServicesModal() {
    const modal = document.getElementById('services-modal');

    if (modal) {
        modal.classList.add('hide');
        modal.classList.remove('show');

        // Réactiver le scroll du body
        document.body.style.overflow = '';

        // Supprimer la modal après l'animation
        setTimeout(() => {
            modal.classList.remove('hide');
        }, 300);

        console.log('✅ Modal Services fermée');
    }
}

/**
 * Ferme la modal services en cliquant en dehors du contenu
 */
document.addEventListener('DOMContentLoaded', function () {
    const servicesModal = document.getElementById('services-modal');

    if (servicesModal) {
        servicesModal.addEventListener('click', function (e) {
            // Fermer si on clique sur l'overlay (pas sur le contenu)
            if (e.target === servicesModal) {
                closeServicesModal();
            }
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// Fonction utilitaire pour tester les modals (console)
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.testLegalModals = function () {
        console.log('🧪 Test des modals juridiques...');

        const types = ['cgu', 'mentions', 'confidentialite', 'licence'];
        let i = 0;

        function testNext() {
            if (i < types.length) {
                const type = types[i];
                console.log(`   Test ${i + 1}/4 : ${type}`);
                openLegalModal(type);

                setTimeout(() => {
                    closeLegalModal(type);
                    i++;
                    setTimeout(testNext, 500);
                }, 2000);
            } else {
                console.log('✅ Tous les tests passés !');
            }
        }

        testNext();
    };

    console.log('💡 Utilisez testLegalModals() pour tester toutes les modals');
}
