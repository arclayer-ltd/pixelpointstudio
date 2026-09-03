import {
  DESCRIPTION_WORDS_MAX,
  DESCRIPTION_WORDS_MIN,
  HOOK_MAX,
  PLAY_LONG_MAX,
  PLAY_SHORT_MAX,
  PLAY_TITLE_MAX,
  TITLE_MAX,
  type CopyPack,
  type ProductFacts,
} from "./types";

function clip(s: string, n: number): string {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).trimEnd() + "…";
}

function expandDescription(facts: ProductFacts): string {
  const brand = facts.ownerBrand || "this shop";
  const material = facts.material || "the material the owner named";
  const price = facts.price ? ` Listed at ${facts.price}.` : "";
  const seed = [
    `${facts.title} is photographed by the shop that owns it. ${brand} is the only brand on this listing.`,
    `The piece is ${material}. The photo in this job is the owner's file, not a catalog pull and not a stock pack.`,
    `Use the stills and the 12-second clip to show the object as it sits on the table: edges, surface, and scale.`,
    `Copy stays with the object. No celebrity, no film franchise, no other company's mark.`,
    `A buyer should know what they are looking at, who made or sells it, and that the pictures match the item in hand.`,
  ];
  const paragraphs: string[] = [];
  let words = 0;
  let i = 0;
  while (words < DESCRIPTION_WORDS_MIN) {
    const extra = `${seed[i % seed.length]} ${facts.title} stays in frame. ${brand} does not borrow another catalog. ${material} is the only material claim.${price} The export pack is square, 9:16, script, and Play text written from these facts.`;
    paragraphs.push(extra);
    words += extra.split(/\s+/).length;
    i += 1;
    if (i > 40) break;
  }
  const text = paragraphs.join(" ");
  const parts = text.split(/\s+/);
  if (parts.length > DESCRIPTION_WORDS_MAX) {
    return parts.slice(0, DESCRIPTION_WORDS_MAX).join(" ");
  }
  return text;
}

export function localCopyFromFacts(facts: ProductFacts): CopyPack {
  const title = clip(facts.title, TITLE_MAX);
  const hook = clip(
    `${title}: owner photo, original stills, a 12-second ad. ${facts.material || "As photographed."}`,
    HOOK_MAX,
  );
  const playTitle = clip(title, PLAY_TITLE_MAX);
  const playShort = clip(
    `Owner photo to original listing copy, stills, and a 12s ad.`,
    PLAY_SHORT_MAX,
  );
  const description = expandDescription(facts);
  const playLong = clip(
    `${description}\n\nOwnerShot Ads writes this pack from the shop owner's photo and facts. Android + web. No stock. No celebrity. No third-party brands.`,
    PLAY_LONG_MAX,
  );
  const script = clip(
    `${title}. ${facts.material ? `Made of ${facts.material}. ` : ""}Photographed by the owner. Hold, turn, set down. ${facts.ownerBrand ? `${facts.ownerBrand}.` : ""}`,
    400,
  );
  return { title, hook, description, playTitle, playShort, playLong, script };
}
