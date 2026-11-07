import { fail, json } from "@/lib/http";
import { generateStills } from "@/lib/higgsfield";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { StillVerdict } from "@/lib/types";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const body = (await request.json()) as {
    jobId?: string;
    stillId?: string;
    verdict?: StillVerdict;
    regenerate?: boolean;
  };
  if (!body.jobId) return fail("jobId is required.");
  const store = getStore();
  const job = await store.getJob(body.jobId, user.id);
  if (!job) return fail("Job not found.", 404);

  if (body.regenerate) {
    if (!job.coverUrl) return fail("Generate needs an owner photo.");
    const { stills } = await generateStills({
      jobId: job.id,
      coverPath: job.coverUrl,
      factsTitle: job.facts.title,
    });
    job.stills = stills;
    job.status = "judging";
    const saved = await store.updateJob(job);
    return json({ job: saved });
  }

  job.stills = job.stills.map((s) =>
    s.id === body.stillId ? { ...s, verdict: body.verdict } : s,
  );
  if (job.stills.some((s) => s.verdict === "keep")) {
    job.status = "motion";
  }
  const saved = await store.updateJob(job);
  return json({ job: saved });
}
