import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fail, json } from "@/lib/http";
import { saveUpload } from "@/lib/media";
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
  const bytes = await readFile(
    join(process.cwd(), "docs/fixtures/sample-product.jpg"),
  );
  const url = await saveUpload(jobId, "cover-fixture", bytes, "jpg");
  job.coverUrl = url;
  const saved = await store.updateJob(job);
  return json({ url, job: saved });
}
