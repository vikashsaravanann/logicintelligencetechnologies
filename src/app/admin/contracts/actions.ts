"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { uploadImmutable } from "@/lib/documents/storage";
import { assertPdf, sha256Hex, MAX_PDF_BYTES } from "@/lib/documents/integrity";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RpcResult {
  ok: boolean;
  reason?: string;
}

/**
 * Record a manually-uploaded signed contract PDF. This is operator-attested, not
 * provider-verified; the DB function flips the contract to 'signed'.
 */
export async function recordSignature(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("contracts.record_signature", "contract.record_signature");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const contractId = String(formData.get("contractId") ?? "");
  if (!UUID.test(contractId)) throw new Error("Invalid contract id");

  const signatoryName = String(formData.get("signatoryName") ?? "").trim();
  const signatoryEmail = String(formData.get("signatoryEmail") ?? "").trim();
  if (!signatoryName) throw new Error("Signatory name is required.");
  if (!EMAIL.test(signatoryEmail)) throw new Error("A valid signatory email is required.");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("A signed PDF file is required.");
  if (file.size > MAX_PDF_BYTES) throw new Error("File exceeds the 4 MB limit.");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    assertPdf(bytes);
    const sha256 = sha256Hex(bytes);
    const storagePath = `contracts/${contractId}/signed.pdf`;
    await uploadImmutable(storagePath, bytes);

    const { data, error } = await supabaseAdmin.rpc("record_contract_signature", {
      p_contract: contractId,
      p_sha256: sha256,
      p_signatory_name: signatoryName,
      p_signatory_email: signatoryEmail,
      p_storage_path: storagePath,
      p_provenance: "manual_upload",
      p_actor: session.userId,
      p_actor_email: session.email,
      p_request_id: crypto.randomUUID(),
    });
    const result = (data ?? null) as RpcResult | null;
    if (error) throw new Error("Could not record the signature.");
    if (!result?.ok) throw new Error(result?.reason ?? "Signature could not be recorded.");

    await recordAdminAction({
      actor,
      action: "contract.record_signature",
      capability: "contracts.record_signature",
      target: { type: "contract", id: contractId },
      outcome: "succeeded",
      metadata: { provenance: "manual_upload", sha256 },
    });
  } catch (err) {
    await recordAdminAction({
      actor,
      action: "contract.record_signature",
      capability: "contracts.record_signature",
      target: { type: "contract", id: contractId },
      outcome: "failed",
      errorCode: "record_signature_failed",
    });
    throw err instanceof Error ? err : new Error("Could not record the signature.");
  }

  revalidatePath(`/admin/contracts/${contractId}/record-signature`);
}
