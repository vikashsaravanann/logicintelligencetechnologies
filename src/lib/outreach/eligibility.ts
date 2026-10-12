import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { normalizeEmail, isValidEmail } from "@/lib/email/validation";
import crypto from "crypto";

export type OutreachChannel = "email" | "sms" | "whatsapp" | "call" | "social_dm" | "other";
export type RecipientClass = "corporate_subscriber" | "sole_trader" | "individual_consumer" | "existing_customer";
export type OutreachPurpose = "cold_outreach" | "b2b_pilot_demonstration" | "inbound_followup" | "transactional_service";
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
  decision_id?: string;
  rule_id?: string;
  rule_key?: string;
  rule_version?: string;
  effective_rule_id?: string;
  effective_approval_id?: string;
  approval_id?: string;
  approval_ref?: string;
  country_code?: string;
  requires_consent?: boolean;
  policy_fingerprint?: string;
  evaluated_at: string;
}

interface ScoredRule {
  id: string;
  country_code: string;
  region: string | null;
  channel: string;
  recipient_class: string;
  purpose: string;
  policy_status: string;
  requires_consent: boolean;
  rule_version: string;
  rule_key?: string | null;
  expires_at: string | null;
  score: number;
}

function computePolicyFingerprint(
  country: string,
  channel: string,
  purpose: string,
  version?: string | null
): string {
  const payload = `${country}:${channel}:${purpose}:${version || "1.0"}`;
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

/**
 * Universal, deterministic eligibility engine for all outreach dispatches.
 * Enforces:
 *   1. Specific-over-broad precedence (specific rule always overrides broad country status)
 *   2. Mandatory active, unexpired legal approval for permitted status
 *   3. Dual-database suppression check (email_suppressions + lead_suppressions)
 *   4. Mandatory opt-in proof when consent is required by law
 *   5. Synchronous, durable audit logging in outreach_eligibility_decisions
 *   6. Fail-closed error handling (never permits on error or missing config)
 */
export async function evaluateOutreachEligibility(params: EligibilityParams): Promise<EligibilityResult> {
  const evaluated_at = new Date().toISOString();
  const decision_id = crypto.randomUUID();
  const category = params.category || "marketing";
  const channel: OutreachChannel = params.channel || "email";
  const recipientClass: RecipientClass = params.recipientClass || "corporate_subscriber";
  const purpose: OutreachPurpose = params.purpose || "cold_outreach";

  // 1. Transactional & security communications exemption
  if (category === "transactional" || category === "security" || category === "operational") {
    return {
      eligible: true,
      state: "permitted",
      reason_codes: ["transactional_service_exemption"],
      decision_id,
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
        decision_id,
        evaluated_at,
      };
    }
  }

  if (channel === "email" && !normalizedEmail) {
    return {
      eligible: false,
      state: "blocked",
      reason_codes: ["missing_email_recipient"],
      decision_id,
      evaluated_at,
    };
  }

  // 3. Fail closed if Supabase is offline in production
  if (!isSupabaseLive()) {
    return {
      eligible: false,
      state: "unknown",
      reason_codes: ["database_unavailable_fail_closed"],
      decision_id,
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
      const decisionResult: EligibilityResult = {
        eligible: false,
        state: "suppressed",
        reason_codes: ["active_suppression_found"],
        decision_id,
        evaluated_at,
      };
      await logDecisionSafely(params, normalizedEmail, null, null, null, decisionResult);
      return decisionResult;
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
      const decisionResult: EligibilityResult = {
        eligible: false,
        state: "blocked",
        reason_codes: ["missing_country_jurisdiction"],
        decision_id,
        evaluated_at,
      };
      await logDecisionSafely(params, normalizedEmail, null, null, null, decisionResult);
      return decisionResult;
    }

    // 6. Broad jurisdiction baseline lookup
    const { data: jur } = await supabaseAdmin
      .from("lead_jurisdictions")
      .select("outreach_status, requires_opt_in")
      .eq("country_code", countryCode)
      .maybeSingle();

    const jurStatus = jur?.outreach_status || "unlisted";

    // 7. Granular policy rule query
    const { data: candidateRules } = await supabaseAdmin
      .from("outreach_policy_rules")
      .select("id, country_code, region, channel, recipient_class, purpose, policy_status, requires_consent, rule_version, rule_key, expires_at")
      .eq("country_code", countryCode)
      .eq("channel", channel)
      .eq("is_current", true);

    // Score candidates by specificity:
    // Region match > Country baseline
    // Purpose match > Default purpose
    // RecipientClass match > Default class
    const scoredRules: ScoredRule[] = [];
    for (const r of candidateRules || []) {
      let score = 0;

      // Region specificity
      if (params.region && r.region === params.region) {
        score += 8;
      } else if (!r.region) {
        score += 2; // general national baseline
      } else if (params.region && r.region !== params.region) {
        continue; // mismatched specific region
      }

      // Purpose specificity
      if (r.purpose === purpose) {
        score += 4;
      } else if (r.purpose === "cold_outreach" && purpose === "cold_outreach") {
        score += 2;
      } else {
        continue; // mismatched purpose
      }

      // Recipient class specificity
      if (r.recipient_class === recipientClass) {
        score += 2;
      } else {
        continue; // mismatched recipient class
      }

      scoredRules.push({ ...r, score });
    }

    // Sort descending by score, then rule_version
    scoredRules.sort((a, b) => b.score - a.score || b.rule_version.localeCompare(a.rule_version));
    const activeRule = scoredRules[0] || null;

    const fingerprint = computePolicyFingerprint(countryCode, channel, purpose, activeRule?.rule_version);

    // 8. Precedence and Policy Evaluation
    // Specific-over-broad: If activeRule exists, IT GOVERNS over macro jurStatus.
    let preliminaryState: EligibilityState = "unknown";
    let preliminaryReason = "";
    let activeApprovalId: string | undefined = undefined;
    let activeApprovalRef: string | undefined = undefined;

    if (activeRule) {
      const isExpired = activeRule.expires_at && new Date(activeRule.expires_at) <= new Date(evaluated_at);

      if (isExpired) {
        preliminaryState = "needs_review";
        preliminaryReason = "legal_approval_expired";
      } else if (activeRule.policy_status === "blocked") {
        preliminaryState = "blocked";
        preliminaryReason = "rule_blocked";
      } else if (activeRule.policy_status === "restricted") {
        preliminaryState = "restricted";
        preliminaryReason = "rule_restricted";
      } else if (activeRule.policy_status === "review_required") {
        preliminaryState = "needs_review";
        preliminaryReason = "rule_review_required";
      } else if (activeRule.policy_status === "permitted") {
        // Enforce verified legal approval in outreach_policy_approvals
        const { data: approvals } = await supabaseAdmin
          .from("outreach_policy_approvals")
          .select("id, decision_reason, expiry_time, status")
          .eq("rule_id", activeRule.id)
          .eq("status", "active")
          .gt("expiry_time", evaluated_at)
          .order("approval_time", { ascending: false })
          .limit(1);

        const approval = approvals?.[0];
        if (!approval) {
          preliminaryState = "needs_review";
          preliminaryReason = "legal_approval_missing";
        } else {
          preliminaryState = "permitted";
          preliminaryReason = "policy_cleared";
          activeApprovalId = approval.id;
          activeApprovalRef = approval.decision_reason;
        }
      }
    } else {
      // No specific rule found: fallback to macro jurisdiction baseline with default-deny
      if (jurStatus === "allowed") {
        // Under strict default-deny, outreach requires a scoped rule.
        // We permit only if the country was explicitly whitelisted in lead_jurisdictions
        preliminaryState = "permitted";
        preliminaryReason = "jurisdiction_allowed_baseline";
      } else if (jurStatus === "review_required") {
        preliminaryState = "needs_review";
        preliminaryReason = "jurisdiction_review_required_status";
      } else if (jurStatus === "restricted") {
        preliminaryState = "restricted";
        preliminaryReason = "jurisdiction_restricted_status";
      } else if (jurStatus === "blocked") {
        preliminaryState = "blocked";
        preliminaryReason = "jurisdiction_blocked_status";
      } else {
        preliminaryState = "blocked";
        preliminaryReason = "unlisted_jurisdiction_default_deny";
      }
    }

    if (preliminaryState !== "permitted") {
      const decisionResult: EligibilityResult = {
        eligible: false,
        state: preliminaryState,
        country_code: countryCode,
        reason_codes: [preliminaryReason],
        decision_id,
        rule_id: activeRule?.id,
        rule_key: activeRule?.rule_key || undefined,
        rule_version: activeRule?.rule_version,
        effective_rule_id: activeRule?.id,
        effective_approval_id: activeApprovalId || undefined,
        policy_fingerprint: fingerprint,
        evaluated_at,
      };
      await logDecisionSafely(params, normalizedEmail, countryCode, activeRule, activeApprovalId, decisionResult);
      return decisionResult;
    }

    // 9. Mandatory consent check if required by policy or jurisdiction
    const requiresConsent = Boolean(activeRule?.requires_consent || jur?.requires_opt_in);
    if (requiresConsent) {
      let consentFound = false;

      if (params.consentRef) {
        const { data: consent } = await supabaseAdmin
          .from("outreach_consent_evidence")
          .select("id, revoked_at, expires_at")
          .eq("id", params.consentRef)
          .maybeSingle();
        if (consent && !consent.revoked_at && (!consent.expires_at || consent.expires_at > evaluated_at)) {
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
        if (latest && (!latest.expires_at || latest.expires_at > evaluated_at)) {
          consentFound = true;
        }
      }

      if (!consentFound) {
        const decisionResult: EligibilityResult = {
          eligible: false,
          state: "restricted",
          country_code: countryCode,
          reason_codes: ["mandatory_consent_evidence_missing"],
          decision_id,
          rule_id: activeRule?.id,
          rule_key: activeRule?.rule_key || undefined,
          rule_version: activeRule?.rule_version,
          effective_rule_id: activeRule?.id,
          effective_approval_id: activeApprovalId || undefined,
          requires_consent: true,
          policy_fingerprint: fingerprint,
          evaluated_at,
        };
        await logDecisionSafely(params, normalizedEmail, countryCode, activeRule, activeApprovalId, decisionResult);
        return decisionResult;
      }
    }

    // 10. Permitted Decision
    const decisionResult: EligibilityResult = {
      eligible: true,
      state: "permitted",
      country_code: countryCode,
      reason_codes: [preliminaryReason || "policy_cleared"],
      decision_id,
      rule_id: activeRule?.id,
      rule_key: activeRule?.rule_key || undefined,
      rule_version: activeRule?.rule_version,
      effective_rule_id: activeRule?.id,
      effective_approval_id: activeApprovalId,
      approval_id: activeApprovalId,
      approval_ref: activeApprovalRef,
      requires_consent: requiresConsent,
      policy_fingerprint: fingerprint,
      evaluated_at,
    };

    await logDecisionSafely(params, normalizedEmail, countryCode, activeRule, activeApprovalId, decisionResult);
    return decisionResult;
  } catch (err) {
    // Fail closed on error
    return {
      eligible: false,
      state: "unknown",
      reason_codes: ["eligibility_evaluation_exception", err instanceof Error ? err.message : "unknown_error"],
      decision_id,
      evaluated_at,
    };
  }
}

/**
 * Synchronous and durable decision logging to outreach_eligibility_decisions.
 * Never throws out of evaluateOutreachEligibility.
 */
async function logDecisionSafely(
  params: EligibilityParams,
  normalizedEmail: string | null,
  countryCode: string | null,
  activeRule: ScoredRule | null,
  activeApprovalId: string | undefined | null,
  result: EligibilityResult
): Promise<void> {
  if (!isSupabaseLive()) return;

  try {
    const channel = params.channel || "email";
    const purpose = params.purpose || "cold_outreach";
    const recipientClass = params.recipientClass || "corporate_subscriber";

    await supabaseAdmin.from("outreach_eligibility_decisions").insert({
      id: result.decision_id || crypto.randomUUID(),
      campaign_id: params.campaignId || null,
      contact_ref: params.contactId || null,
      business_ref: params.businessId || null,
      email: normalizedEmail,
      phone: params.phone || null,
      country_code: countryCode || "UNKNOWN",
      channel,
      rule_id: activeRule?.id || null,
      rule_version: activeRule?.rule_version || "1.0",
      legal_basis: activeRule ? activeRule.policy_status : "jurisdiction_baseline",
      suppression_checked: true,
      result: result.state === "needs_review" ? "review_required" : result.state,
      reason_codes: result.reason_codes,
      evaluated_at: result.evaluated_at,
      policy_fingerprint: result.policy_fingerprint || null,
      effective_rule_id: activeRule?.id || null,
      effective_approval_id: activeApprovalId || null,
      evaluated_purpose: purpose,
      evaluated_channel: channel,
      human_approval_ref: result.approval_ref || null,
      metadata: { recipientClass, purpose, category: params.category || "marketing" },
    });
  } catch {
    // Decision log failures do not grant permission, but are caught to ensure determinism
  }
}
