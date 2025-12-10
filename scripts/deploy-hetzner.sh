#!/bin/bash
################################################################################
# OceanPhenix V10 - Installation automatique sur Hetzner
# Server: VOTRE_IP_HETZNER
# Date: Décembre 2025
################################################################################

set -euo pipefail

echo "🌊 Installation OceanPhenix V10 sur Hetzner"
echo "==========================================="

# Variables principales
GITHUB_REPO="https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git"
INSTALL_DIR="/opt/oceanphenix"
SYSTEM_USER="oceanphenix"
COMPOSE_VERSION="v2.24.0"

SERVER_IP=$(curl -s https://checkip.amazonaws.com || curl -s ifconfig.me || echo "VOTRE_IP_HETZNER")
ROOT_DOMAIN_INPUT=${ROOT_DOMAIN:-}

if [[ -z "${ROOT_DOMAIN_INPUT}" ]]; then
    ROOT_DOMAIN="${SERVER_IP}.nip.io"
else
    ROOT_DOMAIN="${ROOT_DOMAIN_INPUT}"
fi

ACME_EMAIL_DEFAULT="admin@${ROOT_DOMAIN}"
ACME_EMAIL_VALUE=${ACME_EMAIL:-$ACME_EMAIL_DEFAULT}
ADMIN_USER_VALUE=${ADMIN_USER:-oceanphenix_admin}

# Vérification root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root" 
   exit 1
fi

echo ""
echo "📦 1/8 - Mise à jour du système..."
apt-get update
apt-get upgrade -y
apt-get install -y curl git ufw fail2ban htop jq openssl

echo ""
echo "🐳 2/8 - Installation Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installé"
else
    echo "✅ Docker déjà installé"
fi

echo ""
echo "🐳 3/8 - Installation Docker Compose..."
if ! docker compose version &> /dev/null; then
    mkdir -p /usr/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/lib/docker/cli-plugins/docker-compose
    echo "✅ Docker Compose v${COMPOSE_VERSION} installé"
else
    echo "✅ Docker Compose déjà installé"
fi

echo ""
echo "👤 4/8 - Création de l'utilisateur système..."
if ! id "$SYSTEM_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$SYSTEM_USER"
    usermod -aG docker "$SYSTEM_USER"
    echo "✅ Utilisateur $SYSTEM_USER créé"
else
    echo "✅ Utilisateur $SYSTEM_USER existe déjà"
fi

echo ""
echo "📥 5/8 - Clone du projet depuis GitHub..."
if [ ! -d "$INSTALL_DIR" ]; then
        mkdir -p "$INSTALL_DIR"
        git clone "$GITHUB_REPO" "$INSTALL_DIR"
        chown -R "$SYSTEM_USER":"$SYSTEM_USER" "$INSTALL_DIR"
        echo "✅ Projet cloné dans $INSTALL_DIR"
else
    echo "⚠️  Répertoire existe, mise à jour..."
        cd "$INSTALL_DIR"
    git pull
        chown -R "$SYSTEM_USER":"$SYSTEM_USER" "$INSTALL_DIR"
fi


echo ""
echo "🔧 6/8 - Configuration de l'environnement..."
cd "$INSTALL_DIR"

create_or_update_env() {
    local key="$1"
    local value="$2"
    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        echo "${key}=${value}" >> .env
    fi
}

random_secret() {
    openssl rand -hex 32
}

random_password() {
    openssl rand -base64 24 | tr -dc 'A-Za-z0-9'
}

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé depuis .env.example"
fi

create_or_update_env "ROOT_DOMAIN" "$ROOT_DOMAIN"
create_or_update_env "ACME_EMAIL" "$ACME_EMAIL_VALUE"
create_or_update_env "ADMIN_USER" "$ADMIN_USER_VALUE"
create_or_update_env "ADMIN_PASSWORD_HASH" "$(random_password)"
create_or_update_env "JWT_SECRET" "$(random_secret)"
create_or_update_env "API_KEY_MASTER" "$(random_secret)"
create_or_update_env "QDRANT_API_KEY" "$(random_secret)"
create_or_update_env "MINIO_ROOT_USER" "admin"
create_or_update_env "MINIO_ROOT_PASSWORD" "$(random_password)"
create_or_update_env "N8N_BASIC_AUTH_USER" "${N8N_BASIC_AUTH_USER:-admin}"
create_or_update_env "N8N_BASIC_AUTH_PASSWORD" "$(random_password)"
create_or_update_env "N8N_ENCRYPTION_KEY" "$(random_secret)"
create_or_update_env "GRAFANA_ADMIN_PASSWORD" "$(random_password)"
create_or_update_env "PORTAINER_ADMIN_PASSWORD" "$(random_password)"
create_or_update_env "SUPERSET_SECRET_KEY" "$(random_secret)"
create_or_update_env "SUPERSET_DB_PASSWORD" "$(random_password)"
create_or_update_env "SUPERSET_ADMIN_PASSWORD" "$(random_password)"
create_or_update_env "STRAPI_DB_PASSWORD" "$(random_password)"
create_or_update_env "STRAPI_APP_KEYS" "$(random_secret)"
create_or_update_env "STRAPI_API_TOKEN_SALT" "$(random_secret)"
create_or_update_env "STRAPI_ADMIN_JWT_SECRET" "$(random_secret)"
create_or_update_env "STRAPI_TRANSFER_TOKEN_SALT" "$(random_secret)"
create_or_update_env "TZ" "Europe/Paris"

chown "$SYSTEM_USER":"$SYSTEM_USER" .env

echo ""
echo "🕸 7/8 - Configuration des réseaux Docker..."
for network in v10_proxy v10_internal; do
    if ! docker network inspect "$network" >/dev/null 2>&1; then
        docker network create "$network"
        echo "✅ Réseau $network créé"
    else
        echo "✅ Réseau $network déjà présent"
    fi

done

echo ""
echo "🔥 8/8 - Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
echo "✅ Firewall configuré"

echo ""
echo "🚀 Démarrage des services Docker..."
cd "$INSTALL_DIR"
sudo -u "$SYSTEM_USER" docker compose --profile all pull
sudo -u "$SYSTEM_USER" docker compose --profile all up -d

echo ""
echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📊 Services disponibles :"
echo "================================"
echo "🏠 Hub Frontend:      https://app.${ROOT_DOMAIN}"
echo "🎨 OpenWebUI:         https://studio.${ROOT_DOMAIN}"
echo "📈 Grafana:           https://monitor.${ROOT_DOMAIN}"
echo "📊 Prometheus:        https://monitor.${ROOT_DOMAIN}:9090"
echo "🐳 Portainer:         https://portainer.${ROOT_DOMAIN}"
echo "💾 MinIO:             https://minio.${ROOT_DOMAIN}"
echo "🔍 Qdrant:            http://$SERVER_IP:6333"
echo "🤖 Ollama:            http://$SERVER_IP:11434"
echo ""
echo "🔐 Informations importantes :"
echo "================================"
echo "Répertoire: $INSTALL_DIR"
echo "Utilisateur: $SYSTEM_USER"
echo "Nom de domaine (ROOT_DOMAIN): $ROOT_DOMAIN"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Vérifier le fichier .env et ajuster les sous-domaines ou emails"
echo "2. Configurer Portainer: https://portainer.${ROOT_DOMAIN}"
echo "3. Configurer Grafana: https://monitor.${ROOT_DOMAIN} (admin / voir .env)"
echo "4. Tester l'API: https://api.${ROOT_DOMAIN}/health"
echo ""
echo "📚 Commandes utiles :"
echo "  cd $INSTALL_DIR"
echo "  docker compose ps                    # Voir les services"
echo "  docker compose logs -f api           # Voir les logs"
echo "  docker compose restart SERVICE       # Redémarrer"
echo "  docker compose --profile all up -d   # Relancer la stack"
echo "  docker compose down                  # Arrêter"
echo ""
echo "🎉 Bonne utilisation !"
