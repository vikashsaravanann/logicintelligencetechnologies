"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { rotateForContract } from "@/lib/onboarding/sessions";
import { dispatchAutomationEvent } from "@/lib/automation/dispatch";
import { calculateLeadScore } from "@/lib/crm/scoring";
import { normalizeN8nBase } from "@/lib/automations/n8n-core";
import { cleanKey, cleanUrl, buildN8nHeaders, resolveN8nCreds } from "@/lib/automations/n8n-client";

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

export interface TestN8nResult {
  ok: boolean;
  status: number;
  message: string;
  workflowCount?: number;
}

/**
 * Live test an n8n connection using provided or stored credentials.
 * super_admin only (capability automations.sync).
 */
export async function testN8nConnectionAction(input?: { base?: string; apiKey?: string }): Promise<TestN8nResult> {
  const session = await requireCapabilityAction("automations.sync", "automation.test_connection");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  let base = cleanUrl(input?.base);
  let apiKey = cleanKey(input?.apiKey);

  if (!base || !apiKey) {
    const creds = await resolveN8nCreds();
    if (!base && creds?.base) base = creds.base;
    if (!apiKey && creds?.apiKey) apiKey = creds.apiKey;
  }

  if (!base || !apiKey) {
    await recordAdminAction({
      actor,
      action: "automation.test_connection",
      capability: "automations.sync",
      outcome: "failed",
      metadata: { reason: "missing_credentials" },
      errorCode: "missing_credentials",
    });
    return { ok: false, status: 400, message: "Both n8n Base URL and API Key are required to test the connection." };
  }

  let endpoints;
  try {
    endpoints = normalizeN8nBase(base, process.env.NODE_ENV === "production");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid base URL";
    await recordAdminAction({
      actor,
      action: "automation.test_connection",
      capability: "automations.sync",
      outcome: "failed",
      metadata: { reason: msg },
      errorCode: "invalid_url",
    });
    return { ok: false, status: 400, message: msg };
  }

  // 1. Probe healthz
  try {
    const healthRes = await fetch(endpoints.healthUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!healthRes.ok) {
      await recordAdminAction({
        actor,
        action: "automation.test_connection",
        capability: "automations.sync",
        outcome: "failed",
        errorCode: `health_${healthRes.status}`,
      });
      return { ok: false, status: healthRes.status, message: `n8n server health probe returned HTTP ${healthRes.status}.` };
    }
  } catch (err) {
    const msg = err instanceof Error && err.name === "TimeoutError" ? "Health check timed out" : "Could not reach n8n server";
    await recordAdminAction({
      actor,
      action: "automation.test_connection",
      capability: "automations.sync",
      outcome: "failed",
      errorCode: "health_unreachable",
    });
    return { ok: false, status: 504, message: `${msg} at ${endpoints.healthUrl}. Check URL or network connectivity.` };
  }

  // 2. Probe API with credentials
  try {
    const apiRes = await fetch(`${endpoints.apiRoot}/workflows?limit=10`, {
      headers: buildN8nHeaders(apiKey),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (apiRes.status === 401) {
      await recordAdminAction({
        actor,
        action: "automation.test_connection",
        capability: "automations.sync",
        outcome: "failed",
        errorCode: "api_401",
      });
      return {
        ok: false,
        status: 401,
        message: "HTTP 401 Unauthorized: The n8n API rejected this key. Ensure you created a Public API Key in n8n (Settings > Public API > API keys).",
      };
    }

    if (!apiRes.ok) {
      await recordAdminAction({
        actor,
        action: "automation.test_connection",
        capability: "automations.sync",
        outcome: "failed",
        errorCode: `api_${apiRes.status}`,
      });
      return { ok: false, status: apiRes.status, message: `n8n API returned HTTP ${apiRes.status}.` };
    }

    const data = (await apiRes.json()) as { data?: unknown[] };
    const count = Array.isArray(data?.data) ? data.data.length : 0;

    await recordAdminAction({
      actor,
      action: "automation.test_connection",
      capability: "automations.sync",
      outcome: "succeeded",
      metadata: { workflowCount: count },
    });

    return {
      ok: true,
      status: 200,
      message: `Connection successful! Engine active and verified (${count} workflow(s) listed).`,
      workflowCount: count,
    };
  } catch (err) {
    const msg = err instanceof Error && err.name === "TimeoutError" ? "API request timed out" : "Could not reach n8n API endpoint";
    await recordAdminAction({
      actor,
      action: "automation.test_connection",
      capability: "automations.sync",
      outcome: "failed",
      errorCode: "api_unreachable",
    });
    return { ok: false, status: 504, message: `${msg}. Check SSL certificates and firewall settings.` };
  }
}

/**
 * Save and verify n8n connection credentials.
 * super_admin only (capability automations.sync).
 */
export async function saveN8nConfigAction(input: {
  base: string;
  apiKey: string;
  webhookSecret?: string;
}): Promise<{ ok: boolean; message: string }> {
  const session = await requireCapabilityAction("automations.sync", "automation.save_config");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  if (session.role !== "super_admin") {
    await recordAdminAction({
      actor,
      action: "automation.save_config",
      capability: "automations.sync",
      outcome: "denied",
      errorCode: "42501",
    });
    return { ok: false, message: "Only super administrators can modify automation engine credentials." };
  }

  const base = cleanUrl(input.base);
  const apiKey = cleanKey(input.apiKey);
  const webhookSecret = input.webhookSecret?.trim();

  if (!base || !apiKey) {
    return { ok: false, message: "Both n8n Base URL and API Key are required." };
  }

  const rows = [
    { key: "n8n_base_url", value: base, updated_at: new Date().toISOString(), updated_by: session.userId },
    { key: "n8n_api_key", value: apiKey, updated_at: new Date().toISOString(), updated_by: session.userId },
  ];
  if (webhookSecret) {
    rows.push({
      key: "n8n_webhook_secret",
      value: webhookSecret,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    });
  }

  const { error } = await supabaseAdmin.from("platform_settings").upsert(rows, { onConflict: "key" });

  if (error) {
    await recordAdminAction({
      actor,
      action: "automation.save_config",
      capability: "automations.sync",
      outcome: "failed",
      errorCode: error.code,
    });
    return { ok: false, message: `Failed to persist configuration: ${error.message}` };
  }

  await recordAdminAction({
    actor,
    action: "automation.save_config",
    capability: "automations.sync",
    outcome: "succeeded",
    metadata: { base, hasWebhookSecret: Boolean(webhookSecret) },
  });

  revalidatePath("/admin/automations");
  return { ok: true, message: "n8n automation engine configuration saved and active." };
}
