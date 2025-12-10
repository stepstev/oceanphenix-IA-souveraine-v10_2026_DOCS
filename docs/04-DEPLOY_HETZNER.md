# 🚀 Guide d'installation OceanPhenix V10 sur Hetzner

## Serveur: VOTRE_IP_HETZNER

### Étape 1: Connexion SSH

Depuis votre machine Windows:

```powershell
ssh root@VOTRE_IP_HETZNER
```

### Étape 2: Télécharger et exécuter le script

```bash
# Télécharger le script
curl -o /tmp/deploy-hetzner.sh <https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/deploy-hetzner.sh>

# Rendre exécutable
chmod +x /tmp/deploy-hetzner.sh

# Exécuter (en root)
bash /tmp/deploy-hetzner.sh
```

### Étape 3: Vérification

Après installation (~5 minutes), testez:

```bash
# Voir les services
cd /opt/oceanphenix
docker-compose ps

# Voir les logs
docker-compose logs -f backend

# Tester l'API
curl <http://localhost:8000/health>
```

### Services accessibles:

- **Hub Frontend**: <http://VOTRE_IP_HETZNER:8000>
- **OpenWebUI**: <http://VOTRE_IP_HETZNER:3000>
- **Grafana**: <http://VOTRE_IP_HETZNER:3001>
- **Prometheus**: <http://VOTRE_IP_HETZNER:9090>
- **Portainer**: <https://VOTRE_IP_HETZNER:9443>
- **MinIO**: <http://VOTRE_IP_HETZNER:9001>

### Configuration post-installation


1. **Portainer** (<https://VOTRE_IP_HETZNER:9443>)

   - Créer compte admin dans les 5 minutes
   - Password: minimum 12 caractères


2. **Grafana** (<http://VOTRE_IP_HETZNER:3001>)

   - Login: `admin`
   - Password: voir `/opt/oceanphenix/.env`


3. Importer les dashboards Grafana

   ```bash
   cd /opt/oceanphenix/core/monitoring/dashboards
   # Importer via UI Grafana: oceanphenix-platform-health.json
   # Importer via UI Grafana: oceanphenix-containers-monitoring.json
   ```

### Commandes utiles

```bash
# Naviguer vers le projet
cd /opt/oceanphenix

# Voir tous les services
docker-compose ps

# Redémarrer un service
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f backend

# Arrêter tout
docker-compose down

# Démarrer tout
docker-compose up -d

# Mise à jour depuis GitHub
git pull
docker-compose pull
docker-compose up -d
```

### Sécurité

Le script configure automatiquement:
- ✅ Firewall UFW (ports 22, 80, 443)
- ✅ Fail2ban pour SSH
- ✅ Utilisateur système dédié
- ✅ Mots de passe aléatoires

### Backup manuel

```bash
# Backup des données
cd /opt/oceanphenix
./scripts/backup.sh  # Si disponible

# Ou backup manuel
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

### Troubleshooting

**Services ne démarrent pas:**
```bash
docker-compose logs -f
```

**Port déjà utilisé:**
```bash
netstat -tulpn | grep :8000
```

**Redémarrage complet:**
```bash
cd /opt/oceanphenix
docker-compose down
docker-compose up -d
```

**Espace disque:**
```bash
df -h
docker system prune -a  # Nettoyer Docker
```

### Support

- GitHub: <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026>
- Issues: <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues>
