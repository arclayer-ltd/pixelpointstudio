import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canSaveFacts, validateFacts } from "./facts";

describe("facts", () => {
  it("blocks empty title", () => {
    const err = validateFacts(
      { title: "", price: "12", material: "clay", ownerBrand: "Kiln" },
      "/cover.jpg",
    );
    assert.equal(err?.field, "title");
  });

  it("blocks save without a photo", () => {
    const err = validateFacts(
      { title: "Mug", price: "", material: "", ownerBrand: "" },
      null,
    );
    assert.equal(err?.message, "Cover photo is required.");
    assert.equal(
      canSaveFacts({ title: "Mug", price: "", material: "", ownerBrand: "" }, null),
      false,
    );
  });

  it("allows title plus cover", () => {
    assert.equal(
      canSaveFacts(
        { title: "Speckled mug", price: "28", material: "stoneware", ownerBrand: "Kiln" },
        "/cover.jpg",
      ),
      true,
    );
  });
});
