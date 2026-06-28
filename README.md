# 🌟 SheStarts AI Career Counselor

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg" />
  <img src="https://img.shields.io/badge/Node.js-20.x+-green.svg" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi" />
  <img src="https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js" />
  <img src="https://img.shields.io/badge/LangGraph-0.0.x-orange.svg" />
</div>

<br />

An enterprise-grade, event-driven AI platform architected to facilitate workforce reentry for women. By employing a multi-agent Directed Acyclic Graph (DAG) orchestration model over Large Language Models (LLMs), the system automates resume parsing, skill gap analysis, and generates deterministic career progression roadmaps.

---

## 📑 Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture (HLD)](#2-system-architecture-hld)
- [3. LLM Agent Orchestration (LLD)](#3-llm-agent-orchestration-lld)
- [4. Data Model & Schema](#4-data-model--schema)
- [5. Sequence Flow](#5-sequence-flow)
- [6. API Specifications](#6-api-specifications)
- [7. Development Setup](#7-development-setup)

---

## 1. Executive Summary

### 🎯 Problem Statement
Women returning to the workforce often face a "confidence gap" and lack awareness of modern industry requirements. Traditional counseling is unscalable and lacks real-time, data-driven skill mapping.

### 💡 Solution
SheStarts leverages a swarm of specialized AI agents built on **Google Gemini 1.5 Flash** and **LangGraph** to process user data (assessment + resume) concurrently, outputting a highly personalized, actionable JSON state that is rendered into dynamic UI dashboards and downloadable PDF reports.

---

## 2. System Architecture (HLD)

The system follows a strict 3-tier decoupling:
1. **Presentation Layer:** Next.js (App Router, Server Components + Client Hooks).
2. **Application Layer:** FastAPI serving as an asynchronous API gateway and compute orchestrator.
3. **Data Layer:** SQLite utilizing `aiosqlite` for non-blocking asynchronous I/O with SQLAlchemy ORM.

```mermaid
graph TB
    subgraph Client [Client Tier]
        Browser[Web Browser]
    end

    subgraph CDN [Next.js Server]
        NextApp[Next.js App Router]
    end

    subgraph Backend [FastAPI Application Server]
        Gateway[API Gateway / Router]
        AuthMiddleware[JWT Authentication]
        
        subgraph Workers [Service Layer]
            Parser[PyMuPDF Resume Parser]
            PDFGen[ReportLab PDF Engine]
            GraphWorker[LangGraph Execution Engine]
        end
    end

    subgraph External [External Interfaces]
        Gemini((Google Gemini API))
    end

    subgraph Storage [Data Tier]
        DB[(SQLite Database)]
    end

    Browser <-->|HTTP/REST| NextApp
    NextApp <-->|REST API| Gateway
    Gateway --> AuthMiddleware
    AuthMiddleware --> Workers
    
    GraphWorker <-->|gRPC/HTTP| Gemini
    Workers <-->|Async SQL| DB
```

---

## 3. LLM Agent Orchestration (LLD)

The core cognitive engine is implemented using a **LangGraph State Graph**. Instead of a single LLM call, the state is passed sequentially and conditionally through 7 specialized agents, ensuring high accuracy and separation of concerns.

```mermaid
stateDiagram-v2
    [*] --> Assessment_Agent: Raw User Input
    Assessment_Agent --> Resume_Analyzer: Parsed Strengths/Weaknesses
    Resume_Analyzer --> Skill_Gap_Agent: Extracted Resume Entities
    Skill_Gap_Agent --> Career_Recommendation_Agent: Computed Skill Delta
    Career_Recommendation_Agent --> Learning_Roadmap_Agent: Target Career Paths
    Career_Recommendation_Agent --> Interview_Coach: Target Career Paths
    Learning_Roadmap_Agent --> Employability_Agent: 30-60-90 Day Plan
    Interview_Coach --> Employability_Agent: Q&A Mocks
    Employability_Agent --> [*]: Final State (JSON)
```

**Node Responsibilities:**
- **Assessment Agent:** Contextualizes unstructured bio-data.
- **Resume Analyzer:** Named Entity Recognition (NER) for skills, education, and experience using zero-shot prompting.
- **Skill Gap Agent:** Cross-references user skills against industry-standard benchmarks.
- **Career Recommendation Agent:** Employs cosine similarity logic (via LLM semantics) to map profiles to top 5 roles.
- **Learning Roadmap Agent:** Time-series based curriculum generation.
- **Interview Coach:** Behavioral and technical prompt engineering.
- **Employability Agent:** Final aggregation and heuristic scoring (0-100).

---

## 4. Data Model & Schema

Data persistence is managed via SQLAlchemy 2.0 with async engine support.

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string hashed_password
        datetime created_at
    }
    
    ASSESSMENTS {
        int id PK
        int user_id FK
        json raw_data
        json ai_results
        datetime completed_at
    }
    
    RESUMES {
        int id PK
        int user_id FK
        string file_path
        json extracted_text
        datetime uploaded_at
    }

    USERS ||--o{ ASSESSMENTS : "takes"
    USERS ||--o{ RESUMES : "uploads"
```

---

## 5. Sequence Flow

The following sequence illustrates the synchronous processing of a user's career assessment request.

```mermaid
sequenceDiagram
    participant U as Client (Next.js)
    participant API as FastAPI Router
    participant LG as LangGraph Engine
    participant LLM as Google Gemini
    participant DB as SQLite
    
    U->>API: POST /api/assessment (Payload + Auth Token)
    API->>DB: Validate Token & User
    API->>LG: Invoke graph.invoke(state)
    
    rect rgb(240, 248, 255)
        Note right of LG: Graph Execution
        LG->>LLM: Node 1: Prompt (Assessment)
        LLM-->>LG: JSON Response
        LG->>LLM: Node 2: Prompt (Skills)
        LLM-->>LG: JSON Response
        Note right of LG: ... Continues for 7 Nodes
    end
    
    LG-->>API: Final Aggregated State
    API->>DB: INSERT INTO assessments (ai_results)
    API-->>U: HTTP 200 OK (Results JSON)
```

---

## 6. API Specifications

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|---------------|
| `POST` | `/api/auth/register` | Create a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate and issue JWT | ❌ |
| `POST` | `/api/assessment` | Trigger the LangGraph AI pipeline | ✅ |
| `GET`  | `/api/assessment/history`| Fetch user's past assessment data | ✅ |
| `POST` | `/api/resume/upload` | Upload PDF and trigger PyMuPDF parser | ✅ |
| `GET`  | `/api/report/download`| Stream dynamically generated PDF report | ✅ |

*For full schemas and interactive testing, run the server and visit `http://localhost:8000/docs` (Swagger UI).*

---

## 7. Development Setup

### 🛠 Prerequisites
- **Node v20.x** (NVM recommended)
- **Python 3.10+** (pyenv or conda recommended)
- **Git**

### 💻 Local Environment Initialization

**1. Clone the repository:**
```bash
git clone https://github.com/Amansingh223/Career-Counselor-AI-.git
cd Career-Counselor-AI-
```

**2. Backend Setup (FastAPI):**
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Configure Environment Variables
echo GEMINI_API_KEY="your_api_key_here" > .env
echo SECRET_KEY="your_jwt_secret" >> .env

# Start ASGI Server
python -m uvicorn main:app --reload --port 8000
```

**3. Frontend Setup (Next.js):**
Open a new terminal window:
```bash
cd frontend
npm install

# Start Turbopack dev server
npm run dev
```

**4. Windows Quick-Start:**
For rapid local bootstrapping on Windows, execute the provided batch script from the root directory:
```cmd
.\start.bat
```

---
*Architected and engineered for high-throughput, low-latency AI orchestration.*
