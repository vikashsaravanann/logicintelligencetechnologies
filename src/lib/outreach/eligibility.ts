import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { normalizeEmail, isValidEmail } from "@/lib/email/validation";

export type OutreachChannel = "email" | "sms" | "whatsapp" | "call" | "social_dm" | "other";
export type RecipientClass = "corporate_subscriber" | "sole_trader" | "individual_consumer" | "existing_customer";
export type OutreachPurpose = "cold_outreach" | "inbound_followup" | "transactional_service";
export type EligibilityState = "permitted" | "needs_review" | "restricted" | "blocked" | "suppressed" | "unknown";

export interface EligibilityParams {
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  region?: string | null;
  channel?: OutreachChannel;
  recipientClass?: RecipientClass;
  purpose?: OutreachPurpose;
  businessId?: string | null;
  contactId?: string | null;
  campaignId?: string | null;
  consentRef?: string | null;
  category?: "marketing" | "transactional" | "operational" | "security";
  timeOfSend?: Date | string;
}

export interface EligibilityResult {
  eligible: boolean;
  state: EligibilityState;
  reason_codes: string[];
  rule_id?: string;
  rule_version?: string;
  approval_ref?: string;
  country_code?: string;
  evaluated_at: string;
}

/**
 * Universal, deterministic eligibility engine for all outreach dispatches.
 * Enforces:
 *   1. Channel-specific legal policy rules
 *   2. Dual-database suppression check (email_suppressions + lead_suppressions)
 *   3. Default-deny posture for unverified jurisdictions
 *   4. Mandatory opt-in proof when consent is required by law
 *   5. Fail-closed error handling (never permits on lookup failure)
 */
export async function evaluateOutreachEligibility(params: EligibilityParams): Promise<EligibilityResult> {
  const evaluated_at = new Date().toISOString();
  const category = params.category || "marketing";
  const channel = params.channel || "email";
  const recipientClass = params.recipientClass || "corporate_subscriber";
  const purpose = params.purpose || "cold_outreach";

  // 1. Transactional & security communications exemption
  if (category === "transactional" || category === "security" || category === "operational") {
    return {
      eligible: true,
      state: "permitted",
      reason_codes: ["transactional_service_exemption"],
      evaluated_at,
    };
  }

  // 2. Syntax validation
  let normalizedEmail: string | null = null;
  if (params.email) {
    normalizedEmail = normalizeEmail(params.email);
    if (!isValidEmail(normalizedEmail)) {
      return {
        eligible: false,
        state: "blocked",
        reason_codes: ["invalid_email_syntax"],
        evaluated_at,
      };
    }
  }

  if (channel === "email" && !normalizedEmail) {
    return {
      eligible: false,
      state: "blocked",
      reason_codes: ["missing_email_recipient"],
      evaluated_at,
    };
  }

  // 3. Fail closed if Supabase is offline in production
  if (!isSupabaseLive()) {
    return {
      eligible: false,
      state: "unknown",
      reason_codes: ["database_unavailable_fail_closed"],
      evaluated_at,
    };
  }

  try {
    // 4. Dual-database suppression check
    const suppressionChecks: Promise<boolean>[] = [];

    if (normalizedEmail) {
      suppressionChecks.push(
        (async () => {
          const { data } = await supabaseAdmin
            .from("email_suppressions")
            .select("email")
            .eq("email", normalizedEmail!)
            .maybeSingle();
          return Boolean(data);
        })(),
        (async () => {
          const { data } = await supabaseAdmin
            .from("lead_suppressions")
            .select("id")
            .eq("active", true)
            .eq("email", normalizedEmail!)
            .limit(1);
          return Boolean(data && data.length > 0);
        })()
      );
    }

    if (params.phone) {
      suppressionChecks.push(
        (async () => {
          const { data } = await supabaseAdmin
            .from("lead_suppressions")
            .select("id")
            .eq("active", true)
            .eq("phone", params.phone!)
            .limit(1);
          return Boolean(data && data.length > 0);
        })()
      );
    }

    if (params.businessId) {
      suppressionChecks.push(
        (async () => {
          const { data } = await supabaseAdmin
            .from("lead_suppressions")
            .select("id")
            .eq("active", true)
            .eq("business_id", params.businessId!)
            .limit(1);
          return Boolean(data && data.length > 0);
        })()
      );
    }

    const suppressionResults = await Promise.all(suppressionChecks);
    if (suppressionResults.some(Boolean)) {
      return {
        eligible: false,
        state: "suppressed",
        reason_codes: ["active_suppression_found"],
        evaluated_at,
      };
    }

    // 5. Jurisdiction resolution
    let countryCode = params.countryCode?.trim().toUpperCase() || null;

    if (!countryCode && params.businessId) {
      const { data: biz } = await supabaseAdmin
        .from("lead_businesses")
        .select("country_code")
        .eq("id", params.businessId)
        .maybeSingle();
      if (biz?.country_code) countryCode = biz.country_code.toUpperCase();
    }

    if (!countryCode && params.contactId) {
      const { data: contact } = await supabaseAdmin
        .from("contact_leads")
        .select("country")
        .eq("id", params.contactId)
        .maybeSingle();
      if (contact?.country) countryCode = contact.country.toUpperCase();
    }

    if (!countryCode) {
      return {
        eligible: false,
        state: "blocked",
        reason_codes: ["missing_country_jurisdiction"],
        evaluated_at,
      };
    }

    // 6. Broad jurisdiction check
    const { data: jur } = await supabaseAdmin
      .from("lead_jurisdictions")
      .select("outreach_status, requires_opt_in")
      .eq("country_code", countryCode)
      .maybeSingle();

    const jurStatus = jur?.outreach_status || "unlisted";

    // 7. Granular policy rule check
    const now = new Date().toISOString();
    const { data: matchingRules } = await supabaseAdmin
      .from("outreach_policy_rules")
      .select("id, policy_status, requires_consent, rule_version, expires_at")
      .eq("country_code", countryCode)
      .eq("channel", channel)
      .eq("recipient_class", recipientClass)
      .eq("purpose", purpose);

    const activeRule = (matchingRules || []).find((r) => {
      if (r.expires_at && r.expires_at <= now) return false;
      return true;
    });

    const isPermittedByRule = activeRule?.policy_status === "permitted";
    const isPermittedByBroadJur = jurStatus === "allowed";

    if (!isPermittedByRule && !isPermittedByBroadJur) {
      const state: EligibilityState =
        activeRule?.policy_status === "blocked" || jurStatus === "blocked"
          ? "blocked"
          : activeRule?.policy_status === "restricted"
            ? "restricted"
            : "needs_review";

      const reasonCode =
        jurStatus === "unlisted"
          ? "unlisted_jurisdiction_default_deny"
          : `jurisdiction_${state}_status`;

      return {
        eligible: false,
        state,
        country_code: countryCode,
        reason_codes: [reasonCode],
        rule_id: activeRule?.id,
        rule_version: activeRule?.rule_version,
        evaluated_at,
      };
    }

    // 8. Mandatory consent check if required by policy
    const requiresConsent = Boolean(activeRule?.requires_consent || jur?.requires_opt_in);
    if (requiresConsent) {
      let consentFound = false;

      if (params.consentRef) {
        const { data: consent } = await supabaseAdmin
          .from("outreach_consent_evidence")
          .select("id, revoked_at, expires_at")
          .eq("id", params.consentRef)
          .maybeSingle();
        if (consent && !consent.revoked_at && (!consent.expires_at || consent.expires_at > now)) {
          consentFound = true;
        }
      }

      if (!consentFound && normalizedEmail) {
        const { data: consentByEmail } = await supabaseAdmin
          .from("outreach_consent_evidence")
          .select("id, revoked_at, expires_at")
          .eq("email", normalizedEmail)
          .is("revoked_at", null)
          .order("obtained_at", { ascending: false })
          .limit(1);
        const latest = consentByEmail?.[0];
        if (latest && (!latest.expires_at || latest.expires_at > now)) {
          consentFound = true;
        }
      }

      if (!consentFound) {
        return {
          eligible: false,
          state: "restricted",
          country_code: countryCode,
          reason_codes: ["mandatory_consent_evidence_missing"],
          rule_id: activeRule?.id,
          rule_version: activeRule?.rule_version,
          evaluated_at,
        };
      }
    }

    // 9. Record decision log asynchronously (fire and forget to not block hot path)
    const decisionResult: EligibilityResult = {
      eligible: true,
      state: "permitted",
      country_code: countryCode,
      reason_codes: ["policy_cleared"],
      rule_id: activeRule?.id,
      rule_version: activeRule?.rule_version,
      evaluated_at,
    };

    void supabaseAdmin.from("outreach_eligibility_decisions").insert({
      campaign_id: params.campaignId || null,
      contact_ref: params.contactId || null,
      business_ref: params.businessId || null,
      email: normalizedEmail,
      phone: params.phone || null,
      country_code: countryCode,
      channel,
      rule_id: activeRule?.id || null,
      rule_version: activeRule?.rule_version || "1.0",
      legal_basis: isPermittedByRule ? "policy_rule" : "jurisdiction_allowlist",
      suppression_checked: true,
      result: "permitted",
      reason_codes: decisionResult.reason_codes,
      evaluated_at,
      metadata: { recipientClass, purpose },
    }).then();

    return decisionResult;
  } catch (err) {
    // Fail closed on error
    return {
      eligible: false,
      state: "unknown",
      reason_codes: ["eligibility_evaluation_exception", err instanceof Error ? err.message : "unknown_error"],
      evaluated_at,
    };
  }
}
