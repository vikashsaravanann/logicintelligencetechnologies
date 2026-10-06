import { test } from "node:test";
import assert from "node:assert/strict";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_KEYS, getDocumentType } from "@/config/documents";

test("the registry defines exactly seven document types", () => {
  assert.equal(DOCUMENT_TYPE_KEYS.length, 7);
});

test("every reference prefix is a valid, unique LIT prefix", () => {
  const prefixes = DOCUMENT_TYPE_KEYS.map((k) => DOCUMENT_TYPES[k].referencePrefix);
  for (const p of prefixes) assert.match(p, /^LIT-[A-Z]{2,5}$/);
  assert.equal(new Set(prefixes).size, prefixes.length, "prefixes must be unique");
});

test("every master is uploaded with a real 64-hex sha256; templates require human approval", () => {
  for (const k of DOCUMENT_TYPE_KEYS) {
    const t = DOCUMENT_TYPES[k];
    assert.equal(t.masterStatus, "MASTER_UPLOADED", `${k} master`);
    assert.equal(t.templateStatus, "REQUIRES_HUMAN_ACTION", `${k} template`);
    assert.match(t.masterSha256, /^[0-9a-f]{64}$/, `${k} sha`);
    assert.ok(t.masterFile.endsWith(".pdf"));
  }
});

test("getDocumentType returns a type or null, never undefined", () => {
  assert.equal(getDocumentType("sow")?.key, "sow");
  assert.equal(getDocumentType("nope"), null);
  assert.equal(getDocumentType("__proto__"), null);
});
