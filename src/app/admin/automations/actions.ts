"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { rotateForContract } from "@/lib/onboarding/sessions";
import { dispatchAutomationEvent } from "@/lib/automation/dispatch";
import { calculateLeadScore } from "@/lib/crm/scoring";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Re-queue a failed provisioning step so the dispatcher picks it up again. Only
 * steps currently in 'failed' are reset to 'pending'.
 */
export async function retryProvisioningStep(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.retry");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const stepId = String(formData.get("stepId") ?? "");
  if (!UUID.test(stepId)) throw new Error("Invalid step id");

  const { error } = await supabaseAdmin
    .from("provisioning_steps")
    .update({ status: "pending" })
    .eq("id", stepId)
    .eq("status", "failed");

  await recordAdminAction({
    actor,
    action: "automation.retry",
    capability: "automations.retry",
    target: { type: "provisioning_step", id: stepId },
    outcome: error ? "failed" : "succeeded",
    errorCode: error?.code,
  });

  if (error) throw new Error("Could not retry the provisioning step.");

  revalidatePath("/admin/automations");
}

/**
 * Rotate the onboarding link for a contract: revoke any active session and mint
 * a fresh one. rotateForContract records its own audit entry.
 */
export async function rotateOnboardingLink(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("onboarding.manage", "onboarding.rotate_link");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const contractId = String(formData.get("contractId") ?? "");
  if (!UUID.test(contractId)) throw new Error("Invalid contract id");

  // Recover the client/project references from an existing session for the contract.
  const { data } = await supabaseAdmin
    .from("onboarding_sessions")
    .select("client_id, project_id")
    .eq("contract_id", contractId)
    .limit(1)
    .maybeSingle();

  const clientId = (data?.client_id as string | null | undefined) ?? null;
  const projectId = (data?.project_id as string | null | undefined) ?? null;

  await rotateForContract(contractId, { clientId, projectId }, actor);

  revalidatePath("/admin/automations");
}

/**
 * Re-queue a failed or dead-letter automation event so the dispatcher can retry it.
 */
export async function retryAutomationEvent(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.event_retry");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const eventId = String(formData.get("eventId") ?? "");
  if (!UUID.test(eventId)) throw new Error("Invalid event id");

  const { error } = await supabaseAdmin
    .from("automation_events")
    .update({ status: "pending" })
    .eq("id", eventId)
    .in("status", ["failed", "dead_letter"]);

  await recordAdminAction({
    actor,
    action: "automation.event_retry",
    capability: "automations.retry",
    target: { type: "automation_event", id: eventId },
    outcome: error ? "failed" : "succeeded",
    errorCode: error?.code,
  });

  if (error) throw new Error("Could not retry the automation event.");

  revalidatePath("/admin/automations");
}

/**
 * Manually trigger the automation events dispatcher to process pending events immediately.
 */
export async function triggerAutomationDispatcher(): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.trigger_dispatcher");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const { data: events, error } = await supabaseAdmin
    .from("automation_events")
    .select("id, event_type, payload")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(10);

  let dispatched = 0;
  let failed = 0;

  if (events && events.length > 0) {
    for (const ev of events) {
      const r = await dispatchAutomationEvent(ev.id, ev.event_type, (ev.payload ?? {}) as Record<string, unknown>);
      if (r.state === "dispatched") {
        await supabaseAdmin.from("automation_events").update({ status: "dispatched" }).eq("id", ev.id);
        dispatched++;
      } else if (r.state === "no_workflow") {
        await supabaseAdmin.from("automation_events").update({ status: "failed" }).eq("id", ev.id);
        failed++;
      }
    }
  }

  await recordAdminAction({
    actor,
    action: "automation.trigger_dispatcher",
    capability: "automations.retry",
    outcome: error ? "failed" : "succeeded",
    metadata: { considered: events?.length ?? 0, dispatched, failed },
  });

  revalidatePath("/admin/automations");
}

/**
 * Manually trigger lead auto-scoring batch to enrich unscored leads.
 */
export async function triggerLeadScoringBatch(): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.trigger_lead_scoring");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const { data: leads, error } = await supabaseAdmin
    .from("contact_leads")
    .select("id, email, company, phone, budget, message")
    .is("lead_score", null)
    .order("created_at", { ascending: false })
    .limit(20);

  let scoredCount = 0;
  if (leads && leads.length > 0) {
    for (const lead of leads) {
      const result = calculateLeadScore({
        email: lead.email,
        company: lead.company,
        phone: lead.phone,
        budget: lead.budget,
        message: lead.message,
      });
      await supabaseAdmin
        .from("contact_leads")
        .update({ lead_score: result.score })
        .eq("id", lead.id);
      scoredCount++;
    }
  }

  await recordAdminAction({
    actor,
    action: "automation.trigger_lead_scoring",
    capability: "automations.retry",
    outcome: error ? "failed" : "succeeded",
    metadata: { evaluated: leads?.length ?? 0, updated: scoredCount },
  });

  revalidatePath("/admin/automations");
}

/**
 * Trigger manual check for invoice payment reminders.
 */
export async function triggerInvoiceReminders(): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.trigger_invoice_reminders");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select("id, invoice_code, status, due_date")
    .in("status", ["issued", "overdue", "pending"])
    .limit(50);

  await recordAdminAction({
    actor,
    action: "automation.trigger_invoice_reminders",
    capability: "automations.retry",
    outcome: error ? "failed" : "succeeded",
    metadata: { pendingRemindersCount: invoices?.length ?? 0 },
  });

  revalidatePath("/admin/automations");
}

/**
 * Trigger manual outreach followup check.
 */
export async function triggerOutreachFollowups(): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.trigger_outreach_followups");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const { data: enrollments, error } = await supabaseAdmin
    .from("outreach_enrollments")
    .select("id, status, current_step")
    .eq("status", "ACTIVE")
    .limit(50);

  await recordAdminAction({
    actor,
    action: "automation.trigger_outreach_followups",
    capability: "automations.retry",
    outcome: error ? "failed" : "succeeded",
    metadata: { activeEnrollments: enrollments?.length ?? 0 },
  });

  revalidatePath("/admin/automations");
}
