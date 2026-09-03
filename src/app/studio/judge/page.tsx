"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { Chip, GhostButton, PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Job, StillAsset } from "@/lib/types";

function JudgeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [active, setActive] = useState<StillAsset | null>(null);
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
      .then((d) => {
        if (!d) return;
        setJob(d.job);
        setActive(d.job.stills[0] ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, [params, router]);

  async function verdict(v: "keep" | "reject") {
    if (!job || !active) return;
    const res = await api.judge(job.id, { stillId: active.id, verdict: v });
    setJob(res.job);
    setActive(res.job.stills.find((s) => s.id === active.id) ?? res.job.stills[0]);
  }

  async function regen() {
    if (!job) return;
    setBusy(true);
    try {
      const res = await api.judge(job.id, { regenerate: true });
      setJob(res.job);
      setActive(res.job.stills[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regenerate failed.");
    } finally {
      setBusy(false);
    }
  }

  const kept = job?.stills.some((s) => s.verdict === "keep");

  return (
    <StudioShell step="05 Judge">
      <ScreenTitle
        kicker="On the still"
        title="Keep or reject"
        sub="Keep one still to open Motion. Reject and Regen stay on this frame — not in a chat thread."
      />
      <div className="aspect-[4/5] overflow-hidden bg-carbon">
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.url} alt={`${active.format} still`} className="size-full object-cover" />
        ) : (
          <p className="flex size-full items-center justify-center text-bone">No still yet.</p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {job?.stills.map((s) => (
          <Chip key={s.id} active={active?.id === s.id} onClick={() => setActive(s)}>
            {s.format}
            {s.verdict ? ` · ${s.verdict}` : ""}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <GhostButton onClick={() => verdict("keep")}>Keep</GhostButton>
        <GhostButton onClick={() => verdict("reject")}>Reject</GhostButton>
        <GhostButton disabled={busy} onClick={regen}>
          Regen
        </GhostButton>
      </div>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
      <PointButton
        className="mt-6 w-full"
        disabled={!kept}
        onClick={() => job && router.push(`/studio/motion?job=${job.id}`)}
      >
        {kept ? "Motion" : "Keep one still"}
      </PointButton>
    </StudioShell>
  );
}

export default function JudgePage() {
  return (
    <Suspense>
      <JudgeInner />
    </Suspense>
  );
}
