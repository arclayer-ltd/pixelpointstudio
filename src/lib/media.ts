import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import type { StillAsset, StillFormat } from "./types";

const exec = promisify(execFile);
const MEDIA = join(process.cwd(), ".data", "media");

export function mediaAbs(rel: string): string {
  return join(MEDIA, rel.replace(/^\/+/, ""));
}

export function mediaPublicUrl(rel: string): string {
  return `/api/media/${rel.replace(/^\/+/, "")}`;
}

export function ensureMediaDir(rel = ""): string {
  const dir = join(MEDIA, rel);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveUpload(
  jobId: string,
  kind: string,
  bytes: Buffer,
  ext = "jpg",
): Promise<string> {
  ensureMediaDir(jobId);
  const rel = `${jobId}/${kind}.${ext}`;
  writeFileSync(mediaAbs(rel), bytes);
  return mediaPublicUrl(rel);
}

export async function readPublicOrLocal(url: string): Promise<Buffer> {
  if (url.startsWith("/api/media/")) {
    return readFileSync(mediaAbs(url.replace("/api/media/", "")));
  }
  if (url.startsWith("/fixtures/")) {
    return readFileSync(join(process.cwd(), "public", url.replace(/^\//, "")));
  }
  if (url.startsWith("data:")) {
    const b64 = url.split(",")[1] ?? "";
    return Buffer.from(b64, "base64");
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFileSync(url);
}

const SIZES: Record<StillFormat, { w: number; h: number }> = {
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
  "9:16": { w: 1080, h: 1920 },
};

export async function renderFallbackStills(
  jobId: string,
  coverUrl: string,
): Promise<StillAsset[]> {
  const src = await readPublicOrLocal(coverUrl);
  ensureMediaDir(jobId);
  const formats: StillFormat[] = ["1:1", "4:5", "9:16"];
  const stills: StillAsset[] = [];
  for (const format of formats) {
    const { w, h } = SIZES[format];
    const rel = `${jobId}/still-${format.replace(":", "x")}.jpg`;
    await sharp(src)
      .rotate()
      .resize(w, h, { fit: "cover", position: "attention" })
      .jpeg({ quality: 88 })
      .toFile(mediaAbs(rel));
    stills.push({
      id: `${jobId}-${format}`,
      format,
      url: mediaPublicUrl(rel),
    });
  }
  return stills;
}

export async function renderFallbackClip(
  jobId: string,
  stillUrl: string,
): Promise<string> {
  ensureMediaDir(jobId);
  const src = await readPublicOrLocal(stillUrl);
  const frame = mediaAbs(`${jobId}/clip-frame.jpg`);
  const outRel = `${jobId}/clip.mp4`;
  await sharp(src).resize(1080, 1920, { fit: "cover" }).jpeg().toFile(frame);
  try {
    await exec("ffmpeg", [
      "-y",
      "-loop",
      "1",
      "-i",
      frame,
      "-t",
      "13",
      "-vf",
      "scale=1080:1920,format=yuv420p",
      "-r",
      "30",
      "-an",
      "-movflags",
      "+faststart",
      mediaAbs(outRel),
    ]);
  } catch {
    await exec("ffmpeg", [
      "-y",
      "-loop",
      "1",
      "-i",
      frame,
      "-t",
      "13",
      "-pix_fmt",
      "yuv420p",
      "-an",
      mediaAbs(outRel),
    ]);
  }
  return mediaPublicUrl(outRel);
}

export async function normalizeClip(inputAbs: string, outputAbs: string) {
  await exec("ffmpeg", [
    "-y",
    "-i",
    inputAbs,
    "-t",
    "15",
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    outputAbs,
  ]);
}

export async function writePackZip(
  jobId: string,
  files: Array<{ name: string; url: string; text?: string }>,
): Promise<string> {
  ensureMediaDir(jobId);
  const dir = ensureMediaDir(`${jobId}/pack`);
  for (const file of files) {
    if (file.text != null) {
      writeFileSync(join(dir, file.name), file.text);
    } else {
      const buf = await readPublicOrLocal(file.url);
      writeFileSync(join(dir, file.name), buf);
    }
  }
  const zipRel = `${jobId}/ownershot-pack.zip`;
  await exec("zip", ["-j", "-r", mediaAbs(zipRel), dir]);
  return mediaPublicUrl(zipRel);
}
