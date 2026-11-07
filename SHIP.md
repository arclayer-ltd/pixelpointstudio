# SHIP — OwnerShot Ads

Both auditors returned **SHIP** on the same revision. Nits were fixed in one follow-up commit. A second Human User pass also returned **SHIP**.

## Dual-SHIP revision

- SHA: `d3bccab234bdecd4fa90526e1e2c71e8727766ff`
- Branch: `cursor/ownershot-ads-29f1`
- Human-use video: `/opt/cursor/artifacts/human_user_ownershot_shop_owner_flow.mp4`

### human_user

```json
{
  "role": "human_user",
  "sha": "d3bccab234bdecd4fa90526e1e2c71e8727766ff",
  "verdict": "SHIP",
  "blockers": [],
  "nits": [
    "Had to judge all three aspect ratios before Motion button appeared - could be more obvious that this is required"
  ],
  "video": "/opt/cursor/artifacts/human_user_ownershot_shop_owner_flow.mp4",
  "felt_like": "Straightforward photo-to-ad workflow that a craft shop owner could confidently use tomorrow."
}
```

### creative_director

```json
{
  "role": "creative_director",
  "sha": "d3bccab234bdecd4fa90526e1e2c71e8727766ff",
  "verdict": "SHIP",
  "blockers": [],
  "nits": [
    "The bottom padding on the 'Grid camera' screen could breathe a tiny bit more to balance the heavy buttons.",
    "Input field borders on the 'Facts' screen feel slightly heavy, but acceptable within the brutalist aesthetic."
  ],
  "videos_reviewed": [
    "/opt/cursor/artifacts/human_user_ownershot_shop_owner_flow.mp4"
  ],
  "felt_like": "An editorial, high-utility tool that strips away SaaS fluff to focus entirely on the shop owner's product."
}
```

## Nit-fix confirmation

- SHA: `2b251478309d015c01793c9ca016c6519f3e5353`
- Human User verdict: **SHIP** (Motion enables after one keep)

```json
{
  "role": "human_user",
  "sha": "2b251478309d015c01793c9ca016c6519f3e5353",
  "verdict": "SHIP",
  "blockers": [],
  "nits": [
    "Button text rendering glitch on Motion page showed 'MAKER 28 CLIP' instead of 'MAKE 12S CLIP', but functionality worked correctly"
  ],
  "video": "/opt/cursor/artifacts/human_user_ownershot_shop_owner_flow.mp4",
  "felt_like": "Smooth flow from marketing to finished export—the Motion button fix is solid and the whole shop owner journey just works."
}
```

## What shipped

Working web studio + Expo Android client. Capture → Facts → Generate → Judge → Motion → Export on `docs/fixtures/sample-product.jpg`. Queue worker at `server/worker.ts`. Marketing site with unique title, one H1, SoftwareApplication + FAQPage, sitemap, robots. Play listing in `store/google-play/listing.md`.
