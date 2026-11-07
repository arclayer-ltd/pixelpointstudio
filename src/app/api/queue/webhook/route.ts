import { fail, json } from "@/lib/http";
import { requireEnv } from "@/lib/env";
import { getStore } from "@/lib/store";
import type { Job } from "@/lib/types";

export async function POST(request: Request) {
  const secret = requireEnv("QUEUE_SECRET");
  const header = request.headers.get("x-queue-secret");
  if (!secret) {
    return json({ status: "missing", key: "QUEUE_SECRET" }, 503);
  }
  if (header !== secret) return fail("Unauthorized.", 401);
  const body = (await request.json()) as {
    jobId?: string;
    ownerId?: string;
    patch?: Partial<Job>;
  };
  if (!body.jobId || !body.ownerId) return fail("jobId and ownerId required.");
  const store = getStore();
  const job = await store.getJob(body.jobId, body.ownerId);
  if (!job) return fail("Job not found.", 404);
  const saved = await store.updateJob({ ...job, ...body.patch, id: job.id });
  return json({ job: saved });
}
