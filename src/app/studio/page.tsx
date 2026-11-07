"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { Chip, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Job, Shop } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .session()
      .then((s) => {
        if (!s.user) {
          router.replace("/studio/sign-in");
          return;
        }
        return api.jobs();
      })
      .then((data) => {
        if (!data) return;
        setShop(data.shop);
        setJobs(data.jobs);
      })
      .catch((e: Error) => setError(e.message));
  }, [router]);

  async function shoot() {
    const { job } = await api.createJob();
    router.push(`/studio/capture?job=${job.id}`);
  }

  return (
    <StudioShell step="01 Home">
      <ScreenTitle
        kicker={shop?.name ?? "Shop"}
        title="Last jobs"
        sub="Shoot the product on the table. Library holds only what you own."
      />
      <div className="mb-6 flex gap-2">
        <Chip active onClick={shoot}>
          Shoot
        </Chip>
        <Chip onClick={() => router.push("/studio/library")}>Library</Chip>
      </div>
      {error ? <p className="text-danger">{error}</p> : null}
      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id} className="border border-hairline-bone bg-paper p-3">
            <Link href={`/studio/facts?job=${job.id}`} className="flex gap-3">
              <div className="size-16 shrink-0 overflow-hidden bg-ink">
                {job.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.coverUrl} alt="" className="size-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-display text-[16px] font-semibold">
                  {job.facts.title || "Untitled"}
                </p>
                <p className="text-[13px] uppercase tracking-[0.14em] text-mute">
                  {job.status}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {jobs.length === 0 ? (
          <li className="border border-dashed border-hairline p-6 text-[15px] text-mute">
            No jobs yet. Shoot the product you own.
          </li>
        ) : null}
      </ul>
    </StudioShell>
  );
}
