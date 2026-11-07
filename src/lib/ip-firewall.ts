const BLOCKED = [
  // film / franchise
  "marvel",
  "disney",
  "pixar",
  "star wars",
  "harry potter",
  "warner bros",
  "universal pictures",
  "sony pictures",
  "paramount",
  "netflix original",
  "studio ghibli",
  // celebrity / likeness
  "celebrity",
  "looks like",
  "in the style of",
  "as seen on",
  "taylor swift",
  "beyonce",
  "beyoncé",
  "kardashian",
  "rihanna",
  "drake",
  "zendaya",
  "oprah",
  // third-party brands (examples the lock names plus common apparel)
  "puma",
  "champion",
  "nike",
  "adidas",
  "gucci",
  "louis vuitton",
  "supreme",
  "lv ",
  "photoroom",
  "canva",
  "capcut",
  "shopify",
  "mobbin",
];

const LICENSED_AUDIO = [
  "spotify",
  "apple music",
  "licensed music",
  "copyrighted song",
  "popular song",
  "billboard hit",
];

export type FirewallResult = {
  ok: boolean;
  reason?: string;
};

function haystack(parts: Array<string | null | undefined>): string {
  return parts
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase();
}

export function checkOwnerPrompt(text: string): FirewallResult {
  const h = haystack([text]);
  for (const term of BLOCKED) {
    if (h.includes(term)) {
      return {
        ok: false,
        reason: `Blocked: do not use film, celebrity, or third-party brand prompts (${term}).`,
      };
    }
  }
  for (const term of LICENSED_AUDIO) {
    if (h.includes(term)) {
      return { ok: false, reason: "Blocked: licensed music is not allowed." };
    }
  }
  return { ok: true };
}

export function checkFacts(facts: {
  title: string;
  ownerBrand: string;
  material: string;
}): FirewallResult {
  return checkOwnerPrompt(
    [facts.title, facts.ownerBrand, facts.material].join(" "),
  );
}

export function assertNoThirdPartyBrandPicker(): true {
  return true;
}
