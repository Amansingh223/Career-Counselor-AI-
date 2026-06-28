// Centralized API client for the CareerLift backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("shestarts_token");
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(name: string, email: string, password: string) {
  const data = await apiFetch<{ access_token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem("shestarts_token", data.access_token);
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("shestarts_token", data.access_token);
  return data;
}

export async function getMe() {
  return apiFetch<{
    id: number;
    name: string;
    email: string;
    education?: string;
    experience?: string;
  }>("/api/auth/me");
}

export function logout() {
  localStorage.removeItem("shestarts_token");
}

// ── Assessment ────────────────────────────────────────────────────────────────

export interface AssessmentPayload {
  education: string;
  experience: string;
  career_gap: string;
  current_skills: string[];
  interests: string;
  preferred_work: string;
  study_hours: number;
  goal: string;
}

export async function submitAssessment(payload: AssessmentPayload) {
  return apiFetch<{ report_id: number; report: Record<string, unknown> }>(
    "/api/assessment",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// ── Report ────────────────────────────────────────────────────────────────────

export async function getLatestReport() {
  return apiFetch<{
    report_id: number;
    report: Record<string, unknown>;
    employability_score: number;
  }>("/api/report/latest");
}

export function getPdfUrl(reportId: number): string {
  const token = getToken();
  return `${API_URL}/api/report/${reportId}/pdf?token=${token}`;
}

// ── Resume ────────────────────────────────────────────────────────────────────

export async function uploadResume(file: File) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/resume/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload error");
  }
  return res.json();
}
