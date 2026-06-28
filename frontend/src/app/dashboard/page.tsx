"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLatestReport, getPdfUrl } from "@/lib/api";
import Link from "next/link";

interface Career {
  role: string;
  salary: string;
  difficulty: string;
  growth: string;
  remote: boolean;
  reason: string;
}

interface SkillInfo {
  name: string;
  priority: string;
  difficulty: string;
  example: string;
}

interface RoadmapItem {
  day_range: string;
  topic: string;
  description: string;
  resource?: string;
}

interface Report {
  assessment?: { summary: string; strengths: string[]; weaknesses: string[]; learning_capacity: string };
  recommended_careers?: Career[];
  skill_gap?: { required_skills: string[]; missing_skills: SkillInfo[]; current_skills: string[] };
  roadmap?: { days_30: RoadmapItem[]; days_60: RoadmapItem[]; days_90: RoadmapItem[] };
  employability?: { score: number; breakdown: Record<string, number>; suggestions: string[] };
  interview?: { questions: { question: string; category: string; sample_answer: string }[]; tips: string[] };
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setDash(circ - (score / 100) * circ), 300);
    return () => clearTimeout(t);
  }, [score, circ]);

  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900">{score}</span>
        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`badge border text-[11px] ${colors[priority] || colors.Medium}`}>{priority}</span>
  );
}

// SVG icon components for sidebar stickers
function IconSparkle({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z" fill={active ? "white" : "none"} stroke={active ? "white" : "currentColor"} />
      <path d="M19 3L19.75 5.25L22 6L19.75 6.75L19 9L18.25 6.75L16 6L18.25 5.25Z" fill={active ? "white" : "none"} stroke={active ? "white" : "currentColor"} strokeWidth="1.5" />
    </svg>
  );
}
function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconMap({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconShield({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconChat({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconDocument() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const TABS = [
  { id: "overview", label: "Overview", Icon: IconSparkle },
  { id: "careers", label: "Careers", Icon: IconGrid },
  { id: "skills", label: "Skill Gap", Icon: IconMap },
  { id: "roadmap", label: "Roadmap", Icon: IconShield },
  { id: "interview", label: "Interview", Icon: IconChat },
];

export default function DashboardPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadReport = async () => {
      const cached = localStorage.getItem("shestarts_report");
      const cachedId = localStorage.getItem("shestarts_report_id");
      if (cached) {
        setReport(JSON.parse(cached));
        setReportId(cachedId ? Number(cachedId) : null);
        setLoading(false);
        return;
      }
      try {
        const data = await getLatestReport();
        setReport(data.report as Report);
        setReportId(data.report_id);
      } catch {
        router.push("/assessment");
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!report) return null;

  const { assessment, recommended_careers = [], skill_gap, roadmap, employability, interview } = report;
  const score = employability?.score ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden lg:pl-20">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-[60] w-20 flex-col items-center border-r border-slate-100 bg-white py-5 shadow-sm">
        {/* Logo sticker */}
        <Link href="/" className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-md transition-transform hover:scale-105" title="Home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z" fill="white" />
            <path d="M19 3L19.75 5.25L22 6L19.75 6.75L19 9L18.25 6.75L16 6L18.25 5.25Z" fill="white" strokeWidth="1.5" />
          </svg>
        </Link>

        {/* Main nav stickers */}
        <div className="flex flex-1 flex-col items-center gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                title={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                    : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
                }`}
              >
                <tab.Icon active={isActive} />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-2 h-px w-8 rounded-full bg-slate-200" />

          {/* Document sticker */}
          <Link
            href="/resume"
            title="Resume Analyzer"
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
          >
            <IconDocument />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Resume Analyzer
            </span>
          </Link>

          {/* Chat sticker */}
          <div
            title="Interview Prep"
            className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
            onClick={() => setActiveTab("interview")}
          >
            <IconChat active={false} />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Interview Prep
            </span>
          </div>

          {/* Briefcase sticker */}
          <Link
            href="/assessment"
            title="Career Assessment"
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
          >
            <IconBriefcase />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Re-assess
            </span>
          </Link>
        </div>

        {/* Bottom divider + settings */}
        <div className="flex flex-col items-center gap-2">
          <div className="mb-1 h-px w-8 rounded-full bg-slate-200" />
          <button
            title="Settings"
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
          >
            <IconSettings />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Settings
            </span>
          </button>
        </div>
      </aside>
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">C</div>
            <span className="font-bold tracking-tight text-slate-900">CareerLift</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/assessment" className="btn-secondary text-sm py-2 px-4 border border-slate-200">
              Re-assess
            </Link>
            <Link href="/resume" className="btn-secondary text-sm py-2 px-4 border border-slate-200">
              Resume Analyzer
            </Link>
            {reportId && (
              <a href={getPdfUrl(reportId)}
                target="_blank" id="download-pdf-btn"
                className="btn-primary text-sm py-2 px-4">
                Download PDF
              </a>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Your Career Report <span className="text-indigo-600">is Ready</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            {assessment?.summary || "Your personalized AI career analysis is complete."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}>
              <tab.Icon active={activeTab === tab.id} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Employability + Confidence Score */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Employability Score</p>
                <ScoreRing score={score} />
                <p className="text-center text-slate-500 text-xs font-semibold mt-2">
                  {score >= 75 ? "Strong Industry Readiness" : score >= 50 ? "Core Capabilities Forming" : "Bridge Key Skill Gaps"}
                </p>

                {/* Confidence Score */}
                {employability?.breakdown && (() => {
                  const vals = Object.values(employability.breakdown);
                  const confidence = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                  const confColor = confidence >= 75 ? "#10B981" : confidence >= 50 ? "#F59E0B" : "#EF4444";
                  return (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence Score</span>
                        <span className="text-sm font-black" style={{ color: confColor }}>{confidence}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${confidence}%`, background: confColor }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {confidence >= 75 ? "High confidence in role fit" : confidence >= 50 ? "Moderate — keep building" : "Low — focus on skill gaps"}
                      </p>
                    </div>
                  );
                })()}

                {/* Breakdown bars */}
                {employability?.breakdown && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(employability.breakdown).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-500 capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-bold text-slate-700">{val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${val}%`,
                              background: `linear-gradient(90deg, #6366f1, #8b5cf6)`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strengths */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Your Strengths</p>
                <ul className="space-y-2.5">
                  {(assessment?.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Areas to Improve</p>
                <ul className="space-y-2.5">
                  {(assessment?.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Career Assessment Summary */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Detailed Assessment Summary</p>
              <div className="prose prose-sm max-w-none text-slate-700 leading-loose">
                <p>{assessment?.summary || "Your personalized AI career analysis is complete. Based on your profile, we have identified key areas for growth and targeted recommendations to accelerate your career return."}</p>
                <p className="mt-4"><strong>Learning Capacity:</strong> {assessment?.learning_capacity || "Medium"}</p>
                <p className="mt-2 text-slate-500">
                  This assessment considers your current educational background, previous experience, and the career gap. The suggestions provided below and in the other tabs are customized to bridge your specific skill gaps effectively.
                </p>
              </div>
            </div>

            {/* Top Career + Action Plan */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {recommended_careers[0] && (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                  <p className="text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">Top Career Match</p>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{recommended_careers[0].role}</h2>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{recommended_careers[0].reason}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge bg-white text-slate-700 border border-slate-200">Growth: {recommended_careers[0].growth}</span>
                        <span className="badge bg-white text-slate-700 border border-slate-200">Difficulty: {recommended_careers[0].difficulty}</span>
                        {recommended_careers[0].remote && (
                          <span className="badge bg-white text-slate-700 border border-slate-200">Remote OK</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-indigo-600 font-extrabold text-xl">{recommended_careers[0].salary}</div>
                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Expected Salary</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Action Plan</p>
                <ul className="space-y-3">
                  {(employability?.suggestions || []).slice(0, 4).map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-center text-indigo-600 font-bold text-[11px] flex-shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── CAREERS TAB ── */}
        {activeTab === "careers" && (
          <div className="space-y-4">
            {recommended_careers.map((career, i) => (
              <div key={career.role}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{career.role}</h3>
                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">{career.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-indigo-600 font-extrabold text-xl">{career.salary}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Salary Range</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100">Growth: {career.growth}</span>
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-100">Difficulty: {career.difficulty}</span>
                      {career.remote && (
                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">Remote Available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SKILL GAP TAB ── */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Your Current Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(skill_gap?.current_skills || []).map((s) => (
                  <span key={s} className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Required for Target Roles</h3>
              <div className="flex flex-wrap gap-2">
                {(skill_gap?.required_skills || []).map((s) => (
                  <span key={s} className="badge bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm md:col-span-2">
              <h3 className="font-bold text-slate-900 mb-5">Missing Skills - Priority List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(skill_gap?.missing_skills || []).map((skill: any, idx: number) => {
                  const name = typeof skill === "string" ? skill : skill.name || `Skill ${idx + 1}`;
                  const priority = typeof skill === "string" ? "Medium" : skill.priority || "Medium";
                  const difficulty = typeof skill === "string" ? "Medium" : skill.difficulty || "Medium";
                  const example = typeof skill === "string" ? "N/A" : skill.example || "No example provided.";
                  return (
                    <div key={name + idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{name}</span>
                        <PriorityBadge priority={priority} />
                        <span className="badge bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">{difficulty}</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{example}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {activeTab === "roadmap" && (
          <div className="space-y-10">
            {([
              { key: "days_30", label: "First 30 Days - Foundation", color: "bg-indigo-600" },
              { key: "days_60", label: "Days 31-60 - Building", color: "bg-emerald-600" },
              { key: "days_90", label: "Days 61-90 - Advanced", color: "bg-violet-600" },
            ] as const).map((phase) => (
              <div key={phase.key}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${phase.color} text-white text-sm font-bold mb-5`}>
                  {phase.label}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(roadmap?.[phase.key] || []).map((item: any, i: number) => {
                    const dayRange = typeof item === "string" ? `Item ${i + 1}` : item.day_range || "";
                    const topic = typeof item === "string" ? item : item.topic || "Roadmap Item";
                    const description = typeof item === "string" ? "" : item.description || "";
                    const resource = typeof item === "string" ? "" : item.resource || "";
                    return (
                      <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
                        <div className="text-indigo-600 text-xs font-bold mb-1.5">{dayRange}</div>
                        <h4 className="font-bold text-slate-900 mb-2">{topic}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                        {resource && (
                          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                            Resource: <span className="text-indigo-600 font-semibold">{resource}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── INTERVIEW TAB ── */}
        {activeTab === "interview" && (
          <div className="space-y-6">
            {interview?.tips && interview.tips.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-4">Interview Techniques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interview.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white border border-slate-200/60 p-3 rounded-xl">
                      <span className="text-indigo-600 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                      <p className="text-slate-600 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(interview?.questions || []).map((q, i) => (
                <details key={i} className="bg-white border border-slate-200 rounded-2xl group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-50/50 transition-colors rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-slate-900 font-semibold text-sm leading-relaxed">{q.question}</p>
                        <span className="badge bg-slate-100 text-slate-500 border border-slate-200 text-[10px] mt-1.5">{q.category}</span>
                      </div>
                    </div>
                    <span className="text-slate-300 text-xs font-bold ml-4 flex-shrink-0">Show</span>
                  </summary>
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl mt-4">
                      <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-2">Sample Answer Strategy</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{q.sample_answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
