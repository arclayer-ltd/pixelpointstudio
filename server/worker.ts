/**
 * Dedicated-server queue worker.
 * Point DEDICATED_SERVER_URL here. Auth: x-queue-secret = QUEUE_SECRET.
 */
import { createServer } from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeClip } from "../src/lib/media";

const PORT = Number(process.env.PORT ?? 8787);
const SECRET = process.env.QUEUE_SECRET ?? "";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

type QueueJob = {
  id: string;
  kind: "normalize" | "webhook-test";
  inputPath?: string;
  outputPath?: string;
  jobId?: string;
  ownerId?: string;
  attempts?: number;
};

const queue: QueueJob[] = [];

async function postWebhook(job: QueueJob, patch: Record<string, unknown>) {
  if (!job.jobId || !job.ownerId) return;
  await fetch(`${SITE}/api/queue/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-queue-secret": SECRET,
    },
    body: JSON.stringify({ jobId: job.jobId, ownerId: job.ownerId, patch }),
  });
}

async function run(job: QueueJob) {
  const attempts = (job.attempts ?? 0) + 1;
  try {
    if (job.kind === "normalize" && job.inputPath && job.outputPath) {
      mkdirSync(join(job.outputPath, ".."), { recursive: true });
      await normalizeClip(job.inputPath, job.outputPath);
    }
    await postWebhook(job, { status: "done" });
  } catch (e) {
    if (attempts < 3) {
      queue.push({ ...job, attempts });
      return;
    }
    await postWebhook(job, {
      status: "failed",
      error: e instanceof Error ? e.message : "queue failed",
    });
  }
}

setInterval(() => {
  const next = queue.shift();
  if (next) void run(next);
}, 500);

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        worker: "ready",
        QUEUE_SECRET: SECRET ? "ok" : "missing",
        queued: queue.length,
      }),
    );
    return;
  }
  if (req.method === "POST" && url.pathname === "/jobs") {
    if (!SECRET) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "missing", key: "QUEUE_SECRET" }));
      return;
    }
    if (req.headers["x-queue-secret"] !== SECRET) {
      res.writeHead(401);
      res.end("Unauthorized");
      return;
    }
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as QueueJob;
    queue.push(body);
    writeFileSync(
      join(process.cwd(), ".queue-data", `${body.id ?? Date.now()}.json`),
      JSON.stringify(body),
    );
    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ queued: true }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

mkdirSync(join(process.cwd(), ".queue-data"), { recursive: true });
server.listen(PORT, () => {
  console.log(`OwnerShot queue on :${PORT}`);
});
