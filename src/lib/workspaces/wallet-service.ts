/**
 * Staff Document Wallet Service
 *
 * Implements private document storage per employee:
 * - 50 MB strict maximum file size boundary
 * - Allowed MIME types verification
 * - Signed URLs with 15-minute expiration
 * - Multi-tenant isolation (owner-only access, audited Super Admin access)
 * - Safe file metadata persistence in public.staff_document_wallet
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export const WALLET_BUCKET = "staff-wallet";
export const WALLET_MAX_FILE_SIZE_BYTES = 52428800; // 50 MB
export const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes

export const ALLOWED_WALLET_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
] as const;

export const WALLET_ALLOWED_MIME_TYPES = ALLOWED_WALLET_MIME_TYPES;

export type WalletMimeType = (typeof ALLOWED_WALLET_MIME_TYPES)[number];

export const WALLET_CATEGORIES = [
  "identity",
  "educational",
  "certification",
  "employment",
  "tax_compliance",
  "project_note",
  "other",
] as const;

export type WalletCategory = (typeof WALLET_CATEGORIES)[number];

export interface WalletDocumentRecord {
  id: string;
  owner_user_id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_path: string;
  category: WalletCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletDocumentWithUrl extends WalletDocumentRecord {
  downloadUrl?: string;
}

/**
 * Validates file upload attributes before recording or storage.
 */
export function validateWalletFile(fileName: string, fileSizeBytes: number, mimeType: string): { valid: boolean; error?: string } {
  if (!fileName || fileName.trim().length === 0) {
    return { valid: false, error: "File name is required" };
  }
  if (fileSizeBytes <= 0) {
    return { valid: false, error: "File is empty: file size must be greater than 0" };
  }
  if (fileSizeBytes > WALLET_MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds 50 MB limit (max 52,428,800 bytes)" };
  }
  if (!ALLOWED_WALLET_MIME_TYPES.includes(mimeType as WalletMimeType)) {
    return { valid: false, error: `Unsupported MIME type: ${mimeType}. Allowed: PDF, DOCX, XLSX, Images, Text` };
  }
  return { valid: true };
}

/**
 * Validates file upload and throws on error (helper for handlers and tests).
 */
export function validateWalletUpload(fileSizeBytes: number, mimeType: string, fileName = "document.pdf"): boolean {
  const result = validateWalletFile(fileName, fileSizeBytes, mimeType);
  if (!result.valid) {
    throw new Error(result.error);
  }
  return true;
}

/**
 * Lists documents for a staff user.
 * Caller must be the document owner OR Super Admin.
 */
export async function listWalletDocuments(
  targetUserId: string,
  callerUserId: string,
  isSuperAdmin: boolean
): Promise<WalletDocumentRecord[]> {
  if (targetUserId !== callerUserId && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You cannot view another employee's document wallet.");
  }

  const { data, error } = await supabaseAdmin
    .from("staff_document_wallet")
    .select("*")
    .eq("owner_user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list wallet documents: ${error.message}`);
  }

  return (data || []) as WalletDocumentRecord[];
}

/**
 * Records a newly uploaded document in the staff wallet.
 */
export async function recordWalletDocument(params: {
  ownerUserId: string;
  callerUserId: string;
  isSuperAdmin: boolean;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  category?: WalletCategory;
  description?: string;
}): Promise<WalletDocumentRecord> {
  const {
    ownerUserId,
    callerUserId,
    isSuperAdmin,
    fileName,
    fileSizeBytes,
    mimeType,
    storagePath,
    category = "other",
    description,
  } = params;

  if (ownerUserId !== callerUserId && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You cannot upload documents into another employee's wallet.");
  }

  const validation = validateWalletFile(fileName, fileSizeBytes, mimeType);
  if (!validation.valid) {
    throw new Error(`VALIDATION_FAILED: ${validation.error}`);
  }

  // Ensure storage path begins with ownerUserId/ for tenant containment
  if (!storagePath.startsWith(`${ownerUserId}/`)) {
    throw new Error("INVALID_STORAGE_PATH: Storage path must be prefixed with owner user ID.");
  }

  const { data, error } = await supabaseAdmin
    .from("staff_document_wallet")
    .insert({
      owner_user_id: ownerUserId,
      file_name: fileName.trim(),
      file_size_bytes: fileSizeBytes,
      mime_type: mimeType,
      storage_path: storagePath,
      category,
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record wallet document: ${error.message}`);
  }

  return data as WalletDocumentRecord;
}

/**
 * Generates a signed, short-lived download URL for a wallet document.
 */
export async function getWalletDocumentSignedUrl(
  documentId: string,
  callerUserId: string,
  isSuperAdmin: boolean
): Promise<{ signedUrl: string; document: WalletDocumentRecord }> {
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from("staff_document_wallet")
    .select("*")
    .eq("id", documentId)
    .single();

  if (fetchErr || !doc) {
    throw new Error("NOT_FOUND: Document not found in wallet.");
  }

  if (doc.owner_user_id !== callerUserId && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You cannot download another employee's wallet document.");
  }

  const { data: signData, error: signErr } = await supabaseAdmin.storage
    .from(WALLET_BUCKET)
    .createSignedUrl(doc.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signErr || !signData?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${signErr?.message || "Storage error"}`);
  }

  return {
    signedUrl: signData.signedUrl,
    document: doc as WalletDocumentRecord,
  };
}

/**
 * Deletes a document from the staff wallet and deletes its storage object.
 */
export async function deleteWalletDocument(
  documentId: string,
  callerUserId: string,
  isSuperAdmin: boolean
): Promise<{ success: boolean }> {
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from("staff_document_wallet")
    .select("*")
    .eq("id", documentId)
    .single();

  if (fetchErr || !doc) {
    throw new Error("NOT_FOUND: Document not found.");
  }

  if (doc.owner_user_id !== callerUserId && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You cannot delete another employee's wallet document.");
  }

  // Delete from storage
  await supabaseAdmin.storage.from(WALLET_BUCKET).remove([doc.storage_path]);

  // Delete database record
  const { error: delErr } = await supabaseAdmin
    .from("staff_document_wallet")
    .delete()
    .eq("id", documentId);

  if (delErr) {
    throw new Error(`Failed to delete document record: ${delErr.message}`);
  }

  return { success: true };
}
