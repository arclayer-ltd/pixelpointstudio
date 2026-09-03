import { fail, json } from "@/lib/http";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { Job } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const { id } = await context.params;
  const job = await getStore().getJob(id, user.id);
  if (!job) return fail("Job not found.", 404);
  return json({ job });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const { id } = await context.params;
  const store = getStore();
  const job = await store.getJob(id, user.id);
  if (!job) return fail("Job not found.", 404);
  const patch = (await request.json()) as Partial<Job>;
  const next: Job = {
    ...job,
    ...patch,
    id: job.id,
    ownerId: job.ownerId,
    shopId: job.shopId,
    productId: job.productId,
  };
  const saved = await store.updateJob(next);
  return json({ job: saved });
}
