"use server";

import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface LegalApprovalInput {
  ruleId: string;
  reviewerEmail: string;
  reviewerRole: "legal_counsel" | "compliance_officer" | "external_counsel" | "dpo";
  qualification: string;
  decisionReason: string;
  expiryDays?: number;
  evidenceUri?: string;
  evidenceHash?: string;
  scopeLimitations?: Record<string, unknown>;
  dualSignoffBy?: string;
}

export interface RevokeApprovalInput {
  approvalId: string;
  revokedBy: string;
  reason: string;
}

export interface ConsentEvidenceInput {
  email?: string | null;
  phone?: string | null;
  channel?: "email" | "sms" | "whatsapp" | "call";
  purpose?: string;
  scope?: string;
  consentType: "express" | "inferred" | "implied" | "soft_opt_in";
  source: string;
  proofRef?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresDays?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Server action to record human legal approval for a scoped policy rule.
 * Strict rules:
 *   - Human reviewer credentials and qualifications required
 *   - Expiry strictly capped at 180 days maximum
 *   - Immutable audit trail in outreach_policy_approvals
 */
export async function recordLegalPolicyApproval(input: LegalApprovalInput) {
  const session = await requireCapabilityAction("outreach.manage", "outreach.legal_approval");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  if (!input.ruleId || !input.reviewerEmail || !input.qualification || !input.decisionReason) {
    throw new Error("Missing required fields: ruleId, reviewerEmail, qualification, and decisionReason are mandatory.");
  }

  // Strictly enforce max 180-day review cycle
  const maxDays = 180;
  const requestedDays = input.expiryDays && input.expiryDays > 0 ? input.expiryDays : 180;
  const days = Math.min(requestedDays, maxDays);

  const now = new Date();
  const expiryTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // 1. Verify rule exists
  const { data: rule, error: ruleErr } = await supabaseAdmin
    .from("outreach_policy_rules")
    .select("id, country_code, channel, purpose")
    .eq("id", input.ruleId)
    .single();

  if (ruleErr || !rule) {
    throw new Error("Target policy rule not found.");
  }

  // 2. Insert immutable approval audit record
  const { data: approval, error: appErr } = await supabaseAdmin
    .from("outreach_policy_approvals")
    .insert({
      rule_id: rule.id,
      reviewer_user_id: session.userId,
      reviewer_email: input.reviewerEmail.trim().toLowerCase(),
      reviewer_role: input.reviewerRole,
      qualification_or_authority: input.qualification.trim(),
      reviewer_qualification: input.qualification.trim(),
      decision_reason: input.decisionReason.trim(),
      evidence_uri: input.evidenceUri?.trim() || null,
      evidence_hash: input.evidenceHash?.trim() || null,
      scope_limitations: input.scopeLimitations || {},
      dual_signoff_by: input.dualSignoffBy?.trim() || null,
      dual_signoff_at: input.dualSignoffBy ? now.toISOString() : null,
      status: "active",
      approval_time: now.toISOString(),
      expiry_time: expiryTime.toISOString(),
    })
    .select("id, expiry_time")
    .single();

  if (appErr || !approval) {
    throw new Error(`Failed to record approval in database: ${appErr?.message}`);
  }

  // 3. Update rule status to permitted with authoritative expiry time
  const { error: updateErr } = await supabaseAdmin
    .from("outreach_policy_rules")
    .update({
      policy_status: "permitted",
      expires_at: approval.expiry_time,
      updated_at: now.toISOString(),
    })
    .eq("id", rule.id);

  if (updateErr) {
    throw new Error(`Failed to update policy rule: ${updateErr.message}`);
  }

  await recordAdminAction({
    actor,
    action: "outreach.legal_approval",
    capability: "outreach.manage",
    target: { type: "outreach_policy_approval", id: approval.id },
    outcome: "succeeded",
    metadata: { ruleId: rule.id, reviewerRole: input.reviewerRole, reviewerEmail: input.reviewerEmail, expiryDays: days },
  });

  revalidatePath("/admin/outreach/compliance");
  return { ok: true, approvalId: approval.id, expiresAt: approval.expiry_time };
}

/**
 * Server action to revoke an active legal approval, immediately flipping policy back to review_required.
 */
export async function revokeLegalPolicyApproval(input: RevokeApprovalInput) {
  const session = await requireCapabilityAction("outreach.manage", "outreach.revoke_approval");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  if (!input.approvalId || !input.reason) {
    throw new Error("Missing approvalId or revocation reason.");
  }

  const now = new Date().toISOString();

  // 1. Fetch approval
  const { data: approval, error: fetchErr } = await supabaseAdmin
    .from("outreach_policy_approvals")
    .select("id, rule_id, status")
    .eq("id", input.approvalId)
    .single();

  if (fetchErr || !approval) {
    throw new Error("Target approval not found.");
  }

  // 2. Mark approval revoked
  const { error: appUpdateErr } = await supabaseAdmin
    .from("outreach_policy_approvals")
    .update({
      status: "revoked",
    })
    .eq("id", input.approvalId);

  if (appUpdateErr) {
    throw new Error(`Failed to revoke approval: ${appUpdateErr.message}`);
  }

  // 3. Revert rule status to review_required and expire rule immediately
  const { error: ruleUpdateErr } = await supabaseAdmin
    .from("outreach_policy_rules")
    .update({
      policy_status: "review_required",
      expires_at: now,
      updated_at: now,
    })
    .eq("id", approval.rule_id);

  if (ruleUpdateErr) {
    throw new Error(`Failed to revert policy rule status: ${ruleUpdateErr.message}`);
  }

  await recordAdminAction({
    actor,
    action: "outreach.revoke_approval",
    capability: "outreach.manage",
    target: { type: "outreach_policy_approval", id: input.approvalId },
    outcome: "succeeded",
    metadata: { ruleId: approval.rule_id, reason: input.reason },
  });

  revalidatePath("/admin/outreach/compliance");
  return { ok: true, ruleId: approval.rule_id, revokedBy: session.email || input.revokedBy };
}

/**
 * Server action to record verified consent evidence.
 */
export async function recordConsentEvidence(input: ConsentEvidenceInput) {
  const session = await requireCapabilityAction("outreach.manage", "outreach.record_consent");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  if (!input.email && !input.phone) {
    throw new Error("At least an email address or phone number is required for consent evidence.");
  }

  const now = new Date();
  let expiresAt: string | null = null;
  if (input.expiresDays && input.expiresDays > 0) {
    expiresAt = new Date(now.getTime() + input.expiresDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("outreach_consent_evidence")
    .insert({
      email: input.email ? input.email.trim().toLowerCase() : null,
      phone: input.phone ? input.phone.trim() : null,
      channel: input.channel || "email",
      purpose: input.purpose || "cold_outreach",
      scope: input.scope || "commercial",
      consent_type: input.consentType,
      source: input.source,
      proof_ref: input.proofRef || null,
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
      obtained_at: now.toISOString(),
      expires_at: expiresAt,
      metadata: input.metadata || {},
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to record consent evidence: ${error?.message}`);
  }

  await recordAdminAction({
    actor,
    action: "outreach.record_consent",
    capability: "outreach.manage",
    target: { type: "outreach_consent_evidence", id: data.id },
    outcome: "succeeded",
    metadata: { email: input.email, consentType: input.consentType, source: input.source },
  });

  revalidatePath("/admin/outreach/compliance");
  return { ok: true, evidenceId: data.id };
}
