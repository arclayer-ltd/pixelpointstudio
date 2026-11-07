import { fail, json } from "@/lib/http";
import { writeCopy } from "@/lib/grok";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const { jobId } = (await request.json()) as { jobId?: string };
  if (!jobId) return fail("jobId is required.");
  const store = getStore();
  const job = await store.getJob(jobId, user.id);
  if (!job) return fail("Job not found.", 404);
  if (!job.coverUrl) return fail("Generate needs an owner photo.");
  if (!job.facts.title) return fail("Title is required.");
  job.status = "copying";
  await store.updateJob(job);
  try {
    const { copy, provider } = await writeCopy({
      facts: job.facts,
      coverDataUrl: job.coverUrl,
    });
    job.copy = copy;
    job.status = "stills";
    job.error = null;
    const saved = await store.updateJob(job);
    return json({ job: saved, provider });
  } catch (e) {
    job.status = "failed";
    job.error = e instanceof Error ? e.message : "Copy failed.";
    await store.updateJob(job);
    return fail(job.error, 400);
  }
}
