"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Job } from "@/lib/types";

function ExportInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [progress, setProgress] = useState(0);
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
      .then((d) => d && setJob(d.job));
  }, [params, router]);

  async function run() {
    if (!job) return;
    setError("");
    setProgress(8);
    const tick = window.setInterval(() => {
      setProgress((p) => (p < 86 ? p + 6 : p));
    }, 180);
    try {
      const res = await api.exportPack(job.id);
      setJob(res.job);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      window.clearInterval(tick);
    }
  }

  const preview = job?.stills.find((s) => s.format === "9:16") ?? job?.stills[0];
  const ready = Boolean(job?.packUrl);

  async function share() {
    if (!job?.packUrl) return;
    const abs = new URL(job.packUrl, window.location.origin).toString();
    if (navigator.share) {
      await navigator.share({ title: job.facts.title, url: abs });
    } else {
      window.location.href = job.packUrl;
    }
  }

  return (
    <StudioShell step="08 Export">
      <ScreenTitle
        kicker="On the preview"
        title="Export"
        sub="The border fills. Share after the file exists."
      />
      <div
        className="relative aspect-[9/16] max-h-[52vh] overflow-hidden bg-carbon"
        style={{
          boxShadow: `inset 0 0 0 6px color-mix(in srgb, #62E000 ${progress}%, #2A2924)`,
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt="" className="size-full object-cover" />
        ) : null}
        <p className="absolute bottom-3 left-3 font-display text-[12px] tracking-[0.16em] text-bone uppercase">
          {progress}%
        </p>
      </div>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
      {!ready ? (
        <PointButton className="mt-6 w-full" onClick={run}>
          Build pack
        </PointButton>
      ) : (
        <PointButton className="mt-6 w-full" onClick={share}>
          Share
        </PointButton>
      )}
    </StudioShell>
  );
}

export default function ExportPage() {
  return (
    <Suspense>
      <ExportInner />
    </Suspense>
  );
}
