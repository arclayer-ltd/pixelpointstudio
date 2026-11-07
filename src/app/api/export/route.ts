import { fail, json } from "@/lib/http";
import { writePackZip } from "@/lib/media";
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
  const square = job.stills.find((s) => s.format === "1:1");
  const vertical = job.stills.find((s) => s.format === "9:16");
  if (!square || !vertical || !job.copy) {
    return fail("Pack needs square, 9:16, and script.");
  }
  job.status = "exporting";
  await store.updateJob(job);
  const packUrl = await writePackZip(job.id, [
    { name: "still-1x1.jpg", url: square.url },
    { name: "still-9x16.jpg", url: vertical.url },
    { name: "script.txt", url: "", text: job.copy.script },
    {
      name: "play.txt",
      url: "",
      text: [
        `TITLE: ${job.copy.playTitle}`,
        `SHORT: ${job.copy.playShort}`,
        `LONG:`,
        job.copy.playLong,
      ].join("\n"),
    },
  ]);
  job.packUrl = packUrl;
  job.status = "done";
  const saved = await store.updateJob(job);
  return json({ job: saved });
}
