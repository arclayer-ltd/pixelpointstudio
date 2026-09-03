import type { Job, Product, SessionUser, Shop } from "./types";

function timedFetch(input: RequestInfo, init?: RequestInit, ms = 90000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(input, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    signal: ctrl.signal,
  }).finally(() => clearTimeout(timer));
}

async function parse<T>(res: Response | Promise<Response>): Promise<T> {
  try {
    const resolved = await res;
    const body = (await resolved.json()) as T & { error?: string };
    if (!resolved.ok) {
      throw new Error(body.error || `Request failed (${resolved.status})`);
    }
    return body;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw e;
  }
}

export const api = {
  session: () => parse<{ user: SessionUser | null }>(timedFetch("/api/auth/session")),
  signIn: (email: string, mode: "magic" | "local" = "local") =>
    parse<{ user?: SessionUser; sent?: boolean; url?: string }>(
      timedFetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode }),
      }),
    ),
  google: () =>
    parse<{ url?: string }>(
      timedFetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "google" }),
      }),
    ),
  signOut: () => timedFetch("/api/auth/session", { method: "DELETE" }),
  jobs: () => parse<{ shop: Shop; jobs: Job[] }>(timedFetch("/api/jobs")),
  createJob: () =>
    parse<{ job: Job }>(timedFetch("/api/jobs", { method: "POST" })),
  job: (id: string) => parse<{ job: Job }>(timedFetch(`/api/jobs/${id}`)),
  products: () => parse<{ products: Product[] }>(timedFetch("/api/products")),
  fixture: (jobId: string) =>
    parse<{ url: string; job: Job }>(
      timedFetch("/api/fixture", {
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
      timedFetch("/api/upload", { method: "POST", body: form }),
    );
  },
  facts: (jobId: string, facts: Job["facts"]) =>
    parse<{ job: Job }>(
      timedFetch("/api/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, facts }),
      }),
    ),
  copy: (jobId: string) =>
    parse<{ job: Job }>(
      timedFetch("/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  stills: (jobId: string) =>
    parse<{ job: Job }>(
      timedFetch("/api/stills", {
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
      timedFetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, ...payload }),
      }),
    ),
  motion: (jobId: string, audioMode: "original" | "none") =>
    parse<{ job: Job }>(
      timedFetch("/api/motion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, audioMode }),
      }),
    ),
  exportPack: (jobId: string) =>
    parse<{ job: Job }>(
      timedFetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      }),
    ),
  health: () => parse<unknown>(timedFetch("/api/health")),
};
