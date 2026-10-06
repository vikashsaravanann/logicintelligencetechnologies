import { createHash } from "crypto";

/** Max stored document size — matches the DB CHECK and the Vercel body limit. */
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

/** Lowercase hex SHA-256 of a buffer. */
export function sha256Hex(data: Uint8Array | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** True if a string is a 64-char lowercase hex digest. */
export function isSha256Hex(s: string): boolean {
  return /^[0-9a-f]{64}$/.test(s);
}

/**
 * Validate that a buffer is a PDF: the %PDF- magic at the very start and a
 * %%EOF marker near the end. Throws with a safe message otherwise. Not a full
 * parser — a defence-in-depth check before we store or sign anything.
 */
export function assertPdf(data: Uint8Array): void {
  if (data.length < 8) throw new Error("File is too small to be a PDF");
  if (data.length > MAX_PDF_BYTES) throw new Error("File exceeds the 4 MB limit");
  const header = Buffer.from(data.subarray(0, 5)).toString("latin1");
  if (header !== "%PDF-") throw new Error("File is not a PDF (bad header)");
  const tailStart = Math.max(0, data.length - 1024);
  const tail = Buffer.from(data.subarray(tailStart)).toString("latin1");
  if (!tail.includes("%%EOF")) throw new Error("File is not a well-formed PDF (no EOF marker)");
}

/**
 * A storage object path is safe when it has no traversal, is not absolute, is
 * not empty, and uses a conservative character set. Returns the path unchanged
 * or throws.
 */
export function assertSafeStoragePath(path: string): string {
  if (!path || path.length > 400) throw new Error("Invalid storage path length");
  if (path.startsWith("/")) throw new Error("Storage path must be relative");
  if (path.includes("..")) throw new Error("Storage path must not contain ..");
  if (!/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/.test(path)) throw new Error("Storage path has invalid characters");
  if (!path.toLowerCase().endsWith(".pdf")) throw new Error("Storage path must be a .pdf");
  return path;
}
