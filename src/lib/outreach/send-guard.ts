import { isValidEmail, normalizeEmail } from "@/lib/email/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { evaluateOutreachEligibility } from "./eligibility";
import { STOP_LIFECYCLE_STAGES, type LeadLifecycleStage } from "./types";

export type SendGuardResult =
  | { ok: true; email: string; countryCode?: string }
  | { ok: false; reason: string };

const DEFAULT_COOLDOWN_HOURS = 48;

/**
 * Universal marketing send guard — all outreach marketing must pass here.
 * Connects directly to evaluateOutreachEligibility() to enforce legal policies.
 */
export async function marketingSendGuard(params: {
  email: string;
  leadId?: string | null;
  countryCode?: string | null;
  cooldownHours?: number;
  campaignId?: string | null;
}): Promise<SendGuardResult> {
  const email = normalizeEmail(params.email);
  if (!isValidEmail(email)) {
    return { ok: false, reason: "invalid_email" };
  }

  let resolvedCountry = params.countryCode || null;

  if (isSupabaseLive()) {
    try {
      let query = supabaseAdmin
        .from("contact_leads")
        .select(
          "id, lifecycle_stage, communication_status, last_contacted_at, pipeline_stage, country"
        )
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (params.leadId) {
        query = supabaseAdmin
          .from("contact_leads")
          .select(
            "id, lifecycle_stage, communication_status, last_contacted_at, pipeline_stage, country"
          )
          .eq("id", params.leadId)
          .limit(1);
      }

      const { data } = await query.maybeSingle();
      if (data) {
        if (!resolvedCountry && data.country) {
          resolvedCountry = data.country;
        }

        const stage = String(
          data.lifecycle_stage || data.pipeline_stage || "NEW"
        ).toUpperCase() as LeadLifecycleStage;
        if (STOP_LIFECYCLE_STAGES.includes(stage)) {
          return { ok: false, reason: `lifecycle_${stage.toLowerCase()}` };
        }
        const status = String(data.communication_status || "").toUpperCase();
        if (
          status === "BOUNCED" ||
          status === "COMPLAINT" ||
          status === "UNSUBSCRIBED" ||
          status === "SUPPRESSED"
        ) {
          return { ok: false, reason: `comm_${status.toLowerCase()}` };
        }
        if (data.last_contacted_at) {
          const hours =
            (Date.now() - new Date(data.last_contacted_at).getTime()) /
            (1000 * 60 * 60);
          const cooldown = params.cooldownHours ?? DEFAULT_COOLDOWN_HOURS;
          if (hours < cooldown) {
            return { ok: false, reason: "cooldown" };
          }
        }
      }
    } catch {
      return { ok: false, reason: "lead_lookup_failed" };
    }
  }

  // Centralized policy evaluation (jurisdiction + legal basis + suppression)
  const eligibility = await evaluateOutreachEligibility({
    email,
    contactId: params.leadId,
    countryCode: resolvedCountry,
    channel: "email",
    campaignId: params.campaignId,
    category: "marketing",
  });

  if (!eligibility.eligible) {
    const primaryReason = eligibility.reason_codes[0] || eligibility.state;
    return { ok: false, reason: `compliance_${primaryReason}` };
  }

  return { ok: true, email, countryCode: eligibility.country_code };
}
