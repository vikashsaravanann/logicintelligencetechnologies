"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { scheduleFollowup, cancelFollowup, markFollowupSent } from "@/lib/outreach/intelligence/followups";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FollowupActionResult {
  ok: boolean;
  message: string;
}

/** Schedule (or reschedule) a follow-up for a lead. */
export async function createFollowup(formData: FormData): Promise<FollowupActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.followup_schedule");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const businessId = String(formData.get("businessId") ?? "").trim();
  const days = Number(formData.get("days") ?? "0");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300) || null;

  if (!UUID.test(businessId)) return { ok: false, message: "Pick a valid lead." };
  if (!Number.isFinite(days) || days < 1 || days > 180) return { ok: false, message: "Choose between 1 and 180 days out." };

  const dueAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  const r = await scheduleFollowup({ businessId, dueAt, reason, createdBy: session.email ?? session.userId });

  await recordAdminAction({
    actor,
    action: "outreach.followup_schedule",
    capability: "outreach.manage",
    target: { type: "lead_business", id: businessId },
    outcome: r.ok ? "succeeded" : "failed",
    metadata: { days, rescheduled: r.message.includes("rescheduled") },
  });

  if (!r.ok) return { ok: false, message: r.message };
  revalidatePath("/admin/outreach/followups");
  return { ok: true, message: r.message };
}

/** Cancel a scheduled follow-up. */
export async function cancelFollowupAction(id: string): Promise<FollowupActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.followup_cancel");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(id)) return { ok: false, message: "Invalid follow-up." };
  const ok = await cancelFollowup(id, session.email ?? session.userId);
  await recordAdminAction({ actor, action: "outreach.followup_cancel", capability: "outreach.manage", target: { type: "outreach_followup", id }, outcome: ok ? "succeeded" : "failed" });
  if (!ok) return { ok: false, message: "Could not cancel (already resolved?)." };
  revalidatePath("/admin/outreach/followups");
  return { ok: true, message: "Follow-up cancelled." };
}

/** Mark a follow-up sent (the chase went out through the normal controlled path). */
export async function markFollowupSentAction(id: string): Promise<FollowupActionResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.followup_sent");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(id)) return { ok: false, message: "Invalid follow-up." };
  const ok = await markFollowupSent(id);
  await recordAdminAction({ actor, action: "outreach.followup_sent", capability: "outreach.manage", target: { type: "outreach_followup", id }, outcome: ok ? "succeeded" : "failed" });
  if (!ok) return { ok: false, message: "Could not update (already resolved?)." };
  revalidatePath("/admin/outreach/followups");
  return { ok: true, message: "Marked sent." };
}
