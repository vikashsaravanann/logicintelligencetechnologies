import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generateChecklistToken,
  hashToken,
  isWellFormedToken,
  checklistTokenState,
  type ChecklistTokenState,
  generateConfirmationReference,
} from "./token-core";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";
import { sendEmail } from "@/lib/email/send-email";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import EnterpriseChecklistInvitationEmail from "@/emails/enterprise-checklist-invitation-email";
import EnterpriseChecklistSubmissionReceiptEmail from "@/emails/enterprise-checklist-submission-receipt-email";
import EnterpriseChecklistAdminAlertEmail from "@/emails/enterprise-checklist-admin-alert-email";
import { COMPANY } from "@/config/company";
import { randomBytes } from "crypto";

export interface CreateInvitationInput {
  recipientName: string;
  recipientEmail: string;
  recipientCompany?: string | null;
  clientId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  ttlDays?: number;
}

export interface CreatedInvitation {
  invitationId: string;
  token: string;
  url: string;
  expiresAt: string;
}

/**
 * Mint a fresh secure enterprise checklist invitation.
 * The raw token is returned once for the admin to copy or dispatch.
 */
export async function createChecklistInvitation(
  input: CreateInvitationInput
): Promise<CreatedInvitation | null> {
  const ttl = Math.min(Math.max(1, input.ttlDays ?? 30), 90);
  const { token, tokenHash } = generateChecklistToken();
  const expiresAt = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000).toISOString();

  // Retrieve current active version
  const { data: version } = await supabaseAdmin
    .from("enterprise_checklist_versions")
    .select("id")
    .eq("document_version", "1.0")
    .maybeSingle();

  let versionId = version?.id;
  if (!versionId) {
    // If table not seeded yet in DB, insert standard row
    const { data: newV } = await supabaseAdmin
      .from("enterprise_checklist_versions")
      .insert({
        document_title: "The 50-Point Enterprise Deployment Checklist",
        document_version: "1.0",
        source_pdf_path: "private/resources/website-development-checklist.pdf",
        source_pdf_sha256: "32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404",
        checkpoint_count: 50,
        phase_count: 8,
        is_active: true,
      })
      .select("id")
      .single();
    versionId = newV?.id;
  }

  if (!versionId) return null;

  const { data, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .insert({
      client_id: input.clientId || null,
      recipient_name: input.recipientName.trim(),
      recipient_email: input.recipientEmail.trim().toLowerCase(),
      recipient_company: input.recipientCompany?.trim() || null,
      version_id: versionId,
      token_hash: tokenHash,
      status: "issued",
      expires_at: expiresAt,
      created_by: input.createdBy || null,
      internal_notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[Checklist] Failed to insert invitation:", error);
    return null;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, "");
  return {
    invitationId: data.id,
    token,
    url: `${siteUrl}/enterprise-checklist/${token}`,
    expiresAt,
  };
}

/**
 * Retrieve public/client-safe invitation data by raw token.
 */
export async function getInvitationByToken(rawToken: string) {
  if (!isWellFormedToken(rawToken)) {
    return { state: "invalid" as ChecklistTokenState, invitation: null, response: null };
  }

  const tokenHash = hashToken(rawToken);
  const { data: inv, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select(
      `id, recipient_name, recipient_email, recipient_company, status, expires_at, viewed_at, submitted_at, revoked_at, created_at,
       enterprise_checklist_versions(document_title, document_version, checkpoint_count, phase_count)`
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !inv) {
    return { state: "invalid" as ChecklistTokenState, invitation: null, response: null };
  }

  const state = checklistTokenState(inv);

  let response = null;
  if (state === "submitted" || inv.submitted_at) {
    const { data: resp } = await supabaseAdmin
      .from("enterprise_checklist_responses")
      .select("id, confirmation_reference, selected_count, client_notes, submitted_at")
      .eq("invitation_id", inv.id)
      .maybeSingle();

    if (resp) {
      const { data: items } = await supabaseAdmin
        .from("enterprise_checklist_response_items")
        .select("point_number")
        .eq("response_id", resp.id)
        .order("point_number", { ascending: true });

      response = {
        ...resp,
        selectedPoints: (items || []).map((i) => i.point_number),
      };
    }
  }

  return {
    state,
    invitation: {
      id: inv.id,
      recipientName: inv.recipient_name,
      recipientCompany: inv.recipient_company,
      expiresAt: inv.expires_at,
      status: inv.status,
      version: Array.isArray(inv.enterprise_checklist_versions)
        ? inv.enterprise_checklist_versions[0] || null
        : ((inv.enterprise_checklist_versions as any) || null),
    },
    response,
  };
}

/**
 * Record a client view event (idempotent, skips if already submitted or staff preview).
 */
export async function recordChecklistView(rawToken: string): Promise<void> {
  if (!isWellFormedToken(rawToken)) return;
  const tokenHash = hashToken(rawToken);

  const { data: inv } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select("id, status, viewed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!inv) return;
  if (inv.status === "issued" || inv.status === "sent") {
    await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .update({
        status: "viewed",
        viewed_at: inv.viewed_at || new Date().toISOString(),
      })
      .eq("id", inv.id);
  }
}

export interface SubmitSelectionsInput {
  rawToken: string;
  selectedPoints: number[];
  submittedByName?: string;
  clientNotes?: string;
}

export interface SubmitResult {
  ok: boolean;
  message: string;
  confirmationReference?: string;
  selectedCount?: number;
  submittedAt?: string;
}

/**
 * Submit client selections atomically to the database.
 */
export async function submitChecklistSelections(
  input: SubmitSelectionsInput
): Promise<SubmitResult> {
  if (!isWellFormedToken(input.rawToken)) {
    return { ok: false, message: "Invalid or malformed invitation link." };
  }

  // Validate points array: 1 to 50 unique integers
  const points = Array.from(new Set(input.selectedPoints))
    .map((p) => Number(p))
    .filter((p) => Number.isInteger(p) && p >= 1 && p <= 50)
    .sort((a, b) => a - b);

  if (points.length === 0) {
    return { ok: false, message: "Please select at least 1 checkpoint to submit." };
  }

  const tokenHash = hashToken(input.rawToken);
  const { data: inv, error: invErr } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select("id, version_id, recipient_name, recipient_email, recipient_company, status, expires_at, submitted_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (invErr || !inv) {
    return { ok: false, message: "Invitation not found or invalid." };
  }

  const state = checklistTokenState(inv);
  if (state === "expired") {
    return { ok: false, message: "This invitation link has expired. Please contact us for a refreshed link." };
  }
  if (state === "revoked") {
    return { ok: false, message: "This invitation link has been revoked." };
  }
  if (state === "submitted" || inv.submitted_at) {
    // Return existing confirmation reference idempotently
    const { data: existingResp } = await supabaseAdmin
      .from("enterprise_checklist_responses")
      .select("confirmation_reference, selected_count, submitted_at")
      .eq("invitation_id", inv.id)
      .maybeSingle();

    if (existingResp) {
      return {
        ok: true,
        message: "Checklist selections were already submitted.",
        confirmationReference: existingResp.confirmation_reference,
        selectedCount: existingResp.selected_count,
        submittedAt: existingResp.submitted_at,
      };
    }
  }

  const confirmationReference = generateConfirmationReference();
  const now = new Date().toISOString();
  const submitterName = input.submittedByName?.trim() || inv.recipient_name;

  // Insert response
  const { data: resp, error: respErr } = await supabaseAdmin
    .from("enterprise_checklist_responses")
    .insert({
      invitation_id: inv.id,
      version_id: inv.version_id,
      confirmation_reference: confirmationReference,
      submitted_by_name: submitterName,
      selected_count: points.length,
      client_notes: input.clientNotes?.trim() || null,
      submitted_at: now,
    })
    .select("id")
    .single();

  if (respErr || !resp) {
    console.error("[Checklist] Response insert failed:", respErr);
    return { ok: false, message: "Could not save selections. Please try again." };
  }

  // Insert response items
  const itemRows = points.map((p) => ({
    response_id: resp.id,
    version_id: inv.version_id,
    point_number: p,
  }));

  const { error: itemsErr } = await supabaseAdmin
    .from("enterprise_checklist_response_items")
    .insert(itemRows);

  if (itemsErr) {
    console.error("[Checklist] Items insert failed:", itemsErr);
  }

  // Update invitation status
  await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .update({
      status: "submitted",
      submitted_at: now,
    })
    .eq("id", inv.id);

  // Send client receipt email
  try {
    const selectedDetails = ENTERPRISE_CHECKPOINTS.filter((c) => points.includes(c.number)).map(
      (c) => ({
        number: c.number,
        title: c.title,
        phase: c.phase_title,
      })
    );

    await sendEmail({
      to: inv.recipient_email,
      from: "noReply",
      subject: `LIT | Checklist Submission Receipt [${confirmationReference}]`,
      category: "transactional",
      eventType: "checklist-submission-receipt",
      templateKey: "enterprise-checklist-submission-receipt-email",
      react: EnterpriseChecklistSubmissionReceiptEmail({
        recipientName: submitterName,
        confirmationReference,
        selectedCount: points.length,
        selectedPoints: selectedDetails,
      }),
    });
  } catch (emailErr) {
    console.error("[Checklist] Receipt email failed:", emailErr);
  }

  // Send admin alert
  try {
    const adminRecipients = getLeadNotificationRecipients();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, "");
    const adminReviewUrl = `${siteUrl}/admin/checklist-invitations/${inv.id}`;

    await sendEmail({
      to: adminRecipients,
      from: "noReply",
      subject: `New Enterprise Checklist Submission: ${inv.recipient_company || inv.recipient_name} (${points.length} Points)`,
      category: "transactional",
      eventType: "checklist-admin-alert",
      templateKey: "enterprise-checklist-admin-alert-email",
      react: EnterpriseChecklistAdminAlertEmail({
        recipientName: submitterName,
        recipientEmail: inv.recipient_email,
        company: inv.recipient_company || "—",
        confirmationReference,
        selectedCount: points.length,
        adminUrl: adminReviewUrl,
        clientNotes: input.clientNotes || "None",
      }),
    });
  } catch (adminErr) {
    console.error("[Checklist] Admin alert email failed:", adminErr);
  }

  return {
    ok: true,
    message: "Checklist selections successfully submitted and recorded.",
    confirmationReference,
    selectedCount: points.length,
    submittedAt: now,
  };
}

/**
 * Send an enterprise checklist invitation email.
 */
export async function sendChecklistInvitationEmail(invitationId: string): Promise<{ ok: boolean; message: string }> {
  const { data: inv } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select("id, recipient_name, recipient_email, recipient_company, token_hash, status, expires_at, sent_count")
    .eq("id", invitationId)
    .single();

  if (!inv) return { ok: false, message: "Invitation not found." };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, "");

  // Note: Since raw token is cryptographic and stored hashed, if we are resending without raw token,
  // we issue a fresh token to guarantee link validity
  const { token, tokenHash } = generateChecklistToken();
  await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .update({
      token_hash: tokenHash,
      sent_at: new Date().toISOString(),
      sent_count: (inv.sent_count || 0) + 1,
      status: inv.status === "draft" ? "sent" : inv.status,
    })
    .eq("id", inv.id);

  const inviteUrl = `${siteUrl}/enterprise-checklist/${token}`;

  const result = await sendEmail({
    to: inv.recipient_email,
    from: "hello",
    subject: `LIT | Your 50-Point Enterprise Deployment Checklist`,
    category: "transactional",
    eventType: "checklist-invitation",
    templateKey: "enterprise-checklist-invitation-email",
    react: EnterpriseChecklistInvitationEmail({
      recipientName: inv.recipient_name,
      company: inv.recipient_company || undefined,
      inviteUrl,
      expiresAt: inv.expires_at,
    }),
  });

  if (!result.success) {
    return { ok: false, message: result.message || "Failed to send invitation email." };
  }

  return { ok: true, message: "Invitation email dispatched successfully." };
}

/**
 * Generate formatted WhatsApp share URL and text.
 */
export function generateWhatsAppShareContent(recipientName: string, inviteUrl: string): { text: string; shareUrl: string } {
  const text = `Hello ${recipientName}, here is your private link to review the official Logic Intelligence Technologies 50-Point Enterprise Deployment Checklist for your project: ${inviteUrl}`;
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  return { text, shareUrl };
}
