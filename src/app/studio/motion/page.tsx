"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { Chip, PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { AudioMode, Job } from "@/lib/types";

function MotionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [audio, setAudio] = useState<AudioMode>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = params.get("job");
    if (!id) return void router.replace("/studio");
    api
      .session()
      .then((s) => {
        if (!s.user) router.replace("/studio/sign-in");
        else return api.job(id);
      })
      .then((d) => {
        if (!d) return;
        setJob(d.job);
        setAudio(d.job.audioMode);
      })
      .catch((e: Error) => setError(e.message));
  }, [params, router]);

  async function make() {
    if (!job) return;
    setBusy(true);
    try {
      const res = await api.motion(job.id, audio);
      setJob(res.job);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clip failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StudioShell step="06 Motion">
      <ScreenTitle
        kicker="12–15 seconds"
        title="Clip"
        sub="Original audio you upload, or none. No licensed music."
      />
      <div className="relative aspect-[9/16] max-h-[52vh] overflow-hidden bg-carbon">
        {job?.clipUrl?.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.clipUrl} alt="12s still preview" className="size-full object-cover" />
        ) : job?.clipUrl ? (
          <video
            className="size-full object-cover"
            src={job.clipUrl}
            controls
            playsInline
          />
        ) : job?.stills.find((s) => s.verdict === "keep") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.stills.find((s) => s.verdict === "keep")?.url}
            alt=""
            className="size-full object-cover"
          />
        ) : null}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-carbon/40">
            <span className="size-4 bg-point point-pulse" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2">
        <Chip active={audio === "none"} onClick={() => setAudio("none")}>
          None
        </Chip>
        <Chip active={audio === "original"} onClick={() => setAudio("original")}>
          Original audio
        </Chip>
      </div>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
      <PointButton className="mt-6 w-full" busy={busy} disabled={busy} onClick={job?.clipUrl ? () => router.push(`/studio/pack?job=${job.id}`) : make}>
        {job?.clipUrl ? "Pack" : "Make 12s clip"}
      </PointButton>
    </StudioShell>
  );
}

export default function MotionPage() {
  return (
    <Suspense>
      <MotionInner />
    </Suspense>
  );
}
