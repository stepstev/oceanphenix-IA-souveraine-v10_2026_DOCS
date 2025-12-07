# 🚨 Configuration Alertmanager - Guide Rapide

## 📧 Configuration Email

Alertmanager est configuré pour envoyer des alertes par email. Voici comment le configurer selon votre fournisseur.

### 1️⃣ Éditer `.env`

```bash
nano .env  # ou notepad sur Windows
```

Configurer selon votre fournisseur email :

#### Gmail (App Password requis)

```env
ALERT_EMAIL=votre.email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASSWORD=<App Password 16 caractères>
SMTP_FROM=votre.email@gmail.com
```

**Créer App Password** : https://support.google.com/accounts/answer/185833

#### Office 365 / Outlook

```env
ALERT_EMAIL=votre.email@votredomaine.com
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre.email@votredomaine.com
SMTP_PASSWORD=<votre mot de passe>
SMTP_FROM=votre.email@votredomaine.com
```

#### OVH

```env
ALERT_EMAIL=admin@votredomaine.com
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=admin@votredomaine.com
SMTP_PASSWORD=<votre mot de passe>
SMTP_FROM=admin@votredomaine.com
```

#### O2Switch

```env
ALERT_EMAIL=admin@votredomaine.com
SMTP_HOST=mail.votredomaine.com
SMTP_PORT=587
SMTP_USER=admin@votredomaine.com
SMTP_PASSWORD=<votre mot de passe>
SMTP_FROM=admin@votredomaine.com
```

### 2️⃣ Éditer `core/monitoring/alertmanager.yml`

Remplacer les adresses email par les vôtres :

```yaml
global:
  smtp_from: 'alertes@votredomaine.com'
  smtp_smarthost: 'smtp.example.com:587'
  smtp_auth_username: 'alertes@votredomaine.com'
  smtp_auth_password: '${SMTP_PASSWORD}'

receivers:
  - name: 'email-oceanphenix'
    email_configs:
      - to: 'admin@votredomaine.com'  # ← Votre email
  
  - name: 'email-critical'
    email_configs:
      - to: 'admin@votredomaine.com, support@votredomaine.com'  # ← Plusieurs emails
```

### 3️⃣ Démarrer Alertmanager

```bash
# Redémarrer la stack monitoring
docker compose --profile monitoring down
docker compose --profile monitoring up -d

# Vérifier les services
docker compose ps | grep -E "prometheus|alertmanager"

# Vérifier les logs
docker logs v8-alertmanager
docker logs v8-prometheus
```

### 4️⃣ Tester les Alertes

#### Test manuel via Alertmanager UI

1. Ouvrir http://localhost:9093
2. **Alerts** → Voir les alertes actives
3. **Status** → Vérifier configuration

#### Tester l'envoi d'email

```bash
# Créer une alerte de test dans Prometheus
curl -X POST http://localhost:9090/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "Test d alerte",
      "description": "Ceci est un test"
    }
  }]'
```

Ou simuler une condition d'alerte :

```bash
# Générer charge CPU (Linux/macOS)
stress --cpu 8 --timeout 300s

# Ou en Docker
docker run --rm -it progrium/stress --cpu 2 --timeout 60s
```

Vous devriez recevoir un email sous quelques minutes.

### 5️⃣ Vérifier Configuration

#### Prometheus

```bash
# Vérifier que Prometheus voit Alertmanager
curl http://localhost:9090/api/v1/alertmanagers | jq

# Vérifier les règles chargées
curl http://localhost:9090/api/v1/rules | jq
```

#### Alertmanager

```bash
# Vérifier statut
curl http://localhost:9093/-/healthy

# Voir configuration
curl http://localhost:9093/api/v1/status | jq
```

---

## 📋 Types d'Alertes Configurées

### 🔴 Critiques (envoi immédiat)

- **InstanceDown** : Service ne répond plus
- **CriticalCPUUsage** : CPU > 95%
- **CriticalMemoryUsage** : RAM > 95%
- **DiskSpaceCritical** : Disque < 10%
- **OllamaDown** : LLM Engine down
- **QdrantDown** : Vector DB down
- **BackendAPIDown** : API backend down

### 🟡 Warnings (notification toutes les heures)

- **HighCPUUsage** : CPU > 80%
- **HighMemoryUsage** : RAM > 80%
- **DiskSpaceLow** : Disque < 20%
- **ContainerRestarted** : Conteneur redémarré

### 🔵 Info (notification quotidienne)

- **HighHTTPErrorRate** : Taux erreur HTTP élevé

---

## 🎨 Templates Email

Les emails sont stylisés en HTML avec :

- 🎨 Couleurs selon sévérité (rouge/orange/bleu)
- 📊 Informations détaillées (instance, labels, timestamps)
- 🔗 Lien vers Alertmanager pour plus de détails
- ✅ Notification de résolution

Exemple d'email :

```
🚨 [CRITIQUE] InstanceDown

🔥 OllamaDown
CRITIQUE

📋 Résumé: Ollama LLM Engine est DOWN
📝 Description: Le service Ollama ne répond plus
🖥️ Instance: ollama:11434
⏰ Début: 2025-12-07 14:23:45
```

---

## 🔧 Personnalisation

### Ajouter des Alertes Personnalisées

Éditer `core/monitoring/alert_rules.yml` :

```yaml
- alert: MonAlerte
  expr: ma_metrique > seuil
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Résumé de l'alerte"
    description: "Description détaillée"
```

Recharger Prometheus :

```bash
curl -X POST http://localhost:9090/-/reload
```

### Ajouter des Destinataires

Dans `alertmanager.yml`, section receivers :

```yaml
- name: 'email-equipe'
  email_configs:
    - to: 'dev@example.com, ops@example.com, manager@example.com'
```

### Intégration Slack/Teams

Ajouter webhook dans `alertmanager.yml` :

```yaml
- name: 'slack-critical'
  slack_configs:
    - api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
      channel: '#alerts'
      title: '{{ .GroupLabels.alertname }}'
      text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## 🐛 Dépannage

### Emails non reçus

```bash
# Vérifier logs Alertmanager
docker logs v8-alertmanager | grep -i error

# Vérifier configuration SMTP
docker exec v8-alertmanager cat /etc/alertmanager/alertmanager.yml | grep smtp

# Tester SMTP manuellement
telnet smtp.example.com 587
```

### Alertes non déclenchées

```bash
# Vérifier règles Prometheus
curl http://localhost:9090/api/v1/rules | jq

# Vérifier alertes actives
curl http://localhost:9090/api/v1/alerts | jq

# Vérifier métriques
curl http://localhost:9090/api/v1/query?query=up
```

### Spam d'alertes

Ajuster dans `alertmanager.yml` :

```yaml
route:
  group_wait: 30s       # Attendre 30s avant envoi
  repeat_interval: 4h   # Répéter toutes les 4h
```

---

## 📚 Ressources

- **Alertmanager UI** : http://localhost:9093
- **Prometheus UI** : http://localhost:9090
- **Documentation officielle** : https://prometheus.io/docs/alerting/latest/
- **Configuration SMTP** : https://prometheus.io/docs/alerting/latest/configuration/#email_config

---

**🌊 OceanPhenix V8** - Monitoring & Alertes
