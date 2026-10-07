"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SUPPRESSION_REASONS = ["opt_out", "bounce", "complaint", "manual", "jurisdiction", "do_not_contact"] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export interface SuppressResult {
  ok: boolean;
  message: string;
}

/**
 * Add a global suppression. A match here blocks outreach at the database layer
 * (the lead_outreach gate), so this takes effect for every worker and agent.
 */
export async function addSuppression(formData: FormData): Promise<SuppressResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.suppress");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const domain = String(formData.get("domain") ?? "").trim().toLowerCase() || null;
  const reasonRaw = String(formData.get("reason") ?? "manual");
  const reason = (SUPPRESSION_REASONS as readonly string[]).includes(reasonRaw) ? reasonRaw : "manual";
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  if (!email && !domain) return { ok: false, message: "Provide an email or a domain to suppress." };
  if (email && !EMAIL.test(email)) return { ok: false, message: "That email is not valid." };
  if (domain && !DOMAIN.test(domain)) return { ok: false, message: "That domain is not valid." };

  const { error } = await supabaseAdmin.from("lead_suppressions").insert({
    email,
    domain,
    reason,
    scope: "global",
    source: "manual",
    notes,
    active: true,
  });

  await recordAdminAction({
    actor,
    action: "outreach.suppress",
    capability: "outreach.manage",
    outcome: error ? "failed" : "succeeded",
    metadata: { reason, hasEmail: Boolean(email), hasDomain: Boolean(domain) },
  });

  if (error) return { ok: false, message: "Could not add the suppression." };
  revalidatePath("/admin/outreach/suppression");
  return { ok: true, message: "Suppression added. Outreach to this contact is now blocked at the database." };
}

/** Deactivate a suppression (reversible; audited). */
export async function deactivateSuppression(id: string): Promise<SuppressResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.suppress");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  const { error } = await supabaseAdmin.from("lead_suppressions").update({ active: false }).eq("id", id);
  await recordAdminAction({
    actor,
    action: "outreach.suppress",
    capability: "outreach.manage",
    target: { type: "lead_suppression", id },
    outcome: error ? "failed" : "succeeded",
    metadata: { op: "deactivate" },
  });
  if (error) return { ok: false, message: "Could not update the suppression." };
  revalidatePath("/admin/outreach/suppression");
  return { ok: true, message: "Suppression deactivated." };
}
