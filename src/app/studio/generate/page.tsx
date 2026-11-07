"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { Chip, PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { GenerateTab, Job } from "@/lib/types";

function GenerateInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [tab, setTab] = useState<GenerateTab>("still");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = params.get("job");
    if (!id) return void router.replace("/studio");
    api
      .session()
      .then((s) => {
        if (!s.user) router.replace("/studio/sign-in");
        else return api.job(id);
      })
      .then((d) => d && setJob(d.job))
      .catch((e: Error) => setError(e.message));
  }, [params, router]);

  async function generate() {
    if (!job) return;
    if (!job.coverUrl) {
      setError("Generate needs an owner photo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!job.copy) await api.copy(job.id);
      if (tab === "still") {
        const res = await api.stills(job.id);
        router.push(`/studio/judge?job=${res.job.id}`);
      } else {
        const res = await api.motion(job.id, "none");
        router.push(`/studio/motion?job=${res.job.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StudioShell step="04 Generate">
      <ScreenTitle
        kicker="One Point button"
        title="Generate"
        sub="Owner photo is the only input. Same product. Not a style pack."
      />
      <div className="mb-5 flex gap-2">
        <Chip active={tab === "still"} onClick={() => setTab("still")}>
          Still
        </Chip>
        <Chip active={tab === "clip"} onClick={() => setTab("clip")}>
          Clip
        </Chip>
      </div>
      <div className="relative aspect-square overflow-hidden bg-carbon">
        {job?.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.coverUrl} alt="" className="size-full object-cover" />
        ) : null}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-carbon/40">
            <span className="size-4 bg-point point-pulse" />
          </div>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[12px] tracking-[0.14em] uppercase text-mute">
        {tab === "still" ? "1:1 · 4:5 · 9:16" : "12–15s · original audio or none"}
      </p>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
      <PointButton className="mt-6 w-full" busy={busy} disabled={busy || !job} onClick={generate}>
        {tab === "still" ? "Make stills" : "Make clip"}
      </PointButton>
    </StudioShell>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateInner />
    </Suspense>
  );
}
