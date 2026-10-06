import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidActionName, redactMetadata } from "./audit-core";
import { getRequestContext, requestContextFromRequest, type RequestContext } from "./request-context";
import type { Capability } from "@/config/roles";

export type AuditOutcome = "succeeded" | "failed" | "denied";

export interface StaffActor {
  userId: string | null;
  email: string | null;
  role: string | null;
}

export interface RecordAdminActionInput {
  actor: StaffActor | null;
  action: string;
  capability?: Capability;
  target?: { type: string; id: string };
  outcome: AuditOutcome;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  correlationId?: string;
  /** Supply when recording from an API route; otherwise next/headers is used. */
  request?: Request;
}

/**
 * Append a record to admin_audit_log. Never throws: an audit failure must not
 * break the user's action, but callers should surface "audit record FAILED"
 * when { ok:false } is returned rather than report a clean success.
 */
export async function recordAdminAction(input: RecordAdminActionInput): Promise<{ ok: boolean }> {
  try {
    if (!isValidActionName(input.action)) {
      console.error("[audit] invalid action name", input.action);
      return { ok: false };
    }
    const ctx: RequestContext = input.request
      ? requestContextFromRequest(input.request)
      : await getRequestContext();

    const { error } = await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: input.actor?.userId ?? null,
      actor_email: input.actor?.email ?? null,
      actor_role: input.actor?.role ?? null,
      action: input.action,
      capability: input.capability ?? null,
      target_type: input.target?.type ?? null,
      target_id: input.target?.id ?? null,
      outcome: input.outcome,
      request_id: ctx.requestId,
      correlation_id: input.correlationId ?? null,
      ip_hash: ctx.ipHash,
      user_agent: ctx.userAgent,
      metadata: redactMetadata(input.metadata ?? {}),
      error_code: input.errorCode ?? null,
    });
    if (error) {
      console.error("[audit] insert failed", error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[audit] unexpected error", err);
    return { ok: false };
  }
}
