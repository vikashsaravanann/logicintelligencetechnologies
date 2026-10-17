import * as React from "react";
import {
  ReferenceButton,
  ReferenceDetails,
  ReferenceDocumentList,
  ReferenceFrame,
  ReferenceHero,
  ReferenceSection,
  ReferenceText,
  safeEmailUrl,
} from "./components";
import { REFERENCE_EMAIL } from "./theme";

export interface ReferenceVerificationEmailProps {
  recipientName?: string;
  verificationUrl: string;
  expiresIn?: string;
}

export interface ReferenceWelcomeEmailProps {
  fullName?: string;
  workspaceUrl?: string;
}

export interface ReferenceCampaignEmailProps {
  headline?: string;
  description?: string;
  actionUrl: string;
  ctaLabel?: string;
  unsubscribeUrl: string;
  offerLabel?: string;
}

export type ReferenceDarkCampaignEmailProps = ReferenceCampaignEmailProps;

export interface ReferenceOnboardingEmailProps {
  recipientName?: string;
  onboardingUrl: string;
  projectTitle?: string;
}

export interface ReferenceStaffInvitationEmailProps {
  recipientName?: string;
  recipientEmail: string;
  jobTitle?: string;
  department?: string;
  systemRole?: string;
  workspaceUrl: string;
  workspaceUuid?: string;
}

type ReferenceDocument = { filename: string; url?: string };

export interface ReferenceStageApprovalEmailProps {
  recipientName?: string;
  companyName?: string;
  engagementRef?: string;
  approvedStageOrdinal: number;
  approvedStageTitle: string;
  nextStageOrdinal?: number | null;
  nextStageTitle?: string;
  nextStageUrl?: string;
  actionUrl?: string;
  adminNotes?: string;
  documents?: ReferenceDocument[];
  documentsAttached?: boolean;
}

export interface ReferenceInvoicePaymentEmailProps {
  recipientName?: string;
  status: "invoice_ready" | "payment_verified";
  invoiceNumber?: string;
  amount: string;
  dueDate?: string;
  paymentDate?: string;
  utrReference?: string;
  bankCreditReference?: string;
  actionUrl: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  documents?: ReferenceDocument[];
  documentsAttached?: boolean;
}

export interface ReferenceSupportReplyEmailProps {
  recipientName?: string;
  ticketReference: string;
  subject: string;
  replyMessage: string;
  agentName?: string;
  ticketUrl: string;
  statusLabel?: string;
}

export interface ReferenceMaintenanceActivationEmailProps {
  recipientName?: string;
  planName: string;
  projectTitle?: string;
  periodStart: string;
  periodEnd: string;
  amountPaid?: string;
  isTrial?: boolean;
  verificationAmount?: string;
  subscriptionUrl: string;
}

function greeting(name?: string) {
  return name?.trim() ? `Hi ${name.trim()},` : "Hi there,";
}

function message(text: string) {
  return (
    <span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
      {text}
    </span>
  );
}

export function ReferenceVerificationEmail({
  recipientName,
  verificationUrl,
  expiresIn,
}: ReferenceVerificationEmailProps) {
  return (
    <ReferenceFrame preview="Verify your email address to continue.">
      <ReferenceHero
        title="Verify your email address"
        image="verification"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          Confirm this is your email address to continue with Logic Intelligence
          Technologies.
        </ReferenceText>
        <ReferenceButton href={verificationUrl} variant="orange">
          Verify my email
        </ReferenceButton>
        {expiresIn ? (
          <ReferenceText muted>This verification link expires in {expiresIn}.</ReferenceText>
        ) : null}
        <ReferenceText muted>
          Didn’t request this? You can safely ignore this email.
        </ReferenceText>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceWelcomeEmail({
  fullName,
  workspaceUrl,
}: ReferenceWelcomeEmailProps) {
  return (
    <ReferenceFrame preview="Welcome to Logic Intelligence Technologies. Your next big idea starts here." tone="orange">
      <ReferenceHero
        title="Your next big idea starts here."
        image="welcome"
        tone="orange"
      />
      <ReferenceSection>
        <ReferenceText>{greeting(fullName)}</ReferenceText>
        <ReferenceText>
          Welcome to Logic Intelligence Technologies. From project planning to
          software development and ongoing support, we’re here to help you build
          for your business.
        </ReferenceText>
        <ReferenceText>
          {workspaceUrl
            ? "Visit your workspace to review your project information and next steps."
            : "Explore our technology services and find the right starting point for your project."}
        </ReferenceText>
        <ReferenceButton href={workspaceUrl || REFERENCE_EMAIL.siteUrl} variant="orange">
          {workspaceUrl ? "Explore my workspace" : "Get to know us"}
        </ReferenceButton>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceCampaignEmail({
  headline = "Build your next digital experience.",
  description = "Explore software development and technology services for your business, from planning your project to maintaining it after launch.",
  actionUrl,
  ctaLabel = "Explore our services",
  unsubscribeUrl,
  offerLabel,
}: ReferenceCampaignEmailProps) {
  return (
    <ReferenceFrame
      preview={headline}
      tone="orange"
      unsubscribeUrl={unsubscribeUrl}
    >
      <ReferenceHero
        eyebrow={offerLabel}
        title={headline}
        image="campaign"
        tone="orange"
      />
      <ReferenceSection>
        <ReferenceText>{message(description)}</ReferenceText>
        <ReferenceButton href={actionUrl} variant="blue">
          {ctaLabel}
        </ReferenceButton>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceDarkCampaignEmail({
  headline = "A clearer plan for your next project.",
  description = "Bring your business goals into focus. Explore our approach to planning, building, and supporting your next software project.",
  actionUrl,
  ctaLabel = "Explore our approach",
  unsubscribeUrl,
  offerLabel,
}: ReferenceDarkCampaignEmailProps) {
  return (
    <ReferenceFrame
      preview={headline}
      tone="dark"
      unsubscribeUrl={unsubscribeUrl}
    >
      <ReferenceHero
        eyebrow={offerLabel}
        title={headline}
        image="night"
        tone="dark"
      />
      <ReferenceSection>
        <ReferenceText dark>{message(description)}</ReferenceText>
        <ReferenceButton href={actionUrl} variant="purple">
          {ctaLabel}
        </ReferenceButton>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceOnboardingEmail({
  recipientName,
  onboardingUrl,
  projectTitle,
}: ReferenceOnboardingEmailProps) {
  return (
    <ReferenceFrame preview={projectTitle ? `Let’s get started on ${projectTitle}.` : "Share your project requirements to get started."} tone="sky">
      <ReferenceHero
        title="Welcome to your next chapter."
        image="onboarding"
        tone="sky"
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          {projectTitle ? (
            <>Let’s get started on <strong>{projectTitle}</strong>.</>
          ) : (
            <>Let’s get started on your project.</>
          )}{" "}
          Share your business goals, requirements, and priorities in the
          onboarding form.
        </ReferenceText>
        <ReferenceText>
          Your answers help our team understand the scope and prepare for your
          project discussion.
        </ReferenceText>
        <ReferenceButton href={onboardingUrl} variant="purple">
          Start my onboarding
        </ReferenceButton>
        <ReferenceText muted>
          If a requirement is still undecided, include the questions you’d like
          to discuss with our team.
        </ReferenceText>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceStaffInvitationEmail({
  recipientName,
  recipientEmail,
  jobTitle,
  department,
  systemRole,
  workspaceUrl,
  workspaceUuid,
}: ReferenceStaffInvitationEmailProps) {
  const rows = [
    { label: "Invited email", value: recipientEmail },
    ...(jobTitle ? [{ label: "Job title", value: jobTitle }] : []),
    ...(department ? [{ label: "Department", value: department }] : []),
    ...(systemRole ? [{ label: "Workspace role", value: systemRole }] : []),
    ...(workspaceUuid ? [{ label: "Workspace ID", value: workspaceUuid }] : []),
  ];

  return (
    <ReferenceFrame preview="You’re invited to the Logic Intelligence Technologies workspace." tone="sky">
      <ReferenceHero
        eyebrow="Team invitation"
        title="Your workspace invitation."
        image="workspace"
        tone="sky"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          You’ve been invited to join the Logic Intelligence Technologies
          workspace. Follow the invitation to sign in or complete the setup
          shown there.
        </ReferenceText>
        <ReferenceDetails rows={rows} />
        <ReferenceButton href={workspaceUrl} variant="blue">
          Open my invitation
        </ReferenceButton>
        <ReferenceText muted>
          Use {recipientEmail} when signing in. If this invitation was unexpected,
          check with your team before continuing.
        </ReferenceText>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceStageApprovalEmail({
  recipientName,
  companyName,
  engagementRef,
  approvedStageOrdinal,
  approvedStageTitle,
  nextStageOrdinal,
  nextStageTitle,
  nextStageUrl,
  actionUrl,
  adminNotes,
  documents,
  documentsAttached = false,
}: ReferenceStageApprovalEmailProps) {
  const nextStage = nextStageTitle
    ? `${nextStageOrdinal != null ? `Stage ${nextStageOrdinal}: ` : ""}${nextStageTitle}`
    : nextStageOrdinal != null
      ? `Stage ${nextStageOrdinal}`
      : undefined;
  const destination = actionUrl || nextStageUrl;
  const rows = [
    { label: "Approved stage", value: `Stage ${approvedStageOrdinal}: ${approvedStageTitle}` },
    ...(companyName ? [{ label: "Company", value: companyName }] : []),
    ...(engagementRef ? [{ label: "Project reference", value: engagementRef }] : []),
    ...(nextStage ? [{ label: "Next stage", value: nextStage }] : []),
  ];

  return (
    <ReferenceFrame preview={`Stage ${approvedStageOrdinal} approved: ${approvedStageTitle}.`}>
      <ReferenceHero
        eyebrow="Stage approval"
        title="Your project stage is approved."
        image="milestone"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          Your submission for <strong>{approvedStageTitle}</strong> has been
          approved. Review the stage details below for your project records.
        </ReferenceText>
        <ReferenceDetails rows={rows} />
        {nextStage ? (
          <ReferenceText>
            Review the project workspace for the requirements and current access
            status of your next stage.
          </ReferenceText>
        ) : null}
        {destination ? (
          <ReferenceButton href={destination} variant="purple">
            View my project
          </ReferenceButton>
        ) : null}
      </ReferenceSection>
      {adminNotes ? (
        <ReferenceSection cream>
          <ReferenceText><strong>A note from the team</strong></ReferenceText>
          <ReferenceText align="left">{message(adminNotes)}</ReferenceText>
        </ReferenceSection>
      ) : null}
      {documents?.length ? (
        <ReferenceSection>
          <ReferenceDocumentList documents={documents} attached={documentsAttached} />
        </ReferenceSection>
      ) : null}
    </ReferenceFrame>
  );
}

export function ReferenceInvoicePaymentEmail({
  recipientName,
  status,
  invoiceNumber,
  amount,
  dueDate,
  paymentDate,
  utrReference,
  bankCreditReference,
  actionUrl,
  invoiceUrl,
  receiptUrl,
  documents,
  documentsAttached = false,
}: ReferenceInvoicePaymentEmailProps) {
  const verified = status === "payment_verified";
  const rows = [
    ...(invoiceNumber ? [{ label: "Invoice number", value: invoiceNumber }] : []),
    { label: verified ? "Payment amount" : "Amount due", value: amount },
    { label: "Status", value: verified ? "Payment verified" : "Invoice ready" },
    ...(dueDate ? [{ label: "Due date", value: dueDate }] : []),
    ...(paymentDate ? [{ label: "Payment date", value: paymentDate }] : []),
    ...(utrReference ? [{ label: "UTR reference", value: utrReference }] : []),
    ...(bankCreditReference ? [{ label: "Bank credit reference", value: bankCreditReference }] : []),
  ];

  return (
    <ReferenceFrame preview={verified ? `Your payment of ${amount} has been verified.` : `Your invoice${invoiceNumber ? ` ${invoiceNumber}` : ""} is ready to review.`}>
      <ReferenceHero
        eyebrow={verified ? "Payment confirmation" : "Billing"}
        title={verified ? "Payment verified. Thank you." : "Your invoice is ready."}
        image="payment"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          {verified
            ? "We’ve verified your payment. Here are the details for your records."
            : "Review your invoice and payment instructions using the link below."}
        </ReferenceText>
        <ReferenceDetails rows={rows} />
        <ReferenceButton href={actionUrl} variant="orange">
          {verified ? "View payment details" : "Review my invoice"}
        </ReferenceButton>
        {invoiceUrl || receiptUrl ? (
          <ReferenceText muted>
            {invoiceUrl ? <a href={safeEmailUrl(invoiceUrl)} style={{ color: "inherit", textDecoration: "underline" }}>View invoice</a> : null}
            {invoiceUrl && receiptUrl ? " · " : null}
            {receiptUrl ? <a href={safeEmailUrl(receiptUrl)} style={{ color: "inherit", textDecoration: "underline" }}>View receipt</a> : null}
          </ReferenceText>
        ) : null}
      </ReferenceSection>
      {documents?.length ? (
        <ReferenceSection cream>
          <ReferenceDocumentList documents={documents} attached={documentsAttached} />
        </ReferenceSection>
      ) : null}
    </ReferenceFrame>
  );
}

export function ReferenceSupportReplyEmail({
  recipientName,
  ticketReference,
  subject,
  replyMessage,
  agentName,
  ticketUrl,
  statusLabel,
}: ReferenceSupportReplyEmailProps) {
  return (
    <ReferenceFrame preview={`A reply to ${ticketReference}: ${subject}`} tone="sky">
      <ReferenceHero
        eyebrow="Support update"
        title="Your support team has replied."
        image="support"
        tone="sky"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          {agentName || "Our support team"} replied to your support request.
        </ReferenceText>
        <ReferenceDetails rows={[
          { label: "Ticket", value: ticketReference },
          { label: "Subject", value: subject },
          ...(statusLabel ? [{ label: "Status", value: statusLabel }] : []),
        ]} />
      </ReferenceSection>
      <ReferenceSection cream>
        <ReferenceText align="left">{message(replyMessage)}</ReferenceText>
        {agentName ? <ReferenceText muted align="left">— {agentName}</ReferenceText> : null}
      </ReferenceSection>
      <ReferenceSection>
        <ReferenceButton href={ticketUrl} variant="blue">
          View and reply
        </ReferenceButton>
        <ReferenceText muted>
          Continue the conversation in your ticket so the details stay together.
        </ReferenceText>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

export function ReferenceMaintenanceActivationEmail({
  recipientName,
  planName,
  projectTitle,
  periodStart,
  periodEnd,
  amountPaid,
  isTrial = false,
  verificationAmount,
  subscriptionUrl,
}: ReferenceMaintenanceActivationEmailProps) {
  const rows = [
    { label: "Plan", value: planName },
    { label: "Plan type", value: isTrial ? "Trial" : "Maintenance" },
    ...(projectTitle ? [{ label: "Project", value: projectTitle }] : []),
    { label: "Period starts", value: periodStart },
    { label: "Period ends", value: periodEnd },
    ...(amountPaid ? [{ label: "Amount paid", value: amountPaid }] : []),
    ...(verificationAmount ? [{ label: "Verification amount", value: verificationAmount }] : []),
  ];

  return (
    <ReferenceFrame preview={`${planName}${isTrial ? " trial" : ""} is active for ${periodStart} to ${periodEnd}.`}>
      <ReferenceHero
        eyebrow="Maintenance"
        title={isTrial ? "Your maintenance trial is active." : "Your maintenance plan is active."}
        image="maintenance"
        compact
      />
      <ReferenceSection>
        <ReferenceText>{greeting(recipientName)}</ReferenceText>
        <ReferenceText>
          Your <strong>{planName}</strong>{isTrial ? " trial" : " maintenance plan"}
          {projectTitle ? <> for <strong>{projectTitle}</strong></> : null} is
          active for the period below.
        </ReferenceText>
        <ReferenceDetails rows={rows} />
        <ReferenceText>
          Visit your subscription page to review what’s included and the details
          of your plan.
        </ReferenceText>
        <ReferenceButton href={subscriptionUrl} variant="purple">
          View my subscription
        </ReferenceButton>
        {isTrial ? (
          <ReferenceText muted>
            Your subscription page has the trial terms and any next steps.
          </ReferenceText>
        ) : null}
      </ReferenceSection>
    </ReferenceFrame>
  );
}
