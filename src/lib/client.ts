import type { Job, Product, SessionUser, Shop } from "./types";

async function parse<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  const body = (await resolved.json()) as T & { error?: string };
  if (!resolved.ok) {
    throw new Error(body.error || `Request failed (${resolved.status})`);
  }
  return body;
}

export const api = {
  session: () => parse<{ user: SessionUser | null }>(fetch("/api/auth/session")),
  signIn: (email: string, mode: "magic" | "local" = "local") =>
    parse<{ user?: SessionUser; sent?: boolean; url?: string }>(
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode }),
      }),
    ),
  google: () =>
    parse<{ url?: string }>(
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "google" }),
      }),
    ),
  signOut: () => fetch("/api/auth/session", { method: "DELETE" }),
  jobs: () => parse<{ shop: Shop; jobs: Job[] }>(fetch("/api/jobs")),
  createJob: () =>
    parse<{ job: Job }>(fetch("/api/jobs", { method: "POST" })),
  job: (id: string) => parse<{ job: Job }>(fetch(`/api/jobs/${id}`)),
  products: () => parse<{ products: Product[] }>(fetch("/api/products")),
  fixture: (jobId: string) =>
    parse<{ url: string; job: Job }>(
      fetch("/api/fixture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  upload: async (jobId: string, slot: "cover" | "extra", file: File) => {
    const form = new FormData();
    form.set("jobId", jobId);
    form.set("slot", slot);
    form.set("file", file);
    return parse<{ url: string; job: Job }>(
      fetch("/api/upload", { method: "POST", body: form }),
    );
  },
  facts: (jobId: string, facts: Job["facts"]) =>
    parse<{ job: Job }>(
      fetch("/api/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, facts }),
      }),
    ),
  copy: (jobId: string) =>
    parse<{ job: Job }>(
      fetch("/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  stills: (jobId: string) =>
    parse<{ job: Job }>(
      fetch("/api/stills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  judge: (
    jobId: string,
    payload: { stillId?: string; verdict?: "keep" | "reject"; regenerate?: boolean },
  ) =>
    parse<{ job: Job }>(
      fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, ...payload }),
      }),
    ),
  motion: (jobId: string, audioMode: "original" | "none") =>
    parse<{ job: Job }>(
      fetch("/api/motion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, audioMode }),
      }),
    ),
  exportPack: (jobId: string) =>
    parse<{ job: Job }>(
      fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  health: () => parse<unknown>(fetch("/api/health")),
};
