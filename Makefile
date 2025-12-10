# ═══════════════════════════════════════════════════════════════════════════
# 🌊 OceanPhenix V10 - Makefile Administration
# ═══════════════════════════════════════════════════════════════════════════

.PHONY: help install start stop restart logs clean v8-migrate

# 🛠️ Commandes par défaut
help:
	@echo "🌊 OceanPhenix V10 Manager"
	@echo "----------------------------------------------------------------"
	@echo "make install    : Prépare l'environnement (fichiers, réseaux)"
	@echo "make start      : Démarre tous les services (Profile 'all')"
	@echo "make stop       : Arrête tous les services"
	@echo "make restart    : Redémarre tout"
	@echo "make logs       : Affiche les logs en temps réel"
	@echo "make clean      : Nettoie les conteneurs et réseaux orphelins"
	@echo "make v8-migrate : Importe les données de la stack V8"
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

# 📦 Migration depuis V8 (Script externe)
v8-migrate:
	@chmod +x scripts/migrate_v8.sh
	@./scripts/migrate_v8.sh
