import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRenderRequest, looksLikePdf } from "@/lib/pdf/renderer-core";

test("buildRenderRequest maps each type to its document number", () => {
  assert.equal(buildRenderRequest("sow", {}).doc, "01");
  assert.equal(buildRenderRequest("proposal", {}).doc, "02");
  assert.equal(buildRenderRequest("maintenance_support", {}).doc, "07");
});

test("buildRenderRequest passes the data through and rejects unknown types", () => {
  const req = buildRenderRequest("sow", { common: { "Client Company": "Acme" } });
  assert.deepEqual(req.data, { common: { "Client Company": "Acme" } });
  assert.throws(() => buildRenderRequest("bogus", {}), /Unknown document type/);
});

test("looksLikePdf checks the %PDF magic", () => {
  assert.ok(looksLikePdf(new TextEncoder().encode("%PDF-1.7\n...")));
  assert.ok(!looksLikePdf(new TextEncoder().encode("GIF89a")));
  assert.ok(!looksLikePdf(new Uint8Array(2)));
});
