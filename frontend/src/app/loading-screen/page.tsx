"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AGENT_STEPS = [
  { icon: "🧠", name: "Assessment Agent", desc: "Analyzing your background & strengths..." },
  { icon: "🎯", name: "Skill Gap Agent", desc: "Identifying missing skills for target roles..." },
  { icon: "💼", name: "Career Recommendation Agent", desc: "Finding your best career matches..." },
  { icon: "🗺️", name: "Learning Roadmap Agent", desc: "Building your personalized 90-day plan..." },
  { icon: "📊", name: "Employability Agent", desc: "Calculating your readiness score..." },
  { icon: "📄", name: "Resume Analyzer Agent", desc: "Reviewing your profile strength..." },
  { icon: "🎤", name: "Interview Coach Agent", desc: "Preparing your interview questions..." },
];

export default function LoadingScreenPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < AGENT_STEPS.length - 1) {
          setCompleted((c) => [...c, prev]);
          return prev + 1;
        }
        clearInterval(interval);
        setCompleted((c) => [...c, prev]);
        setTimeout(() => router.push("/dashboard"), 1200);
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [router]);

  const progressPct = Math.round(((completed.length) / AGENT_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          <div className="absolute inset-[6px] rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
            ✨
          </div>
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Analyzing Your Profile</h1>
        <p className="text-slate-400 text-sm mb-8">7 specialized AI agents are working on your report...</p>

        {/* Agent list */}
        <div className="space-y-2.5 text-left mb-8">
          {AGENT_STEPS.map((agent, i) => {
            const isDone = completed.includes(i);
            const isCurrent = currentStep === i && !isDone;
            const isPending = i > currentStep;

            return (
              <div key={agent.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                  isDone
                    ? "bg-emerald-50 border-emerald-200"
                    : isCurrent
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-slate-200 opacity-40"
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-bold ${
                  isDone ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {isDone ? "✓" : agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs uppercase tracking-wider truncate ${
                    isDone ? "text-emerald-800" : isCurrent ? "text-indigo-900" : "text-slate-400"
                  }`}>
                    {agent.name}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{agent.desc}</div>
                  )}
                  {isDone && (
                    <div className="text-xs text-emerald-600 font-medium mt-0.5">Completed</div>
                  )}
                </div>
                {isPending && (
                  <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">Pending</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-2">
          <div
            className="progress-fill bg-indigo-600"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{progressPct}% Complete</p>
      </div>
    </div>
  );
}
