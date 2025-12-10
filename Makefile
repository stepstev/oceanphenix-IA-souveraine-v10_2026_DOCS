# ═══════════════════════════════════════════════════════════════════════════
# 🌊 OceanPhenix V10 - Makefile Administration
# ═══════════════════════════════════════════════════════════════════════════

.PHONY: help install start stop restart logs clean status backup restore

# 🛠️ Commandes par défaut
help:
	@echo "🌊 OceanPhenix V10 Manager"
	@echo "----------------------------------------------------------------"
	@echo "make install    : Prépare l'environnement (fichiers, réseaux)"
	@echo "make start      : Démarre tous les services (Profile 'all')"
	@echo "make stop       : Arrête tous les services"
	@echo "make restart    : Redémarre tout"
	@echo "make logs       : Affiche les logs en temps réel"
	@echo "make status     : Affiche l'état des services"
	@echo "make clean      : Nettoie les conteneurs et réseaux orphelins"
	@echo "make backup     : Sauvegarde les données importantes"
	@echo "make restore    : Restaure depuis une sauvegarde"
	@echo "----------------------------------------------------------------"

# 🚀 Installation
install:
	@echo "🔧 Initialisation de V10..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env créé depuis .env.example (Pensez à éditer les secrets !)"; \
	else \
		echo "ℹ️ .env existe déjà"; \
	fi
	@docker network create v10_proxy 2>/dev/null || true
	@docker network create v10_internal 2>/dev/null || true
	@echo "✅ Réseaux Docker créés"

# ▶️ Démarrage
start:
	@echo "🚀 Démarrage de la stack complète..."
	@docker-compose --profile all up -d --remove-orphans
	@echo "✅ Services démarrés sur https://localhost (si Caddy actif)"

# ⏹️ Arrêt
stop:
	@echo "🛑 Arrêt des services..."
	@docker-compose --profile all down

# 🔄 Redémarrage
restart: stop start

# 📜 Logs
logs:
	@docker-compose logs -f --tail=50

# 🧹 Nettoyage
clean:
	@docker-compose down --remove-orphans
	@docker system prune -f

# 📊 Statut des services
status:
	@echo "📊 État des services OceanPhenix V10..."
	@docker-compose ps

# 💾 Sauvegarde des données
backup:
	@echo "💾 Sauvegarde des données..."
	@mkdir -p backups
	@docker run --rm -v oceanphenix-v10_qdrant_data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/qdrant-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@docker run --rm -v oceanphenix-v10_minio_data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/minio-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Sauvegarde terminée dans ./backups/"

# 🔄 Restauration depuis sauvegarde
restore:
	@echo "🔄 Restauration depuis sauvegarde..."
	@echo "Listez vos sauvegardes avec: ls -lh backups/"
	@echo "Utilisez: docker run --rm -v oceanphenix-v10_qdrant_data:/data -v $(PWD)/backups:/backup alpine tar xzf /backup/VOTRE_FICHIER.tar.gz -C /data"
