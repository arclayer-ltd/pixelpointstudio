import Link from "next/link";
import { PointMark, Wordmark } from "./mark";

export function StudioShell({
  children,
  step,
}: {
  children: React.ReactNode;
  step?: string;
}) {
  return (
    <div className="min-h-dvh bg-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bone">
        <header className="flex items-center justify-between border-b border-hairline-bone px-4 py-3">
          <Link href="/studio" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <span className="font-display text-[11px] tracking-[0.2em] uppercase text-mute">
            {step ?? "Studio"}
          </span>
        </header>
        <main className="flex-1 px-4 py-6">{children}</main>
        <nav className="grid grid-cols-4 border-t border-hairline-bone">
          <Link className="min-h-12 py-3 text-center font-display text-[10px] tracking-[0.16em] uppercase" href="/studio">
            Home
          </Link>
          <Link className="min-h-12 py-3 text-center font-display text-[10px] tracking-[0.16em] uppercase" href="/studio/library">
            Library
          </Link>
          <Link className="min-h-12 py-3 text-center font-display text-[10px] tracking-[0.16em] uppercase" href="/studio/capture">
            Shoot
          </Link>
          <Link className="min-h-12 py-3 text-center font-display text-[10px] tracking-[0.16em] uppercase" href="/studio/settings">
            Settings
          </Link>
        </nav>
      </div>
      <PointMark className="sr-only" />
    </div>
  );
}
