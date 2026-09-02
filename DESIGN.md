---
name: Pixelpoint Studio
description: Carbon lettering, one Point-green square, and the discipline of a performance brand — a studio identity, not a Bootstrap template.
colors:
  carbon: "#0A0A0A"
  ink: "#141414"
  bone: "#F3F0E7"
  paper: "#FAF8F2"
  mute: "#6E6C64"
  hairline: "#2A2924"
  hairline-on-bone: "#DDD8CC"
  point: "#C8EF2A"
  point-deep: "#9EC21A"
  on-point: "#0A0A0A"
  on-carbon: "#F6F3EA"
  danger: "#E23B2E"
typography:
  display-xl:
    fontFamily: "Anybody, 'Arial Narrow', sans-serif"
    fontSize: "clamp(56px, 12vw, 140px)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.04em"
  display-lg:
    fontFamily: "Anybody, 'Arial Narrow', sans-serif"
    fontSize: "clamp(40px, 6vw, 72px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Anybody, 'Arial Narrow', sans-serif"
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Red Hat Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  body-sm:
    fontFamily: "'Red Hat Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  caption:
    fontFamily: "Anybody, 'Arial Narrow', sans-serif"
    fontSize: "12px"
    fontWeight: 520
    lineHeight: 1.2
    letterSpacing: "0.42em"
  button:
    fontFamily: "Anybody, 'Arial Narrow', sans-serif"
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  control: "2px"
  full: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "16px"
  4: "24px"
  5: "40px"
  6: "64px"
  7: "104px"
components:
  button-primary:
    backgroundColor: "{colors.point}"
    textColor: "{colors.on-point}"
    rounded: "{rounded.none}"
    padding: "16px 28px"
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.point-deep}"
    textColor: "{colors.on-point}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-carbon}"
    rounded: "{rounded.none}"
    padding: "16px 28px"
    typography: "{typography.button}"
  button-on-bone:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "16px 28px"
    typography: "{typography.button}"
---

## Overview

Pixelpoint is a studio that ships websites and apps. The identity has one idea: **the Point is a pixel**. Carbon lettering. A single voltage green used like Ferrari uses red — scarce, never decorative. The live site at pixelpointstudio.com is the anti-reference: Arial, a muddy `#bad530`, a second Tailwind-blue system, 24px pills, and glow blobs. This file replaces that world.

The wordmark is outlined SVG in `brand/`. Never set the logo in live web text. Anybody is the display skeleton and the campaign face; Red Hat Text is the reading face. The monogram is a notched pixel that has dropped a smaller square — a pixel, and a point.

Craft bar (named, not copied): Nike wordmark certainty, On Running polarity (black/white + product color), Linear’s single-accent discipline.

## Colors

**Carbon** `#0A0A0A` is the home surface. **Bone** `#F3F0E7` is the paper surface. **Point** `#C8EF2A` is the only brand chroma.

Point is the evolved lime. The live `#bad530` was olive, low-chroma, and used as decoration (glows, blobs). Point is hotter and greener than that olive, and cooler than Nike Volt (`#CEFF00`) — close enough to feel like performance, far enough to own.

Rules:

- Letters of the wordmark are Carbon or Bone. The square tittles are Point. That is the only place Point is required.
- CTAs may be Point, square-cornered, Carbon type on top. One primary per view.
- Never set Point as body text on Bone (contrast fails). Never set Point as a page fill except a full-bleed poster or a 16px swatch.
- Kill the live site’s `--primary-blue` / `--secondary-blue` / `--accent-blue`. Blue is not a Pixelpoint color.
- One-color reproduction: all Carbon, including the squares.

## Typography

**Wordmark** is not a font. It is `brand/wordmark.svg` (mixed-case primary) and `brand/wordmark-caps.svg` (campaign / jersey). Square tittles replace the i-dots. Tracking and outlines are locked in the SVG.

**Display** is Anybody (variable; on the web, weight 700, width toward condensed). Line-height under 1. Tight negative tracking. Uppercase for campaign lines; mixed case for studio headlines.

**Text** is Red Hat Text 400/500 at 15–18px, 1.45–1.5 line-height. This is the reading face so Anybody can stay loud.

**Caption** is Anybody 520, wide tracking (`0.42em`), uppercase — the `STUDIO` lockup rhythm. Use it for labels, not paragraphs.

Do not use Arial, Roboto, Inter, or Helvetica as the identity. System UI is a last-resort fallback, never the look.

## Layout

A hard 8px-derived ladder (4 / 8 / 16 / 24 / 40 / 64 / 104). Full-bleed carbon or bone bands; no card soup. Wordmark sits with real padding — it is a unit, not a navbar afterthought. Campaign type can break the viewport; UI type cannot.

Nav: inverse wordmark, left; one Point-or-ghost action, right. No pill header, no drop shadow.

## Elevation & Depth

None as a brand device. No glow blobs, no `rgba(154, 255, 0)` halos, no 22px shadows. Separation is hairline + polarity (carbon against bone). Photography can carry depth; chrome cannot.

## Shapes

Square is the brand geometry because the Point is a pixel. Controls are `0–2px` radius, not 24px pills. The monogram and the i-tittles are perfect squares. Circles are for photography and UI toggles, not for identity.

## Components

**Primary button.** Point fill, Carbon type, square corners, Anybody 650, slight tracking, 16×28 padding. Hover to Point-deep. No pill, no shadow, no icon-for-decoration.

**Ghost button.** Transparent, Bone type on Carbon, 1px hairline. For secondary actions.

**Wordmark.** Primary mixed-case on Bone (`wordmark.svg`). Inverse on Carbon (`wordmark-inverse.svg`). Caps lockup for sports-scale campaign (`wordmark-caps.svg`). Studio lockup when the legal name must appear (`lockup.svg`). Clear space: one cap-height of the word on all sides. Minimum digital width: 120px for mixed, 96px for caps.

**Monogram.** `monogram.svg` / `app-icon.svg` (notched pixel). `favicon.svg` is the two-square pair — it survives 16px. Never redraw with rounded corners or gradients.

## Do's and Don'ts

Do:

- Put the square tittle on both i’s in mixed-case **Pixelpoint**, and on the first I only in **PIXELPOINT**.
- Use Point as a scarce signal: tittles, one CTA, one monogram.
- Pair Anybody display with Red Hat Text.
- Hold carbon/bone polarity the way On holds black/white.

Don't:

- Don’t set the logo in Arial, Inter, or live text.
- Don’t use `#bad530`, Tailwind blue, purple, or gradients as brand color.
- Don’t add glow, blobs, glass, or 24px pills.
- Don’t put a tittle on the second I of PIXELPOINT.
- Don’t copy the Nike swoosh, On wordmark, Linear mark, or Metalab layout.
- Don’t claim portfolio lifts or testimonials that are not in `PRODUCT.md`.
