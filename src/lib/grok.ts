import { grokConfigured, grokModel, requireEnv } from "./env";
import { checkOwnerPrompt } from "./ip-firewall";
import { localCopyFromFacts } from "./local-copy";
import type { CopyPack, ProductFacts } from "./types";

const SYSTEM = `You write original listing copy for a shop owner who photographed their own product.
Refuse film, celebrity, and third-party brand requests.
Do not invent testimonials, pricing, or traffic.
Return only JSON with keys: title (≤60 chars), hook (≤150 chars), description (400-800 words), playTitle (≤30 chars), playShort (≤80 chars), playLong (≤4000 chars), script (spoken 12-15s, original voiceover words only, no song names).`;

export async function writeCopy(input: {
  facts: ProductFacts;
  coverDataUrl?: string | null;
}): Promise<{ copy: CopyPack; provider: "grok" | "local" }> {
  const wall = checkOwnerPrompt(
    `${input.facts.title} ${input.facts.ownerBrand} ${input.facts.material}`,
  );
  if (!wall.ok) {
    throw new Error(wall.reason);
  }

  if (!grokConfigured()) {
    return { copy: localCopyFromFacts(input.facts), provider: "local" };
  }

  const key = requireEnv("GROK_API_KEY");
  const userContent: Array<Record<string, unknown>> = [
    {
      type: "input_text",
      text: `Owner facts (owner brand only):\n${JSON.stringify(input.facts)}`,
    },
  ];
  if (input.coverDataUrl?.startsWith("data:")) {
    userContent.push({ type: "input_image", image_url: input.coverDataUrl });
  }

  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: grokModel(),
      input: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    return { copy: localCopyFromFacts(input.facts), provider: "local" };
  }

  const body = (await res.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text =
    body.output_text ||
    body.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("\n") ||
    "";
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    return { copy: localCopyFromFacts(input.facts), provider: "local" };
  }
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as CopyPack;
  const after = checkOwnerPrompt(
    `${parsed.title} ${parsed.hook} ${parsed.description} ${parsed.script}`,
  );
  if (!after.ok) {
    throw new Error(after.reason);
  }
  return { copy: parsed, provider: "grok" };
}
