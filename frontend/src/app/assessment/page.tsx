"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssessment, AssessmentPayload } from "@/lib/api";
import Link from "next/link";

const SKILL_CATEGORIES = [
  {
    label: "Programming & Development",
    skills: ["Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "R", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "MATLAB", "Scala", "Bash/Shell"],
  },
  {
    label: "Web & Frontend",
    skills: ["React", "Next.js", "Vue.js", "Angular", "HTML/CSS", "Tailwind CSS", "Bootstrap", "Node.js", "Express.js", "REST APIs", "GraphQL"],
  },
  {
    label: "Data & Analytics",
    skills: ["SQL", "Excel", "Power BI", "Tableau", "Data Analysis", "SPSS", "Pandas", "NumPy", "Matplotlib", "Google Analytics", "Looker Studio", "Apache Spark"],
  },
  {
    label: "AI & Machine Learning",
    skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "LangChain", "Prompt Engineering"],
  },
  {
    label: "Cloud & DevOps",
    skills: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Git/GitHub", "Jenkins"],
  },
  {
    label: "Databases",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis", "Oracle DB", "Snowflake", "BigQuery"],
  },
  {
    label: "Design & Creative",
    skills: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva", "UX Research", "UI Design", "Wireframing", "Prototyping", "Video Editing", "After Effects"],
  },
  {
    label: "Business & Management",
    skills: ["Project Management", "Agile/Scrum", "Finance", "Accounting", "HR", "Recruitment", "Business Analysis", "Operations", "Supply Chain", "Leadership"],
  },
  {
    label: "Marketing & Sales",
    skills: ["Digital Marketing", "SEO/SEM", "Content Writing", "Social Media Marketing", "Email Marketing", "CRM Tools", "Salesforce", "HubSpot", "Copywriting", "Brand Strategy"],
  },
  {
    label: "Soft Skills",
    skills: ["Communication", "Customer Service", "Presentation", "Problem Solving", "Critical Thinking", "Team Collaboration", "Time Management", "Negotiation"],
  },
  {
    label: "Productivity Tools",
    skills: ["Microsoft Word", "Microsoft PowerPoint", "Google Workspace", "Notion", "Jira", "Confluence", "Slack", "Trello", "Asana", "Zoom"],
  },
];

const EDUCATION_OPTIONS = [
  "High School / 12th",
  "Diploma",
  "Bachelor's Degree (B.A/B.Sc/B.Com/BBA/B.Tech)",
  "Master's Degree (MBA/M.Sc/M.Tech)",
  "PhD / Doctorate",
  "Professional Certification",
];

const WORK_OPTIONS = ["Remote", "Hybrid", "On-site"];

type Step = 0 | 1 | 2 | 3;

const STEPS = ["Background", "Skills", "Preferences", "Review"];

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set([SKILL_CATEGORIES[0].label]));
  const toggleCat = (label: string) => setOpenCats((prev) => { const s = new Set(prev); s.has(label) ? s.delete(label) : s.add(label); return s; });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<AssessmentPayload>({
    education: "",
    experience: "",
    career_gap: "",
    current_skills: [],
    interests: "",
    preferred_work: "Remote",
    study_hours: 2,
    goal: "",
  });

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      current_skills: prev.current_skills.includes(skill)
        ? prev.current_skills.filter((s) => s !== skill)
        : [...prev.current_skills, skill],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await submitAssessment(form);
      localStorage.setItem("shestarts_report", JSON.stringify(result.report));
      localStorage.setItem("shestarts_report_id", String(result.report_id));
      router.push("/loading-screen");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">C</div>
            <span className="font-bold tracking-tight text-slate-900">CareerLift</span>
          </Link>
          <span className="text-slate-400 text-sm font-medium">Career Assessment</span>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Career Assessment</h1>
          <p className="text-slate-500 text-sm">Tell us about yourself so our AI agents can build your personalized plan.</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-start justify-between relative">
            {/* connector line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-slate-200 z-0" />
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}
                >
                  {i < step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : i + 1}
                </div>
                <span className={`text-[11px] font-semibold mt-2 ${i === step ? "text-indigo-600" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            {/* Step 0 — Background */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Your Background</h2>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Highest Education Level
                  </label>
                  <select id="edu-select" className="input-field" value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}>
                    <option value="">Select education level</option>
                    {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Total Work Experience
                  </label>
                  <input id="exp-input" className="input-field" placeholder="e.g. 3 years, 5 years, Fresher"
                    value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Career Gap Duration
                  </label>
                  <input id="gap-input" className="input-field" placeholder="e.g. 2 years, 6 months, None"
                    value={form.career_gap} onChange={(e) => setForm({ ...form, career_gap: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Career Goal <span className="text-slate-300 font-normal">(Optional)</span>
                  </label>
                  <input id="goal-input" className="input-field" placeholder="e.g. Become a Data Analyst, Re-enter Corporate Finance"
                    value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
                </div>
              </div>
            )}

            {/* Step 1 — Skills */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Your Current Skills</h2>
                <p className="text-slate-500 text-sm mb-4">Select all skills you currently have experience with.</p>

                {form.current_skills.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {form.current_skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {s}
                        <button type="button" onClick={() => toggleSkill(s)} className="ml-0.5 text-indigo-400 hover:text-indigo-700">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {SKILL_CATEGORIES.map((cat) => {
                    const isOpen = openCats.has(cat.label);
                    const selectedCount = cat.skills.filter((s) => form.current_skills.includes(s)).length;
                    return (
                      <div key={cat.label} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleCat(cat.label)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                            {selectedCount > 0 && (
                              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>
                            )}
                          </div>
                          <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="px-4 py-3 flex flex-wrap gap-2 bg-white">
                            {cat.skills.map((skill) => {
                              const selected = form.current_skills.includes(skill);
                              return (
                                <button key={skill} id={`skill-${skill.toLowerCase().replace(/[\s/+#.]+/g, "-")}`}
                                  type="button" onClick={() => toggleSkill(skill)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                    selected
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-400"
                                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                  }`}>
                                  {selected ? (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  ) : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                  )}
                                  {skill}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-slate-400 text-xs">
                  {form.current_skills.length === 0 ? "No skills selected yet" : `✓ ${form.current_skills.length} skill${form.current_skills.length > 1 ? "s" : ""} selected`}
                </p>
              </div>
            )}

            {/* Step 2 — Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Your Preferences</h2>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Interests & Passions
                  </label>
                  <textarea id="interests-input" className="input-field min-h-[100px] resize-none"
                    placeholder="e.g. I enjoy working with numbers, helping people, problem-solving..."
                    value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Preferred Work Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {WORK_OPTIONS.map((opt) => (
                      <button key={opt} id={`work-${opt.toLowerCase()}`} type="button"
                        onClick={() => setForm({ ...form, preferred_work: opt })}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                          form.preferred_work === opt
                            ? "bg-indigo-50 text-indigo-700 border-indigo-400"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Daily Study Commitment:{" "}
                    <span className="text-indigo-600 font-bold normal-case">{form.study_hours} hrs / day</span>
                  </label>
                  <input id="hours-slider" type="range" min={1} max={8} value={form.study_hours}
                    onChange={(e) => setForm({ ...form, study_hours: Number(e.target.value) })}
                    className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>1 hr</span><span>4 hrs</span><span>8 hrs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Review Your Details</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { label: "Education", value: form.education || "-" },
                    { label: "Experience", value: form.experience || "-" },
                    { label: "Career Gap", value: form.career_gap || "-" },
                    { label: "Goal", value: form.goal || "Not specified" },
                    { label: "Work Mode", value: form.preferred_work },
                    { label: "Study Hours/Day", value: `${form.study_hours} hours` },
                    { label: "Interests", value: form.interests || "Not specified" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4 bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl">
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex-shrink-0">{row.label}</span>
                      <span className="text-slate-900 text-sm font-semibold text-right">{row.value}</span>
                    </div>
                  ))}

                  <div className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Selected Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.current_skills.length > 0
                        ? form.current_skills.map((s) => (
                            <span key={s} className="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">{s}</span>
                          ))
                        : <span className="text-slate-400 text-xs font-medium">None selected</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <span className="text-xs font-bold text-indigo-700 flex-shrink-0">AI</span>
                  <div>
                    <p className="text-indigo-900 text-sm font-bold">Ready for Analysis</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">7 AI agents will analyze your profile. This takes approximately 30–40 seconds.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button id="prev-btn" type="button"
                onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
                disabled={step === 0}
                className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
                Back
              </button>

              {step < 3 ? (
                <button id="next-btn" type="button"
                  onClick={() => setStep((s) => ((s + 1) as Step))}
                  className="btn-primary">
                  Next
                </button>
              ) : (
                <button id="submit-assessment" type="button"
                  onClick={handleSubmit} disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {loading ? (
                    <><div className="spinner w-4 h-4 border-2" /> Analyzing...</>
                  ) : (
                    "Generate Report"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
