import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkFacts, checkOwnerPrompt } from "./ip-firewall";

describe("ip firewall", () => {
  it("allows an owner product", () => {
    const r = checkFacts({
      title: "Hand-thrown speckled mug",
      ownerBrand: "North Kiln",
      material: "stoneware",
    });
    assert.equal(r.ok, true);
  });

  it("blocks film IP", () => {
    const r = checkOwnerPrompt("make it look like star wars merch");
    assert.equal(r.ok, false);
  });

  it("blocks third-party brand", () => {
    const r = checkOwnerPrompt("put the puma logo on the hat");
    assert.equal(r.ok, false);
  });

  it("blocks licensed music", () => {
    const r = checkOwnerPrompt("use a billboard hit under the clip");
    assert.equal(r.ok, false);
  });
});
