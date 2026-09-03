# Pixel Point Studio — agent workflow

**Locked product:** OwnerShot Ads. Read `PRODUCT.md` and `.agents/product-marketing.md` before any product, marketing, or UI work. Do not pivot the idea.

**Full build:** paste `docs/MASTER_PROMPT.md` into a new Grok 4.6 Cloud Agent run. That prompt is YOLO from phase 0 to SHIP, with Human User + Creative Director sub-agents. Skill: `.agents/skills/ownershot-yolo/SKILL.md`.

These SEO skills are the **default workflow** for this repository. Future Cursor agents, Cloud Agents, and other tools that read `AGENTS.md` must treat them as installed project skills — not optional extras.

## Default SEO skills

Read the matching `SKILL.md` **before** acting. Follow that skill and its `references/` files. Do not improvise a parallel SEO process.

| Skill | Path | Use for |
| --- | --- | --- |
| `seo-audit` | `.agents/skills/seo-audit/SKILL.md` | Technical / on-page SEO, rankings, indexing, Core Web Vitals, vague “help with SEO” requests |
| `ai-seo` | `.agents/skills/ai-seo/SKILL.md` | AI search, AEO/GEO/LLMO, citations in ChatGPT, Perplexity, AI Overviews, `llms.txt` |
| `programmatic-seo` | `.agents/skills/programmatic-seo/SKILL.md` | Template pages at scale (locations, comparisons, directories, keyword + modifier pages) |
| `schema` | `.agents/skills/schema/SKILL.md` | JSON-LD, schema.org, rich results |
| `aso` | `.agents/skills/aso/SKILL.md` | App Store and Google Play listing optimization |
| `site-architecture` | `.agents/skills/site-architecture/SKILL.md` | Page hierarchy, navigation, URL structure, internal linking (not XML sitemaps — that is `seo-audit`) |

The same skill trees are mirrored under `.cursor/skills/` so Cursor auto-discovers them. `.agents/skills/` is the source of truth.

## Routing

1. If the user mentions SEO vaguely, or a public page/site is being created or changed, start with `seo-audit`.
2. Adding or fixing structured data → `schema`.
3. AI-answer visibility / citations → `ai-seo`.
4. Many similar SEO pages from data or templates → `programmatic-seo`.
5. App store listing or ranking → `aso`.
6. Sitemap-as-IA, nav, URLs, or internal linking → `site-architecture`.
7. A task can require more than one skill. Read each that applies.

If `.agents/product-marketing.md` exists, read it first (as each skill requires).

## Provenance

Vendored from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills). Hashes are in `skills-lock.json`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
