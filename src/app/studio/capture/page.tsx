"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { CarbonButton, GhostButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Job } from "@/lib/types";

function CaptureInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const extra = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const existing = params.get("job");
    (async () => {
      const session = await api.session();
      if (!session.user) {
        router.replace("/studio/sign-in");
        return;
      }
      if (existing) {
        setJob((await api.job(existing)).job);
      } else {
        setJob((await api.createJob()).job);
      }
    })().catch((e: Error) => setError(e.message));
  }, [params, router]);

  async function onFile(slot: "cover" | "extra", file?: File) {
    if (!job || !file) return;
    setBusy(true);
    try {
      const res = await api.upload(job.id, slot, file);
      setJob(res.job);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StudioShell step="02 Capture">
      <ScreenTitle
        kicker="Cover vs extras"
        title="Grid camera"
        sub="Cover must fill the square. No barcode of other catalogs."
      />
      <div className="relative aspect-square overflow-hidden bg-carbon shutter-settle">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-white/15" />
          ))}
        </div>
        {job?.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.coverUrl} alt="Cover" className="size-full object-cover snap-cover" />
        ) : (
          <p className="flex size-full items-center justify-center font-display text-[12px] tracking-[0.2em] text-bone uppercase">
            Cover slot
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <CarbonButton className="flex-1" disabled={busy} onClick={() => camera.current?.click()}>
          Cover
        </CarbonButton>
        <GhostButton className="flex-1" disabled={busy} onClick={() => extra.current?.click()}>
          Extra
        </GhostButton>
        <GhostButton
          className="w-full"
          disabled={busy || !job}
          onClick={async () => {
            if (!job) return;
            setBusy(true);
            try {
              setJob((await api.fixture(job.id)).job);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Fixture failed.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Use fixture
        </GhostButton>
      </div>
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile("cover", e.target.files?.[0])}
      />
      <input
        ref={extra}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile("extra", e.target.files?.[0])}
      />
      {job?.extraUrls.length ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {job.extraUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="aspect-square object-cover" />
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
      <CarbonButton
        className="mt-6 w-full"
        disabled={!job?.coverUrl}
        onClick={() => job && router.push(`/studio/facts?job=${job.id}`)}
      >
        Facts
      </CarbonButton>
    </StudioShell>
  );
}

export default function CapturePage() {
  return (
    <Suspense>
      <CaptureInner />
    </Suspense>
  );
}
