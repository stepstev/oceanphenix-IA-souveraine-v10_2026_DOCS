# 🚀 Déploiement OceanPhenix V10 sur Hetzner

Ce guide décrit l'installation complète de la stack V10 (proxy, API, RAG, automation, BI, monitoring) sur un serveur Hetzner fraîchement provisionné.

---

## 1. Pré-requis

- Serveur Hetzner (Ubuntu 22.04 LTS recommandé) avec accès root.
- Nom de domaine pointant vers le serveur (A/AAAA). À défaut, le script utilisera `IP.nip.io` pour générer des sous-domaines SSL.
- Ports 22/80/443 ouverts côté Hetzner.
- Clé SSH déjà ajoutée au serveur.

Variables à préparer (elles peuvent être exportées avant de lancer le script) :

| Variable | Description |
| --- | --- |
| `ROOT_DOMAIN` | Domaine racine sans sous-domaine, ex `example.com`. Optionnel (auto `IP.nip.io`). |
| `ACME_EMAIL` | Email pour Let's Encrypt. Par défaut `admin@$ROOT_DOMAIN`. |
| `ADMIN_USER` | Compte basic-auth côté proxy. Par défaut `oceanphenix_admin`. |


---

## 2. Déploiement automatisé

1. **Connexion SSH**

   ```powershell
   ssh root@VOTRE_IP_HETZNER
   ```

2. **Téléchargement et exécution du script**

   ```bash
   # (Optionnel) forcer vos variables
   export ROOT_DOMAIN=example.com
   export ACME_EMAIL=ops@example.com

   # Télécharger le script officiel (stocké dans scripts/deploy-hetzner.sh)
   curl -fsSL https://raw.githubusercontent.com/stepstev/oceanphenix-IA-souveraine-v10_2026/main/scripts/deploy-hetzner.sh -o /tmp/deploy-hetzner.sh

   chmod +x /tmp/deploy-hetzner.sh
   /tmp/deploy-hetzner.sh
   ```

   Le script installe Docker + Docker Compose, crée l'utilisateur `oceanphenix`, clone le dépôt `main`, génère un `.env` basé sur `.env.example`, crée les réseaux externes (`v10_proxy`, `v10_internal`) puis lance la stack complète via `docker compose --profile all up -d`.

3. **Vérifications immédiates** (≈5 minutes après exécution)

   ```bash
   cd /opt/oceanphenix
   docker compose --profile all ps                     # État des conteneurs
   docker compose logs -f api                         # Logs API FastAPI
   curl -k https://api.${ROOT_DOMAIN:-$HOSTNAME}/health
   ```

---

## 3. Services exposés (par défaut)

| Usage | URL |
| --- | --- |
| Hub Dashboard | `https://app.<ROOT_DOMAIN>` |
| API REST | `https://api.<ROOT_DOMAIN>` |
| OpenWebUI Studio | `https://studio.<ROOT_DOMAIN>` |
| MinIO Console | `https://minio.<ROOT_DOMAIN>` |
| Portainer | `https://portainer.<ROOT_DOMAIN>` |
| Monitoring (Grafana) | `https://monitor.<ROOT_DOMAIN>` |
| Prometheus / Alertmanager | `https://monitor.<ROOT_DOMAIN>:9090` / `:9093` |
| Automation (n8n) | `https://n8n.<ROOT_DOMAIN>` |
| BI (Superset) | `https://bi.<ROOT_DOMAIN>` |

Les services internes (Qdrant `:6333`, Ollama `:11434`, Postgres, Valkey) restent sur le réseau privé.

---

## 4. Post-installation recommandée

1. **Revue du fichier `.env`** (généré depuis `.env.example`).
   - Adapter les sous-domaines (`DOMAIN_*`).
   - Vérifier les secrets automatiques (JWT, Grafana, Portainer, Superset, n8n, MinIO...).
   - Compléter les sections SMTP / Alertmanager si vous souhaitez recevoir des alertes.

2. **Portainer** (`https://portainer.<ROOT_DOMAIN>`)
   - Créez le compte admin dans les 5 minutes suivant le premier accès.

3. **Grafana** (`https://monitor.<ROOT_DOMAIN>`)
   - Identifiant : `admin`
   - Mot de passe : valeur `GRAFANA_ADMIN_PASSWORD` dans `.env`.
   - Importer les dashboards fournis (`core/monitoring/dashboards/*.json`).

4. **Modèles Ollama**
   ```bash
   docker exec -it v10-ollama ollama pull mistral:7b
   docker exec -it v10-ollama ollama pull nomic-embed-text
   ```

5. **Vérifier les jobs n8n et Superset**
   - n8n : activer l'authentification Basic (déjà configurée via `.env`).
   - Superset : exécuter l'initialisation (`superset fab create-admin`, etc.) si nécessaire.

---

## 5. Commandes utiles

```bash
cd /opt/oceanphenix

# Afficher les services
docker compose --profile all ps

# Logs ciblés
docker compose logs -f api

# Redémarrer un service
docker compose restart v10-api

# Mettre à jour la stack
git pull
docker compose --profile all pull
docker compose --profile all up -d

# Arrêt / nettoyage
docker compose down
docker system prune -af
```

Scripts utiles : `scripts/backup.sh` (si présent) pour archiver les volumes, ou `scripts/sync-minio-to-openwebui.sh` pour synchroniser les données RAG.

---

## 6. Sécurité & maintenance

- Le script active automatiquement UFW (22/80/443) et Fail2ban sur SSH.
- Un utilisateur système `oceanphenix` est créé et ajouté au groupe Docker.
- Les mots de passe critiques sont générés aléatoirement (stockés dans `/opt/oceanphenix/.env`). Sauvegardez ce fichier.
- Pensez à ajouter des enregistrements DNS pour chaque sous-domaine si vous n'utilisez pas `nip.io`.
- Configurez les alertes (Alertmanager → email/Slack) pour profiter du monitoring Prometheus.

---

## 7. Dépannage

| Problème | Commandes à exécuter |
| --- | --- |
| Un service ne démarre pas | `docker compose logs -f <service>` |
| Ressource bloquée | `docker compose down && docker compose --profile all up -d` |
| Port déjà occupé | `ss -tulpn \| grep PORT` |
| Réseaux manquants | `docker network ls`, `docker network create v10_proxy` |
| Manque d'espace | `df -h`, `docker system prune -af` |

---

## 8. Support

- Dépôt GitHub : <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026>
- Issues : <https://github.com/stepstev/oceanphenix-IA-souveraine-v10_2026/issues>
