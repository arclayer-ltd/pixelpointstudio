import { readFile } from "node:fs/promises";
import { mediaAbs } from "@/lib/media";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const rel = path.join("/");
  try {
    const buf = await readFile(mediaAbs(rel));
    const ext = rel.split(".").pop();
    const type =
      ext === "mp4"
        ? "video/mp4"
        : ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "zip"
              ? "application/zip"
              : "image/jpeg";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
