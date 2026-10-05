import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { normalizeEmail, isValidEmail } from "@/lib/email/validation";
import { isSuppressed } from "@/lib/email/suppression";
import { recordLeadActivity } from "./activity";
import type { CampaignStatus } from "./types";

export type AudiencePreview = {
  eligible: number;
  suppressed: number;
  invalid: number;
  total: number;
  sampleEmails: string[];
};

export async function previewAudience(filter?: {
  lifecycle_stage?: string;
  source?: string;
  limit?: number;
}): Promise<AudiencePreview> {
  const empty: AudiencePreview = {
    eligible: 0,
    suppressed: 0,
    invalid: 0,
    total: 0,
    sampleEmails: [],
  };
  if (!isSupabaseLive()) return empty;

  let q = supabaseAdmin
    .from("contact_leads")
    .select("id, email, lifecycle_stage, source, name")
    .order("created_at", { ascending: false })
    .limit(filter?.limit ?? 500);

  if (filter?.lifecycle_stage) {
    q = q.eq("lifecycle_stage", filter.lifecycle_stage);
  }
  if (filter?.source) {
    q = q.eq("source", filter.source);
  }

  const { data: leads } = await q;
  if (!leads?.length) return empty;

  let eligible = 0;
  let suppressed = 0;
  let invalid = 0;
  const sampleEmails: string[] = [];

  for (const lead of leads) {
    const email = normalizeEmail(String(lead.email || ""));
    if (!isValidEmail(email)) {
      invalid += 1;
      continue;
    }
    if (await isSuppressed(email, "marketing")) {
      suppressed += 1;
      continue;
    }
    eligible += 1;
    if (sampleEmails.length < 10) sampleEmails.push(email);
  }

  return {
    eligible,
    suppressed,
    invalid,
    total: leads.length,
    sampleEmails,
  };
}

export async function createCampaign(params: {
  name: string;
  description?: string;
  createdBy?: string;
  steps: Array<{
    delay_days: number;
    subject: string;
    body_html: string;
    body_text?: string;
  }>;
  dryRun?: boolean;
}): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseLive()) return { error: "Database not configured" };
  if (!params.name.trim()) return { error: "Name required" };
  if (!params.steps.length) return { error: "At least one sequence step required" };

  const { data: campaign, error } = await supabaseAdmin
    .from("outreach_campaigns")
    .insert({
      name: params.name.trim().slice(0, 200),
      description: params.description?.slice(0, 2000) || null,
      status: "DRAFT" as CampaignStatus,
      created_by: params.createdBy || null,
      dry_run: Boolean(params.dryRun),
    })
    .select("id")
    .single();

  if (error || !campaign) {
    return { error: error?.message || "Failed to create campaign" };
  }

  const stepRows = params.steps.map((s, i) => ({
    campaign_id: campaign.id,
    step_order: i,
    delay_days: Math.max(0, Number(s.delay_days) || 0),
    subject: s.subject.slice(0, 300),
    body_html: s.body_html,
    body_text: s.body_text || null,
  }));

  const { error: stepErr } = await supabaseAdmin
    .from("outreach_sequence_steps")
    .insert(stepRows);
  if (stepErr) {
    await supabaseAdmin.from("outreach_campaigns").delete().eq("id", campaign.id);
    return { error: stepErr.message };
  }

  await recordLeadActivity({
    eventType: "outreach_created",
    campaignId: campaign.id,
    actor: params.createdBy,
    metadata: { name: params.name },
  });

  return { id: campaign.id };
}

export async function setCampaignStatus(params: {
  id: string;
  status: CampaignStatus;
  actor?: string;
}): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseLive()) return { error: "Database not configured" };

  const updates: Record<string, unknown> = {
    status: params.status,
    updated_at: new Date().toISOString(),
  };
  if (params.status === "ACTIVE") {
    updates.started_at = new Date().toISOString();
    updates.approved_by = params.actor || null;
    updates.approved_at = new Date().toISOString();
  }
  if (params.status === "COMPLETED") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("outreach_campaigns")
    .update(updates)
    .eq("id", params.id);

  if (error) return { error: error.message };

  await recordLeadActivity({
    eventType:
      params.status === "ACTIVE"
        ? "outreach_approved"
        : `campaign_${params.status.toLowerCase()}`,
    campaignId: params.id,
    actor: params.actor,
  });

  return { ok: true };
}

export async function enrollEligibleLeads(params: {
  campaignId: string;
  actor?: string;
  limit?: number;
}): Promise<{ enrolled: number; skipped: number } | { error: string }> {
  if (!isSupabaseLive()) return { error: "Database not configured" };

  const { data: steps } = await supabaseAdmin
    .from("outreach_sequence_steps")
    .select("delay_days")
    .eq("campaign_id", params.campaignId)
    .order("step_order", { ascending: true })
    .limit(1);

  const delay0 = steps?.[0]?.delay_days ?? 0;
  const nextSend = new Date(Date.now() + delay0 * 86400000).toISOString();

  const { data: leads } = await supabaseAdmin
    .from("contact_leads")
    .select("id, email")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 200);

  let enrolled = 0;
  let skipped = 0;

  for (const lead of leads || []) {
    const email = normalizeEmail(String(lead.email || ""));
    if (!isValidEmail(email) || (await isSuppressed(email, "marketing"))) {
      skipped += 1;
      continue;
    }
    const { error } = await supabaseAdmin.from("outreach_enrollments").upsert(
      {
        campaign_id: params.campaignId,
        lead_id: lead.id,
        email,
        status: "ACTIVE",
        current_step: 0,
        next_send_at: nextSend,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campaign_id,email" }
    );
    if (error) skipped += 1;
    else enrolled += 1;
  }

  return { enrolled, skipped };
}
