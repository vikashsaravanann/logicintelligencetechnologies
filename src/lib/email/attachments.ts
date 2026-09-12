import "server-only";
import { sanitizeFilename } from "./validation";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function isPdfBuffer(content: Buffer): boolean {
  if (content.length < 5) return false;
  return content.subarray(0, 5).toString("ascii") === "%PDF-";
}

export function preparePdfAttachment(filename: string, content: Buffer): {
  filename: string;
  content: Buffer;
  contentType: "application/pdf";
} {
  if (content.length > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment exceeds 2 MB");
  }
  if (!isPdfBuffer(content)) {
    throw new Error("Attachment must be a PDF");
  }
  const safe = sanitizeFilename(filename);
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
  return {
    filename: withExt,
    content,
    contentType: "application/pdf",
  };
}
