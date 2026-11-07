import { fail, json } from "@/lib/http";
import { saveUpload } from "@/lib/media";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const form = await request.formData();
  const file = form.get("file");
  const jobId = String(form.get("jobId") ?? "");
  const slot = String(form.get("slot") ?? "cover");
  if (!(file instanceof File) || !jobId) {
    return fail("file and jobId are required.");
  }
  const store = getStore();
  const job = await store.getJob(jobId, user.id);
  if (!job) return fail("Job not found.", 404);
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const url = await saveUpload(jobId, `${slot}-${Date.now()}`, bytes, safeExt);
  if (slot === "cover") {
    job.coverUrl = url;
  } else {
    job.extraUrls = [...job.extraUrls, url];
  }
  const saved = await store.updateJob(job);
  return json({ url, job: saved });
}
