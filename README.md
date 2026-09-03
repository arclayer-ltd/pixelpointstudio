# OwnerShot Ads

Locked product of [Pixelpoint Studio](PRODUCT.md). A shop owner photographs **their** product. Grok writes original listing copy. Higgsfield makes original stills and a 12–15s ad. Supabase stores the account. Vercel hosts web. A dedicated server runs the queue. Google Play ships Android.

Do not pivot this into a marketplace, stock studio, or chat toy. Source of truth: `PRODUCT.md`, `DESIGN.md`, `docs/MASTER_PROMPT.md`.

## Apps

| Path | What |
| --- | --- |
| `/` | Marketing site (one H1, `SoftwareApplication` + `FAQPage`, sitemap, robots) |
| `/studio` | Web editor — screens 01–10 |
| `mobile/` | Expo Android client (same tokens, same API) |
| `server/worker.ts` | Queue worker for the dedicated server |
| `store/google-play/listing.md` | Play title / short / long |
| `supabase/migrations/` | `profiles`, `shops`, `products`, `assets`, `jobs` + RLS |

## Develop

```bash
cp .env.example .env.local
npm install
npm run dev
```

Studio: http://localhost:3000/studio  
Health (reports `missing` keys): http://localhost:3000/api/health  
Queue: `npm run queue` (port 8787)

Lack of a key is not a stop. Clients read `process.env.*`. Local stills/clip/copy run when Grok or Higgsfield are absent so the owner flow can be filmed.

## Fixture

`docs/fixtures/sample-product.jpg` — handmade ceramic used by the Human User pass. Capture → **Use fixture**.
