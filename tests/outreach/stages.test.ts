import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { STOP_LIFECYCLE_STAGES, LEAD_LIFECYCLE_STAGES } from "../../src/lib/outreach/types.ts";

describe("lifecycle", () => {
  it("includes terminal stop stages", () => {
    for (const s of ["REPLIED", "WON", "UNSUBSCRIBED", "SUPPRESSED"] as const) {
      assert.ok(STOP_LIFECYCLE_STAGES.includes(s));
    }
  });
  it("has unique stages", () => {
    assert.equal(new Set(LEAD_LIFECYCLE_STAGES).size, LEAD_LIFECYCLE_STAGES.length);
  });
});
