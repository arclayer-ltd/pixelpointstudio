import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { deflateSync } from "node:zlib";
import sharp from "sharp";
import type { StillAsset, StillFormat } from "./types";

const exec = promisify(execFile);
const MEDIA = join(
  process.env.VERCEL ? "/tmp/ownershot" : join(process.cwd(), ".data"),
  "media",
);

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
    return mediaPublicUrl(outRel);
  } catch {
    try {
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
      return mediaPublicUrl(outRel);
    } catch {
      const stillRel = `${jobId}/clip-still.jpg`;
      writeFileSync(mediaAbs(stillRel), readFileSync(frame));
      return mediaPublicUrl(stillRel);
    }
  }
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
  try {
    await exec("zip", ["-j", "-r", mediaAbs(zipRel), dir]);
  } catch {
    const entries: Array<{ name: string; data: Buffer }> = [];
    for (const file of files) {
      if (file.text != null) {
        entries.push({ name: file.name, data: Buffer.from(file.text) });
      } else {
        entries.push({ name: file.name, data: await readPublicOrLocal(file.url) });
      }
    }
    writeFileSync(mediaAbs(zipRel), zipStore(entries));
  }
  return mediaPublicUrl(zipRel);
}

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function zipStore(files: Array<{ name: string; data: Buffer }>): Buffer {
  const chunks: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const compressed = deflateSync(file.data);
    const crc = crc32(file.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(0, 10);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    const localFull = Buffer.concat([local, name, compressed]);
    chunks.push(localFull);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 12);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, name]));
    offset += localFull.length;
  }
  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralDir, end]);
}
