# 🌊 OceanPhenix V10 - Déploiement Production O2Switch + Hetzner

## 📋 Architecture de déploiement

```
[Domaine O2Switch]
    ↓ DNS A Records
[Serveur Hetzner] VOTRE_IP_HETZNER
    ↓ Caddy Reverse Proxy
[Services Docker OceanPhenix]
```

---

## 🔧 Partie 1: Configuration DNS chez O2Switch

### Prérequis O2Switch

- ✅ Compte O2Switch actif
- ✅ Domaine enregistré (ex: `votredomaine.fr`)
- ✅ Accès au cPanel O2Switch

### Configuration DNS dans cPanel O2Switch

#### Étape 1: Connexion cPanel

1. Connexion: https://www.o2switch.fr/cpanel/
2. Login avec vos identifiants O2Switch
3. Rechercher **"Zone Editor"** dans cPanel

#### Étape 2: Créer les enregistrements DNS

Dans **Zone Editor** → **Gérer** votre domaine:

**Enregistrements A à créer:**

```dns
# Frontend principal
@ (root)                  A    VOTRE_IP_HETZNER    TTL: 3600
hub                       A    VOTRE_IP_HETZNER    TTL: 3600

# Services IA
studio                    A    VOTRE_IP_HETZNER    TTL: 3600
api                       A    VOTRE_IP_HETZNER    TTL: 3600

# Monitoring
monitoring                A    VOTRE_IP_HETZNER    TTL: 3600
grafana                   A    VOTRE_IP_HETZNER    TTL: 3600
prometheus                A    VOTRE_IP_HETZNER    TTL: 3600

# Administration
admin                     A    VOTRE_IP_HETZNER    TTL: 3600
portainer                 A    VOTRE_IP_HETZNER    TTL: 3600

# Stockage
storage                   A    VOTRE_IP_HETZNER    TTL: 3600
minio                     A    VOTRE_IP_HETZNER    TTL: 3600

# Wildcard (optionnel)
*                         A    VOTRE_IP_HETZNER    TTL: 3600
```

**Exemple concret avec le domaine `oceanphenix.fr`:**

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | VOTRE_IP_HETZNER | 3600 |
| A | hub | VOTRE_IP_HETZNER | 3600 |
| A | studio | VOTRE_IP_HETZNER | 3600 |
| A | api | VOTRE_IP_HETZNER | 3600 |
| A | monitoring | VOTRE_IP_HETZNER | 3600 |
| A | admin | VOTRE_IP_HETZNER | 3600 |

#### Étape 3: Vérifier la propagation DNS

Attendre 5-30 minutes, puis vérifier:

**Depuis Windows PowerShell:**
```powershell
# Vérifier le domaine principal
nslookup votredomaine.fr

# Vérifier les sous-domaines
nslookup studio.votredomaine.fr
nslookup monitoring.votredomaine.fr
```

**Résultat attendu:**
```
Nom :    studio.votredomaine.fr
Address: VOTRE_IP_HETZNER
```

---

## 🚀 Partie 2: Déploiement sur Hetzner

### Prérequis Hetzner

- ✅ Serveur Hetzner créé (CPX41 ou supérieur)
- ✅ IP: `VOTRE_IP_HETZNER`
- ✅ OS: Ubuntu 24.04 LTS
- ✅ Accès SSH root configuré

### Étape 1: Connexion SSH au serveur

**Depuis Windows PowerShell:**

```powershell
ssh root@VOTRE_IP_HETZNER
```

Si première connexion, accepter la clé SSH.

### Étape 2: Installation automatique

**Une fois connecté au serveur Hetzner:**

```bash
# Télécharger le script d'installation
curl -o /tmp/deploy-hetzner.sh https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/scripts/deploy-hetzner.sh

# Rendre exécutable
chmod +x /tmp/deploy-hetzner.sh

# Exécuter l'installation
bash /tmp/deploy-hetzner.sh
```

**Le script va installer automatiquement:**
- ✅ Docker & Docker Compose
- ✅ Firewall UFW (ports 22, 80, 443)
- ✅ Fail2ban pour sécurité SSH
- ✅ Clone du projet depuis GitHub
- ✅ Configuration système optimisée
- ✅ Démarrage de tous les services

**Durée estimée:** 5-10 minutes

### Étape 3: Configuration du domaine

**Modifier la configuration Caddy pour votre domaine:**

```bash
# Se connecter au serveur (si déconnecté)
ssh root@VOTRE_IP_HETZNER

# Éditer le Caddyfile
cd /opt/oceanphenix
nano core/proxy/Caddyfile
```

**Remplacer le contenu par:**

```caddy
# Configuration OceanPhenix avec domaine O2Switch

# Frontend principal
hub.votredomaine.fr {
    reverse_proxy hub-frontend:80
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# AI Studio
studio.votredomaine.fr {
    reverse_proxy openwebui:8080
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# API Backend
api.votredomaine.fr {
    reverse_proxy api:8000
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# Monitoring - Grafana
monitoring.votredomaine.fr {
    reverse_proxy grafana:3000
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# Administration - Portainer
admin.votredomaine.fr {
    reverse_proxy portainer:9000
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# MinIO Storage
storage.votredomaine.fr {
    reverse_proxy minio:9001
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

# Fallback - Accès direct par IP
http://VOTRE_IP_HETZNER {
    redir https://hub.votredomaine.fr permanent
}
```

**Remplacer `votredomaine.fr` par votre vrai domaine!**

### Étape 4: Configuration SSL Let's Encrypt

**Méthode 1: Let's Encrypt automatique (recommandé)**

```bash
# Modifier le Caddyfile pour SSL auto
cd /opt/oceanphenix
nano core/proxy/Caddyfile
```

**Simplifier la config TLS:**

```caddy
hub.votredomaine.fr {
    reverse_proxy hub-frontend:80
    # Let's Encrypt automatique
}

studio.votredomaine.fr {
    reverse_proxy openwebui:8080
}

# etc...
```

**Relancer Caddy:**

```bash
docker-compose restart caddy
docker-compose logs -f caddy
```

### Étape 5: Vérification

**Depuis votre navigateur:**

1. **Frontend**: https://hub.votredomaine.fr
2. **AI Studio**: https://studio.votredomaine.fr
3. **Monitoring**: https://monitoring.votredomaine.fr
4. **Admin**: https://admin.votredomaine.fr

**Vérifier les certificats SSL:**
- Cadenas vert dans le navigateur
- Certificat Let's Encrypt valide

**Depuis le serveur:**

```bash
# Vérifier les services
cd /opt/oceanphenix
docker-compose ps

# Vérifier les logs Caddy
docker-compose logs caddy

# Tester l'API
curl http://localhost:8000/health
```

---

## 🔐 Partie 3: Sécurisation Post-Installation

### 1. Configuration Firewall Hetzner Cloud

**Dans le panel Hetzner Cloud:**

1. Aller dans **Firewalls**
2. Créer un nouveau firewall
3. Ajouter ces règles:

```
Inbound Rules:
- SSH (22)     - Source: Votre IP fixe (recommandé)
- HTTP (80)    - Source: 0.0.0.0/0
- HTTPS (443)  - Source: 0.0.0.0/0

Outbound Rules:
- Allow All
```

4. Attacher le firewall à votre serveur

### 2. Sécuriser SSH

```bash
# Désactiver le login root par mot de passe
nano /etc/ssh/sshd_config

# Modifier ces lignes:
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes

# Redémarrer SSH
systemctl restart sshd
```

### 3. Configuration Fail2ban

```bash
# Vérifier Fail2ban
systemctl status fail2ban

# Voir les bans SSH
fail2ban-client status sshd

# Configuration (déjà faite par le script)
cat /etc/fail2ban/jail.local
```

### 4. Mots de passe des services

```bash
# Voir les mots de passe générés
cat /opt/oceanphenix/.env | grep PASSWORD

# Changer les mots de passe:
nano /opt/oceanphenix/.env

# Redémarrer après modification
cd /opt/oceanphenix
docker-compose restart grafana portainer
```

---

## 📊 Partie 4: Configuration des Services

### 1. Portainer

```bash
# Ouvrir: https://admin.votredomaine.fr
# Créer le compte admin dans les 5 minutes
# Username: admin
# Password: 12+ caractères
```

### 2. Grafana

```bash
# Ouvrir: https://monitoring.votredomaine.fr
# Login: admin
# Password: voir /opt/oceanphenix/.env

# Importer les dashboards:
# Menu → Dashboards → Import
# Fichiers: /opt/oceanphenix/core/monitoring/dashboards/
```

### 3. OpenWebUI (AI Studio)

```bash
# Ouvrir: https://studio.votredomaine.fr
# Créer un compte utilisateur
# Télécharger un modèle Ollama:

docker exec -it v10-ollama ollama pull llama2
docker exec -it v10-ollama ollama pull mistral
```

---

## 🔄 Partie 5: Maintenance et Mises à jour

### Mise à jour du projet

```bash
ssh root@VOTRE_IP_HETZNER
cd /opt/oceanphenix

# Sauvegarder avant
docker-compose down
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Mettre à jour
git pull origin main
docker-compose pull
docker-compose up -d

# Vérifier
docker-compose ps
docker-compose logs -f
```

### Backup automatique

```bash
# Créer un script de backup
cat > /opt/oceanphenix/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d-%H%M)

mkdir -p $BACKUP_DIR

# Backup données
cd /opt/oceanphenix
tar -czf $BACKUP_DIR/oceanphenix-data-$DATE.tar.gz data/

# Backup base Qdrant
docker exec v10-qdrant tar -czf /tmp/qdrant-backup.tar.gz /qdrant/storage
docker cp v10-qdrant:/tmp/qdrant-backup.tar.gz $BACKUP_DIR/qdrant-$DATE.tar.gz

# Garder 7 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup terminé: $DATE"
EOF

chmod +x /opt/oceanphenix/backup.sh

# Ajouter au cron (tous les jours à 2h)
crontab -e
# Ajouter: 0 2 * * * /opt/oceanphenix/backup.sh
```

### Monitoring système

```bash
# Espace disque
df -h

# Utilisation Docker
docker system df

# Nettoyer si nécessaire
docker system prune -a

# RAM et CPU
htop
```

---

## 🆘 Troubleshooting

### DNS ne résout pas

```bash
# Vérifier depuis le serveur
nslookup studio.votredomaine.fr

# Vérifier depuis votre PC
nslookup studio.votredomaine.fr

# Attendre la propagation (jusqu'à 24h)
# Forcer le cache DNS local:
ipconfig /flushdns  # Windows
```

### SSL ne fonctionne pas

```bash
# Vérifier les logs Caddy
docker-compose logs caddy

# Vérifier que les ports sont ouverts
ufw status

# Forcer le renouvellement
docker-compose restart caddy
```

### Service ne répond pas

```bash
cd /opt/oceanphenix

# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs -f SERVICE_NAME

# Redémarrer un service
docker-compose restart SERVICE_NAME

# Redémarrer tout
docker-compose restart
```

### Espace disque plein

```bash
# Vérifier l'espace
df -h

# Nettoyer Docker
docker system prune -a --volumes

# Supprimer les vieux backups
rm /opt/backups/oceanphenix-data-OLD*.tar.gz

# Nettoyer les logs
journalctl --vacuum-time=7d
```

---

## 📋 Checklist de déploiement

### O2Switch DNS ✅

- [ ] Connexion cPanel O2Switch
- [ ] Enregistrements A créés pour tous les sous-domaines
- [ ] Propagation DNS vérifiée (nslookup)
- [ ] TTL configuré à 3600

### Hetzner Serveur ✅

- [ ] Serveur créé (CPX41+, Ubuntu 24.04)
- [ ] Connexion SSH établie
- [ ] Script deploy-hetzner.sh exécuté
- [ ] Services Docker démarrés
- [ ] Firewall UFW configuré
- [ ] Fail2ban actif

### Configuration Domaine ✅

- [ ] Caddyfile modifié avec votre domaine
- [ ] SSL Let's Encrypt actif
- [ ] Tous les sous-domaines accessibles en HTTPS
- [ ] Redirections HTTP → HTTPS fonctionnelles

### Sécurité ✅

- [ ] Firewall Hetzner Cloud configuré
- [ ] SSH sécurisé (clés uniquement)
- [ ] Mots de passe changés dans .env
- [ ] Fail2ban vérifié
- [ ] Backup automatique configuré

### Services ✅

- [ ] Portainer configuré (compte admin créé)
- [ ] Grafana configuré (dashboards importés)
- [ ] OpenWebUI accessible (modèle Ollama téléchargé)
- [ ] API backend répond (/health)
- [ ] Frontend accessible

---

## 📞 Support

**GitHub:** https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026

**Issues:** https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues

**Documentation:**
- INSTALLATION.md - Guide complet
- DEPLOY_HETZNER.md - Déploiement Hetzner
- README.md - Vue d'ensemble

---

**🌊 OceanPhenix V10 - Plateforme IA Souveraine**
**O2Switch (DNS) + Hetzner (Hosting) = Production Ready!**
