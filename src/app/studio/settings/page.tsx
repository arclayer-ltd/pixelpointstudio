"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { GhostButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { HealthReport, SessionUser } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);

  useEffect(() => {
    api.session().then((s) => {
      if (!s.user) router.replace("/studio/sign-in");
      else setUser(s.user);
    });
    api.health().then((h) => setHealth(h as HealthReport));
  }, [router]);

  async function out() {
    await api.signOut();
    router.replace("/studio/sign-in");
  }

  return (
    <StudioShell step="10 Settings">
      <ScreenTitle
        kicker={user?.email ?? "Account"}
        title="Settings"
        sub="You warrant you own the photos and may advertise the product."
      />
      <section className="border border-hairline-bone bg-paper p-4 text-[15px]">
        <p className="font-display text-[12px] tracking-[0.16em] uppercase text-mute">
          IP reminder
        </p>
        <p className="mt-2">
          No stock packs, celebrity likeness, film IP, or third-party brand pickers.
          Higgsfield product IP check stays on. Grok refuses those prompts.
        </p>
      </section>
      <section className="mt-6">
        <p className="font-display text-[12px] tracking-[0.16em] uppercase text-mute">
          Credits / keys
        </p>
        <ul className="mt-2 space-y-1 text-[14px]">
          {health
            ? Object.entries(health.keys).map(([name, row]) => (
                <li key={name} className="flex justify-between border-b border-hairline-bone py-2">
                  <span>{name}</span>
                  <span className={row.status === "ok" ? "text-point-deep" : "text-mute"}>
                    {row.status}
                  </span>
                </li>
              ))
            : null}
        </ul>
      </section>
      <GhostButton className="mt-8 w-full" onClick={out}>
        Sign out
      </GhostButton>
    </StudioShell>
  );
}
