# Locked product: OwnerShot Ads

This repository’s product is **OwnerShot Ads**, an Android + web app from Pixelpoint Studio. Do not replace this idea, pivot to a marketplace clone, or ship a general chat/image toy.

## One sentence

A shop owner photographs their own product. The app writes original listing copy and makes original stills plus a short ad. No stock, no celebrity, no third-party brands.

## Users

Independent shop owners and makers who already have a physical product and a phone. Not agencies. Not resellers of other people’s catalogs.

## Job to be done

Turn one owned product photo into:

1. Searchable title, hook, and description
2. Square cover + 9:16 still
3. 12–15s original video
4. A Google Play / social export pack

## Stack (fixed)

| Layer | Tool | Role |
| --- | --- | --- |
| Copy + routing | Grok 4.6 | Original titles, descriptions, scripts. Refuse film, celebrity, and third-party brand prompts. |
| Stills + video | Higgsfield Marketing Studio | Image and 12–15s video from the owner’s photo. Generated audio or owner-uploaded original audio only. |
| Data | Supabase | Auth, shops, products, jobs, signed media storage |
| Web | Vercel | Marketing site, schema, web editor |
| Heavy work | Dedicated server | Job queue, ffmpeg, Play billing webhooks |
| Store | Google Play | Android client. Keywords only in visible listing fields. |

## Hard no

- Cloning Photoroom, Canva, Shopify, Shopee, Vinted, Depop, Sora, Meta AI, or Mobbin
- Using Mobbin screenshots as in-app or store art
- Licensed music, stock packs, celebrity likeness, film IP
- Third-party brand pickers (Puma, Champion, and the rest)
- Dropship or marketplace inventory of goods the user does not own

## Legal wall

User warrants they own the photos and may advertise the product. Grok blocks celebrity / film / third-party brand prompts. Higgsfield product IP check stays on.

## Source of the lock

Locked after an SEO audit of apps listed on Mobbin (seller tools + gen-AI studios). Neighboring category: product-photo editors and seller listing forms. Gap: owner photo → original copy + still + short ad + Play pack.
