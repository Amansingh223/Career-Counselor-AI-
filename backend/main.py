"""
CareerLift AI Career Counselor — FastAPI Main Application
"""

import json
import logging
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db, init_db
from models import User, Skill, Report
from schemas import (
    UserRegister, UserLogin, Token, AssessmentInput, FullReport
)
from auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from agents.workflow import run_career_workflow
from services.resume_parser import extract_text_from_pdf
from services.pdf_service import generate_career_report_pdf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("✅ Database initialized")
    yield


app = FastAPI(
    title="CareerLift AI Career Counselor",
    description="AI-powered career counseling for women restarting their careers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://career-counselor-ai-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"message": "CareerLift AI Career Counselor API", "status": "running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=Token, tags=["Auth"])
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ── Google OAuth ─────────────────────────────────────────────────────────────

class GoogleAuthPayload(BaseModel):
    id_token: str
    name: str | None = None
    email: str | None = None


@app.post("/api/auth/google", response_model=Token, tags=["Auth"])
async def google_auth(payload: GoogleAuthPayload, db: AsyncSession = Depends(get_db)):
    """Verify Google ID token and return our own JWT."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}"
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            google_data = response.json()
    except Exception:
        raise HTTPException(status_code=401, detail="Could not verify Google token")

    email = google_data.get("email") or payload.email
    name = google_data.get("name") or payload.name or email

    if not email:
        raise HTTPException(status_code=400, detail="No email found in Google token")

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        import secrets
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(secrets.token_hex(32)),  # random password
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token, tags=["Auth"])
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", tags=["Auth"])
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "education": current_user.education,
        "experience": current_user.experience,
        "career_gap": current_user.career_gap,
        "goal": current_user.goal,
    }


# ── Assessment ────────────────────────────────────────────────────────────────

@app.post("/api/assessment", tags=["Assessment"])
async def run_assessment(
    payload: AssessmentInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run the full LangGraph AI workflow and save results."""
    # Update user profile
    current_user.education = payload.education
    current_user.experience = payload.experience
    current_user.career_gap = payload.career_gap
    current_user.study_hours = payload.study_hours
    current_user.goal = payload.goal
    current_user.interests = payload.interests
    current_user.preferred_work = payload.preferred_work

    # Save skills
    for skill_name in payload.current_skills:
        existing = await db.execute(
            select(Skill).where(Skill.user_id == current_user.id, Skill.skill == skill_name)
        )
        if not existing.scalar_one_or_none():
            db.add(Skill(user_id=current_user.id, skill=skill_name))

    await db.commit()

    # Build user profile dict for agents
    user_profile = {
        "name": current_user.name,
        "education": payload.education,
        "experience": payload.experience,
        "career_gap": payload.career_gap,
        "current_skills": payload.current_skills,
        "interests": payload.interests,
        "preferred_work": payload.preferred_work,
        "study_hours": payload.study_hours,
        "goal": payload.goal,
    }

    logger.info(f"Running AI workflow for user {current_user.id}")
    report = await run_career_workflow(user_profile)

    # Save report
    db_report = Report(
        user_id=current_user.id,
        career_data=json.dumps(report.get("recommended_careers", [])),
        employability_score=report.get("employability", {}).get("score"),
        roadmap_data=json.dumps(report.get("roadmap", {})),
        skill_gap_data=json.dumps(report.get("skill_gap", {})),
        interview_data=json.dumps(report.get("interview", {})),
        raw_response=json.dumps(report),
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)

    return {"report_id": db_report.id, "report": report}


# ── Resume Upload ─────────────────────────────────────────────────────────────

@app.post("/api/resume/upload", tags=["Resume"])
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and analyze a resume PDF."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    # Get latest report for this user
    result = await db.execute(
        select(Report).where(Report.user_id == current_user.id).order_by(Report.id.desc())
    )
    latest_report = result.scalar_one_or_none()

    careers = []
    if latest_report and latest_report.career_data:
        careers = json.loads(latest_report.career_data)

    user_profile = {
        "name": current_user.name,
        "education": current_user.education,
        "experience": current_user.experience,
        "career_gap": current_user.career_gap,
        "current_skills": [],
        "interests": current_user.interests or "",
        "preferred_work": current_user.preferred_work or "",
        "study_hours": current_user.study_hours or 2,
        "goal": current_user.goal or "",
        "resume_text": resume_text,
    }

    from agents.nodes import resume_agent, GraphState
    state: GraphState = {"user_profile": user_profile, "careers": careers}
    result_state = resume_agent(state)
    resume_analysis = result_state.get("resume_analysis", {})

    # Update report
    if latest_report:
        latest_report.resume_data = json.dumps(resume_analysis)
        await db.commit()

    return {"resume_analysis": resume_analysis}


# ── Reports ───────────────────────────────────────────────────────────────────

@app.get("/api/report/latest", tags=["Reports"])
async def get_latest_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Report).where(Report.user_id == current_user.id).order_by(Report.id.desc())
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="No report found. Please complete the assessment first.")

    return {
        "report_id": report.id,
        "report": json.loads(report.raw_response) if report.raw_response else {},
        "employability_score": report.employability_score,
    }


@app.get("/api/report/{report_id}/pdf", tags=["Reports"])
async def download_pdf(
    report_id: int,
    token: str = None,
    db: AsyncSession = Depends(get_db),
):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        from jose import jwt
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == int(user_id))
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    user_result = await db.execute(select(User).where(User.id == int(user_id)))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    report_data = json.loads(report.raw_response) if report.raw_response else {}
    pdf_bytes = generate_career_report_pdf(user.name, report_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=career_report_{report_id}.pdf"},
    )
