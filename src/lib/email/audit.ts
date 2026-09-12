/**
 * Admin email audit log.
 * Records every admin-triggered send for forensic inspection.
 */
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "./config";
import { maskEmail } from "./logger";

export type AuditStatus = "sent" | "failed" | "dry_run";

export interface AdminAuditEntry {
  triggeredBy: string; // 'session:{email}' or 'cron'
  emailType: string;
  recipient: string; // stored as-is for admin query; masked in logs
  outboxId?: string;
  status: AuditStatus;
  errorMessage?: string;
  ipAddress?: string;
}

/** Write one audit row. Non-fatal — never throws. */
export async function writeAdminAudit(entry: AdminAuditEntry): Promise<void> {
  if (!isSupabaseLive()) return;
  try {
    await supabaseAdmin.from("email_admin_audit").insert({
      triggered_by: entry.triggeredBy,
      email_type: entry.emailType,
      recipient: entry.recipient,
      outbox_id: entry.outboxId ?? null,
      status: entry.status,
      error_message: entry.errorMessage ? entry.errorMessage.slice(0, 400) : null,
      ip_address: entry.ipAddress ?? null,
    });
  } catch (err) {
    // Audit failure is non-fatal but should be visible in logs.
    console.error("[audit] Failed to write admin audit row:", {
      type: entry.emailType,
      recipient: maskEmail(entry.recipient),
      err: err instanceof Error ? err.message : String(err),
    });
  }
}
