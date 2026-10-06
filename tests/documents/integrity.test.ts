import { test } from "node:test";
import assert from "node:assert/strict";
import { sha256Hex, isSha256Hex, assertPdf, assertSafeStoragePath, MAX_PDF_BYTES } from "@/lib/documents/integrity";

const pdf = (body = "x") => new TextEncoder().encode(`%PDF-1.7\n${body}\n%%EOF`);

test("sha256Hex matches the known empty-string vector", () => {
  assert.equal(sha256Hex(new Uint8Array(0)), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("isSha256Hex only accepts 64 lowercase hex", () => {
  assert.ok(isSha256Hex("a".repeat(64)));
  assert.ok(!isSha256Hex("A".repeat(64)));
  assert.ok(!isSha256Hex("abc"));
});

test("assertPdf accepts a well-formed PDF and rejects others", () => {
  assert.doesNotThrow(() => assertPdf(pdf()));
  assert.throws(() => assertPdf(new TextEncoder().encode("not a pdf at all %%EOF")), /bad header/);
  assert.throws(() => assertPdf(new TextEncoder().encode("%PDF-1.7 no eof here")), /EOF/);
  assert.throws(() => assertPdf(new Uint8Array(3)), /too small/);
  // oversize: a buffer just over the cap (header ok) is rejected on size
  const big = new Uint8Array(MAX_PDF_BYTES + 1);
  big.set(new TextEncoder().encode("%PDF-"), 0);
  assert.throws(() => assertPdf(big), /4 MB/);
});

test("assertSafeStoragePath blocks traversal, absolute, and non-pdf", () => {
  assert.equal(assertSafeStoragePath("acme/sow/v1.pdf"), "acme/sow/v1.pdf");
  assert.throws(() => assertSafeStoragePath("../etc/passwd.pdf"), /\.\./);
  assert.throws(() => assertSafeStoragePath("/abs/path.pdf"), /relative/);
  assert.throws(() => assertSafeStoragePath("acme/sow/v1.txt"), /\.pdf/);
  assert.throws(() => assertSafeStoragePath("acme/../x.pdf"), /\.\./);
});
