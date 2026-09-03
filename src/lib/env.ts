import type { EnvStatus, HealthReport } from "./types";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GROK_API_KEY",
  "GROK_MODEL",
  "HIGGSFIELD_API_KEY",
  "HIGGSFIELD_WORKSPACE_ID",
  "QUEUE_SECRET",
  "DEDICATED_SERVER_URL",
  "PLAY_PACKAGE_NAME",
] as const;

function present(name: (typeof KEYS)[number]): boolean {
  const v = process.env[name];
  return Boolean(v && v.trim().length > 0);
}

export function envStatus(name: (typeof KEYS)[number]): EnvStatus {
  return present(name) ? "ok" : "missing";
}

export function requireEnv(name: (typeof KEYS)[number]): string | null {
  const v = process.env[name];
  if (!v || !v.trim()) return null;
  return v.trim();
}

export function grokModel(): string {
  return requireEnv("GROK_MODEL") ?? "grok-4.6";
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function healthReport(): HealthReport {
  const keys = {} as HealthReport["keys"];
  for (const name of KEYS) {
    const status = envStatus(name);
    keys[name] = {
      status,
      valuePreview:
        status === "ok" && name === "GROK_MODEL" ? grokModel() : undefined,
    };
  }
  return { ok: true, keys };
}

export function supabaseConfigured(): boolean {
  return (
    envStatus("NEXT_PUBLIC_SUPABASE_URL") === "ok" &&
    envStatus("NEXT_PUBLIC_SUPABASE_ANON_KEY") === "ok"
  );
}

export function grokConfigured(): boolean {
  return envStatus("GROK_API_KEY") === "ok";
}

export function higgsfieldConfigured(): boolean {
  return envStatus("HIGGSFIELD_API_KEY") === "ok";
}

export function queueConfigured(): boolean {
  return envStatus("QUEUE_SECRET") === "ok";
}
