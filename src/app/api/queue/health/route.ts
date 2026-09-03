import { envStatus, requireEnv } from "@/lib/env";
import { json } from "@/lib/http";

export async function GET() {
  const dedicated = requireEnv("DEDICATED_SERVER_URL");
  return json({
    worker: "ready",
    QUEUE_SECRET: envStatus("QUEUE_SECRET"),
    DEDICATED_SERVER_URL: envStatus("DEDICATED_SERVER_URL"),
    PLAY_PACKAGE_NAME: envStatus("PLAY_PACKAGE_NAME"),
    dedicated,
  });
}
