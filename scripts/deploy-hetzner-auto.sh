#!/bin/bash

################################################################################
# 🚀 OceanPhenix V10 - Script de Déploiement Automatique Hetzner
################################################################################
# Description: Installation automatique complète sur serveur Hetzner
# Compatibilité: Ubuntu 22.04 LTS
# Usage: bash deploy-hetzner-auto.sh
################################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_error() {
    echo -e "${RED}✗ ERREUR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

################################################################################
# 📝 CONFIGURATION - À PERSONNALISER PAR CLIENT
################################################################################

# Configuration par défaut (exemple OceanPhenix)
DEFAULT_DOMAIN="ia.oceanphenix.fr"
DEFAULT_SERVER_IP="46.224.72.83"
DEFAULT_EMAIL="admin@oceanphenix.fr"

# Demander confirmation ou personnalisation
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🌊 OceanPhenix V10 - Déploiement Hetzner               ║
║                                                               ║
║       Installation Automatique Backend Stack                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Mode de configuration
echo -e "${YELLOW}Mode de configuration:${NC}"
echo "1) Utiliser configuration par défaut (OceanPhenix)"
echo "2) Personnaliser pour nouveau client"
read -p "Choisir (1 ou 2): " CONFIG_MODE

if [ "$CONFIG_MODE" == "2" ]; then
    read -p "Domaine principal (ex: ia.mondomaine.com): " DOMAIN
    read -p "IP du serveur Hetzner: " SERVER_IP
    read -p "Email admin (pour SSL): " ADMIN_EMAIL
else
    DOMAIN=$DEFAULT_DOMAIN
    SERVER_IP=$DEFAULT_SERVER_IP
    ADMIN_EMAIL=$DEFAULT_EMAIL
fi

# Sous-domaines automatiques
DOMAIN_API="api.${DOMAIN#ia.}"
DOMAIN_MINIO="s3.${DOMAIN#ia.}"
DOMAIN_GRAFANA="grafana.${DOMAIN#ia.}"
DOMAIN_ALERTMANAGER="alertmanager.${DOMAIN#ia.}"
DOMAIN_PORTAINER="portainer.${DOMAIN#ia.}"
DOMAIN_N8N="n8n.${DOMAIN#ia.}"

# Génération mots de passe sécurisés
ADMIN_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 32)
MINIO_ROOT_USER="admin"
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)
N8N_AUTH_USER="admin"
N8N_AUTH_PASSWORD=$(openssl rand -base64 32)
SMTP_PASSWORD=$(openssl rand -base64 32)

# Affichage configuration
echo -e "\n${GREEN}📋 Configuration détectée:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Domaine principal:    ${CYAN}${DOMAIN}${NC}"
echo -e "IP Serveur:           ${CYAN}${SERVER_IP}${NC}"
echo -e "Email admin:          ${CYAN}${ADMIN_EMAIL}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Sous-domaines créés:"
echo -e "  - API:          ${CYAN}${DOMAIN_API}${NC}"
echo -e "  - MinIO:        ${CYAN}${DOMAIN_MINIO}${NC}"
echo -e "  - Grafana:      ${CYAN}${DOMAIN_GRAFANA}${NC}"
echo -e "  - Alertmanager: ${CYAN}${DOMAIN_ALERTMANAGER}${NC}"
echo -e "  - Portainer:    ${CYAN}${DOMAIN_PORTAINER}${NC}"
echo -e "  - n8n:          ${CYAN}${DOMAIN_N8N}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

read -p "Confirmer et démarrer l'installation? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Installation annulée."
    exit 0
fi

################################################################################
# 🔧 ÉTAPE 1: Vérifications Préalables
################################################################################

print_step "Vérification des prérequis système"

# Vérifier OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]] || [[ ! "$VERSION_ID" =~ ^(22|24) ]]; then
        print_error "OS non supporté. Ubuntu 22.04/24.04 LTS requis."
        exit 1
    fi
    print_success "OS: $PRETTY_NAME"
else
    print_error "Impossible de détecter l'OS"
    exit 1
fi

# Vérifier droits root
if [ "$EUID" -ne 0 ]; then 
    print_error "Ce script doit être exécuté avec sudo ou en root"
    exit 1
fi

print_success "Droits administrateur confirmés"

################################################################################
# 🔧 ÉTAPE 2: Configuration DNS (Instructions)
################################################################################

print_step "Configuration DNS requise"

echo -e "${YELLOW}⚠️  ACTION MANUELLE REQUISE AVANT DE CONTINUER${NC}\n"
echo "Configurez les enregistrements DNS suivants dans votre zone DNS:"
echo ""
echo -e "${CYAN}Type    Nom                     Valeur          TTL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "A       ${DOMAIN#ia.}          ${SERVER_IP}    3600"
echo "A       ia                      ${SERVER_IP}    3600"
echo "A       api                     ${SERVER_IP}    3600"
echo "A       s3                      ${SERVER_IP}    3600"
echo "A       grafana                 ${SERVER_IP}    3600"
echo "A       alertmanager            ${SERVER_IP}    3600"
echo "A       portainer               ${SERVER_IP}    3600"
echo "A       n8n                     ${SERVER_IP}    3600"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "DNS configuré? Appuyez sur Entrée pour continuer..."

################################################################################
# 🔧 ÉTAPE 3: Mise à jour système
################################################################################

print_step "Mise à jour du système"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get autoremove -y -qq

print_success "Système à jour"

################################################################################
# 🔧 ÉTAPE 4: Installation Docker
################################################################################

print_step "Installation Docker Engine"

# Supprimer anciennes versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Dépendances
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    git \
    htop \
    net-tools

# Ajouter clé GPG Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Démarrer Docker
systemctl enable docker
systemctl start docker

print_success "Docker installé: $(docker --version)"

################################################################################
# 🔧 ÉTAPE 5: Configuration Firewall
################################################################################

print_step "Configuration Firewall UFW"

# Réinitialiser UFW
ufw --force reset

# Autoriser SSH (IMPORTANT!)
ufw allow 22/tcp comment 'SSH'

# Autoriser HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Activer UFW
ufw --force enable

print_success "Firewall configuré (SSH, HTTP, HTTPS)"

################################################################################
# 🔧 ÉTAPE 6: Création réseaux Docker
################################################################################

print_step "Création des réseaux Docker"

docker network create v10_proxy 2>/dev/null || true
docker network create v10_internal 2>/dev/null || true

print_success "Réseaux Docker créés"

################################################################################
# 🔧 ÉTAPE 7: Clone du projet
################################################################################

print_step "Récupération du code source"

INSTALL_DIR="/opt/oceanphenix-v10"

# Supprimer ancien répertoire si existe
if [ -d "$INSTALL_DIR" ]; then
    print_warning "Répertoire existant trouvé, sauvegarde..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Cloner depuis GitHub
git clone https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026.git "$INSTALL_DIR"

cd "$INSTALL_DIR"

print_success "Code source récupéré dans $INSTALL_DIR"

################################################################################
# 🔧 ÉTAPE 8: Configuration .env
################################################################################

print_step "Génération du fichier .env de production"

cat > "$INSTALL_DIR/.env" <<EOF
# ═══════════════════════════════════════════════════════════════════════════
# 🌊 OceanPhenix V10 - Configuration Production Hetzner
# ═══════════════════════════════════════════════════════════════════════════
# Généré automatiquement le $(date)
# Serveur: ${SERVER_IP}
# Domaine: ${DOMAIN}
# ═══════════════════════════════════════════════════════════════════════════

# === DOMAINES ===
ACME_EMAIL=${ADMIN_EMAIL}
DOMAIN_DASHBOARD=${DOMAIN}
DOMAIN_API=${DOMAIN_API}
DOMAIN_MINIO=${DOMAIN_MINIO}
DOMAIN_S3=${DOMAIN_MINIO}
DOMAIN_N8N=${DOMAIN_N8N}
DOMAIN_BI=bi.${DOMAIN#ia.}
DOMAIN_STUDIO=studio.${DOMAIN#ia.}
DOMAIN_MONITORING=${DOMAIN_GRAFANA}
DOMAIN_PORTAINER=${DOMAIN_PORTAINER}

# === SÉCURITÉ ===
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

# === N8N ===
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=${N8N_AUTH_USER}
N8N_BASIC_AUTH_PASSWORD=${N8N_AUTH_PASSWORD}

# === SMTP (Alertes Email) ===
SMTP_PASSWORD=${SMTP_PASSWORD}

# === OLLAMA ===
OLLAMA_HOST=http://ollama:11434

# === PRODUCTION ===
ENV=production
DEBUG=false
EOF

chmod 600 "$INSTALL_DIR/.env"

print_success "Fichier .env créé avec mots de passe sécurisés"

################################################################################
# 🔧 ÉTAPE 9: Configuration Caddy
################################################################################

print_step "Configuration Caddy Reverse Proxy"

# Créer Caddyfile production
cat > "$INSTALL_DIR/core/proxy/Caddyfile" <<EOF
# ═══════════════════════════════════════════════════════════════════════════
# 🌊 OceanPhenix V10 - Caddy Configuration Production
# ═══════════════════════════════════════════════════════════════════════════
{
    email ${ADMIN_EMAIL}
    admin off
}

# Dashboard Principal
${DOMAIN} {
    reverse_proxy dashboard:80
    encode gzip
    log {
        output file /var/log/caddy/dashboard.log
    }
}

# API Backend
${DOMAIN_API} {
    reverse_proxy api:8000
    encode gzip
    log {
        output file /var/log/caddy/api.log
    }
}

# MinIO Console
${DOMAIN_MINIO} {
    reverse_proxy minio:9001
    encode gzip
}

# Grafana
${DOMAIN_GRAFANA} {
    reverse_proxy grafana:3000
    encode gzip
}

# Alertmanager
${DOMAIN_ALERTMANAGER} {
    reverse_proxy alertmanager:9093
    encode gzip
}

# Portainer
${DOMAIN_PORTAINER} {
    reverse_proxy portainer:9000
    encode gzip
}

# n8n
${DOMAIN_N8N} {
    reverse_proxy n8n:5678
    encode gzip
}
EOF

print_success "Caddyfile production configuré"

################################################################################
# 🔧 ÉTAPE 10: Démarrage des services
################################################################################

print_step "Démarrage de la stack OceanPhenix V10"

cd "$INSTALL_DIR"

# Démarrer tous les services avec profil 'all'
docker compose --profile all up -d

# Attendre que les services démarrent
sleep 10

print_success "Services Docker démarrés"

################################################################################
# 🔧 ÉTAPE 11: Installation modèle LLM
################################################################################

print_step "Installation du modèle LLM Mistral"

# Attendre qu'Ollama soit prêt
echo "Attente du démarrage d'Ollama..."
sleep 20

# Télécharger Mistral
docker exec v10-ollama ollama pull mistral:latest

print_success "Modèle Mistral installé"

################################################################################
# 🔧 ÉTAPE 12: Vérification des services
################################################################################

print_step "Vérification de l'état des services"

echo -e "\n${CYAN}Services Docker:${NC}"
docker compose ps

echo -e "\n${CYAN}Statut des conteneurs:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep v10-

################################################################################
# 🔧 ÉTAPE 13: Configuration Backups Automatiques
################################################################################

print_step "Configuration des backups automatiques"

BACKUP_DIR="/opt/oceanphenix-backups"
mkdir -p "$BACKUP_DIR"

# Script de backup
cat > /usr/local/bin/oceanphenix-backup.sh <<'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR="/opt/oceanphenix-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup volumes Docker
docker run --rm \
  -v v10_minio_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/minio_${DATE}.tar.gz /data

docker run --rm \
  -v v10_qdrant_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/qdrant_${DATE}.tar.gz /data

# Nettoyer backups > 7 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
BACKUP_SCRIPT

chmod +x /usr/local/bin/oceanphenix-backup.sh

# Cron quotidien 2h du matin
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/oceanphenix-backup.sh") | crontab -

print_success "Backups automatiques configurés (quotidien 2h)"

################################################################################
# 📊 RÉSUMÉ FINAL
################################################################################

print_step "✅ Installation Terminée avec Succès!"

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🌊 OceanPhenix V10 - Déploiement Réussi!              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Sauvegarder les credentials dans un fichier sécurisé
CREDENTIALS_FILE="$INSTALL_DIR/credentials_$(date +%Y%m%d_%H%M%S).txt"
cat > "$CREDENTIALS_FILE" <<CREDS
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   🔐 CREDENTIALS OCEANPHENIX V10                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📅 Généré le: $(date)
🌐 Serveur: ${SERVER_IP}
📧 Email admin: ${ADMIN_EMAIL}

════════════════════════════════════════════════════════════════════════════════
🌐 ACCÈS WEB
════════════════════════════════════════════════════════════════════════════════

Dashboard Principal:    https://${DOMAIN}
API Backend:            https://${DOMAIN_API}
Grafana (Monitoring):   https://${DOMAIN_GRAFANA}
MinIO (Stockage S3):    https://${DOMAIN_MINIO}
Alertmanager:           https://${DOMAIN_ALERTMANAGER}
Portainer (Docker):     https://${DOMAIN_PORTAINER}
n8n (Automation):       https://${DOMAIN_N8N}

════════════════════════════════════════════════════════════════════════════════
🔑 IDENTIFIANTS
════════════════════════════════════════════════════════════════════════════════

🔹 GRAFANA
   URL:      https://${DOMAIN_GRAFANA}
   User:     admin
   Password: ${GRAFANA_PASSWORD}

🔹 MINIO (S3 Storage)
   URL:      https://${DOMAIN_MINIO}
   User:     ${MINIO_ROOT_USER}
   Password: ${MINIO_ROOT_PASSWORD}

🔹 N8N (Automation)
   URL:      https://${DOMAIN_N8N}
   User:     ${N8N_AUTH_USER}
   Password: ${N8N_AUTH_PASSWORD}

🔹 PORTAINER (Docker GUI)
   URL:      https://${DOMAIN_PORTAINER}
   Note:     Créer compte admin au premier accès

════════════════════════════════════════════════════════════════════════════════
🛠️ COMMANDES UTILES
════════════════════════════════════════════════════════════════════════════════

# Voir logs d'un service
docker compose -f ${INSTALL_DIR}/docker-compose.yml logs -f [service]

# Redémarrer un service
docker compose -f ${INSTALL_DIR}/docker-compose.yml restart [service]

# Voir l'état des services
docker compose -f ${INSTALL_DIR}/docker-compose.yml ps

# Arrêter tous les services
docker compose -f ${INSTALL_DIR}/docker-compose.yml down

# Démarrer tous les services
docker compose -f ${INSTALL_DIR}/docker-compose.yml --profile all up -d

# Backup manuel
/usr/local/bin/oceanphenix-backup.sh

════════════════════════════════════════════════════════════════════════════════
⚠️  SÉCURITÉ IMPORTANTE
════════════════════════════════════════════════════════════════════════════════

1. Sauvegardez ce fichier dans un gestionnaire de mots de passe sécurisé
2. Supprimez ce fichier après sauvegarde: rm ${CREDENTIALS_FILE}
3. Ne partagez JAMAIS ces credentials par email non chiffré
4. Changez les mots de passe par défaut après premier accès

════════════════════════════════════════════════════════════════════════════════
📚 DOCUMENTATION
════════════════════════════════════════════════════════════════════════════════

Documentation complète: ${INSTALL_DIR}/docs/README.md
Support: https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues

CREDS

chmod 600 "$CREDENTIALS_FILE"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 Résumé de l'Installation${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}🌐 URLs d'accès:${NC}"
echo -e "   Dashboard:    ${GREEN}https://${DOMAIN}${NC}"
echo -e "   API:          ${GREEN}https://${DOMAIN_API}${NC}"
echo -e "   Grafana:      ${GREEN}https://${DOMAIN_GRAFANA}${NC}"
echo -e "   MinIO:        ${GREEN}https://${DOMAIN_MINIO}${NC}"
echo -e "   Alertmanager: ${GREEN}https://${DOMAIN_ALERTMANAGER}${NC}"
echo -e "   Portainer:    ${GREEN}https://${DOMAIN_PORTAINER}${NC}"
echo -e "   n8n:          ${GREEN}https://${DOMAIN_N8N}${NC}"

echo -e "\n${CYAN}🔑 Identifiants sauvegardés dans:${NC}"
echo -e "   ${YELLOW}${CREDENTIALS_FILE}${NC}"
echo -e "   ${RED}⚠️  Sauvegardez ce fichier puis SUPPRIMEZ-LE du serveur!${NC}"

echo -e "\n${CYAN}📂 Installation dans:${NC}"
echo -e "   ${INSTALL_DIR}"

echo -e "\n${CYAN}🔄 Services actifs:${NC}"
docker compose -f "$INSTALL_DIR/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}" | grep v10-

echo -e "\n${CYAN}💾 Backups automatiques:${NC}"
echo -e "   Quotidien à 2h du matin"
echo -e "   Dossier: ${BACKUP_DIR}"

echo -e "\n${GREEN}✅ Installation OceanPhenix V10 terminée avec succès!${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}🚀 Prochaines étapes:${NC}"
echo "   1. Sauvegardez le fichier credentials"
echo "   2. Testez l'accès à ${DOMAIN}"
echo "   3. Configurez Grafana"
echo "   4. Déployez le frontend sur O2Switch"
echo ""
echo -e "${GREEN}📖 Documentation: ${INSTALL_DIR}/docs/README.md${NC}\n"
