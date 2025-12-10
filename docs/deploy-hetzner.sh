#!/bin/bash
################################################################################
# OceanPhenix V10 - Installation automatique sur Hetzner
# Server: VOTRE_IP_HETZNER
# Date: Décembre 2025
################################################################################

set -e  # Arrêt en cas d'erreur

echo "🌊 Installation OceanPhenix V10 sur Hetzner"
echo "=========================================="

# Variables
DOMAIN="VOTRE_IP_HETZNER"  # Remplacer par votre domaine si disponible
GITHUB_REPO="https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git"
INSTALL_DIR="/opt/oceanphenix"
USER="oceanphenix"

# Vérification root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root" 
   exit 1
fi

echo ""
echo "📦 1/8 - Mise à jour du système..."
apt-get update
apt-get upgrade -y
apt-get install -y curl git ufw fail2ban htop

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
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installé"
else
    echo "✅ Docker Compose déjà installé"
fi

echo ""
echo "👤 4/8 - Création de l'utilisateur système..."
if ! id "$USER" &>/dev/null; then
    useradd -m -s /bin/bash $USER
    usermod -aG docker $USER
    echo "✅ Utilisateur $USER créé"
else
    echo "✅ Utilisateur $USER existe déjà"
fi

echo ""
echo "📥 5/8 - Clone du projet depuis GitHub..."
if [ ! -d "$INSTALL_DIR" ]; then
    mkdir -p $INSTALL_DIR
    git clone $GITHUB_REPO $INSTALL_DIR
    chown -R $USER:$USER $INSTALL_DIR
    echo "✅ Projet cloné dans $INSTALL_DIR"
else
    echo "⚠️  Répertoire existe, mise à jour..."
    cd $INSTALL_DIR
    git pull
    chown -R $USER:$USER $INSTALL_DIR
fi

echo ""
echo "🔧 6/8 - Configuration de l'environnement..."
cd $INSTALL_DIR

# Création du fichier .env si nécessaire
if [ ! -f .env ]; then
    cat > .env << EOF
# Configuration OceanPhenix V10 - Hetzner
COMPOSE_PROJECT_NAME=oceanphenix-ia-souveraine-v8

# Server
SERVER_IP=\$(curl -s ifconfig.me || echo "VOTRE_IP_HETZNER")
DOMAIN=$DOMAIN

# Security
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32)
PORTAINER_ADMIN_PASSWORD=$(openssl rand -base64 32)

# SMTP (optionnel)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@oceanphenix.fr

# Backup
BACKUP_RETENTION_DAYS=7
EOF
    echo "✅ Fichier .env créé"
fi

echo ""
echo "🔥 7/8 - Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
echo "✅ Firewall configuré"

echo ""
echo "🚀 8/8 - Démarrage des services Docker..."
cd $INSTALL_DIR
sudo -u $USER docker-compose pull
sudo -u $USER docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📊 Services disponibles :"
echo "================================"
echo "🏠 Hub Frontend:      http://$DOMAIN:8000"
echo "🎨 OpenWebUI:         http://$DOMAIN:3000"
echo "📈 Grafana:           http://$DOMAIN:3001"
echo "📊 Prometheus:        http://$DOMAIN:9090"
echo "🐳 Portainer:         https://$DOMAIN:9443"
echo "💾 MinIO:             http://$DOMAIN:9001"
echo "🔍 Qdrant:            http://$DOMAIN:6333"
echo "🤖 Ollama:            http://$DOMAIN:11434"
echo ""
echo "🔐 Informations importantes :"
echo "================================"
echo "Répertoire: $INSTALL_DIR"
echo "Utilisateur: $USER"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Configurer Portainer: https://$DOMAIN:9443"
echo "2. Configurer Grafana: http://$DOMAIN:3001 (admin / voir .env)"
echo "3. Tester l'API: http://$DOMAIN:8000/health"
echo ""
echo "📚 Commandes utiles :"
echo "  cd $INSTALL_DIR"
echo "  docker-compose ps              # Voir les services"
echo "  docker-compose logs -f         # Voir les logs"
echo "  docker-compose restart         # Redémarrer"
echo "  docker-compose down            # Arrêter"
echo ""
echo "🎉 Bonne utilisation !"
