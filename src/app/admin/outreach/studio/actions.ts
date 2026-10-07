"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudioLead, saveMessageVersion } from "@/lib/outreach/intelligence/store";
import { generateOutreachMessage, type GenerateResult } from "@/lib/outreach/intelligence/generate";
import { OPPORTUNITY_TYPES, OUTREACH_CHANNELS, OUTREACH_TONES } from "@/lib/outreach/intelligence/message-schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StudioGenerateResult {
  ok: boolean;
  message: string;
  status?: GenerateResult["status"];
  savedId?: string;
  draft?: GenerateResult["output"];
  gates?: GenerateResult["gates"];
  score?: GenerateResult["score"];
  blockersPass?: boolean;
  complianceReason?: string;
}

/**
 * Generate a first-contact draft for a verified lead. AI runs server-side.
 * Refuses when the lead is not compliance-cleared or has no verified evidence —
 * no fabrication, and nothing is ever auto-sent.
 */
export async function generateDraft(formData: FormData): Promise<StudioGenerateResult> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.generate");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const businessId = String(formData.get("businessId") ?? "");
  const channelRaw = String(formData.get("channel") ?? "email");
  const toneRaw = String(formData.get("tone") ?? "professional");
  const channel = (OUTREACH_CHANNELS as readonly string[]).includes(channelRaw) ? channelRaw : "email";
  const tone = (OUTREACH_TONES as readonly string[]).includes(toneRaw) ? toneRaw : "professional";

  if (!UUID.test(businessId)) return { ok: false, message: "Invalid lead." };

  const lead = await getStudioLead(businessId);
  if (!lead) return { ok: false, message: "Lead not found." };

  const openOpp = lead.opportunities.find((o) => (o.status as string) === "open") ?? lead.opportunities[0];
  const opportunityType = openOpp?.opportunity_type as string | undefined;
  if (!opportunityType || !(OPPORTUNITY_TYPES as readonly string[]).includes(opportunityType)) {
    return { ok: false, message: "This lead has no classified opportunity to write from." };
  }
  if (lead.evidence.length === 0) {
    return { ok: false, status: "insufficient_evidence", message: "No verified evidence on this lead yet — enrich it before drafting." };
  }

  // Duplication check: a recent message to the same business.
  const { data: recent } = await supabaseAdmin
    .from("lead_outreach_messages")
    .select("id")
    .eq("business_id", businessId)
    .gte("generated_at", new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString())
    .limit(1);
  const noRecentDuplicate = !(recent && recent.length);

  const input = {
    company_name: lead.business.company_name as string,
    industry: (lead.business.industry as string) ?? undefined,
    city: (lead.business.city as string) ?? undefined,
    country_code: (lead.business.country_code as string) ?? undefined,
    official_website: (lead.business.domain as string) ? `https://${lead.business.domain}` : undefined,
    opportunity_type: opportunityType,
    channel,
    tone,
    evidence: lead.evidence,
  };

  const result = await generateOutreachMessage(input, {
    complianceCleared: lead.compliance.cleared,
    noRecentDuplicate,
  });

  let savedId: string | undefined;
  if (result.status === "ok" && result.output) {
    savedId =
      (await saveMessageVersion({
        businessId,
        channel,
        opportunityType,
        output: result.output,
        gates: result.gates ?? [],
        score: result.score ?? null,
        blockersPass: Boolean(result.blockersPass),
        provider: result.provider ?? null,
        model: result.model ?? null,
        generatedBy: session.email,
      })) ?? undefined;
  }

  await recordAdminAction({
    actor,
    action: "outreach.generate",
    capability: "outreach.manage",
    target: { type: "lead_business", id: businessId },
    outcome: result.status === "ok" ? "succeeded" : "failed",
    metadata: { status: result.status, savedId: savedId ?? null, blockersPass: result.blockersPass ?? false },
  });

  revalidatePath(`/admin/outreach/studio`);
  return {
    ok: result.status === "ok",
    status: result.status,
    message: result.message,
    savedId,
    draft: result.output,
    gates: result.gates,
    score: result.score,
    blockersPass: result.blockersPass,
    complianceReason: lead.compliance.reason,
  };
}

/** Human approval gate: only a message that passed every blocker may be approved. */
export async function approveDraft(messageId: string): Promise<{ ok: boolean; message: string }> {
  const session = await requireCapabilityAction("outreach.manage", "outreach.approve");
  const actor = { userId: session.userId, email: session.email, role: session.role };
  if (!UUID.test(messageId)) return { ok: false, message: "Invalid message." };

  const { data: msg } = await supabaseAdmin
    .from("lead_outreach_messages")
    .select("id, blockers_pass, status")
    .eq("id", messageId)
    .maybeSingle();
  if (!msg) return { ok: false, message: "Message not found." };
  if (!msg.blockers_pass) {
    await recordAdminAction({ actor, action: "outreach.approve", capability: "outreach.manage", target: { type: "outreach_message", id: messageId }, outcome: "denied", metadata: { reason: "blockers_failed" } });
    return { ok: false, message: "This draft has not passed all QA blocker gates and cannot be approved." };
  }

  const { error } = await supabaseAdmin
    .from("lead_outreach_messages")
    .update({ status: "approved", approved_by: session.email, approved_at: new Date().toISOString(), reviewed_by: session.email, reviewed_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("blockers_pass", true)
    .in("status", ["draft", "needs_review"]);

  await recordAdminAction({ actor, action: "outreach.approve", capability: "outreach.manage", target: { type: "outreach_message", id: messageId }, outcome: error ? "failed" : "succeeded" });
  if (error) return { ok: false, message: "Could not approve the message." };
  revalidatePath("/admin/outreach/studio");
  return { ok: true, message: "Message approved. It will not send automatically — dispatch stays a separate, controlled step." };
}
