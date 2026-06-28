from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ── Assessment ────────────────────────────────────────────────────────────────

class AssessmentInput(BaseModel):
    education: str
    experience: str          # e.g. "3 years"
    career_gap: str          # e.g. "2 years"
    current_skills: List[str]
    interests: str
    preferred_work: str      # Remote / Hybrid / On-site
    study_hours: int         # hours per day
    goal: Optional[str] = None


# ── Career Recommendation ─────────────────────────────────────────────────────

class CareerRecommendation(BaseModel):
    role: str
    salary: str
    difficulty: str
    growth: str
    remote: bool
    reason: str


# ── Skill Gap ─────────────────────────────────────────────────────────────────

class SkillInfo(BaseModel):
    name: str
    priority: str   # High / Medium / Low
    difficulty: str
    example: str


class SkillGapResult(BaseModel):
    required_skills: List[str]
    missing_skills: List[SkillInfo]
    current_skills: List[str]


# ── Roadmap ───────────────────────────────────────────────────────────────────

class RoadmapItem(BaseModel):
    day_range: str
    topic: str
    description: str
    resource: Optional[str] = None


class LearningRoadmap(BaseModel):
    days_30: List[RoadmapItem]
    days_60: List[RoadmapItem]
    days_90: List[RoadmapItem]


# ── Employability ─────────────────────────────────────────────────────────────

class EmployabilityScore(BaseModel):
    score: int
    breakdown: dict
    suggestions: List[str]


# ── Interview ─────────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    question: str
    category: str
    sample_answer: str


class InterviewResult(BaseModel):
    questions: List[InterviewQuestion]
    tips: List[str]


# ── Resume ────────────────────────────────────────────────────────────────────

class ResumeAnalysis(BaseModel):
    extracted_skills: List[str]
    extracted_experience: str
    extracted_achievements: List[str]
    ats_score: int
    missing_skills: List[str]
    resume_tips: List[str]


# ── Full Report ───────────────────────────────────────────────────────────────

class FullReport(BaseModel):
    assessment_summary: str
    strengths: List[str]
    weaknesses: List[str]
    learning_capacity: str
    recommended_careers: List[CareerRecommendation]
    skill_gap: SkillGapResult
    roadmap: LearningRoadmap
    employability: EmployabilityScore
    interview: InterviewResult
