import { fail, json } from "@/lib/http";
import { normalizeFacts, validateFacts } from "@/lib/facts";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { ProductFacts } from "@/lib/types";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const body = (await request.json()) as {
    jobId?: string;
    facts?: Partial<ProductFacts>;
  };
  if (!body.jobId) return fail("jobId is required.");
  const store = getStore();
  const job = await store.getJob(body.jobId, user.id);
  if (!job) return fail("Job not found.", 404);
  const facts = normalizeFacts(body.facts ?? {});
  const err = validateFacts(facts, job.coverUrl);
  if (err) return fail(err.message, 422);
  job.facts = facts;
  job.status = "facts";
  const saved = await store.updateJob(job);
  await store.upsertProductFromJob(saved);
  return json({ job: saved });
}
