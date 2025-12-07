#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🚀 Script de Déploiement Rapide O2Switch - OceanPhenix V8
# ═══════════════════════════════════════════════════════════════════════════
# Ce script automatise le déploiement du frontend sur O2Switch
# Utilisation : ./deploy-o2switch.sh [votredomaine.com]
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Couleurs pour affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN=${1:-"votredomaine.com"}
FTP_HOST="ftp.${DOMAIN}"
FTP_USER=${FTP_USER:-""}
FTP_PASS=${FTP_PASS:-""}
REMOTE_DIR="/public_html/ia"
LOCAL_DIR="./hub-frontend"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🌊 OceanPhenix V8 - Déploiement O2Switch${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}❌ Dossier hub-frontend introuvable${NC}"
    exit 1
fi

if [ -z "$FTP_USER" ]; then
    echo -e "${YELLOW}🔐 Identifiant FTP :${NC}"
    read FTP_USER
fi

if [ -z "$FTP_PASS" ]; then
    echo -e "${YELLOW}🔑 Mot de passe FTP :${NC}"
    read -s FTP_PASS
    echo
fi

# Configuration config.js
echo -e "\n${YELLOW}⚙️  Configuration API...${NC}"

if [ ! -f "$LOCAL_DIR/config.js" ]; then
    if [ -f "$LOCAL_DIR/config.prod.js" ]; then
        echo -e "${GREEN}✓${NC} Copie de config.prod.js vers config.js"
        cp "$LOCAL_DIR/config.prod.js" "$LOCAL_DIR/config.js"
        
        # Remplacer votredomaine.com par le domaine fourni
        sed -i "s/votredomaine\.com/${DOMAIN}/g" "$LOCAL_DIR/config.js" 2>/dev/null || \
        sed -i '' "s/votredomaine\.com/${DOMAIN}/g" "$LOCAL_DIR/config.js" 2>/dev/null || \
        echo -e "${YELLOW}⚠️  Remplacez manuellement 'votredomaine.com' par '${DOMAIN}' dans config.js${NC}"
        
        echo -e "${GREEN}✓${NC} Configuration API créée"
    else
        echo -e "${RED}❌ config.prod.js introuvable${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} config.js existe déjà"
fi

# Création archive pour upload
echo -e "\n${YELLOW}📦 Préparation des fichiers...${NC}"
ARCHIVE="oceanphenix-frontend-$(date +%Y%m%d-%H%M%S).tar.gz"
tar czf "/tmp/$ARCHIVE" -C hub-frontend .
echo -e "${GREEN}✓${NC} Archive créée : /tmp/$ARCHIVE"

# Upload via FTP
echo -e "\n${YELLOW}📤 Upload FTP vers O2Switch...${NC}"
echo -e "${BLUE}Serveur : $FTP_HOST${NC}"
echo -e "${BLUE}Dossier distant : $REMOTE_DIR${NC}"

# Upload avec lftp si disponible
if command -v lftp &> /dev/null; then
    lftp -u "$FTP_USER,$FTP_PASS" "ftp://$FTP_HOST" <<EOF
set ftp:ssl-allow no
mirror -R $LOCAL_DIR $REMOTE_DIR --delete --verbose
quit
EOF
    echo -e "${GREEN}✓${NC} Upload terminé avec succès (lftp)"
    
# Sinon, utiliser curl
elif command -v curl &> /dev/null; then
    echo -e "${YELLOW}ℹ️  Upload avec curl (plus lent)...${NC}"
    
    # Upload fichiers principaux
    for file in $LOCAL_DIR/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            curl -T "$file" "ftp://$FTP_HOST$REMOTE_DIR/$filename" \
                 --user "$FTP_USER:$FTP_PASS" \
                 --ftp-create-dirs
            echo -e "${GREEN}✓${NC} $filename"
        fi
    done
    
    echo -e "${GREEN}✓${NC} Upload terminé avec succès (curl)"
    echo -e "${YELLOW}⚠️  Note : Les sous-dossiers doivent être uploadés manuellement${NC}"
    
else
    echo -e "${RED}❌ Aucun client FTP trouvé (lftp ou curl requis)${NC}"
    echo -e "${YELLOW}📦 Archive disponible : /tmp/$ARCHIVE${NC}"
    echo -e "${YELLOW}ℹ️  Uploadez manuellement via FileZilla ou cPanel${NC}"
    exit 1
fi

# Résumé
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}🔗 URLs à vérifier :${NC}"
echo -e "   Frontend Hub : ${GREEN}https://ia.${DOMAIN}${NC}"
echo -e "   API Backend  : ${GREEN}https://api.${DOMAIN}/health${NC}"
echo -e ""

echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo -e "   1. Vérifier https://ia.${DOMAIN} dans votre navigateur"
echo -e "   2. Ouvrir Console (F12) et tester :"
echo -e "      ${BLUE}fetch('https://api.${DOMAIN}/health').then(r => r.json()).then(console.log)${NC}"
echo -e "   3. Si erreur CORS, configurer backend Hetzner :"
echo -e "      ${BLUE}ssh root@serveur-hetzner${NC}"
echo -e "      ${BLUE}nano backend/main.py${NC}"
echo -e "      Ajouter : ${GREEN}allow_origins=['https://ia.${DOMAIN}']${NC}"
echo -e "      ${BLUE}docker compose restart backend${NC}"
echo -e ""

echo -e "${GREEN}🎉 Bon déploiement !${NC}\n"
