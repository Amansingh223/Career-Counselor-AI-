"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STATS = [
  { value: "10K+", label: "Women counselled" },
  { value: "7", label: "AI agents" },
  { value: "90 days", label: "Roadmap" },
  { value: "98%", label: "Satisfaction" },
];

const FEATURES = [
  {
    icon: "CA",
    title: "Career Assessment",
    desc: "Collects education, work experience, career gap, skills, interests, availability, and goals to understand the full restart context.",
  },
  {
    icon: "SG",
    title: "Skill Gap Analysis",
    desc: "Compares current skills with target-role requirements and ranks the highest-priority gaps to close first.",
  },
  {
    icon: "CR",
    title: "Career Recommendations",
    desc: "Suggests suitable roles with fit reasoning, estimated learning effort, transition difficulty, and job-readiness timeline.",
  },
  {
    icon: "LR",
    title: "Learning Roadmap",
    desc: "Builds a practical 30-60-90 day plan with weekly milestones, resources, and focused next actions.",
  },
  {
    icon: "ES",
    title: "Employability Score",
    desc: "Measures readiness across skills, confidence, availability, role fit, and market alignment with explainable scoring.",
  },
  {
    icon: "IC",
    title: "Interview Coach",
    desc: "Generates role-based practice questions, sample answer strategies, and confidence-building preparation tips.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Profile Signup",
    desc: "Create an account so assessment results, resume analysis, and report history stay securely available.",
  },
  {
    step: "02",
    title: "Assessment Intake",
    desc: "Share education, prior roles, gap reasons, preferred work mode, study hours, interests, and goals.",
  },
  {
    step: "03",
    title: "Agent Workflow",
    desc: "Specialized AI agents coordinate assessment, role matching, scoring, roadmap creation, and coaching.",
  },
  {
    step: "04",
    title: "Interactive Dashboard",
    desc: "Review matched careers, strengths, gaps, employability score, and day-by-day learning plans.",
  },
  {
    step: "05",
    title: "Resume Analyzer",
    desc: "Upload a CV to inspect ATS compatibility, extracted skills, missing keywords, and improvement tips.",
  },
  {
    step: "06",
    title: "PDF Export",
    desc: "Download a polished AI career report with recommendations, roadmap, scoring, and next steps.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    gap: "3-year career break",
    result: "Secured a remote Data Analyst role",
    avatar: "PS",
  },
  {
    name: "Meera Nair",
    gap: "5-year career break",
    result: "Transitioned to HR Operations Specialist",
    avatar: "MN",
  },
  {
    name: "Anita Rao",
    gap: "2-year career break",
    result: "Joined a tech firm as Junior Product Owner",
    avatar: "AR",
  },
];

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md";
const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 ${className}`}>{children}</div>;
}

function SectionHeader({
  title,
  accent,
  desc,
}: {
  title: string;
  accent?: string;
  desc: string;
}) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        {title} {accent && <span className="text-indigo-600">{accent}</span>}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-500">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <article className="grid h-full grid-rows-[auto_1fr] gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
      <div className="flex min-h-12 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-sm font-extrabold text-indigo-700">
          {icon}
        </div>
        <h3 className="text-lg font-bold leading-7 text-slate-900">{title}</h3>
      </div>
      <p className="text-sm leading-7 text-slate-500">{desc}</p>
    </article>
  );
}

function ProcessCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <article className="grid h-full grid-rows-[auto_1fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
      <div className="flex min-h-12 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-sm font-extrabold text-indigo-600">
          {step}
        </div>
        <h3 className="text-lg font-bold leading-7 text-slate-900">{title}</h3>
      </div>
      <p className="text-sm leading-7 text-slate-500">{desc}</p>
    </article>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900">
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md" : "bg-transparent"
          }`}
      >
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-base font-semibold text-white">
              S
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">CareerLift</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Process
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Stories
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </Container>
      </nav>

      <section className="mb-24 bg-gradient-to-b from-indigo-50 via-white to-[#F8FAFC] pb-24 pt-32 md:pt-40">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700">
              AI-powered career counselor with multi-agent workflows
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              Restart Your Professional Journey
              <span className="block text-indigo-600">With AI Clarity & Support</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500 md:text-xl md:leading-9">
              CareerLift helps women returning after career breaks discover suitable roles, skill gaps,
              employability readiness, and a practical 90-day plan for re-entry.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Link href="/auth/register" className={primaryButtonClass}>
                Start Assessment
              </Link>
              <a href="#features" className={secondaryButtonClass}>
                Explore Features
              </a>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-indigo-600 md:text-3xl">{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="features" className="py-24">
        <Container>
          <SectionHeader
            title="Everything You Need to"
            accent="Relaunch"
            desc="A cohesive workflow that turns profile data into career recommendations, skill-gap analysis, employability scoring, and practical next steps."
          />

          <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="mt-24 border-y border-slate-200 bg-white py-24">
        <Container>
          <SectionHeader
            title="The Assessment Process"
            desc="From background intake to job-readiness, every step is designed around clear outcomes and explainable AI guidance."
          />

          <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PROCESS.map((item) => (
              <ProcessCard key={item.step} {...item} />
            ))}
          </div>
        </Container>
      </section>

      <section id="testimonials" className="py-24">
        <Container>
          <SectionHeader
            title="Empowering Outcomes"
            desc="Examples of the kinds of career transitions CareerLift is built to support with practical, personalized guidance."
          />

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
              >
                <p className="text-sm leading-7 text-slate-600">&quot;{item.result}&quot;</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.name}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{item.gap}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center md:p-12">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Ready to Restart?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Get role recommendations, skill priorities, employability insights, and a 90-day roadmap tailored to your restart goals.
            </p>
            <div className="mt-8">
              <Link href="/auth/register" className={primaryButtonClass}>
                Get Your Free Assessment
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
        <Container>
          <p>(c) 2026 CareerLift Career Counselor.</p>
        </Container>
      </footer>
    </main>
  );
}
