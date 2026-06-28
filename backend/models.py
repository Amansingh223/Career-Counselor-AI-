import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))
    education: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    experience: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    career_gap: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    study_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    goal: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    interests: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_work: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    skill: Mapped[str] = mapped_column(String(100))
    level: Mapped[str] = mapped_column(String(50), default="Beginner")

    user: Mapped["User"] = relationship("User", back_populates="skills")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    career_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    employability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    roadmap_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    skill_gap_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    interview_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    resume_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    raw_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Full JSON
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="reports")
