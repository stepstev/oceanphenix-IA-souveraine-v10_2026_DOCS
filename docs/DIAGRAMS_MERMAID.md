# 📊 Diagrammes Architecture - OceanPhenix

Documentation visuelle avec diagrammes Mermaid (compatibles GitHub).

---

## 📋 Architecture Globale - Vue Déploiement

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'24px', 'fontFamily':'Arial, sans-serif'}}}%%
graph TB
    subgraph Client["👥 Clients / Utilisateurs"]
        BROWSER[🌐 Navigateur Web]
        API_CLIENT[🔌 API Clients]
    end

    subgraph O2Switch["☁️ O2Switch - Frontend Hébergement"]
        STATIC["Hub Frontend - HTTPS"]
    end

    subgraph Internet["🌐 Internet"]
        DNS[🔗 DNS Records]
    end

    subgraph Hetzner["🖥️ Hetzner VPS - Backend"]
        subgraph Firewall["🛡️ UFW Firewall"]
            FW_RULES["Ports: 80, 443, 22"]
        end
        
        subgraph Docker["🐳 Docker Host Ubuntu 22.04"]
            subgraph Compose["Docker Compose Stack"]
                PROXY[Caddy Proxy]
                WEB[Open WebUI]
                API[FastAPI]
                LLM[Ollama]
                VDB[Qdrant]
                S3[MinIO]
                MON[Grafana+Prometheus]
                AUTO_SERVICES["n8n + Portainer + Sync"]
            end
            
            VOLUMES[("Docker Volumes")]
        end
    end

    BROWSER -->|HTTPS| DNS
    API_CLIENT -->|HTTPS| DNS
    DNS -->|Domain Resolution| STATIC
    DNS -->|Domain/IP Resolution| FW_RULES
    
    STATIC -.->|API Calls HTTPS| FW_RULES
    
    FW_RULES --> PROXY
    PROXY --> WEB
    PROXY --> API
    PROXY --> MON
    
    API --> LLM
    API --> VDB
    API --> S3
    WEB --> LLM
    WEB --> VDB
    
    COMPOSE --> VOLUMES
    
    style Client fill:#e3f2fd
    style O2Switch fill:#f3e5f5
    style Hetzner fill:#fff3e0
    style Docker fill:#e8f5e9
```

---

## 🏗️ Architecture 4 Tiers - Serveur Hetzner CAX41

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'24px', 'fontFamily':'Arial, sans-serif'}}}%%
graph TB
    %% Définition des styles
    classDef tierPresentation fill:#4CAF50,stroke:#2E7D32,stroke-width:4px,color:#fff,font-size:22px
    classDef tierApp fill:#2196F3,stroke:#1565C0,stroke-width:4px,color:#fff,font-size:22px
    classDef tierData fill:#FF9800,stroke:#E65100,stroke-width:4px,color:#fff,font-size:22px
    classDef tierAnalytics fill:#9C27B0,stroke:#6A1B9A,stroke-width:4px,color:#fff,font-size:22px
    classDef tierBi fill:#E91E63,stroke:#AD1457,stroke-width:4px,color:#fff,font-size:22px
    classDef storage fill:#00BCD4,stroke:#00838F,stroke-width:3px,color:#fff,font-size:22px
    classDef vectordb fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff,font-size:22px
    classDef strapi fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff,font-size:22px
    
    %% Internet
    Users[👥 Utilisateurs]
    
    %% O2Switch - Frontend statique
    subgraph O2["☁️ O2Switch - Hébergement Frontend"]
        HubFront[📱 Frontend Hub<br/>Interface Web Statique]:::tierPresentation
    end
    
    %% Tier 1: Présentation - Serveur Hetzner CAX41
    subgraph T1[" Tier 1: Reverse Proxy & Monitoring - Serveur Hetzner CAX41"]
        Caddy[🛡️ Caddy Reverse Proxy<br/>HTTPS/SSL Auto]:::tierPresentation
        Grafana[📊 Grafana<br/>Monitoring]:::tierPresentation
    end
    
    %% Tier 2: Application
    subgraph T2[" Tier 2: Application"]
        FastAPI[⚡ FastAPI Backend<br/>RAG Pipeline]:::tierApp
        OpenWebUI[💬 OpenWebUI<br/>Chat IA Interface]:::tierApp
        N8N[🔄 n8n Workflows<br/>Automation]:::tierApp
    end
    
    %% Tier 3: Data Layer
    subgraph T3[" Tier 3: Data Layer"]
        Ollama[🤖 Ollama<br/>LLM Engine + Models]:::tierData
        Qdrant[🔮 Qdrant<br/>Vector DB]:::vectordb
        MinIO[💾 MinIO<br/>S3 Storage]:::storage
        Strapi[📚 Strapi CMS<br/>Knowledge Base]:::strapi
        PostgreSQL[🗄️ PostgreSQL<br/>Strapi DB]:::strapi
    end
    
    %% Tier 4: Analytics
    subgraph T4[" Tier 4: Analytics"]
        Prometheus[📈 Prometheus<br/>Metrics]:::tierAnalytics
        ApacheBI[📊 Apache Superset<br/>Business Intelligence]:::tierBi
    end
    
    %% Connexions Internet → O2Switch & Hetzner
    Users -->|HTTPS| HubFront
    Users -->|HTTPS:443| Caddy
    HubFront -.->|API Calls| Caddy
    
    %% Caddy routing
    Caddy -->|/grafana| Grafana
    Caddy -->|/bi| ApacheBI
    Caddy -->|/n8n| N8N
    Caddy -->|/studio| HubFront
    Caddy -->|/api| FastAPI
    Caddy -->|/strapi| Strapi
    
    %% Tier 2 → Tier 3
    FastAPI -->|Query| Ollama
    FastAPI -->|Vector Search| Qdrant
    FastAPI -->|Documents| MinIO
    FastAPI -->|Content| Strapi
    OpenWebUI -->|Chat| Ollama
    OpenWebUI -->|RAG| Qdrant
    N8N -->|Automation| FastAPI
    N8N -->|Sync| MinIO
    Strapi -->|Store| PostgreSQL
    
    %% Tier 4 Monitoring
    Grafana -->|Query| Prometheus
    Prometheus -->|Scrape| FastAPI
    Prometheus -->|Scrape| Ollama
    Prometheus -->|Scrape| Caddy
    ApacheBI -->|Analyze| Strapi
    
    %% Styling tiers
    style O2 fill:#F3E5F5,stroke:#9C27B0,stroke-width:4px
    style T1 fill:#E8F5E9,stroke:#4CAF50,stroke-width:4px
    style T2 fill:#E3F2FD,stroke:#2196F3,stroke-width:4px
    style T3 fill:#FFF3E0,stroke:#FF9800,stroke-width:4px
    style T4 fill:#F3E5F5,stroke:#9C27B0,stroke-width:4px
    style Users fill:#FFF,stroke:#666,stroke-width:2px
```

### Légende des Tiers

| Serveur | Tier | Couleur | Rôle | Services |
|---------|------|---------|------|----------|
| **O2Switch** | Frontend | 💜 Violet | Interface utilisateur statique | Hub Frontend (HTML/CSS/JS) |
| **Hetzner** | Tier 1: Reverse Proxy | 🟫 Vert | Exposition HTTPS, Monitoring UI | Caddy, Grafana |
| **Hetzner** | Tier 2: Application | 🔵 Bleu | Logique métier, API, Automation | FastAPI, OpenWebUI, n8n |
| **Hetzner** | Tier 3: Data Layer | 🟠 Orange | Stockage données, LLM, Base de connaissances | Ollama, Qdrant, MinIO, Strapi, PostgreSQL |
| **Hetzner** | Tier 4: Analytics | 🟣 Violet | Métriques, Business Intelligence | Prometheus, Apache Superset |

---

## 🔄 Diagramme de Séquence - Pipeline RAG

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
sequenceDiagram
    actor User as 👤 Utilisateur
    participant WEB as 💬 OpenWebUI
    participant API as ⚡ FastAPI
    participant VDB as 🔮 Qdrant
    participant LLM as 🤖 Ollama
    participant S3 as 💾 MinIO

    User->>WEB: Question RAG
    WEB->>API: POST /api/rag/query
    activate API
    
    API->>VDB: Vector Search (embedding)
    activate VDB
    VDB-->>API: Documents pertinents (top-k)
    deactivate VDB
    
    API->>S3: GET /documents/{ids}
    activate S3
    S3-->>API: Contenus complets
    deactivate S3
    
    API->>API: Construction contexte
    API->>LLM: Generate (prompt + contexte)
    activate LLM
    LLM-->>API: Réponse augmentée
    deactivate LLM
    
    API-->>WEB: Response JSON + sources
    deactivate API
    WEB-->>User: Affichage réponse + citations
```

---

## 📤 Diagramme de Séquence - Auto-Indexation Documents

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
sequenceDiagram
    actor User as 👤 Utilisateur
    participant WEB as 💬 OpenWebUI
    participant API as ⚡ FastAPI
    participant S3 as 💾 MinIO
    participant INDEX as 🔄 Auto-Indexer
    participant VDB as 🔮 Qdrant
    participant LLM as 🤖 Ollama

    User->>WEB: Upload Document (PDF/DOCX)
    WEB->>API: POST /api/documents
    activate API
    
    API->>S3: Store file (bucket:documents)
    S3-->>API: file_id + URL
    
    API->>INDEX: Trigger indexation event
    deactivate API
    
    activate INDEX
    INDEX->>S3: Download document
    S3-->>INDEX: File content
    
    INDEX->>INDEX: Extract text (PDF/DOCX parser)
    INDEX->>INDEX: Split chunks (512 tokens)
    
    loop Pour chaque chunk
        INDEX->>LLM: Create embedding
        LLM-->>INDEX: Vector (768 dim)
        INDEX->>VDB: Upsert vector + metadata
    end
    
    INDEX->>API: Indexation complete
    deactivate INDEX
    
    API-->>WEB: Success + doc_id
    WEB-->>User: ✅ Document indexé
```

---

## 🔐 Diagramme de Composants - Sécurité & Réseau

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    subgraph Internet["🌐 Internet Public"]
        USERS[👥 Utilisateurs]
    end
    
    subgraph Hetzner["🖥️ Hetzner VPS Ubuntu 22.04"]
        subgraph FW["🛡️ UFW Firewall"]
            RULES["Rules:<br/>✅ 80/tcp (HTTP → HTTPS)<br/>✅ 443/tcp (HTTPS)<br/>✅ 22/tcp (SSH)<br/>❌ Autres ports bloqués"]
        end
        
        subgraph Caddy["🔐 Caddy Reverse Proxy"]
            SSL["Let's Encrypt<br/>SSL/TLS Auto"]
            ROUTES["Routes:<br/>/api → FastAPI:8000<br/>/studio → Frontend:8080<br/>/grafana → Grafana:3001"]
        end
        
        subgraph Docker["🐳 Docker Network (Isolated)"]
            subgraph Services["Services Stack"]
                API[FastAPI:8000]
                WEB[OpenWebUI:3000]
                GRAF[Grafana:3001]
                OLLAMA[Ollama:11434]
            end
            
            NETWORK["🔒 Bridge Network<br/>internal-only"]
        end
    end
    
    USERS -->|HTTPS:443| FW
    FW -->|Allowed| SSL
    SSL -->|TLS Termination| ROUTES
    
    ROUTES -->|Proxy| API
    ROUTES -->|Proxy| WEB
    ROUTES -->|Proxy| GRAF
    
    API -->|Internal| OLLAMA
    API -.->|Internal| NETWORK
    
    style Internet fill:#e3f2fd
    style FW fill:#ffebee
    style Caddy fill:#e8f5e9
    style Docker fill:#fff3e0
    style Services fill:#f3e5f5
```

---

## 📊 Diagramme de Monitoring - Stack Prometheus/Grafana

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph LR
    subgraph Frontend["🖥️ Frontend Monitoring"]
        GRAF[📊 Grafana<br/>Port 3001]
    end
    
    subgraph Metrics["📈 Metrics Collection"]
        PROM[🔍 Prometheus<br/>Port 9090]
        
        subgraph Exporters["Exporters"]
            NODE[📡 Node Exporter<br/>System Metrics]
            CADV[🐳 cAdvisor<br/>Docker Metrics]
        end
    end
    
    subgraph Targets["🎯 Monitored Services"]
        OLLAMA[🤖 Ollama:11434]
        FAST[⚡ FastAPI:8000]
        CADDY[🛡️ Caddy:2019]
        QDRANT[🔮 Qdrant:6333]
    end
    
    GRAF -->|PromQL Queries| PROM
    
    PROM -->|Scrape /metrics| NODE
    PROM -->|Scrape /metrics| CADV
    PROM -->|Scrape /metrics| OLLAMA
    PROM -->|Scrape /metrics| FAST
    PROM -->|Scrape /metrics| CADDY
    PROM -->|Scrape /metrics| QDRANT
    
    NODE -->|CPU, RAM, Disk, Network| PROM
    CADV -->|Container Stats| PROM
    
    style Frontend fill:#f3e5f5
    style Metrics fill:#e8f5e9
    style Exporters fill:#fff3e0
    style Targets fill:#e3f2fd
```

---

## 🗂️ Diagramme de Classes - Backend API

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'18px'}}}%%
classDiagram
    class FastAPI {
        +app: FastAPI
        +start_server()
        +add_routes()
    }
    
    class RAGPipeline {
        +query(text: str) dict
        +index_document(file: File) str
        -_embed(text: str) Vector
        -_retrieve(query_vector: Vector) List~Doc~
        -_generate(context: str, query: str) str
    }
    
    class VectorStore {
        +client: QdrantClient
        +collection_name: str
        +upsert(vectors: List) None
        +search(vector: Vector, top_k: int) List
        +delete(ids: List) None
    }
    
    class LLMManager {
        +ollama_url: str
        +generate(prompt: str, model: str) str
        +list_models() List~str~
        +pull_model(name: str) bool
    }
    
    class DocumentStore {
        +s3_client: MinioClient
        +bucket: str
        +upload(file: bytes, name: str) str
        +download(file_id: str) bytes
        +list() List~str~
    }
    
    class ModelsManager {
        +llm: LLMManager
        +list_available() List
        +get_active() str
        +set_active(model: str) None
    }
    
    FastAPI --> RAGPipeline : uses
    RAGPipeline --> VectorStore : retrieves from
    RAGPipeline --> LLMManager : generates with
    RAGPipeline --> DocumentStore : reads from
    FastAPI --> ModelsManager : manages
    ModelsManager --> LLMManager : controls
```

---

## 🔄 Flux de Données - Architecture Complète

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph LR
    subgraph Frontend["🌐 Frontend"]
        HUB[📱 Hub Frontend]
        OW[💬 Open WebUI]
    end
    
    subgraph API["⚡ API Layer"]
        FAST[FastAPI<br/>RAG Pipeline]
    end
    
    subgraph Intelligence["🧠 Intelligence"]
        OLLAMA[🤖 Ollama<br/>LLM Engine]
        QDRANT[🔮 Qdrant<br/>Vector Search]
        MINIO[💾 MinIO<br/>Document Storage]
    end
    
    subgraph Automation["🔄 Automation"]
        SYNC[📤 MinIO Sync]
        AUTO[🔄 Auto-Indexer]
    end
    
    HUB -->|API Calls| FAST
    OW --> FAST
    GR -->|Metrics| PROM
    FAST --> OLLAMA
    FAST --> QDRANT
    FAST --> MINIO
    OW --> OLLAMA
    OW --> QDRANT
    MINIO --> SYNC
    SYNC --> AUTO
    AUTO --> OW
    OLLAMA --> QDRANT

    style Frontend fill:#e0f7fa
    style API fill:#f3e5f5
    style Intelligence fill:#fff3e0
    style Automation fill:#e8f5e9
```

---

## 📚 Ressources

- **GitHub Repository** : [stepstev/oceanphenix-IA-souveraine-v8](<https://github.com/stepstev/oceanphenix-IA-souveraine-v8>)
- **Documentation Installation** : [INSTALL_LOCAL.md](INSTALL_LOCAL.md) | [INSTALL_HETZNER.md](INSTALL_HETZNER.md)
- **Mermaid Live Editor** : <https://mermaid.live>
- **Mermaid Documentation** : <https://mermaid.js.org>

---

**© 2025 OceanPhenix IA Souveraine v8** | Made with ❤️ in France 🇫🇷
