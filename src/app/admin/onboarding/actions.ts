"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { createOnboardingSession } from "@/lib/onboarding/sessions";
import { sendEmail } from "@/lib/email/send-email";
import OnboardingInvitationEmail from "@/emails/onboarding-invitation-email";
import { COMPANY } from "@/config/company";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface IssueResult {
  ok: boolean;
  message: string;
  /** The full onboarding URL including the one-time token. Shown once. */
  url?: string;
  emailSent?: boolean;
  recipientEmail?: string;
}

/**
 * Issue a fresh onboarding link. The raw token is returned here exactly once for
 * the admin to copy/share; it is never stored or logged (only its hash is
 * stored). Optional contract/client/project ids tie the submission to a record.
 * If recipientEmail is provided, automatically dispatches an onboarding invitation email.
 */
export async function issueOnboardingLink(formData: FormData): Promise<IssueResult> {
  const session = await requireCapabilityAction("onboarding.manage", "onboarding.session_create");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const read = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v && UUID.test(v) ? v : null;
  };
  const contractId = read("contractId");
  const clientId = read("clientId");
  const projectId = read("projectId");

  const recipientEmail = String(formData.get("recipientEmail") ?? "").trim().toLowerCase();
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const projectTitle = String(formData.get("projectTitle") ?? "").trim();

  const created = await createOnboardingSession({ contractId, clientId, projectId, actor });

  if (!created) {
    await recordAdminAction({
      actor,
      action: "onboarding.session_create",
      capability: "onboarding.manage",
      outcome: "failed",
      metadata: { contractId },
    });
    return { ok: false, message: "Could not create an onboarding link." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl;
  const onboardingUrl = `${origin}/onboard?token=${created.token}`;

  let emailSent = false;
  if (recipientEmail) {
    try {
      const emailRes = await sendEmail({
        to: recipientEmail,
        from: "hello",
        replyTo: COMPANY.emails.hello,
        subject: `LIT | Client Technical Onboarding: ${projectTitle || "Enterprise Platform Setup"}`,
        category: "transactional",
        eventType: "onboarding-invitation",
        templateKey: "onboarding-invitation-email",
        react: OnboardingInvitationEmail({
          recipientName: recipientName || "Client Partner",
          companyName: companyName || "Your Organization",
          projectTitle: projectTitle || "Enterprise Platform Setup",
          onboardingUrl,
        }),
      });
      emailSent = emailRes.success && emailRes.status !== "skipped";
    } catch (mailErr) {
      console.error("[issueOnboardingLink] Automated email dispatch failed:", mailErr);
    }
  }

  await recordAdminAction({
    actor,
    action: "onboarding.session_create",
    capability: "onboarding.manage",
    target: { type: "onboarding_session", id: created.sessionId },
    outcome: "succeeded",
    metadata: { contractId, recipientEmail: recipientEmail || undefined, emailSent },
  });

  revalidatePath("/admin/onboarding");

  return {
    ok: true,
    message: emailSent
      ? `Activation link generated and automatically sent to ${recipientEmail}.`
      : "Activation link generated successfully.",
    url: onboardingUrl,
    emailSent,
    recipientEmail: recipientEmail || undefined,
  };
}
