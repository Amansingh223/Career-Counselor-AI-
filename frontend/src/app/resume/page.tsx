"use client";
import { useRef, useState } from "react";
import { uploadResume } from "@/lib/api";
import Link from "next/link";

interface ResumeAnalysis {
  extracted_skills: string[];
  extracted_experience: string;
  extracted_achievements: string[];
  ats_score: number;
  missing_skills: string[];
  resume_tips: string[];
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".pdf")) {
      setFile(dropped);
      setError("");
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await uploadResume(file);
      setAnalysis(result.resume_analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = analysis
    ? analysis.ats_score >= 70 ? "bg-emerald-500" : analysis.ats_score >= 50 ? "bg-amber-500" : "bg-red-500"
    : "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">S</div>
            <span className="font-bold tracking-tight text-slate-900">CareerLift</span>
          </Link>
          <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4 border border-slate-200">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Resume Analyzer</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload your resume PDF for an ATS compatibility score, keyword analysis, and personalized improvement tips.
            </p>
          </div>

          {/* Upload Zone — only shown before analysis */}
          {!analysis && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`bg-white border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
                  dragging
                    ? "border-indigo-500 bg-indigo-50/30 scale-[1.01]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <input ref={inputRef} id="resume-file-input" type="file" accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setFile(f); setError(""); }
                  }}
                />
                <div className="text-5xl mb-4">{file ? "📄" : "📁"}</div>
                {file ? (
                  <>
                    <p className="font-bold text-slate-900 text-base">{file.name}</p>
                    <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                    <p className="text-indigo-600 text-xs font-semibold mt-3">Click to change file</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 text-base mb-1">Drop your Resume PDF here</p>
                    <p className="text-slate-400 text-sm">or click to browse files</p>
                    <p className="text-slate-300 text-xs mt-3">Supports .pdf files only</p>
                  </>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
              )}

              <button id="upload-resume-btn" onClick={handleUpload}
                disabled={!file || loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? (
                  <><div className="spinner w-4 h-4 border-2" /> Analyzing Resume...</>
                ) : (
                  "Analyze Resume →"
                )}
              </button>
            </>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 animate-fade-in-up">
              {/* ATS Score Card */}
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">ATS Compatibility Score</p>
                <div className="text-6xl font-black text-slate-900 mb-1">
                  {analysis.ats_score}
                  <span className="text-2xl text-slate-400 font-semibold">/100</span>
                </div>
                <div className="progress-bar w-56 mx-auto mt-4">
                  <div className={`progress-fill ${scoreColor}`} style={{ width: `${analysis.ats_score}%` }} />
                </div>
                <p className="text-slate-500 text-sm font-semibold mt-3">
                  {analysis.ats_score >= 70 ? "🟢 Good ATS compatibility" : analysis.ats_score >= 50 ? "🟡 Needs improvement" : "🔴 Significant gaps found"}
                </p>
              </div>

              {/* 2-col grid for skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">✅ Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.extracted_skills || []).map((s) => (
                      <span key={s} className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">{s}</span>
                    ))}
                    {(!analysis.extracted_skills || analysis.extracted_skills.length === 0) && (
                      <span className="text-slate-400 text-sm">None detected</span>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">🚧 Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.missing_skills || []).map((s) => (
                      <span key={s} className="badge bg-red-50 text-red-700 border border-red-100">{s}</span>
                    ))}
                    {(!analysis.missing_skills || analysis.missing_skills.length === 0) && (
                      <span className="text-emerald-600 text-sm font-semibold">All key skills found! ✓</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">📋 Experience Summary</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{analysis.extracted_experience}</p>
              </div>

              {/* Achievements */}
              {analysis.extracted_achievements && analysis.extracted_achievements.length > 0 && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">🏆 Key Achievements</h3>
                  <ul className="space-y-2">
                    {(analysis.extracted_achievements || []).map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                        <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-4">💡 Improvement Tips</h3>
                <ol className="space-y-3">
                  {(analysis.resume_tips || []).map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 bg-indigo-100 border border-indigo-200 rounded-md flex items-center justify-center text-indigo-700 font-bold text-[11px] flex-shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button onClick={() => { setAnalysis(null); setFile(null); }}
                  className="btn-secondary flex-1 border border-slate-200">
                  Upload Another
                </button>
                <Link href="/dashboard" className="btn-primary flex-1 text-center">
                  View Dashboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
