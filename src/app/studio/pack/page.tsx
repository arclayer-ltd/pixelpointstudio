"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Job } from "@/lib/types";

function PackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);

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

  const square = job?.stills.find((s) => s.format === "1:1");
  const vertical = job?.stills.find((s) => s.format === "9:16");

  return (
    <StudioShell step="07 Pack">
      <ScreenTitle
        kicker="Export pack"
        title="Square, 9:16, script"
        sub="Play title, short, and long sit with the files."
      />
      <div className="grid grid-cols-2 gap-3">
        <figure>
          {square ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={square.url} alt="Square still" className="aspect-square w-full object-cover" />
          ) : (
            <div className="aspect-square bg-hairline-bone" />
          )}
          <figcaption className="mt-1 font-display text-[11px] tracking-[0.16em] uppercase text-mute">
            Square
          </figcaption>
        </figure>
        <figure>
          {vertical ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vertical.url} alt="9:16 still" className="aspect-[9/16] w-full object-cover" />
          ) : (
            <div className="aspect-[9/16] bg-hairline-bone" />
          )}
          <figcaption className="mt-1 font-display text-[11px] tracking-[0.16em] uppercase text-mute">
            9:16
          </figcaption>
        </figure>
      </div>
      <section className="mt-6 space-y-3 text-[15px]">
        <p>
          <span className="font-display text-[11px] tracking-[0.16em] uppercase text-mute">Script</span>
          <br />
          {job?.copy?.script || "Generate copy first."}
        </p>
        <p>
          <span className="font-display text-[11px] tracking-[0.16em] uppercase text-mute">Play text</span>
          <br />
          {job?.copy ? (
            <>
              {job.copy.playTitle}
              <br />
              {job.copy.playShort}
            </>
          ) : (
            "Missing."
          )}
        </p>
      </section>
      <PointButton
        className="mt-6 w-full"
        disabled={!square || !vertical || !job?.copy}
        onClick={() => job && router.push(`/studio/export?job=${job.id}`)}
      >
        Export
      </PointButton>
    </StudioShell>
  );
}

export default function PackPage() {
  return (
    <Suspense>
      <PackInner />
    </Suspense>
  );
}
