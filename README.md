# SheStarts AI Career Counselor 🌟

An AI-powered full-stack career counseling platform built for women restarting their careers. Powered by **Google Gemini 1.5 Flash** and orchestrated with **LangGraph**.

---

## 🏗️ Architecture

```
Frontend (Next.js 15)  ←──REST API──→  Backend (FastAPI)
                                              │
                                    LangGraph Workflow
                                    ┌────────────────┐
                                    │  7 AI Agents   │
                                    │  (Gemini 1.5)  │
                                    └────────────────┘
                                              │
                                       SQLite Database
```

## 🤖 AI Agents

| # | Agent | Purpose |
|---|-------|---------|
| 1 | Assessment Agent | Analyzes background, strengths & weaknesses |
| 2 | Skill Gap Agent | Identifies missing skills |
| 3 | Career Recommendation Agent | Recommends 5 career paths |
| 4 | Learning Roadmap Agent | Creates 30-60-90 day plan |
| 5 | Employability Agent | Scores readiness out of 100 |
| 6 | Resume Analyzer | ATS score + improvement tips |
| 7 | Interview Coach | 10 role-specific interview questions |

## 🚀 Quick Start

### Option 1: Double-click `start.bat`
This launches both servers automatically.

### Option 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

## 📁 Project Structure

```
AI Assignment7/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── agents/
│   │   ├── nodes.py         # 7 Gemini AI agent functions
│   │   └── workflow.py      # LangGraph state graph
│   ├── services/
│   │   ├── pdf_service.py   # ReportLab PDF generation
│   │   └── resume_parser.py # PyMuPDF PDF extraction
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   ├── config.py            # Settings
│   ├── database.py          # Async SQLite setup
│   └── requirements.txt
│
├── frontend/
│   └── src/app/
│       ├── page.tsx          # Landing page
│       ├── auth/
│       │   ├── register/     # Registration form
│       │   └── login/        # Login form
│       ├── assessment/       # Multi-step assessment form
│       ├── loading-screen/   # Animated AI progress screen
│       ├── dashboard/        # Main dashboard (5 tabs)
│       └── resume/           # Resume upload & analysis
│
└── start.bat                 # One-click launcher
```

## 🔑 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy |
| AI Orchestration | LangGraph |
| LLM | Google Gemini 1.5 Flash |
| Resume Parsing | PyMuPDF |
| Database | SQLite |
| Authentication | JWT (python-jose) |
| PDF Export | ReportLab |
| Charts | Recharts |
