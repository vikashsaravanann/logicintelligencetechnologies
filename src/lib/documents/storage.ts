import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sha256Hex, assertPdf, assertSafeStoragePath, isSha256Hex } from "./integrity";

export const DOCUMENTS_BUCKET = "lit-documents";

export interface UploadResult {
  path: string;
  sha256: string;
  size: number;
}

/**
 * Upload a PDF to the private documents bucket without overwriting (upsert:
 * false), after validating it is a real PDF on a traversal-safe path. Returns
 * the sha256 + size so the caller records an immutable version row.
 */
export async function uploadImmutable(path: string, bytes: Uint8Array): Promise<UploadResult> {
  assertSafeStoragePath(path);
  assertPdf(bytes);
  const sha256 = sha256Hex(bytes);
  const { error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, Buffer.from(bytes), { contentType: "application/pdf", upsert: false });
  if (error) {
    // A duplicate path is a caller bug (versions must use fresh paths).
    throw new Error(`Upload failed: ${error.message}`);
  }
  return { path, sha256, size: bytes.length };
}

/**
 * A short-lived (60s) signed URL for a stored document object. The caller must
 * have already checked the requester's capability and the document's
 * classification; this only mints the URL. Never returns a public URL.
 */
export async function createDownloadUrl(path: string): Promise<string> {
  assertSafeStoragePath(path);
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data?.signedUrl) throw new Error("Could not create a download link");
  return data.signedUrl;
}

/**
 * Re-download a stored object and confirm its SHA-256 still matches what was
 * recorded. Used by the "Verify" action in the Document Center.
 */
export async function verifyVersionIntegrity(path: string, expectedSha256: string): Promise<boolean> {
  if (!isSha256Hex(expectedSha256)) return false;
  const { data, error } = await supabaseAdmin.storage.from(DOCUMENTS_BUCKET).download(path);
  if (error || !data) return false;
  const bytes = new Uint8Array(await data.arrayBuffer());
  return sha256Hex(bytes) === expectedSha256;
}
