import { TITLE_MAX, type ProductFacts } from "./types";
import { checkFacts } from "./ip-firewall";

export type FactsError = { field?: keyof ProductFacts; message: string };

export function normalizeFacts(input: Partial<ProductFacts>): ProductFacts {
  return {
    title: (input.title ?? "").trim(),
    price: (input.price ?? "").trim(),
    material: (input.material ?? "").trim(),
    ownerBrand: (input.ownerBrand ?? "").trim(),
  };
}

export function validateFacts(
  facts: ProductFacts,
  coverUrl: string | null,
): FactsError | null {
  if (!facts.title) {
    return { field: "title", message: "Title is required." };
  }
  if (facts.title.length > TITLE_MAX) {
    return {
      field: "title",
      message: `Title must be ${TITLE_MAX} characters or fewer.`,
    };
  }
  if (!coverUrl) {
    return { message: "Cover photo is required." };
  }
  const wall = checkFacts(facts);
  if (!wall.ok) {
    return { field: "ownerBrand", message: wall.reason ?? "Blocked." };
  }
  return null;
}

export function canSaveFacts(
  facts: ProductFacts,
  coverUrl: string | null,
): boolean {
  return validateFacts(facts, coverUrl) === null;
}
