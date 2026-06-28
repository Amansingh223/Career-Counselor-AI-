<div align="center">
  <h1>🌟 SheStarts AI Career Counselor 🌟</h1>
  <p><em>An AI-powered full-stack career counseling platform built specially for women restarting their careers.</em></p>
  
  ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
  ![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-F6821F?style=for-the-badge)
</div>

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture](#%EF%B8%8F-architecture)
- [The 7 AI Agents](#-the-7-ai-agents)
- [Tech Stack](#-tech-stack)
- [Getting Started (Installation)](#-getting-started-installation)
- [Project Structure](#-project-structure)
- [Access URLs](#-access-urls)

---

## 🚀 About the Project
**SheStarts** is a modern, responsive web application designed to help women who are looking to rejoin the workforce. By taking a simple assessment and uploading their resumes, users receive personalized career recommendations, tailored skill roadmaps, and interview coaching generated entirely by a swarm of **Google Gemini** AI agents orchestrated via **LangGraph**.

---

## ✨ Key Features
- **🤖 Multi-Agent AI System:** Uses a LangGraph workflow with 7 specialized AI agents to analyze user profiles from different angles.
- **📄 Smart Resume Parsing:** Upload your PDF resume, and our AI automatically scores it for ATS compatibility and extracts key skills.
- **🗺️ Personalized Roadmaps:** Generates a 30-60-90 day learning plan based on identified skill gaps.
- **💬 Interview Coaching:** Get 10 role-specific interview questions based on the recommended career paths.
- **📊 Interactive Dashboards:** Visualize your assessment scores and readiness with interactive charts.
- **📥 PDF Export:** Download your personalized career report in a beautifully formatted PDF.

---

## 🏗️ Architecture

The application is built on a clean, decoupled client-server architecture:

```text
  [ Frontend (Next.js 15) ]  <── REST API ──>  [ Backend (FastAPI) ]
                                                        │
                                                        ▼
                                             [ LangGraph Workflow ]
                                             ┌────────────────────┐
                                             │    7 AI Agents     │
                                             │   (Gemini 1.5)     │
                                             └────────────────────┘
                                                        │
                                                        ▼
                                                [ SQLite Database ]
```

---

## 🤖 The 7 AI Agents

Our LangGraph workflow orchestrates the following AI agents to work together seamlessly:

| # | Agent | Purpose |
|---|-------|---------|
| 1 | **Assessment Agent** | Analyzes background, strengths & weaknesses. |
| 2 | **Skill Gap Agent** | Identifies missing skills needed for modern roles. |
| 3 | **Career Recommendation Agent** | Recommends top 5 career paths based on the profile. |
| 4 | **Learning Roadmap Agent** | Creates a detailed 30-60-90 day upskilling plan. |
| 5 | **Employability Agent** | Scores job-readiness out of 100. |
| 6 | **Resume Analyzer** | Provides ATS score + actionable improvement tips. |
| 7 | **Interview Coach** | Generates 10 role-specific interview questions for practice. |

---

## 🔑 Tech Stack

| Layer | Technology Used |
|-------|-----------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy |
| **AI Orchestration** | LangGraph |
| **Large Language Model** | Google Gemini 1.5 Flash |
| **PDF Processing** | PyMuPDF (parsing), ReportLab (generating) |
| **Database** | SQLite (Async with aiosqlite) |
| **Authentication** | JWT (JSON Web Tokens via python-jose) |

---

## ⚙️ Getting Started (Installation)

Follow these simple steps to run the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v20+ recommended)
- **Python** (v3.10+ recommended)
- **Git**

### Step 1: Clone & API Key Setup
1. Clone this repository to your local machine.
2. Navigate into the `backend` folder and create a `.env` file.
3. Add your Google Gemini API key to the `.env` file:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

### Step 2: Run the App
We have provided an easy-to-use launch script for Windows users!

#### Option A: One-Click Start (Windows only)
Just double-click the **`start.bat`** file located in the root folder. It will automatically start both the backend and frontend servers in separate windows.

#### Option B: Manual Start (Mac / Linux / Windows)

**1. Start the Backend:**
Open a terminal and run:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**2. Start the Frontend:**
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access URLs

Once the servers are running, open your browser and navigate to:

| Service | Local URL |
|---------|-----------|
| 🎨 **Frontend App** | [http://localhost:3000](http://localhost:3000) |
| ⚙️ **Backend API** | [http://localhost:8000](http://localhost:8000) |
| 📚 **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 📁 Project Structure

```text
AI Assignment7/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # Main API entrypoint
│   ├── agents/               # AI Logic
│   │   ├── nodes.py          # The 7 Gemini AI agent functions
│   │   └── workflow.py       # LangGraph state graph definition
│   ├── services/             # Helper services
│   │   ├── pdf_service.py    # Generates downloadable PDF reports
│   │   └── resume_parser.py  # Extracts text from uploaded PDFs
│   ├── models.py             # Database Models (SQLAlchemy)
│   ├── schemas.py            # API request/response validation (Pydantic)
│   ├── auth.py               # JWT Authentication logic
│   ├── config.py             # Environment variables (loads .env)
│   └── database.py           # Database connection setup
│
├── frontend/                 # Next.js Frontend
│   └── src/app/
│       ├── page.tsx          # Landing page
│       ├── auth/             # Login & Registration pages
│       ├── assessment/       # Multi-step questionnaire form
│       ├── loading-screen/   # Animated AI status progress screen
│       ├── dashboard/        # Main dashboard with charts & results
│       └── resume/           # Resume upload & ATS analysis
│
├── start.bat                 # One-click launch script
└── README.md                 # You are here!
```

---
<div align="center">
  <i>Built with ❤️ for empowering women's careers.</i>
</div>
