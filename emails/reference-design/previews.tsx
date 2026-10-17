import * as React from "react";
import {
  ReferenceVerificationEmail,
  ReferenceWelcomeEmail,
  ReferenceCampaignEmail,
  ReferenceDarkCampaignEmail,
  ReferenceOnboardingEmail,
  ReferenceStaffInvitationEmail,
  ReferenceStageApprovalEmail,
  ReferenceInvoicePaymentEmail,
  ReferenceSupportReplyEmail,
  ReferenceMaintenanceActivationEmail,
} from "./templates";

export interface ReferenceEmailPreview {
  key: string;
  name: string;
  subject: string;
  reference: string;
  category:
    | "transactional"
    | "marketing"
    | "lifecycle"
    | "security"
    | "billing"
    | "operational"
    | "hr";
  element: React.ReactElement;
}

const SITE = "https://www.logicintelligencetechnologies.in";
const LOGIN = `${SITE}/login`;

// Fictional, fixed fixtures for design review only. No signed links or live records.
export const REFERENCE_EMAIL_PREVIEWS: ReferenceEmailPreview[] = [
  {
    key: "reference-email-verification",
    name: "Email verification",
    subject: "Verify your email address",
    reference: "01 / Illustrated verification",
    category: "security",
    element: (
      <ReferenceVerificationEmail
        recipientName="Alex"
        verificationUrl={LOGIN}
        expiresIn="24 hours"
      />
    ),
  },
  {
    key: "reference-welcome",
    name: "Welcome",
    subject: "Welcome to Logic Intelligence Technologies",
    reference: "02 / A warm welcome",
    category: "lifecycle",
    element: <ReferenceWelcomeEmail fullName="Alex Morgan" workspaceUrl={LOGIN} />,
  },
  {
    key: "reference-campaign",
    name: "Campaign",
    subject: "Bring your next idea to life",
    reference: "03 / Light editorial campaign",
    category: "marketing",
    element: (
      <ReferenceCampaignEmail
        headline="Big ideas. Thoughtfully built."
        description="From a first conversation to a working product, give your next idea a clear path forward. Explore what we could build together."
        actionUrl={`${SITE}/contact`}
        ctaLabel="Let’s talk about your idea"
        unsubscribeUrl={`${SITE}/unsubscribe`}
        offerLabel="Your next chapter starts here"
      />
    ),
  },
  {
    key: "reference-dark-campaign",
    name: "Dark campaign",
    subject: "A brighter future for your next project",
    reference: "04 / After-dark campaign",
    category: "marketing",
    element: (
      <ReferenceDarkCampaignEmail
        headline="Build what comes next."
        description="Turn a promising idea into something people love to use. Let’s explore a thoughtful digital experience for your business."
        actionUrl={`${SITE}/contact`}
        ctaLabel="Start a conversation"
        unsubscribeUrl={`${SITE}/unsubscribe`}
        offerLabel="Ideas with a future"
      />
    ),
  },
  {
    key: "reference-onboarding",
    name: "Project onboarding",
    subject: "Your next step for Example Project",
    reference: "05 / Guided project onboarding",
    category: "lifecycle",
    element: (
      <ReferenceOnboardingEmail
        recipientName="Alex"
        onboardingUrl={LOGIN}
        projectTitle="Example Project"
      />
    ),
  },
  {
    key: "reference-staff-invitation",
    name: "Staff invitation",
    subject: "Your Example Project workspace is ready",
    reference: "06 / Workspace invitation",
    category: "hr",
    element: (
      <ReferenceStaffInvitationEmail
        recipientName="Alex Morgan"
        recipientEmail="alex.morgan@example.com"
        jobTitle="Product Designer"
        department="Design"
        systemRole="team_member"
        workspaceUrl={LOGIN}
        workspaceUuid="00000000-0000-4000-8000-000000000001"
      />
    ),
  },
  {
    key: "reference-stage-approval",
    name: "Stage approval",
    subject: "Example Project: design stage approved",
    reference: "07 / Milestone celebration",
    category: "operational",
    element: (
      <ReferenceStageApprovalEmail
        recipientName="Alex"
        companyName="Example Project"
        engagementRef="EXAMPLE-2026-001"
        approvedStageOrdinal={2}
        approvedStageTitle="Experience design"
        nextStageOrdinal={3}
        nextStageTitle="Development"
        nextStageUrl={LOGIN}
        actionUrl={LOGIN}
        adminNotes="The design direction is approved. Your team can review the agreed scope before the next stage begins."
        documents={[{ filename: "example-project-design-summary.pdf", url: LOGIN }]}
        documentsAttached={false}
      />
    ),
  },
  {
    key: "reference-invoice-payment",
    name: "Invoice & payment",
    subject: "Your Example Project payment is verified",
    reference: "08 / Clear billing summary",
    category: "billing",
    element: (
      <ReferenceInvoicePaymentEmail
        recipientName="Alex"
        status="payment_verified"
        invoiceNumber="EXAMPLE-INV-001"
        amount="₹49,000.00"
        paymentDate="18 October 2026"
        bankCreditReference="EXAMPLE-BANK-001"
        actionUrl={LOGIN}
        invoiceUrl={LOGIN}
        receiptUrl={LOGIN}
        documents={[{ filename: "example-invoice-001.pdf", url: LOGIN }, { filename: "example-receipt-001.pdf", url: LOGIN }]}
        documentsAttached={false}
      />
    ),
  },
  {
    key: "reference-support-reply",
    name: "Support reply",
    subject: "A reply to your Example Project support request",
    reference: "09 / Human support conversation",
    category: "operational",
    element: (
      <ReferenceSupportReplyEmail
        recipientName="Alex"
        ticketReference="EXAMPLE-SUP-001"
        subject="Updating the project workspace"
        replyMessage="Thanks for sharing the details, Alex. You can review your workspace settings after signing in. If anything still looks unclear, reply to this conversation and we’ll help with the next step."
        agentName="Jordan · Example Support"
        ticketUrl={LOGIN}
        statusLabel="Awaiting your reply"
      />
    ),
  },
  {
    key: "reference-maintenance-activation",
    name: "Maintenance activation",
    subject: "Your Example Project care plan is active",
    reference: "10 / Ongoing project care",
    category: "transactional",
    element: (
      <ReferenceMaintenanceActivationEmail
        recipientName="Alex"
        planName="Basic Care"
        projectTitle="Example Project"
        periodStart="18 October 2026"
        periodEnd="17 November 2026"
        amountPaid="₹5,898.82"
        isTrial={false}
        subscriptionUrl={LOGIN}
      />
    ),
  },
];
