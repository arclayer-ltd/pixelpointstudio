import { fail, json } from "@/lib/http";
import { generateClip } from "@/lib/higgsfield";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { AudioMode } from "@/lib/types";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const body = (await request.json()) as {
    jobId?: string;
    audioMode?: AudioMode;
  };
  if (!body.jobId) return fail("jobId is required.");
  const store = getStore();
  const job = await store.getJob(body.jobId, user.id);
  if (!job) return fail("Job not found.", 404);
  if (!job.coverUrl) return fail("Generate needs an owner photo.");
  const kept = job.stills.find((s) => s.verdict === "keep") ?? job.stills[0];
  try {
    const { url, provider } = await generateClip({
      jobId: job.id,
      stillUrl: kept?.url ?? job.coverUrl,
      coverPath: job.coverUrl,
      script: job.copy?.script ?? job.facts.title,
    });
    job.clipUrl = url;
    job.audioMode = body.audioMode ?? "none";
    job.status = "pack";
    job.error = null;
    const saved = await store.updateJob(job);
    return json({ job: saved, provider });
  } catch (e) {
    job.status = "failed";
    job.error = e instanceof Error ? e.message : "Motion failed.";
    await store.updateJob(job);
    return fail(job.error, 400);
  }
}
