import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNextPath } from "../../src/lib/auth/safe-next.ts";

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    assert.equal(safeNextPath("/services"), "/services");
    assert.equal(safeNextPath("/industries/healthcare"), "/industries/healthcare");
  });

  it("rejects open redirects", () => {
    assert.equal(safeNextPath("https://evil.com"), "/");
    assert.equal(safeNextPath("//evil.com"), "/");
    assert.equal(safeNextPath("\\evil.com"), "/");
    assert.equal(safeNextPath("javascript:alert(1)"), "/");
  });

  it("falls back on empty", () => {
    assert.equal(safeNextPath(null), "/");
    assert.equal(safeNextPath(""), "/");
  });
});
