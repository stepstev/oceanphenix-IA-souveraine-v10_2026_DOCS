# 📊 Dashboard Grafana OceanPhenix - Guide d'Installation

## 🎯 Objectif

Ce dashboard fournit une vue complète de la santé de la plateforme OceanPhenix V10, utilisant :
- **Prometheus** : Collecte des métriques
- **Node Exporter** : Métriques système (CPU, RAM, Disk, Network)
- **cAdvisor** : Métriques des conteneurs Docker

## 📈 Composants du Dashboard

### 1. **🌊 OceanPhenix Platform Overview**
- Statut Prometheus (UP/DOWN)
- Nombre de services actifs
- CPU Usage global (%)
- Memory Usage global (%)
- Disk Usage (%)
- System Uptime

### 2. **📊 System Resources**
- CPU Usage Over Time (graphique temps réel)
- Memory Usage Over Time (Total/Available/Used)

### 3. **🐳 Docker Containers (cAdvisor)**
- CPU Usage par conteneur
- Memory Usage par conteneur

### 4. **🌐 Network & Disk I/O**
- Network Traffic (RX/TX par interface)
- Disk I/O (Read/Write par device)

### 5. **🔍 Services Health Status**
- Table de tous les services avec statut UP/DOWN
- Affichage coloré (vert=UP, rouge=DOWN)

## 🚀 Installation

### Option 1 : Import via l'interface Grafana

1. **Accédez à Grafana**
   ```
   http://localhost:3001
   Login: admin
   Password: OceanPhenix2025!
   ```

2. **Menu** → **Dashboards** → **Import**

3. **Upload JSON file**
   - Sélectionnez le fichier `oceanphenix-platform-health.json`

4. **Sélectionnez la datasource**
   - Choisir "Prometheus" comme source de données
   - Cliquer sur **Import**

### Option 2 : Import automatique via provisioning

1. **Créer le dossier de provisioning**
   ```powershell
   New-Item -ItemType Directory -Force -Path ".\core\monitoring\grafana\provisioning\dashboards"
   ```

2. **Copier le dashboard**
   ```powershell
   Copy-Item ".\core\monitoring\dashboards\oceanphenix-platform-health.json" -Destination ".\core\monitoring\grafana\provisioning\dashboards\"
   ```

3. **Créer le fichier de configuration**
   ```powershell
   @"
   apiVersion: 1

   providers:
     - name: 'OceanPhenix Dashboards'
       orgId: 1
       folder: 'OceanPhenix'
       type: file
       disableDeletion: false
       updateIntervalSeconds: 10
       allowUiUpdates: true
       options:
         path: /etc/grafana/provisioning/dashboards
   "@ | Out-File -FilePath ".\core\monitoring\grafana\provisioning\dashboards\dashboards.yml" -Encoding UTF8
   ```

4. **Redémarrer Grafana**
   ```powershell
   docker-compose restart grafana
   ```

## ⚙️ Configuration Prometheus

Vérifiez que votre `prometheus.yml` contient les jobs suivants :

```yaml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'api-backend'
    static_configs:
      - targets: ['api-backend:8000']
```

## 🔧 Personnalisation

### Ajouter des alertes

1. Dans Grafana, ouvrez le dashboard
2. Cliquez sur un panel → **Edit**
3. Onglet **Alert** → **Create Alert**
4. Définissez les conditions (ex: CPU > 90%)

### Modifier les seuils

Dans le JSON, recherchez `thresholds` et ajustez :
```json
"thresholds": {
  "mode": "absolute",
  "steps": [
    {"color": "green", "value": null},
    {"color": "yellow", "value": 70},
    {"color": "red", "value": 85}
  ]
}
```

### Ajouter un nouveau panel

1. **Edit Dashboard** → **Add Panel**
2. Sélectionner la datasource **Prometheus**
3. Entrer une requête PromQL, exemple :
   ```promql
   rate(container_network_receive_bytes_total{name="v10-ollama"}[5m])
   ```

## 📊 Requêtes PromQL Utiles

### CPU par conteneur
```promql
rate(container_cpu_usage_seconds_total{name=~".+"}[5m]) * 100
```

### Mémoire disponible
```promql
node_memory_MemAvailable_bytes
```

### Trafic réseau
```promql
rate(node_network_receive_bytes_total{device!="lo"}[5m])
```

### Services UP
```promql
count(up == 1)
```

### Disk usage par conteneur
```promql
container_fs_usage_bytes{name=~".+"}
```

## 🐛 Dépannage

### Les métriques ne s'affichent pas

1. **Vérifier Prometheus** : http://localhost:9090/targets
   - Tous les targets doivent être "UP"

2. **Vérifier la datasource dans Grafana**
   - Configuration → Data Sources → Prometheus
   - URL: `http://prometheus:9090`
   - Cliquer sur **Save & Test**

3. **Logs des conteneurs**
   ```powershell
   docker-compose logs prometheus
   docker-compose logs grafana
   docker-compose logs node-exporter
   docker-compose logs cadvisor
   ```

### Panels vides

- Vérifier que la période sélectionnée contient des données
- Essayer "Last 6 hours" au lieu de "Last 24 hours"
- Rafraîchir avec Ctrl+R

### cAdvisor ne remonte pas de métriques

- Vérifier que cAdvisor a accès à Docker socket
- Dans `docker-compose.yml` :
  ```yaml
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  ```

## 🎨 Thèmes et Variables

Le dashboard supporte :
- **Dark theme** (par défaut)
- **Light theme** (changer dans Grafana Preferences)
- **Auto-refresh** : 30 secondes
- **Time range** : 6 heures par défaut

## 📚 Ressources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter Metrics](https://github.com/prometheus/node_exporter)
- [cAdvisor Metrics](https://github.com/google/cadvisor)

## 🆘 Support

Pour toute question ou amélioration :
- Modifier le dashboard dans Grafana
- Exporter le JSON (Dashboard Settings → JSON Model)
- Sauvegarder dans `core/monitoring/dashboards/`
