"""
LangGraph agent node functions.
Each function takes the shared GraphState and returns an updated partial state.
"""

import json
import logging
from typing import TypedDict, List, Optional, Any

import httpx
from google import genai
from google.genai import types as genai_types

from config import settings

logger = logging.getLogger(__name__)

# Configure AI providers
_client = genai.Client(api_key=settings.GEMINI_API_KEY)
_MODEL = "gemini-2.5-flash"
_GEMINI_DISABLED = False
_GROQ_DISABLED = False


# ── Shared State ──────────────────────────────────────────────────────────────

class GraphState(TypedDict, total=False):
    # Input
    user_profile: dict

    # Agent outputs
    assessment: dict
    skill_gap: dict
    careers: list
    roadmap: dict
    employability: dict
    resume_analysis: dict
    interview: dict

    # Final
    final_report: dict
    error: Optional[str]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _json_prompt(prompt: str) -> str:
    return (
        "You are an expert AI career counselor for women restarting their careers.\n"
        "IMPORTANT: Respond ONLY with valid JSON matching the requested schema. No markdown, no explanation.\n\n"
        + prompt
    )


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return json.loads(text)


def _call_groq(prompt: str) -> dict:
    """Call Groq's OpenAI-compatible chat API and parse JSON from the response."""
    global _GROQ_DISABLED
    if _GROQ_DISABLED or not settings.GROQ_API_KEY:
        return {"error": "Groq is not configured."}

    try:
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.GROQ_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert AI career counselor. Return only valid JSON.",
                    },
                    {"role": "user", "content": _json_prompt(prompt)},
                ],
                "temperature": 0.3,
                "max_tokens": 2048,
            },
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        text = data["choices"][0]["message"]["content"]
        return _parse_json_response(text)
    except Exception as e:
        logger.error(f"Groq call failed: {e}")
        if "401" in str(e) or "429" in str(e):
            _GROQ_DISABLED = True
        return {"error": "Groq unavailable. Trying fallback provider."}


def _call_gemini(prompt: str) -> dict:
    """Call Gemini and parse JSON from the response."""
    global _GEMINI_DISABLED
    if _GEMINI_DISABLED:
        return {"error": "Gemini quota reached. Using local fallback."}

    full_prompt = _json_prompt(prompt)
    try:
        response = _client.models.generate_content(
            model=_MODEL,
            contents=full_prompt,
            config=genai_types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=2048,
                response_mime_type="application/json",
            ),
        )
        return _parse_json_response(response.text)
    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        # Last resort fallback if parsing fails - return empty dict with error
        return {"error": "Failed to parse AI response. Please try again."}
    except Exception as e:
        logger.error(f"Gemini call failed: {e}")
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            _GEMINI_DISABLED = True
        return {"error": "AI service unavailable. Using local fallback."}


def _call_ai(prompt: str) -> dict:
    """Prefer Groq when configured, then Gemini, then caller-specific local fallback."""
    if settings.GROQ_API_KEY:
        groq_result = _call_groq(prompt)
        if not _has_ai_error(groq_result):
            return groq_result

    gemini_result = _call_gemini(prompt)
    if not _has_ai_error(gemini_result):
        return gemini_result
    return {"error": "AI service unavailable. Using local fallback."}


def _has_ai_error(result: Any) -> bool:
    return isinstance(result, dict) and bool(result.get("error"))


def _profile_skills(profile: dict) -> List[str]:
    skills = profile.get("current_skills") or []
    return [str(skill) for skill in skills if str(skill).strip()]


def _preferred_track(profile: dict) -> str:
    text = " ".join([
        str(profile.get("goal", "")),
        str(profile.get("interests", "")),
        " ".join(_profile_skills(profile)),
    ]).lower()
    if any(word in text for word in ["data", "sql", "excel", "python", "power bi", "tableau", "analysis"]):
        return "Data Analyst"
    if any(word in text for word in ["marketing", "seo", "content", "social"]):
        return "Digital Marketing Specialist"
    if any(word in text for word in ["hr", "people", "recruit"]):
        return "HR Coordinator"
    if any(word in text for word in ["finance", "account", "bank"]):
        return "Finance Operations Associate"
    if any(word in text for word in ["project", "manage", "operations"]):
        return "Project Coordinator"
    return "Business Analyst"


def _fallback_assessment(profile: dict) -> dict:
    skills = _profile_skills(profile)
    study_hours = int(profile.get("study_hours") or 2)
    learning_capacity = "High" if study_hours >= 4 else "Medium" if study_hours >= 2 else "Low"
    strengths = [
        "Clear motivation to restart and grow professionally",
        "Transferable experience from previous education and work",
        "Ability to commit consistent daily study time",
    ]
    if skills:
        strengths[1] = f"Existing foundation in {', '.join(skills[:3])}"
    return {
        "summary": (
            f"Your profile is a strong fit for a structured return-to-work plan, especially toward "
            f"{_preferred_track(profile)} roles. With focused portfolio work and targeted skill-building, "
            "you can turn your current background into a practical job-search story."
        ),
        "strengths": strengths,
        "weaknesses": [
            "Needs a focused portfolio or proof-of-work project",
            "May need refreshed market-facing tools and interview practice",
        ],
        "learning_capacity": learning_capacity,
    }


def _fallback_skill_gap(profile: dict) -> dict:
    current = _profile_skills(profile)
    track = _preferred_track(profile)
    required_by_track = {
        "Data Analyst": ["Excel", "SQL", "Power BI", "Statistics", "Data Storytelling"],
        "Digital Marketing Specialist": ["SEO/SEM", "Google Analytics", "Content Strategy", "Canva", "Campaign Reporting"],
        "HR Coordinator": ["Recruitment", "HR Operations", "Excel", "Communication", "HRMS Tools"],
        "Finance Operations Associate": ["Excel", "Accounting Basics", "Financial Reporting", "Tally/ERP", "Communication"],
        "Project Coordinator": ["Project Management", "Excel", "Stakeholder Communication", "Agile Basics", "Documentation"],
        "Business Analyst": ["Excel", "SQL", "Process Mapping", "Communication", "Requirement Gathering"],
    }
    required = required_by_track.get(track, required_by_track["Business Analyst"])
    current_lower = {skill.lower() for skill in current}
    missing_names = [skill for skill in required if skill.lower() not in current_lower][:4]
    return {
        "required_skills": required,
        "current_skills": current,
        "missing_skills": [
            {
                "name": skill,
                "priority": "High" if idx < 2 else "Medium",
                "difficulty": "Medium",
                "example": f"Build a small project that demonstrates {skill} in a real workplace scenario.",
            }
            for idx, skill in enumerate(missing_names)
        ],
    }


def _fallback_careers(profile: dict) -> list:
    preferred_remote = str(profile.get("preferred_work", "Remote")).lower() != "on-site"
    base = [
        ("Data Analyst", "Rs 4-8 LPA", "Medium", "High", "Good fit for analytical, Excel, SQL, and reporting skills."),
        ("Business Analyst", "Rs 5-9 LPA", "Medium", "High", "Uses communication, documentation, and problem-solving strengths."),
        ("Project Coordinator", "Rs 4-7 LPA", "Low-Medium", "Medium", "A practical re-entry role for organized execution and stakeholder follow-up."),
        ("Digital Operations Associate", "Rs 3-6 LPA", "Low-Medium", "Medium", "Blends process discipline, tools, and customer/business coordination."),
        ("Customer Success Associate", "Rs 4-7 LPA", "Low", "Medium", "Suitable for strong communication and relationship-building ability."),
    ]
    track = _preferred_track(profile)
    if track != "Data Analyst":
        base[0] = (track, "Rs 4-8 LPA", "Medium", "High", f"Best aligned with your stated interests and goal around {track.lower()}.")
    return [
        {
            "role": role,
            "salary": salary,
            "difficulty": difficulty,
            "growth": growth,
            "remote": preferred_remote,
            "reason": reason,
        }
        for role, salary, difficulty, growth, reason in base
    ]


def _fallback_roadmap(profile: dict, skill_gap: dict, careers: list) -> dict:
    missing = [item.get("name", "Core Skill") for item in skill_gap.get("missing_skills", [])]
    first = missing[0] if missing else "Role Fundamentals"
    second = missing[1] if len(missing) > 1 else "Portfolio Project"
    role = careers[0].get("role", _preferred_track(profile)) if careers else _preferred_track(profile)
    return {
        "days_30": [
            {"day_range": "Day 1-7", "topic": first, "description": f"Refresh the basics of {first} with short daily exercises.", "resource": "YouTube + official docs"},
            {"day_range": "Day 8-14", "topic": "Excel and reporting", "description": "Create clean tables, summaries, and visual reports.", "resource": "Microsoft Learn"},
            {"day_range": "Day 15-21", "topic": "Communication practice", "description": "Write project summaries and explain your career break confidently.", "resource": "LinkedIn Learning"},
            {"day_range": "Day 22-30", "topic": "Mini project", "description": f"Build one small project related to {role}.", "resource": "Kaggle or public datasets"},
        ],
        "days_60": [
            {"day_range": "Day 31-40", "topic": second, "description": f"Practice {second} with guided examples.", "resource": "Coursera / freeCodeCamp"},
            {"day_range": "Day 41-50", "topic": "Portfolio polishing", "description": "Document your project with screenshots, problem statement, and outcome.", "resource": "GitHub"},
            {"day_range": "Day 51-60", "topic": "Role research", "description": "Study 20 job descriptions and map repeated skills.", "resource": "LinkedIn Jobs"},
        ],
        "days_90": [
            {"day_range": "Day 61-70", "topic": "Capstone project", "description": f"Complete one end-to-end {role} project.", "resource": "Public dataset or sample business case"},
            {"day_range": "Day 71-80", "topic": "Resume and LinkedIn", "description": "Update your profile with projects, skills, and measurable outcomes.", "resource": "LinkedIn"},
            {"day_range": "Day 81-90", "topic": "Applications and interviews", "description": "Apply consistently and practice behavioral plus role-specific questions.", "resource": "Naukri / LinkedIn / mock interviews"},
        ],
    }


def _fallback_employability(profile: dict, skill_gap: dict, assessment: dict) -> dict:
    skills_count = len(_profile_skills(profile))
    missing_count = len(skill_gap.get("missing_skills", []))
    study_hours = int(profile.get("study_hours") or 2)
    score = max(45, min(82, 55 + skills_count * 4 + study_hours * 3 - missing_count * 4))
    return {
        "score": score,
        "breakdown": {
            "experience": 16,
            "education": 8,
            "skills": max(10, min(25, skills_count * 5)),
            "career_gap": 8,
            "resume": 7,
            "communication": 8,
        },
        "suggestions": [
            "Complete one portfolio project aligned with your top career role",
            "Add current tools and measurable outcomes to your resume",
            "Practice a confident 60-second career comeback story",
            "Apply to returnship, remote, and entry-to-mid level bridge roles",
        ],
    }


def _fallback_resume_analysis(profile: dict, careers: list) -> dict:
    current = _profile_skills(profile)
    return {
        "extracted_skills": current,
        "extracted_experience": profile.get("experience", "Not provided"),
        "extracted_achievements": [],
        "ats_score": 55 if current else 35,
        "missing_skills": [item.get("name") for item in _fallback_skill_gap(profile).get("missing_skills", [])],
        "resume_tips": [
            "Add a concise career summary tailored to the target role",
            "Include project work that proves current skills",
            "Use action verbs and measurable achievements where possible",
        ],
    }


def _fallback_interview(careers: list) -> dict:
    role = careers[0].get("role", "Business Analyst") if careers else "Business Analyst"
    return {
        "questions": [
            {"question": "Tell me about yourself and your career journey.", "category": "Behavioral", "sample_answer": "Summarize your past experience, career break, recent learning, and why this role is the right next step."},
            {"question": "How have you kept your skills current during your break?", "category": "Career Gap", "sample_answer": "Mention courses, projects, tools practiced, and the routine you built to restart confidently."},
            {"question": f"Why are you interested in a {role} role?", "category": "Motivation", "sample_answer": "Connect the role to your strengths, interests, and the type of problems you enjoy solving."},
            {"question": "Describe a time you solved a difficult problem.", "category": "Behavioral", "sample_answer": "Use the STAR method: situation, task, action, result."},
            {"question": "How would you learn a new tool quickly?", "category": "Situational", "sample_answer": "Explain how you use documentation, tutorials, practice tasks, and feedback."},
            {"question": "How do you prioritize work when several tasks are urgent?", "category": "Situational", "sample_answer": "Discuss impact, deadlines, communication, and breaking work into clear next actions."},
            {"question": "What project are you most proud of?", "category": "Technical", "sample_answer": "Pick a project and explain the goal, tools used, and outcome."},
            {"question": "How do you handle feedback?", "category": "Behavioral", "sample_answer": "Show openness, reflection, and a concrete example of improvement."},
            {"question": "What support would help you succeed in this role?", "category": "Career Gap", "sample_answer": "Ask for clear expectations, onboarding context, and feedback loops while showing ownership."},
            {"question": "Where do you see yourself in two years?", "category": "Motivation", "sample_answer": "Describe growth in role-relevant skills and increasing business impact."},
        ],
        "tips": [
            "Address your career gap directly and positively",
            "Use STAR stories for behavioral answers",
            "Bring one portfolio example into interviews",
        ],
    }


# ── Agent 1 — Assessment ──────────────────────────────────────────────────────

def assessment_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    prompt = f"""
Analyze this woman's profile who is restarting her career:
- Education: {profile.get('education')}
- Work Experience: {profile.get('experience')}
- Career Gap: {profile.get('career_gap')}
- Current Skills: {', '.join(profile.get('current_skills', []))}
- Interests: {profile.get('interests')}
- Preferred Work: {profile.get('preferred_work')}
- Study Hours Per Day: {profile.get('study_hours')}
- Career Goal: {profile.get('goal', 'Not specified')}

Return JSON with this exact structure:
{{
  "summary": "2-3 sentence professional summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "learning_capacity": "High / Medium / Low based on study hours and background"
}}
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_assessment(profile)
    return {**state, "assessment": result}


# ── Agent 2 — Skill Gap ───────────────────────────────────────────────────────

def skill_gap_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    assessment = state.get("assessment", {})
    prompt = f"""
Identify skill gaps for this career restarter:
- Current Skills: {', '.join(profile.get('current_skills', []))}
- Career Goal: {profile.get('goal', 'Not specified')}
- Interests: {profile.get('interests')}
- Assessment Summary: {assessment.get('summary', '')}

Return JSON with this exact structure:
{{
  "required_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "current_skills": {json.dumps(profile.get('current_skills', []))},
  "missing_skills": [
    {{"name": "SQL", "priority": "High", "difficulty": "Medium", "example": "Write queries for data analysis"}},
    {{"name": "Power BI", "priority": "High", "difficulty": "Medium", "example": "Create dashboards"}},
    {{"name": "Statistics", "priority": "Medium", "difficulty": "Medium", "example": "Descriptive stats"}}
  ]
}}
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_skill_gap(profile)
    return {**state, "skill_gap": result}


# ── Agent 3 — Career Recommendation ──────────────────────────────────────────

def career_recommendation_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    assessment = state.get("assessment", {})
    skill_gap = state.get("skill_gap", {})
    prompt = f"""
Recommend 5 suitable career paths for this career restarter:
- Education: {profile.get('education')}
- Experience: {profile.get('experience')}
- Career Gap: {profile.get('career_gap')}
- Interests: {profile.get('interests')}
- Preferred Work: {profile.get('preferred_work')}
- Missing Skills: {[s.get('name') for s in skill_gap.get('missing_skills', [])]}
- Strengths: {assessment.get('strengths', [])}

Return JSON array with this exact structure (return only the array):
[
  {{
    "role": "Data Analyst",
    "salary": "₹6-9 LPA",
    "difficulty": "Medium",
    "growth": "High",
    "remote": true,
    "reason": "Strong analytical background with transferable skills"
  }}
]
Provide exactly 5 career recommendations.
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        careers = _fallback_careers(profile)
        return {**state, "careers": careers}
    careers = result if isinstance(result, list) else result.get("careers", [])
    if not careers:
        careers = _fallback_careers(profile)
    return {**state, "careers": careers}


# ── Agent 4 — Learning Roadmap ────────────────────────────────────────────────

def roadmap_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    skill_gap = state.get("skill_gap", {})
    careers = state.get("careers", [])
    top_career = careers[0].get("role", "Data Analyst") if careers else "Data Analyst"
    prompt = f"""
Create a 90-day learning roadmap for this career restarter aiming to become a {top_career}:
- Study Hours Per Day: {profile.get('study_hours')} hours
- Missing Skills: {[s.get('name') for s in skill_gap.get('missing_skills', [])]}
- Current Skills: {', '.join(profile.get('current_skills', []))}

Return JSON with this exact structure:
{{
  "days_30": [
    {{"day_range": "Day 1-7", "topic": "Python Basics", "description": "Learn variables, loops, functions", "resource": "freeCodeCamp Python"}},
    {{"day_range": "Day 8-14", "topic": "Excel Advanced", "description": "Pivot tables, VLOOKUP, charts", "resource": "ExcelJet"}},
    {{"day_range": "Day 15-21", "topic": "SQL Fundamentals", "description": "SELECT, JOIN, GROUP BY queries", "resource": "SQLZoo"}},
    {{"day_range": "Day 22-30", "topic": "Statistics Basics", "description": "Mean, median, variance, distributions", "resource": "Khan Academy"}}
  ],
  "days_60": [
    {{"day_range": "Day 31-40", "topic": "Power BI", "description": "Create interactive dashboards", "resource": "Microsoft Learn"}},
    {{"day_range": "Day 41-50", "topic": "Advanced SQL", "description": "Subqueries, CTEs, Window functions", "resource": "Mode Analytics"}},
    {{"day_range": "Day 51-60", "topic": "Data Visualization", "description": "Charts, storytelling with data", "resource": "Tableau Public"}}
  ],
  "days_90": [
    {{"day_range": "Day 61-70", "topic": "Capstone Project", "description": "End-to-end data analysis project", "resource": "Kaggle Datasets"}},
    {{"day_range": "Day 71-80", "topic": "Portfolio Building", "description": "GitHub, LinkedIn optimization", "resource": "GitHub"}},
    {{"day_range": "Day 81-90", "topic": "Job Applications", "description": "Apply, interview prep, networking", "resource": "LinkedIn Jobs"}}
  ]
}}
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_roadmap(profile, skill_gap, careers)
    return {**state, "roadmap": result}


# ── Agent 5 — Employability Score ─────────────────────────────────────────────

def employability_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    skill_gap = state.get("skill_gap", {})
    assessment = state.get("assessment", {})
    prompt = f"""
Calculate an employability score (out of 100) for this career restarter:
- Education: {profile.get('education')}
- Experience: {profile.get('experience')}
- Career Gap: {profile.get('career_gap')}
- Current Skills: {', '.join(profile.get('current_skills', []))}
- Missing Skills Count: {len(skill_gap.get('missing_skills', []))}
- Learning Capacity: {assessment.get('learning_capacity', 'Medium')}

Scoring formula (approximate):
- Experience: 25%
- Education: 10%
- Skills match: 30%
- Career gap penalty: -15% if > 2 years
- Resume quality (assume medium): 10%
- Communication/soft skills: 10%

Return JSON with this exact structure:
{{
  "score": 72,
  "breakdown": {{
    "experience": 20,
    "education": 8,
    "skills": 22,
    "career_gap": 10,
    "resume": 7,
    "communication": 8
  }},
  "suggestions": [
    "Complete a SQL certification",
    "Build 2 portfolio projects on Kaggle",
    "Practice mock interviews",
    "Update your LinkedIn profile"
  ]
}}
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_employability(profile, skill_gap, assessment)
    return {**state, "employability": result}


# ── Agent 6 — Resume Analyzer ─────────────────────────────────────────────────

def resume_agent(state: GraphState) -> GraphState:
    profile = state["user_profile"]
    careers = state.get("careers", [])
    target_role = careers[0].get("role", "Data Analyst") if careers else "Data Analyst"
    resume_text = profile.get("resume_text", "")

    if not resume_text:
        # No resume uploaded — return placeholder
        return {**state, "resume_analysis": {
            "extracted_skills": profile.get("current_skills", []),
            "extracted_experience": profile.get("experience", "Not provided"),
            "extracted_achievements": [],
            "ats_score": 0,
            "missing_skills": [],
            "resume_tips": ["Please upload your resume for a detailed ATS analysis."]
        }}

    prompt = f"""
Analyze this resume text for a {target_role} position:

RESUME TEXT:
{resume_text[:3000]}

Return JSON with this exact structure:
{{
  "extracted_skills": ["Python", "Excel", "Communication"],
  "extracted_experience": "3 years in sales and operations",
  "extracted_achievements": ["Led team of 5", "Increased sales by 20%"],
  "ats_score": 65,
  "missing_skills": ["SQL", "Power BI", "Tableau"],
  "resume_tips": [
    "Add quantified achievements (numbers/percentages)",
    "Include a skills section with technical tools",
    "Use action verbs like 'Analyzed', 'Developed', 'Led'"
  ]
}}
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_resume_analysis(profile, careers)
    return {**state, "resume_analysis": result}


# ── Agent 7 — Interview Coach ─────────────────────────────────────────────────

def interview_agent(state: GraphState) -> GraphState:
    careers = state.get("careers", [])
    skill_gap = state.get("skill_gap", {})
    target_role = careers[0].get("role", "Data Analyst") if careers else "Data Analyst"
    prompt = f"""
Generate 10 interview questions for a {target_role} position for a career restarter:
- Skills being developed: {[s.get('name') for s in skill_gap.get('missing_skills', [])]}

Return JSON with this exact structure:
{{
  "questions": [
    {{
      "question": "Tell me about yourself and your career journey.",
      "category": "Behavioral",
      "sample_answer": "I have X years of experience in... I took a career break to... Now I am excited to transition into data analytics because..."
    }}
  ],
  "tips": [
    "Address your career gap confidently — frame it as skill-building time",
    "Use the STAR method for behavioral questions",
    "Research the company before the interview"
  ]
}}
Include exactly 10 questions covering: Behavioral, Technical, Situational, Career Gap, Motivation categories.
"""
    result = _call_ai(prompt)
    if _has_ai_error(result):
        result = _fallback_interview(careers)
    return {**state, "interview": result}


# ── Final Report Generator ────────────────────────────────────────────────────

def final_report_generator(state: GraphState) -> GraphState:
    final_report = {
        "assessment": state.get("assessment", {}),
        "recommended_careers": state.get("careers", []),
        "skill_gap": state.get("skill_gap", {}),
        "roadmap": state.get("roadmap", {}),
        "employability": state.get("employability", {}),
        "resume_analysis": state.get("resume_analysis", {}),
        "interview": state.get("interview", {}),
    }
    return {**state, "final_report": final_report}
