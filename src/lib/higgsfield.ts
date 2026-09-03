import { higgsfieldConfigured, requireEnv } from "./env";
import { checkOwnerPrompt } from "./ip-firewall";
import { renderFallbackClip, renderFallbackStills } from "./media";
import type { StillAsset, StillFormat } from "./types";

const BASE = "https://api.higgsfield.ai";

function authHeader(): string {
  const key = requireEnv("HIGGSFIELD_API_KEY") ?? "";
  return `Key ${key}`;
}

function workspaceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: authHeader(),
    "Content-Type": "application/json",
  };
  const workspace = requireEnv("HIGGSFIELD_WORKSPACE_ID");
  if (workspace) headers["X-Workspace-Id"] = workspace;
  return headers;
}

type Queued = {
  status: string;
  request_id: string;
  status_url?: string;
};

async function poll(statusUrl: string): Promise<{ images?: { url: string }[]; videos?: { url: string }[] }> {
  for (let i = 0; i < 40; i += 1) {
    const res = await fetch(statusUrl, { headers: workspaceHeaders() });
    if (!res.ok) break;
    const body = (await res.json()) as {
      status: string;
      images?: { url: string }[];
      videos?: { url: string }[];
    };
    if (body.status === "completed") return body;
    if (["failed", "nsfw", "canceled"].includes(body.status)) {
      throw new Error(`Higgsfield ${body.status}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Higgsfield timeout");
}

async function submit(path: string, payload: Record<string, unknown>): Promise<Queued> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: workspaceHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Higgsfield ${res.status}`);
  }
  return (await res.json()) as Queued;
}

const FORMAT_PROMPT: Record<StillFormat, string> = {
  "1:1": "square 1:1 catalog still of the same owner product only",
  "4:5": "4:5 portrait still of the same owner product only",
  "9:16": "9:16 vertical still of the same owner product only",
};

export async function generateStills(input: {
  jobId: string;
  coverPath: string;
  factsTitle: string;
}): Promise<{ stills: StillAsset[]; provider: "higgsfield" | "local" }> {
  const wall = checkOwnerPrompt(input.factsTitle);
  if (!wall.ok) throw new Error(wall.reason);

  if (!higgsfieldConfigured()) {
    return {
      stills: await renderFallbackStills(input.jobId, input.coverPath),
      provider: "local",
    };
  }

  try {
    const formats: StillFormat[] = ["1:1", "4:5", "9:16"];
    const stills: StillAsset[] = [];
    for (const format of formats) {
      const queued = await submit("/higgsfield-ai/soul/v2/standard", {
        prompt: `${FORMAT_PROMPT[format]}. Product IP check on. Same product as the owner photo. No celebrity. No film. No third-party brand.`,
        aspect_ratio: format === "1:1" ? "1:1" : format === "4:5" ? "4:5" : "9:16",
        input_images: [{ type: "image_url", image_url: input.coverPath }],
        product_ip_check: true,
      });
      const statusUrl =
        queued.status_url ?? `${BASE}/requests/${queued.request_id}/status`;
      const done = await poll(statusUrl);
      const url = done.images?.[0]?.url;
      if (url) {
        stills.push({ id: `${input.jobId}-${format}`, format, url });
      }
    }
    if (stills.length === 0) {
      return {
        stills: await renderFallbackStills(input.jobId, input.coverPath),
        provider: "local",
      };
    }
    return { stills, provider: "higgsfield" };
  } catch {
    return {
      stills: await renderFallbackStills(input.jobId, input.coverPath),
      provider: "local",
    };
  }
}

export async function generateClip(input: {
  jobId: string;
  stillUrl: string;
  coverPath: string;
  script: string;
}): Promise<{ url: string; provider: "higgsfield" | "local" }> {
  const wall = checkOwnerPrompt(input.script);
  if (!wall.ok) throw new Error(wall.reason);

  if (!higgsfieldConfigured()) {
    return {
      url: await renderFallbackClip(input.jobId, input.stillUrl || input.coverPath),
      provider: "local",
    };
  }

  try {
    const queued = await submit("/v1/image2video/dop", {
      prompt:
        "12 to 15 second original product ad. Camera on the same owner product. No licensed music. Generated audio or silence. Product IP check on.",
      duration: 13,
      input_images: [
        { type: "image_url", image_url: input.stillUrl || input.coverPath },
      ],
      product_ip_check: true,
    });
    const statusUrl =
      queued.status_url ?? `${BASE}/requests/${queued.request_id}/status`;
    const done = await poll(statusUrl);
    const url = done.videos?.[0]?.url;
    if (!url) throw new Error("no video");
    return { url, provider: "higgsfield" };
  } catch {
    return {
      url: await renderFallbackClip(input.jobId, input.stillUrl || input.coverPath),
      provider: "local",
    };
  }
}
