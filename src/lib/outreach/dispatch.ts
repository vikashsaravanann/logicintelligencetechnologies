import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dispatchAutomationEvent, type DispatchState } from "@/lib/automation/dispatch";

export interface OutreachDispatchResult {
  state: DispatchState | "not_approved" | "not_found" | "blocked";
  message: string;
}

/**
 * Dispatch an APPROVED outreach message to n8n for controlled sending. This is
 * the single seam through which an approved draft leaves the system — it is
 * never automatic; a human calls it after approval.
 *
 * Guarantees:
 *  - only a message in status 'approved' that passed every QA blocker is sent;
 *  - the outbound payload carries ids (business_id, message_id) and the drafted
 *    text — never a fabricated contact; n8n resolves the real recipient against
 *    the suppression- and jurisdiction-gated lead_outreach record;
 *  - a 2xx from n8n means "accepted for processing" (status → scheduled), NOT
 *    "sent". The actual send/delivery comes back later as a lead_outreach event;
 *  - fails closed and truthfully when n8n is unconfigured. Never throws.
 */
export async function dispatchApprovedMessage(messageId: string, actorEmail: string): Promise<OutreachDispatchResult> {
  const { data: msg, error } = await supabaseAdmin
    .from("lead_outreach_messages")
    .select("id, business_id, outreach_id, channel, opportunity_type, subject, body, status, blockers_pass")
    .eq("id", messageId)
    .maybeSingle();

  if (error || !msg) return { state: "not_found", message: "Message not found." };
  if (msg.status !== "approved") {
    return { state: "not_approved", message: `Only an approved message can be dispatched (this one is ${String(msg.status)}).` };
  }
  if (!msg.blockers_pass) {
    return { state: "blocked", message: "This message has not passed every QA blocker and cannot be dispatched." };
  }

  const payload = {
    message_id: msg.id as string,
    business_id: msg.business_id as string,
    outreach_id: (msg.outreach_id as string) ?? null,
    channel: msg.channel as string,
    opportunity_type: (msg.opportunity_type as string) ?? null,
    subject: (msg.subject as string) ?? null,
    body: msg.body as string,
    dispatched_by: actorEmail,
  };

  // eventId = message id makes the dispatch idempotent on the n8n side.
  const r = await dispatchAutomationEvent(msg.id as string, "outreach.message_approved", payload);

  if (r.state === "dispatched") {
    await supabaseAdmin
      .from("lead_outreach_messages")
      .update({ status: "scheduled" })
      .eq("id", msg.id as string)
      .eq("status", "approved");
    return { state: "dispatched", message: "Accepted by the dispatch workflow. It is queued to send — not yet confirmed sent." };
  }
  if (r.state === "not_configured") {
    return { state: "not_configured", message: "n8n dispatch is not configured (N8N_BASE_URL / N8N_WEBHOOK_SECRET unset). Nothing was sent." };
  }
  if (r.state === "no_workflow") {
    return { state: "no_workflow", message: "No dispatch workflow is registered for outreach." };
  }
  return { state: "error", message: r.detail ? `Dispatch failed: ${r.detail}` : "Dispatch failed." };
}
