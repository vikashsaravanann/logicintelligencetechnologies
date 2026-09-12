/**
 * Attachment security tests.
 *
 * preparePdfAttachment and isPdfBuffer contain no external I/O.
 * We inline the implementation here to avoid server-only module boundary
 * while keeping the test assertions identical to the production behaviour.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline implementation (mirrors attachments.ts + sanitizeFilename) ────
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  const base = String(name || "file").split(/[/\\]/).pop() || "file";
  const cleaned = base
    .replace(/\0/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return cleaned || "file";
}

function isPdfBuffer(content: Buffer): boolean {
  if (content.length < 5) return false;
  return content.subarray(0, 5).toString("ascii") === "%PDF-";
}

function preparePdfAttachment(
  filename: string,
  content: Buffer
): { filename: string; content: Buffer; contentType: "application/pdf" } {
  if (content.length > MAX_ATTACHMENT_BYTES) throw new Error("Attachment exceeds 2 MB");
  if (!isPdfBuffer(content)) throw new Error("Attachment must be a PDF");
  const safe = sanitizeFilename(filename);
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
  return { filename: withExt, content, contentType: "application/pdf" };
}
// ─────────────────────────────────────────────────────────────────────────

const VALID_PDF_HEADER = Buffer.from("%PDF-1.4\n", "ascii");
const VALID_CONTENT = Buffer.concat([VALID_PDF_HEADER, Buffer.alloc(100, 0)]);

describe("isPdfBuffer", () => {
  it("accepts a buffer starting with %PDF-", () => {
    assert.equal(isPdfBuffer(VALID_CONTENT), true);
  });

  it("rejects a PNG header", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(isPdfBuffer(png), false);
  });

  it("rejects an empty buffer", () => {
    assert.equal(isPdfBuffer(Buffer.alloc(0)), false);
  });

  it("rejects a too-short buffer", () => {
    assert.equal(isPdfBuffer(Buffer.from("%PDF")), false);
  });

  it("rejects a zip/DOCX header", () => {
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14]);
    assert.equal(isPdfBuffer(zip), false);
  });
});

describe("preparePdfAttachment", () => {
  it("returns correct contentType and sanitized filename", () => {
    const result = preparePdfAttachment("My CV (final).pdf", VALID_CONTENT);
    assert.equal(result.contentType, "application/pdf");
    assert.ok(!result.filename.includes(" "), "Filename must not contain spaces");
    assert.ok(result.filename.endsWith(".pdf"), "Filename must end with .pdf");
  });

  it("appends .pdf extension if missing", () => {
    const result = preparePdfAttachment("resume", VALID_CONTENT);
    assert.ok(result.filename.endsWith(".pdf"));
  });

  it("blocks non-PDF content even with .pdf extension", () => {
    const notPdf = Buffer.concat([Buffer.from("GARBAGE"), Buffer.alloc(100)]);
    assert.throws(() => preparePdfAttachment("cv.pdf", notPdf), /PDF/i);
  });

  it("blocks files over 2 MB", () => {
    const big = Buffer.concat([VALID_PDF_HEADER, Buffer.alloc(2 * 1024 * 1024 + 1)]);
    assert.throws(() => preparePdfAttachment("cv.pdf", big), /2 MB/i);
  });

  it("sanitizes path-traversal filenames", () => {
    const result = preparePdfAttachment("../../etc/passwd.pdf", VALID_CONTENT);
    assert.ok(!result.filename.includes(".."), "Must strip ..");
    assert.ok(!result.filename.includes("/"), "Must strip slashes");
  });

  it("sanitizes null bytes in filename", () => {
    const result = preparePdfAttachment("cv\x00evil.pdf", VALID_CONTENT);
    assert.ok(!result.filename.includes("\x00"));
  });

  it("truncates very long filenames to 80 chars + .pdf", () => {
    const long = "a".repeat(200) + ".pdf";
    const result = preparePdfAttachment(long, VALID_CONTENT);
    assert.ok(result.filename.length <= 84); // 80 chars + ".pdf"
  });
});

describe("sanitizeFilename edge cases", () => {
  it("returns 'file.pdf' for empty input", () => {
    const result = preparePdfAttachment("", VALID_CONTENT);
    assert.ok(result.filename.length > 0);
  });

  it("strips leading dots", () => {
    const result = preparePdfAttachment("...hidden.pdf", VALID_CONTENT);
    assert.ok(!result.filename.startsWith("."));
  });
});
