# 🛡️ Sentinel-X Road Intelligence
> **BIMSTEC-Focused Offline-Resilient Road Safety & Legal Compliance Ecosystem**

Sentinel-X is a state-of-the-art, premium road intelligence platform custom-tailored for the **BIMSTEC** region (*Bangladesh, Bhutan, India, Myanmar, Nepal, Sri Lanka, and Thailand*). It is designed to navigate the unique challenges of cross-border transit, highly fragmented traffic laws, diverse driving alignments (e.g., transition from Left-Hand Drive in Thailand to Right-Hand Drive in Myanmar), and limited internet connectivity along highway transit networks.

Combining an Express API backend, a PostgreSQL Vector Database (pgvector), and a highly polished React + Vite Progressive Web App (PWA) frontend, Sentinel-X serves as a comprehensive digital co-pilot for drivers, tourists, and commercial transit operators alike.

---

## 🗺️ Table of Contents
1. [Core Features & Premium Modules](#-core-features--premium-modules)
2. [Technical Architecture](#%EF%B8%8F-technical-architecture)
3. [Monorepo Package Structure](#-monorepo-package-structure)
4. [Prerequisites & Installation](#%EF%B8%8F-prerequisites--installation)
5. [Local Development & System Launch](#-local-development--system-launch)
6. [Developer Workflows (API & DB Synchronisation)](#-developer-workflows-api--db-synchronisation)
7. [Offline Resiliency & Architecture Patterns](#%EF%B8%8F-offline-resiliency--architecture-patterns)

---

## 🌟 Core Features & Premium Modules

### 🚨 1. Sentinel-X AI Driving Co-Pilot
*   **Real-time Risk Computations:** Monitors speed, weather conditions, driving duration (fatigue), time of day, and vehicle class to compute an overall **Survivability Score** (0-100%).
*   **Local AI Guardian:** Connects to a local Ollama server running `llama3.2` to generate real-time, context-specific driving warnings and actions (e.g., automatically referencing local speed limit laws for the active country).
*   **Blackspot Alert System:** References a curated geographical database of high-fatality and high-challan zones (e.g., Delhi-Meerut Expressway KM 14-18, Mumbai Pune Expressway Khopoli Ghat, Pattaya-Bangkok Highway Route 7) to alert drivers proactively.

### 🎙️ 2. On-Device Multilingual Voice Assistant
*   **Floating Action Assistant:** A global Voice Floating Action Button (FAB) enables hands-free voice operations while driving.
*   **Acoustic Country Mappings:** Dynamically updates speech recognition locale based on the active country (e.g., `en-IN` or `hi-IN` for India, `th-TH` for Thailand, `bn-BD` for Bangladesh, `ne-NP` for Nepal).
*   **Dynamic Accent Synthesis**: Speaks responses back to the driver in localized native BCP-47 speech engines.
*   **Intelligent Intent Routing:** The voice command is parsed locally via Ollama into standardized structured JSON actions (e.g., `NAVIGATE` to `/emergency` or `SET_COUNTRY` to `TH`).

### 👮 3. "Pulled-Over" Police Mode
*   **Legal Rights Assistant:** Empowering drivers when stopped by law enforcement. Provides an instantaneous list of legal rights, mandatory document checklists, and guidelines customized for each BIMSTEC country.
*   **Silent Accident/Incident Log:** Enables quick, one-tap registration of accidents or encounters into the local PostgreSQL/Drizzle memory engine.
*   **SOS & Live Location Sharing:** Generates quick links to share live coordinates with trusted contacts or call local emergency dispatchers.

### 📄 4. OCR Traffic Document & Challan Scanner
*   **Vision-Powered Parsing:** Integrates with local `llama3.2-vision` to perform high-fidelity OCR scanning on physical challan papers, traffic tickets, or road signs.
*   **Automatic Extraction:** Automatically extracts key data fields (e.g., exact fine amount, vehicle license plate registration, specific legal sections violated, transaction timestamps) and formats them into clean JSON schemas for local record keeping.

### ⚖️ 5. State-Aware fine Calculator
*   **Cross-Border Calculations**: Instantly calculate fines for specific offenses across all BIMSTEC nations.
*   **Dynamic State Multipliers**: Supports regional state-level fine adjustments (e.g. for India: Delhi `×1.2`, Maharashtra `×1.15`, Karnataka `×1.10`, Uttar Pradesh `×0.95`).
*   **Server-Driven Dropdown**: Leverages a synchronized REST API endpoint to pull available states dynamically from the database.

---

## 🛠️ Technical Architecture

Sentinel-X is built using a modern decoupled architecture inside a unified monorepo. It relies on a strong contract-first API design via OpenAPI, enabling automated client generation.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [React + Vite PWA]
        FE_APP[App.tsx / Main Entry]
        FE_PAGES[Pages: Home, Chat, Sentinel, Police Mode, ChallanPage]
        FE_COMP[VoiceAssistantFAB / OfflineMapFallback]
        FE_HOOKS[Orval Generated TanStack Query Hooks]
    end

    %% Network / Gateway
    subgraph Gateway [API Gateway & Middleware]
        GW_LIMITER[Express Rate Limiter / Pino Logger]
        GW_ROUTING[Express Router / Zod Validators]
    end

    %% Backend Layer
    subgraph Backend [Express API Server]
        BE_ROUTES[Endpoints: sentinel, gemini, vision, laws, accidents, challan]
        BE_DATA[Static BIMSTEC Country Data Store & State Multipliers]
    end

    %% AI & Database Layer
    subgraph StorageAI [Local AI & Database Engines]
        DB_POSTGRES[(PostgreSQL Database)]
        DB_DRIZZLE[Drizzle ORM Schema Layer]
        DB_VECTOR[pgvector 768-dim Vector Embeddings]
        OLLAMA_LLM[Ollama Llama 3.2 - Chat & Command Routing]
        OLLAMA_VIS[Ollama Llama 3.2 Vision - Document OCR]
        OLLAMA_EMB[Ollama Nomic Embed Text - Vector RAG]
        GEMINI_API[Google Gemini 2.5 Flash SDK - Mock / Cloud Image Fallback]
    end

    %% Flows
    FE_PAGES --> FE_COMP
    FE_PAGES --> FE_HOOKS
    FE_HOOKS -- HTTP Requests / SSE --> GW_LIMITER
    GW_LIMITER --> GW_ROUTING
    GW_ROUTING --> BE_ROUTES
    
    BE_ROUTES --> DB_DRIZZLE
    DB_DRIZZLE --> DB_POSTGRES
    DB_DRIZZLE --> DB_VECTOR
    
    BE_ROUTES -- http://localhost:11434 --> OLLAMA_LLM
    BE_ROUTES -- http://localhost:11434 --> OLLAMA_VIS
    BE_ROUTES -- http://localhost:11434 --> OLLAMA_EMB
    BE_ROUTES --> GEMINI_API
```

---

## 📦 Monorepo Package Structure

The project utilizes `npm workspaces` to structure dependencies and shared logic across the monorepo packages.

```text
├── artifacts/                  # Primary application deliverables
│   ├── api-server/            # Express.js REST API with rate-limiting & logging
│   ├── drivelegal/            # React + Vite frontend PWA (Tailwind, Framer Motion)
│   └── mockup-sandbox/        # Prototyping sandbox for visual mockups
├── lib/                        # Shared internal workspace libraries
│   ├── api-spec/              # OpenAPI v3.1.0 specification yaml + Orval generator config
│   ├── api-zod/               # Auto-generated runtime schema validation logic
│   ├── api-client-react/      # Auto-generated React-Query client hooks & type definitions
│   ├── db/                    # Drizzle ORM schemas, pgvector custom types, and seed utility
│   └── integrations-gemini-ai/# Wrapper client for cloud Gemini AI image models
├── scripts/                    # Shared workspace helper scripts & custom CLI commands
├── LAUNCH_SENTINEL.bat        # Master command launcher script
└── package.json               # Monorepo Workspace configuration
```

---

## ⚙️ Prerequisites & Installation

### 1. System Dependencies
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [PostgreSQL](https://www.postgresql.org/) (with [pgvector](https://github.com/pgvector/pgvector) installed/enabled)
*   [Ollama](https://ollama.com/) (Local AI Engine)

### 2. Local AI Model Requirements
Make sure the Ollama application is running, and pull the required models:
```bash
# Pull the standard Llama 3.2 text model (3B)
ollama pull llama3.2

# Pull the text embedding model for RAG and Vector DB storage
ollama pull nomic-embed-text

# Pull the multi-modal vision model for Challan & Document OCR scanning
ollama pull llama3.2-vision
```

### 3. Database Initialization
1. Create a PostgreSQL database (e.g. named `sentinel`).
2. Make sure the `pgvector` extension is enabled in your database. If not, run this in your PostgreSQL shell:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 4. Configuration Setup
Create a `.env` file at the root of the workspace (and ensure the exact variables are duplicated inside `artifacts/api-server/.env` and `lib/db/.env` for localized tasks):

```env
DATABASE_URL="postgresql://postgres.ydoqvurlmnebwccuhetl:SAmpath%402004@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
PORT=3001
AI_INTEGRATIONS_GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 🚀 Local Development & System Launch

### The Quick Way: Master Windows Launcher
Sentinel-X includes a master orchestrator script `LAUNCH_SENTINEL.bat` at the root. Running this will:
1. Initialize and start the local **Ollama Engine** (`ollama serve`).
2. Boot the **Sentinel Express API Server** with live hot-reloading.
3. Start the **React + Vite Frontend PWA Dashboard**.

Simply double-click `LAUNCH_SENTINEL.bat` or run:
```powershell
.\LAUNCH_SENTINEL.bat
```

---

### The Manual Way: Step-by-Step Terminal Execution
If you prefer running components individually, run the following commands from the root directory:

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Push Database Schemas
```bash
npm run push -w lib/db
```

#### Step 3: Seed the Vector Database (Regional traffic rules & laws)
Sentinel-X features a standalone seeder script containing local state laws (Delhi, Karnataka, Maharashtra, etc.). The seeder automatically detects if a local Ollama server is running. If offline or not running, **it falls back to mock 768-dimension embeddings** to guarantee successful seeding in any developer configuration:
```bash
npm run seed -w lib/db
```

#### Step 4: Run the API Server
```bash
npm run dev -w artifacts/api-server
```
*The API gateway will be accessible at [http://localhost:3001](http://localhost:3001).*

#### Step 5: Run the React PWA Frontend
```bash
npm run dev -w artifacts/drivelegal
```
*The frontend dashboard will load at [http://localhost:5173](http://localhost:5173).*

---

## 🔄 Developer Workflows (API & DB Synchronisation)

Sentinel-X enforces a **strict contract-driven design**. Frontend data fetching is synchronized with Backend API routes using the OpenAPI specification.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Spec as openapi.yaml
    participant Orval as Orval Engine
    participant Zod as @workspace/api-zod
    participant React as @workspace/api-client-react
    
    Dev->>Spec: Modifies/Adds endpoint or type schema
    Dev->>Orval: Runs Orval client-generation scripts
    Orval->>Zod: Generates new validation schemas
    Orval->>React: Generates typescript types & TanStack Query hooks
    Dev->>React: Imports types/hooks directly into Frontend components
```

### 1. Syncing API Endpoints
When modifying API routes or payloads:
1. Update [openapi.yaml](file:///c:/Users/bhaskar/Downloads/Drive-Legal-BIMstec/Drive-Legal-BIMstec/lib/api-spec/openapi.yaml).
2. Run code-generation scripts from the root directory:
   ```bash
   npm run codegen -w lib/api-spec
   ```
3. This automatically updates Zod schemas in `@workspace/api-zod` and React query hooks in `@workspace/api-client-react`.

### 2. Updating Database Schemas
When editing database tables:
1. Modify schema definitions inside `lib/db/src/schema/`.
2. Push the schema adjustments to the active database:
   ```bash
   npm run push -w lib/db
   ```

---

## 🛡️ Offline Resiliency & Architecture Patterns

Because highway travel is prone to complete signal dropouts, Sentinel-X incorporates fallback mechanisms:

1. **Local Endpoint Configurations:** The profile tab (`/profile`) allows users to override the active backend url. If deployed locally on a car dashboard or local node, the application communicates locally, maintaining 100% feature availability offline.
2. **Offline Map Sandbox Fallbacks:** When a connection to standard map servers is lost, components seamlessly hot-swap dynamic maps with highly visual static/offline warning containers (`OfflineMapFallback`), allowing safe operations without throwing runtime script errors.
3. **Local Vector Embeddings & RAG:** If connected to a local server machine, the app utilizes local vector-similarity checks via `nomic-embed-text` and Postgres `pgvector` directly, bypassing expensive external RAG pipelines.
4. **On-Device speech engine:** The Voice Assistant utilizes native browser `SpeechSynthesis` and `SpeechRecognition` engines which process audio natively on the browser process/OS layer, enabling full voice command controls even without internet connection.
5. **PWA Local Storage Cache:** Caches vital law records, calculated violation history, and user emergency configuration inputs directly in browser database storage (`localStorage`).

---
*Developed under modern engineering guidelines for BIMSTEC region road safety.*
