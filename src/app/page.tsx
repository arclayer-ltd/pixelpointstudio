import Link from "next/link";
import { Wordmark } from "@/components/mark";
import { marketingJsonLd } from "@/lib/schema";

const faqs = [
  {
    q: "What is OwnerShot Ads?",
    a: "A shop owner photographs their own product. The app writes original listing copy and makes original stills plus a short ad. No stock, no celebrity, no third-party brands.",
  },
  {
    q: "Who is it for?",
    a: "Independent shop owners and makers who already have a physical product and a phone. Not agencies. Not resellers of other people’s catalogs.",
  },
  {
    q: "What do I get from one owner photo?",
    a: "A searchable title, hook, and description; a square cover and 9:16 still; a 12–15 second original video; and a Google Play / social export pack.",
  },
  {
    q: "What is not allowed?",
    a: "Stock packs, celebrity likeness, film IP, licensed music, and third-party brand pickers. You warrant you own the photos and may advertise the product.",
  },
];

export default function MarketingPage() {
  const jsonLd = marketingJsonLd();
  return (
    <div className="bg-bone text-carbon">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Wordmark />
        <Link
          href="/studio"
          className="min-h-11 border border-carbon px-5 py-2 font-display text-[12px] font-semibold tracking-[0.08em] uppercase"
        >
          Open studio
        </Link>
      </header>
      <main className="px-6 pb-24 md:px-10">
        <p className="font-display text-[12px] tracking-[0.42em] uppercase text-mute">
          Pixelpoint Studio
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(48px,10vw,120px)] font-semibold leading-[0.86] tracking-[-0.04em]">
          Photograph your product
          <span className="ml-2 inline-block size-[0.18em] bg-point align-top" />
          <br />
          ship an original ad.
        </h1>
        <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-ink">
          OwnerShot Ads writes original listing copy and makes original stills
          plus a 12–15 second clip from the photo you own. Android and web. No
          stock. No celebrity. No third-party brands.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="inline-flex min-h-11 items-center bg-point px-7 py-4 font-display text-[14px] font-semibold tracking-[0.08em] text-on-point uppercase"
          >
            <span className="mr-3 inline-block size-2.5 bg-carbon" />
            Shoot a product
          </Link>
          <a
            href="#how"
            className="inline-flex min-h-11 items-center border border-carbon px-7 py-4 font-display text-[14px] font-semibold tracking-[0.08em] uppercase"
          >
            How it works
          </a>
        </div>
        <section id="how" className="mt-24 grid gap-px bg-hairline-bone md:grid-cols-4">
          {[
            ["01 Capture", "Grid camera. Cover slot. Extra shots you took."],
            ["02 Facts", "Title, price, material, owner brand only."],
            ["03 Generate", "Still / Clip. One Point button. Same product."],
            ["04 Pack", "Square, 9:16, script, Play text. Then share."],
          ].map(([t, d]) => (
            <article key={t} className="bg-bone p-6">
              <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em]">
                {t}
              </h2>
              <p className="mt-3 text-[15px] text-mute">{d}</p>
            </article>
          ))}
        </section>
        <section className="mt-24 max-w-2xl">
          <h2 className="font-display text-[32px] font-semibold tracking-[-0.03em]">
            Questions
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-display text-[18px] font-semibold">{f.q}</dt>
                <dd className="mt-2 text-[16px] text-ink">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <footer className="border-t border-hairline-bone px-6 py-6 text-[13px] text-mute md:px-10">
        Pixelpoint Studio · OwnerShot Ads ·{" "}
        <Link href="/studio">Studio</Link>
      </footer>
    </div>
  );
}
