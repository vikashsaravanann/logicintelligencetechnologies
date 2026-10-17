import "server-only";
import { sanitizeFilename } from "./validation";
import type { AttachmentRef, EmailAttachment } from "./types";

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

export async function resolveAndVerifyAttachments(
  attachmentRefs?: AttachmentRef[]
): Promise<EmailAttachment[]> {
  if (!attachmentRefs || !Array.isArray(attachmentRefs) || attachmentRefs.length === 0) {
    return [];
  }

  const { createHash } = await import("node:crypto");
  const { supabaseAdmin } = await import("@/lib/supabase/admin");

  const resolved: EmailAttachment[] = [];

  for (const ref of attachmentRefs) {
    if (!ref.storageBucket || !ref.storagePath) {
      throw new Error(`Invalid attachment reference: missing storageBucket or storagePath for ${ref.filename}`);
    }

    const { data, error } = await supabaseAdmin.storage
      .from(ref.storageBucket)
      .download(ref.storagePath);

    if (error || !data) {
      throw new Error(
        `Could not load required attachment ${ref.filename} from ${ref.storageBucket}/${ref.storagePath}: ${error?.message || "File not found"}`
      );
    }

    const buf = Buffer.from(await data.arrayBuffer());
    const actualSha256 = createHash("sha256").update(buf).digest("hex").toLowerCase();

    if (ref.expectedSha256 && actualSha256 !== ref.expectedSha256.toLowerCase()) {
      throw new Error(
        `Integrity mismatch on attachment ${ref.filename}: expected ${ref.expectedSha256}, got ${actualSha256}`
      );
    }

    const prepared = preparePdfAttachment(ref.filename, buf);
    resolved.push({
      filename: prepared.filename,
      content: prepared.content,
      contentType: prepared.contentType,
    });
  }

  return resolved;
}

