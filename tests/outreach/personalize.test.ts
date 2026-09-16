import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { personalize, firstNameFrom } from "../../src/lib/outreach/personalize.ts";

describe("personalize", () => {
  it("substitutes known variables", () => {
    assert.equal(personalize("Hi {{firstName}}", { firstName: "Ada" }), "Hi Ada");
  });
  it("does not invent missing first names", () => {
    const out = personalize("Hi {{firstName}},", { firstName: "" });
    assert.ok(!out.includes("undefined"));
  });
  it("firstNameFrom extracts first token", () => {
    assert.equal(firstNameFrom("Ada Lovelace"), "Ada");
    assert.equal(firstNameFrom(""), "");
  });
});
