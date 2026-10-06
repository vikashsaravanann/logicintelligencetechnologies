"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { capabilityForTransition, type DocumentStatus } from "@/lib/documents/lifecycle";
import { uploadImmutable, createDownloadUrl, verifyVersionIntegrity } from "@/lib/documents/storage";
import { MAX_PDF_BYTES } from "@/lib/documents/integrity";
import type { Capability } from "@/config/roles";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RpcResult {
  ok: boolean;
  reason?: string;
  from?: string;
  to?: string;
}

/** Move a document to a new status via the DB state machine. */
export async function transitionDocumentAction(formData: FormData): Promise<void> {
  const toStatus = String(formData.get("toStatus") ?? "");
  const capability = capabilityForTransition(toStatus as DocumentStatus) as Capability;
  const session = await requireCapabilityAction(capability, "document.transition");

  const documentId = String(formData.get("documentId") ?? "");
  if (!UUID.test(documentId)) throw new Error("Invalid document id");

  const { data, error } = await supabaseAdmin.rpc("transition_document", {
    p_doc: documentId,
    p_to_status: toStatus,
    p_actor: session.userId,
    p_actor_email: session.email,
    p_request_id: crypto.randomUUID(),
  });
  const result = (data ?? null) as RpcResult | null;
  const ok = !error && Boolean(result?.ok);

  await recordAdminAction({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "document.transition",
    capability,
    target: { type: "document", id: documentId },
    outcome: ok ? "succeeded" : "failed",
    errorCode: ok ? undefined : "transition_failed",
    metadata: { toStatus },
  });

  if (error) throw new Error("Could not transition the document.");
  if (!result?.ok) throw new Error(result?.reason ?? "Transition not allowed.");
  revalidatePath(`/admin/documents/${documentId}`);
}

/** Upload a new immutable PDF version for a document. */
export async function uploadVersion(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("documents.upload", "document.upload_version");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const documentId = String(formData.get("documentId") ?? "");
  if (!UUID.test(documentId)) throw new Error("Invalid document id");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("A PDF file is required.");
  if (file.size > MAX_PDF_BYTES) throw new Error("File exceeds the 4 MB limit.");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { data: doc, error: docErr } = await supabaseAdmin
      .from("client_documents")
      .select("id")
      .eq("id", documentId)
      .maybeSingle();
    if (docErr || !doc) throw new Error("Document not found.");

    const { data: latest } = await supabaseAdmin
      .from("client_document_versions")
      .select("version_no")
      .eq("document_id", documentId)
      .order("version_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersionNo = (latest?.version_no ?? 0) + 1;

    const storagePath = `${documentId}/v${nextVersionNo}.pdf`;
    const uploaded = await uploadImmutable(storagePath, bytes);

    const { data: version, error: versionErr } = await supabaseAdmin
      .from("client_document_versions")
      .insert({
        document_id: documentId,
        version_no: nextVersionNo,
        sha256: uploaded.sha256,
        size_bytes: uploaded.size,
        mime: "application/pdf",
        storage_path: storagePath,
        author_id: session.userId,
      })
      .select("id")
      .single();
    if (versionErr || !version) throw new Error("Could not record the version.");

    const { error: updErr } = await supabaseAdmin
      .from("client_documents")
      .update({ current_version_id: version.id })
      .eq("id", documentId);
    if (updErr) throw new Error("Could not update the current version pointer.");

    await recordAdminAction({
      actor,
      action: "document.upload_version",
      capability: "documents.upload",
      target: { type: "document", id: documentId },
      outcome: "succeeded",
      metadata: { versionNo: nextVersionNo, sha256: uploaded.sha256 },
    });
  } catch (err) {
    await recordAdminAction({
      actor,
      action: "document.upload_version",
      capability: "documents.upload",
      target: { type: "document", id: documentId },
      outcome: "failed",
      errorCode: "upload_failed",
    });
    throw err instanceof Error ? err : new Error("Could not upload the version.");
  }

  revalidatePath(`/admin/documents/${documentId}`);
}

/** Mint a 60s signed URL for a version and redirect to it. */
export async function downloadVersion(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("documents.download", "document.download");

  const versionId = String(formData.get("versionId") ?? "");
  if (!UUID.test(versionId)) throw new Error("Invalid version id");

  const { data: version, error } = await supabaseAdmin
    .from("client_document_versions")
    .select("id, document_id, storage_path")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !version) throw new Error("Version not found.");

  const signedUrl = await createDownloadUrl(version.storage_path);

  await recordAdminAction({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "document.download",
    capability: "documents.download",
    target: { type: "document", id: version.document_id },
    outcome: "succeeded",
    metadata: { versionId },
  });

  redirect(signedUrl);
}

/** Re-hash the latest stored version and confirm it still matches. */
export async function verifyLatest(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("documents.review", "document.verify");

  const documentId = String(formData.get("documentId") ?? "");
  if (!UUID.test(documentId)) throw new Error("Invalid document id");

  const { data: latest, error } = await supabaseAdmin
    .from("client_document_versions")
    .select("storage_path, sha256")
    .eq("document_id", documentId)
    .order("version_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !latest) throw new Error("No version to verify.");

  const match = await verifyVersionIntegrity(latest.storage_path, latest.sha256);

  await recordAdminAction({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "document.verify",
    capability: "documents.review",
    target: { type: "document", id: documentId },
    outcome: "succeeded",
    metadata: { match },
  });

  revalidatePath(`/admin/documents/${documentId}`);
}
