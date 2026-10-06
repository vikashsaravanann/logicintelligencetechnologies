import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { renderDocument } from "@/lib/pdf/renderer";
import { uploadImmutable } from "./storage";

export interface ProcessResult {
  claimed: number;
  succeeded: number;
  failed: number;
  notConfigured: boolean;
}

/** Queue a render job for a document with the fill data the service needs. */
export async function enqueueRenderJob(documentId: string, payload: Record<string, unknown>): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("document_render_jobs")
    .insert({ document_id: documentId, status: "queued", payload })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

/**
 * Process up to `max` queued render jobs. Each job is claimed atomically
 * (claim_render_job uses FOR UPDATE SKIP LOCKED), rendered via the PDF service,
 * stored as an immutable version, and marked succeeded. If the PDF service is
 * NOT CONFIGURED the job is returned to the queue untouched (no fake success,
 * no churn) and processing stops. Transient errors retry up to max_attempts,
 * then dead-letter.
 */
export async function processRenderJobs(max = 5): Promise<ProcessResult> {
  const result: ProcessResult = { claimed: 0, succeeded: 0, failed: 0, notConfigured: false };

  for (let i = 0; i < max; i++) {
    const { data: jobs, error } = await supabaseAdmin.rpc("claim_render_job");
    if (error) break;
    const job = Array.isArray(jobs) ? jobs[0] : jobs;
    if (!job) break;
    result.claimed++;

    const { data: doc } = await supabaseAdmin
      .from("client_documents")
      .select("id, client_id, doc_type")
      .eq("id", job.document_id)
      .maybeSingle();
    if (!doc) {
      await supabaseAdmin.from("document_render_jobs").update({ status: "failed", error: "document missing" }).eq("id", job.id);
      result.failed++;
      continue;
    }

    const outcome = await renderDocument(doc.doc_type, (job.payload ?? {}) as Record<string, unknown>);

    if (outcome.state === "NOT CONFIGURED") {
      // Put it back and stop — nothing can be rendered until the service is set.
      await supabaseAdmin.from("document_render_jobs").update({ status: "queued", error: "PDF service not configured" }).eq("id", job.id);
      result.notConfigured = true;
      break;
    }

    if (outcome.state === "ERROR" || !outcome.bytes) {
      const dead = (job.attempts ?? 1) >= (job.max_attempts ?? 3);
      await supabaseAdmin.from("document_render_jobs")
        .update({ status: dead ? "dead_letter" : "queued", error: outcome.detail ?? "render error" })
        .eq("id", job.id);
      result.failed++;
      continue;
    }

    // Store the rendered PDF as the next immutable version.
    const { data: last } = await supabaseAdmin
      .from("client_document_versions")
      .select("version_no")
      .eq("document_id", doc.id)
      .order("version_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextNo = (last?.version_no ?? 0) + 1;
    const path = `${doc.id}/rendered-v${nextNo}.pdf`;
    try {
      const up = await uploadImmutable(path, outcome.bytes);
      const { data: ver } = await supabaseAdmin
        .from("client_document_versions")
        .insert({ document_id: doc.id, version_no: nextNo, sha256: up.sha256, size_bytes: up.size, storage_path: path, note: "auto-rendered" })
        .select("id")
        .single();
      if (ver) await supabaseAdmin.from("client_documents").update({ current_version_id: ver.id }).eq("id", doc.id);
      await supabaseAdmin.from("document_render_jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
      result.succeeded++;
    } catch (err) {
      await supabaseAdmin.from("document_render_jobs")
        .update({ status: "failed", error: err instanceof Error ? err.message : "store error" })
        .eq("id", job.id);
      result.failed++;
    }
  }

  return result;
}
