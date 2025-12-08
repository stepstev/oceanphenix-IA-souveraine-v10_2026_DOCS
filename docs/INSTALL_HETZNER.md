# 🚀 Guide de Déploiement Hetzner - OceanPhenix V8

Guide complet pour déployer OceanPhenix IA Souveraine V8 sur serveur dédié Hetzner avec domaine et SSL.

## 🎯 Vue d'Ensemble

Ce déploiement configure :
- ✅ Stack complète OceanPhenix sur VPS Hetzner
- ✅ Domaine personnalisé avec SSL (Let's Encrypt)
- ✅ Reverse proxy Caddy automatique
- ✅ Firewall sécurisé (UFW)
- ✅ Backups automatiques
- ✅ Monitoring production

## 📋 Prérequis

### Serveur Hetzner

**Configuration recommandée** :

| Composant | Minimum | Recommandé | Optimal |
|-----------|---------|------------|---------|
| OS | Ubuntu 22.04 LTS | **Ubuntu 22.04 LTS** | **Ubuntu 22.04 LTS** |
| CPU | 4 vCPU | 8 vCPU | 16 vCPU |
| RAM | 16 GB | 32 GB | 64 GB |
| Stockage | 200 GB SSD | 500 GB NVMe | 1 TB NVMe |
| Réseau | 20 TB/mois | Illimité | Illimité |

**Modèles Hetzner adaptés** :

- **CPX41** : 8 vCPU, 16 GB RAM, 240 GB NVMe (~40€/mois)
- **CCX33** : 8 vCPU, 32 GB RAM, 360 GB NVMe (~70€/mois) ⭐ Recommandé
- **CCX43** : 16 vCPU, 64 GB RAM, 600 GB NVMe (~135€/mois)

### Domaine & DNS

- Domaine enregistré (OVH, Gandi, Cloudflare, etc.)
- Accès à la configuration DNS

### Accès Hetzner Cloud

- Compte Hetzner Cloud : <https://console.hetzner.cloud>
- Clé SSH configurée

## 🔧 Étape 1 : Création du Serveur Hetzner

### Via Interface Web Hetzner Cloud

1. **Console Hetzner** : <https://console.hetzner.cloud>
2. **New Project** : "oceanphenix-prod"

3. **Add Server** :

   - Location : Nuremberg (de-nbg1) ou Helsinki (fi-hel1)
   - Image : **Ubuntu 22.04 LTS** (Recommandé)
   - Type : CCX33 (8 vCPU, 32 GB)
   - Volumes : Optionnel (backup externe)
   - SSH Key : Ajouter votre clé publique
   - Name : `oceanphenix-v8`

4. **Attendre création** (30 secondes)
5. **Noter l'IP** : `<SERVER_IP>`

### Via CLI Hetzner (Alternatif)

```bash
# Installer hcloud CLI
brew install hcloud  # macOS
# ou
sudo snap install hcloud  # Linux

# Login
hcloud context create oceanphenix

# Créer serveur
hcloud server create \
  --name oceanphenix-v8 \
  --type ccx33 \
  --image ubuntu-22.04 \
  --ssh-key <your-key-id> \
  --location nbg1

# Noter IP publique
hcloud server describe oceanphenix-v8 | grep "Public:"
```

## 🌐 Étape 2 : Configuration DNS

### Configuration A Records

Ajouter dans votre zone DNS :

```
Type    Name                    Value              TTL
A       ia.votredomaine.com     <SERVER_IP>        3600
A       api.votredomaine.com    <SERVER_IP>        3600
A       grafana.votredomaine.com <SERVER_IP>       3600
A       minio.votredomaine.com  <SERVER_IP>        3600
```

**Attendre propagation DNS** : 5-30 minutes

```bash
# Vérifier propagation
dig ia.votredomaine.com +short
# Doit afficher : <SERVER_IP>
```

## 🔐 Étape 3 : Sécurisation du Serveur

### Connexion SSH

```bash
# Première connexion
ssh root@<SERVER_IP>

# Mettre à jour système
apt update && apt upgrade -y
```

### Créer Utilisateur Non-Root

```bash
# Créer utilisateur
adduser oceanphenix
usermod -aG sudo oceanphenix

# Copier clés SSH
rsync --archive --chown=oceanphenix:oceanphenix ~/.ssh /home/oceanphenix/

# Tester connexion
exit
ssh oceanphenix@<SERVER_IP>
```

### Configurer Firewall UFW

```bash
# Activer UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS (Caddy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer
sudo ufw enable
sudo ufw status
```

### Fail2Ban (Protection Brute Force)

```bash
# Installer
sudo apt install fail2ban -y

# Configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Ajouter :
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

# Redémarrer
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

## 🐳 Étape 4 : Installation Docker

```bash
# Script installation Docker
curl -fsSL <https://get.docker.com> -o get-docker.sh
sudo sh get-docker.sh

# Ajouter user au groupe
sudo usermod -aG docker oceanphenix
newgrp docker

# Vérifier
docker --version
docker compose version

# Configuration Docker daemon
sudo nano /etc/docker/daemon.json
```

Contenu `daemon.json` :

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "userland-proxy": false
}
```

```bash
# Redémarrer Docker
sudo systemctl restart docker
```

## 📦 Étape 5 : Déploiement Stack

### Cloner Repository

```bash
# Se placer dans home
cd /home/oceanphenix

# Cloner projet
git clone <https://github.com/stepstev/oceanphenix-IA-souveraine-v8.git>
cd oceanphenix-IA-souveraine-v8
```

### Configuration Environnement

> **🔐 SÉCURITÉ PRODUCTION : Protection du `.env`**
>
> - ❌ **NE JAMAIS** commiter `.env` sur git
> - ✅ Utiliser `.env.example` pour templates
> - ✅ Stocker backups `.env` chiffrés hors serveur
> - ✅ Limiter accès SSH au fichier (chmod 600)

```bash
# Copier template
cp .env.example .env

# Éditer configuration
nano .env

# Sécuriser les permissions
chmod 600 .env
```

**Configuration Production** :

```env
# === DOMAIN ===
DOMAIN=ia.votredomaine.com
API_DOMAIN=api.votredomaine.com
GRAFANA_DOMAIN=grafana.votredomaine.com
MINIO_DOMAIN=minio.votredomaine.com

# === SECURITY - Générer avec openssl rand -base64 32 ===
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<GENERER_MOT_DE_PASSE>
GRAFANA_ADMIN_PASSWORD=<GENERER_MOT_DE_PASSE>

# === MINIO ===
MINIO_BUCKET_RAG=rag-documents

# === OPEN WEBUI ===
OPENWEBUI_API_KEY=  # À remplir après premier démarrage

# === BACKEND ===
API_HOST=0.0.0.0
API_PORT=8000
```

**Générer mots de passe sécurisés** :

```bash
# MinIO password (32 caractères base64)
echo "MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)"

# Grafana password (32 caractères base64)
echo "GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32)"

# ⚠️ IMPORTANT: Noter les passwords dans un gestionnaire de mots de passe
# Ne pas les stocker en clair sur le serveur
```

### Configuration Caddy pour Domaines

Éditer `core/proxy/Caddyfile` :

```caddyfile
# Open WebUI - Interface principale
ia.votredomaine.com {
    reverse_proxy openwebui:8080
    
    encode gzip
    
    log {
        output file /var/log/caddy/ia-access.log
    }
}

# API Backend
api.votredomaine.com {
    reverse_proxy backend:8000
    
    encode gzip
    
    log {
        output file /var/log/caddy/api-access.log
    }
}

# Grafana Monitoring
grafana.votredomaine.com {
    reverse_proxy grafana:3000
    
    encode gzip
    
    log {
        output file /var/log/caddy/grafana-access.log
    }
}

# MinIO Console
minio.votredomaine.com {
    reverse_proxy minio:9001
    
    encode gzip
    
    log {
        output file /var/log/caddy/minio-access.log
    }
}

# MinIO S3 API
s3.votredomaine.com {
    reverse_proxy minio:9000
}
```

### Démarrage Stack

```bash
# Build images si nécessaire
docker compose build

# Démarrer core services d'abord
docker compose up -d caddy minio qdrant

# Attendre 30 secondes
sleep 30

# Démarrer LLM
docker compose up -d ollama

# Open WebUI
docker compose up -d openwebui

# Backend et monitoring
docker compose --profile all up -d

# Vérifier
docker compose ps
```

### Installation Modèles LLM

```bash
# Mistral 7B (Français)
docker exec v8-ollama ollama pull mistral:latest

# Llama 3.2 3B (Léger)
docker exec v8-ollama ollama pull llama3.2:3b

# Embeddings pour RAG
docker exec v8-ollama ollama pull nomic-embed-text

# Vérifier
docker exec v8-ollama ollama list
```

## 🔒 Étape 6 : SSL Automatique

Caddy gère automatiquement SSL avec Let's Encrypt !

```bash
# Vérifier certificats
docker exec v8-caddy caddy list-certificates

# Logs SSL
docker logs v8-caddy | grep -i certificate
```

**Test HTTPS** :

```bash
# Vérifier SSL
curl -I <https://ia.votredomaine.com>
# Doit retourner : HTTP/2 200

# Test API
curl <https://api.votredomaine.com/health>
```

## 📊 Étape 7 : Configuration Monitoring

### Grafana

```bash
# URL : <https://grafana.votredomaine.com>
# Login : admin / [password_from_.env]

# 1. Add Prometheus datasource
#    URL: <http://prometheus:9090>
# 
# 2. Import dashboards
#    - Platform Health (ID: dashboard disponible dans core/monitoring/dashboards/)
```

### Alerting

Configuration email alerts dans Grafana :

1. Configuration > Notification channels
2. Add channel : Email
3. Addresses : votre-email@domain.com
4. Test & Save

## 🔄 Étape 8 : Backups Automatiques

### Script Backup Hetzner Volume

```bash
# Créer script
sudo nano /usr/local/bin/oceanphenix-backup.sh
```

Contenu :

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backup/oceanphenix/$(date +%Y%m%d)"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

echo "🔄 Starting backup..."

# Backup MinIO data
docker run --rm \
  -v oceanphenix-v8_minio_data:/data:ro \
  -v /backup:/backup \
  alpine tar czf $BACKUP_DIR/minio.tar.gz /data

# Backup Qdrant
docker exec v8-qdrant tar czf /tmp/qdrant-backup.tar.gz /qdrant/storage
docker cp v8-qdrant:/tmp/qdrant-backup.tar.gz $BACKUP_DIR/
docker exec v8-qdrant rm /tmp/qdrant-backup.tar.gz

# Backup configuration
tar czf $BACKUP_DIR/config.tar.gz \
  /home/oceanphenix/oceanphenix-IA-souveraine-v8/.env \
  /home/oceanphenix/oceanphenix-IA-souveraine-v8/docker-compose.yml

# Clean old backups
find /backup/oceanphenix -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

# Upload to Hetzner Storage Box (optionnel)
# rsync -avz --delete $BACKUP_DIR/ u123456@u123456.your-storagebox.de:oceanphenix/

echo "✅ Backup completed: $BACKUP_DIR"
df -h /backup
```

```bash
# Permissions
sudo chmod +x /usr/local/bin/oceanphenix-backup.sh

# Test
sudo /usr/local/bin/oceanphenix-backup.sh

# Cron job (tous les jours à 2h)
sudo crontab -e

# Ajouter :
0 2 * * * /usr/local/bin/oceanphenix-backup.sh >> /var/log/oceanphenix-backup.log 2>&1
```

## 🔍 Étape 9 : Monitoring & Maintenance

### Health Checks

```bash
# Script check global
nano ~/check-services.sh
```

```bash
#!/bin/bash
services=("ia:443" "api:443" "grafana:443" "minio:443")

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  if curl -sk "<https://$name.votredomaine.com"> > /dev/null; then
    echo "✅ $name - OK"
  else
    echo "❌ $name - DOWN"
  fi
done
```

### Logs Centralisés

```bash
# Voir tous les logs
docker compose logs -f

# Logs spécifiques
docker logs v8-studio -f --tail 100
docker logs v8-ollama -f
docker logs v8-caddy -f
```

### Mises à Jour

```bash
# Pull dernières images
cd /home/oceanphenix/oceanphenix-IA-souveraine-v8
git pull origin main
docker compose pull

# Redémarrer
docker compose --profile all up -d

# Vérifier
docker compose ps
```

## 🐛 Troubleshooting Production

### SSL ne fonctionne pas

```bash
# Vérifier DNS
dig ia.votredomaine.com +short

# Logs Caddy
docker logs v8-caddy | grep -i "certificate"

# Forcer renouvellement
docker exec v8-caddy caddy reload --config /etc/caddy/Caddyfile
```

### Service inaccessible

```bash
# Vérifier firewall
sudo ufw status

# Vérifier ports
sudo netstat -tlnp | grep :443

# Tester depuis serveur
curl -I <http://localhost:8080>  # Open WebUI
```

### Manque de ressources

```bash
# Monitoring temps réel
docker stats

# Libérer espace disque
docker system prune -a
docker volume prune

# Vérifier disque
df -h
```

### Problème Ollama GPU

```bash
# Vérifier GPU (si disponible)
nvidia-smi

# Forcer CPU only si pas de GPU
# Dans docker-compose.yml, commenter section GPU
```

## 📈 Optimisations Production

### Limiter Ressources

Éditer `docker-compose.yml` :

```yaml
services:
  openwebui:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          memory: 2G
```

### Cache Caddy

```caddyfile
ia.votredomaine.com {
    reverse_proxy openwebui:8080
    
    header {
        Cache-Control "public, max-age=3600"
    }
}
```

### Rate Limiting

```caddyfile
api.votredomaine.com {
    reverse_proxy backend:8000
    
    rate_limit {
        zone api
        key {remote_host}
        events 100
        window 1m
    }
}
```

## 🎯 Checklist Finale

- [ ] Serveur Hetzner créé et accessible
- [ ] DNS configuré et propagé
- [ ] Firewall UFW activé
- [ ] Docker installé et opérationnel
- [ ] Stack déployée avec profil `all`
- [ ] SSL automatique fonctionnel
- [ ] Tous les services accessibles via HTTPS
- [ ] Modèles LLM installés
- [ ] Grafana configuré avec dashboards
- [ ] Backups automatiques en place
- [ ] Monitoring actif
- [ ] Mots de passe sécurisés notés
- [ ] Documentation équipe à jour

## 📚 Ressources

- **Hetzner Cloud** : <https://console.hetzner.cloud>
- **Documentation Caddy** : <https://caddyserver.com/docs>
- **Repository GitHub** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v8>

---

**Support** : <https://github.com/stepstev/oceanphenix-IA-souveraine-v8/issues>
