import { fail, json } from "@/lib/http";
import { generateStills } from "@/lib/higgsfield";
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
  try {
    const { stills, provider } = await generateStills({
      jobId: job.id,
      coverPath: job.coverUrl,
      factsTitle: job.facts.title,
    });
    job.stills = stills;
    job.status = "judging";
    job.error = null;
    const saved = await store.updateJob(job);
    return json({ job: saved, provider });
  } catch (e) {
    job.status = "failed";
    job.error = e instanceof Error ? e.message : "Stills failed.";
    await store.updateJob(job);
    return fail(job.error, 400);
  }
}
