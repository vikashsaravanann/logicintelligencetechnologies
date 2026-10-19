"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { classifyReply } from "@/lib/outreach/intelligence/classify-reply";
import { recordReply, setReplyCategory, markReplyHandled } from "@/lib/outreach/intelligence/replies";
import { REPLY_CATEGORIES, type ReplyCategory } from "@/lib/outreach/intelligence/reply-schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ReplyActionResult {
  ok: boolean;
  message: string;
  category?: ReplyCategory;
  confidence?: number | null;
  classifiedBy?: string;
}

/**
 * Record an inbound reply and classify its intent server-side. The classifier
 * never fabricates — it labels intent only, and a human still confirms soft
 * intents. opt_out/bounce are flagged for immediate suppression.
 */
export async function logReply(formData: FormData): Promise<ReplyActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.reply_log");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const businessId = String(formData.get("businessId") ?? "").trim();
  const fromEmail = String(formData.get("fromEmail") ?? "").trim().toLowerCase() || null;
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 300) || null;
  const body = String(formData.get("body") ?? "").trim();

  if (!UUID.test(businessId)) return { ok: false, message: "Pick a valid lead." };
  if (!body) return { ok: false, message: "Paste the reply text." };
  if (fromEmail && !EMAIL.test(fromEmail)) return { ok: false, message: "That sender email is not valid." };

  // Find the most recent outreach record for this business to link the reply.
  const { data: outreach } = await supabaseAdmin
    .from("lead_outreach")
    .select("id")
    .eq("business_id", businessId)
    .order("last_contacted_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const cls = await classifyReply(subject, body);

  const id = await recordReply({
    businessId,
    outreachId: (outreach?.id as string) ?? null,
    fromEmail,
    subject,
    body,
    category: cls.category,
    confidence: cls.confidence,
    rationale: cls.rationale,
    requiresHuman: cls.requiresHuman,
    classifiedBy: cls.classifiedBy,
    provider: cls.provider,
    model: cls.model,
    raw: { source: "manual_log" },
  });

  await recordAdminAction({
    actor,
    action: "outreach.reply_log",
    capability: "outreach.manage",
    target: { type: "lead_business", id: businessId },
    outcome: id ? "succeeded" : "failed",
    metadata: { category: cls.category, classifiedBy: cls.classifiedBy },
  });

  if (!id) return { ok: false, message: "Could not record the reply." };
  revalidatePath("/admin/outreach/replies");
  return { ok: true, message: `Reply recorded and classified as “${cls.category}”.`, category: cls.category, confidence: cls.confidence, classifiedBy: cls.classifiedBy };
}

/** Re-classify a reply by hand (inbound facts stay immutable). */
export async function reclassifyReply(id: string, category: string): Promise<ReplyActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.reply_classify");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(id)) return { ok: false, message: "Invalid reply." };
  if (!(REPLY_CATEGORIES as readonly string[]).includes(category)) return { ok: false, message: "Invalid category." };

  const ok = await setReplyCategory(id, category as ReplyCategory, session.email ?? session.userId);
  await recordAdminAction({ actor, action: "outreach.reply_classify", capability: "outreach.manage", target: { type: "outreach_reply", id }, outcome: ok ? "succeeded" : "failed", metadata: { category } });
  if (!ok) return { ok: false, message: "Could not re-classify." };
  revalidatePath("/admin/outreach/replies");
  return { ok: true, message: "Re-classified." };
}

/** Mark a reply handled / unhandled. */
export async function toggleReplyHandled(id: string, handled: boolean): Promise<ReplyActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.reply_handle");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(id)) return { ok: false, message: "Invalid reply." };
  const ok = await markReplyHandled(id, session.email ?? session.userId, handled);
  await recordAdminAction({ actor, action: "outreach.reply_handle", capability: "outreach.manage", target: { type: "outreach_reply", id }, outcome: ok ? "succeeded" : "failed", metadata: { handled } });
  if (!ok) return { ok: false, message: "Could not update." };
  revalidatePath("/admin/outreach/replies");
  return { ok: true, message: handled ? "Marked handled." : "Reopened." };
}

/**
 * Suppress the sender of a reply (opt-out / bounce) at the database layer, then
 * mark the reply handled. The suppression is enforced by the outreach gate, so
 * this blocks every future draft to that address.
 */
export async function suppressFromReply(id: string): Promise<ReplyActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.suppress");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(id)) return { ok: false, message: "Invalid reply." };

  const { data: reply } = await supabaseAdmin
    .from("lead_outreach_replies")
    .select("id, from_email, category")
    .eq("id", id)
    .maybeSingle();
  if (!reply) return { ok: false, message: "Reply not found." };
  if (!reply.from_email) return { ok: false, message: "This reply has no sender address to suppress." };

  const reason = reply.category === "bounce" ? "bounce" : "opt_out";
  const { error } = await supabaseAdmin.from("lead_suppressions").insert({
    email: reply.from_email as string,
    reason,
    scope: "global",
    source: "reply",
    notes: `From reply ${id}`,
    active: true,
  });
  if (!error) await markReplyHandled(id, session.email ?? session.userId, true);

  await recordAdminAction({ actor, action: "outreach.suppress", capability: "outreach.manage", target: { type: "outreach_reply", id }, outcome: error ? "failed" : "succeeded", metadata: { reason, from: "reply" } });
  if (error) return { ok: false, message: "Could not add the suppression." };
  revalidatePath("/admin/outreach/replies");
  revalidatePath("/admin/outreach/suppression");
  return { ok: true, message: "Sender suppressed. Outreach to this address is now blocked at the database." };
}
