"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import type { Product } from "@/lib/types";

export default function LibraryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .session()
      .then((s) => {
        if (!s.user) router.replace("/studio/sign-in");
        else return api.products();
      })
      .then((d) => d && setProducts(d.products));
  }, [router]);

  return (
    <StudioShell step="09 Library">
      <ScreenTitle
        kicker="Owned only"
        title="Library"
        sub="Products you photographed. No marketplace inventory."
      />
      <ul className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <li key={p.id} className="bg-paper">
            <div className="aspect-square overflow-hidden bg-ink">
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt={p.facts.title} className="size-full object-cover" />
              ) : null}
            </div>
            <p className="p-2 font-display text-[14px] font-semibold">
              {p.facts.title || "Untitled"}
            </p>
          </li>
        ))}
      </ul>
      {products.length === 0 ? (
        <p className="text-mute">Empty. Shoot a product you own.</p>
      ) : null}
    </StudioShell>
  );
}
