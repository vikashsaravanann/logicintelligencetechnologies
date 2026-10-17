import * as React from "react";
import { render } from "@react-email/components";

// Template Imports
import AdminGenericEmail from "@/emails/admin-generic-email";
import BroadcastEmail from "@/emails/broadcast-email";
import ChecklistDownloadEmail from "@/emails/checklist-download-email";
import ChecklistSubmissionEmail from "@/emails/checklist-submission-email";
import DemoReadyEmail from "@/emails/demo-ready-email";
import EnterpriseChecklistAdminAlertEmail from "@/emails/enterprise-checklist-admin-alert-email";
import EnterpriseChecklistInvitationEmail from "@/emails/enterprise-checklist-invitation-email";
import EnterpriseChecklistSubmissionReceiptEmail from "@/emails/enterprise-checklist-submission-receipt-email";
import FreeDemoConfirmationEmail from "@/emails/free-demo-confirmation-email";
import InvoiceEmail from "@/emails/invoice-email";
import JobApplicationEmail from "@/emails/job-application-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";
import LoginNotificationEmail from "@/emails/login-notification-email";
import MaintenanceRenewalEmail from "@/emails/maintenance-renewal-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import NewsletterConfirmationEmail from "@/emails/newsletter-confirmation-email";
import NewsletterDoubleOptinEmail from "@/emails/newsletter-double-optin-email";
import OutreachSequenceEmail from "@/emails/outreach-sequence-email";
import PasswordResetEmail from "@/emails/password-reset-email";
import PaymentReceivedEmail from "@/emails/payment-received-email";
import PaymentVerifiedDualDocumentEmail from "@/emails/payment-verified-dual-document-email";
import ProjectDeliveredEmail from "@/emails/project-delivered-email";
import ProjectKickoffEmail from "@/emails/project-kickoff-email";
import ProposalSentEmail from "@/emails/proposal-sent-email";
import ResourceAccessEmail from "@/emails/resource-access-email";
import ResourceDeliveryEmail from "@/emails/resource-delivery-email";
import TestimonialRequestEmail from "@/emails/testimonial-request-email";
import WeeklyRecognitionEmail from "@/emails/weekly-recognition-email";
import WelcomeEmail from "@/emails/welcome-email";
import OnboardingInvitationEmail from "@/emails/onboarding-invitation-email";
import QuotationEmail from "@/emails/quotation-email";
import ConsultationBookingConfirmationEmail from "@/emails/consultation-booking-confirmation-email";
import ConsultationRegistrationReceivedEmail from "@/emails/consultation-registration-received-email";
import EngagementPortalInvitationEmail from "@/emails/engagement-portal-invitation-email";
import StageApprovedClientEmail from "@/emails/stage-approved-client-email";
import StageSubmissionAdminAlertEmail from "@/emails/stage-submission-admin-alert-email";
import StageSubmissionClientReceiptEmail from "@/emails/stage-submission-client-receipt-email";
import StaffWorkspaceInvitationEmail from "@/emails/staff-workspace-invitation-email";

export interface TemplateDefinition {
  key: string;
  name: string;
  category: "commercial" | "transactional" | "lifecycle" | "security" | "billing" | "operational" | "marketing" | "hr";
  description: string;
  defaultSender: string;
  replyTo: string;
  subject: string;
  getElement: () => React.ReactElement;
}

export const EMAIL_TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  "enterprise-checklist-invitation": {
    key: "enterprise-checklist-invitation",
    name: "Enterprise Checklist Invitation",
    category: "commercial",
    description: "Invites client stakeholders to review the 50-point engineering checklist and select scope.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Review: 50-Point Enterprise Deployment Checklist",
    getElement: () => (
      <EnterpriseChecklistInvitationEmail
        recipientName="Marcus Vance"
        company="Apex Logistics"
        inviteUrl="https://www.logicintelligencetechnologies.in/checklist/demo-token"
        expiresAt="2026-11-15T00:00:00.000Z"
      />
    ),
  },
  "enterprise-checklist-submission-receipt": {
    key: "enterprise-checklist-submission-receipt",
    name: "Enterprise Checklist Submission Receipt",
    category: "commercial",
    description: "Confirms client submission of selected engineering checkpoints with reference ID.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Checklist Selections Confirmed (LIT-CHK-2026-8812)",
    getElement: () => (
      <EnterpriseChecklistSubmissionReceiptEmail
        recipientName="Marcus Vance"
        confirmationReference="LIT-CHK-2026-8812"
        selectedCount={38}
        selectedPoints={[
          { number: 1, title: "Deterministic Latency SLA", phase: "Phase 1: Architecture" },
          { number: 2, title: "Zero-PHI Boundary Enforcement", phase: "Phase 2: Security" },
          { number: 3, title: "TorchScript Forensics Pipeline", phase: "Phase 3: ML Integration" },
        ]}
      />
    ),
  },
  "enterprise-checklist-admin-alert": {
    key: "enterprise-checklist-admin-alert",
    name: "Enterprise Checklist Admin Alert",
    category: "operational",
    description: "Alerts executive team when a client submits their enterprise checklist selections.",
    defaultSender: "system@logicintelligencetechnologies.in",
    replyTo: "marcus@apexlogistics.com",
    subject: "Checklist Submission: Apex Logistics (38 pts)",
    getElement: () => (
      <EnterpriseChecklistAdminAlertEmail
        recipientName="Marcus Vance"
        recipientEmail="marcus@apexlogistics.com"
        company="Apex Logistics"
        confirmationReference="LIT-CHK-2026-8812"
        selectedCount={38}
        adminUrl="https://www.logicintelligencetechnologies.in/admin/proposals/checklist-review?ref=LIT-CHK-2026-8812"
        clientNotes="Focus on private tenant deployment and real-time audio verification."
      />
    ),
  },
  "new-lead-notification": {
    key: "new-lead-notification",
    name: "New Lead Notification (Admin)",
    category: "operational",
    description: "Dispatched to admin mailbox when a website visitor submits an inquiry or project scope.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "daniel@omniglobal.com",
    subject: "New website enquiry: Daniel Croft",
    getElement: () => (
      <NewLeadNotificationEmail
        fullName="Daniel Croft"
        companyName="OmniGlobal Tech"
        email="daniel@omniglobal.com"
        phone="+1 (555) 019-2834"
        service="Enterprise Hospital AI Core"
        requirements="Seeking multi-facility EHR intelligence integration."
        submissionDate="2026-10-14"
      />
    ),
  },
  "lead-confirmation": {
    key: "lead-confirmation",
    name: "Lead Confirmation (Customer)",
    category: "lifecycle",
    description: "Immediate confirmation sent to prospective clients acknowledging receipt of their inquiry.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "We received your message | Logic Intelligence Technologies",
    getElement: () => (
      <LeadConfirmationEmail
        fullName="Daniel Croft"
        service="Enterprise Hospital AI Core"
      />
    ),
  },
  "consultation-registration-received": {
    key: "consultation-registration-received",
    name: "Consultation Registration Received",
    category: "transactional",
    description: "Dispatched to clients upon registering for an engineering consultation, confirming receipt while awaiting admin review and meeting scheduling.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Consultation Request Received: Technical Discovery Call — Logic Intelligence Technologies",
    getElement: () => (
      <ConsultationRegistrationReceivedEmail
        fullName="Daniel Croft"
        consultationType="Technical Discovery Call"
        bookingRef="LIT-BK-2026-9021"
        slotFormatted="Saturday, October 17, 2026 at 10:00 AM (IST)"
        timezone="Asia/Kolkata (IST · UTC+05:30)"
        duration="45 Mins"
        companyName="OmniGlobal Tech"
        notes="Discussing RAG pipeline architecture and model latency targets."
      />
    ),
  },
  "consultation-booking-confirmation": {
    key: "consultation-booking-confirmation",
    name: "Consultation Booking Confirmation",
    category: "transactional",
    description: "Dispatched to clients confirming their scheduled engineering consultation with Google Meet video link and iCalendar attachment.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Consultation Confirmed: Technical Discovery Call — Logic Intelligence Technologies",
    getElement: () => (
      <ConsultationBookingConfirmationEmail
        fullName="Daniel Croft"
        consultationType="Technical Discovery Call"
        bookingRef="LIT-BK-2026-9021"
        slotFormatted="Saturday, October 17, 2026 at 10:00 AM (IST)"
        timezone="Asia/Kolkata (IST · UTC+05:30)"
        duration="30 Mins"
        meetingUrl="https://meet.google.com/lit-arch-briefing"
        calendarAddUrl="https://calendar.google.com"
        companyName="OmniGlobal Tech"
        notes="Discussing RAG pipeline architecture and model latency targets."
      />
    ),
  },
  "welcome": {
    key: "welcome",
    name: "Welcome Onboarding",
    category: "lifecycle",
    description: "Welcomes newly registered client account holders to the corporate platform.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Welcome to Logic Intelligence Technologies",
    getElement: () => (
      <WelcomeEmail
        fullName="Sarah Chen"
        email="sarah.chen@enterprise.com"
      />
    ),
  },
  "proposal-sent": {
    key: "proposal-sent",
    name: "Commercial Proposal Sent",
    category: "commercial",
    description: "Notifies client leadership that an official commercial proposal is ready for review.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Proposal: Enterprise Speech Intelligence Architecture",
    getElement: () => (
      <ProposalSentEmail
        fullName="Marcus Vance"
        proposalUrl="https://www.logicintelligencetechnologies.in/proposals/PRP-9021"
      />
    ),
  },
  "quotation": {
    key: "quotation",
    name: "Client Quotation Presentation",
    category: "commercial",
    description: "Presents formal itemized quotation with 50/50 payment milestone terms and secure sign-off link.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Quotation: Enterprise Next.js Engineering — Logic Intelligence Technologies",
    getElement: () => (
      <QuotationEmail
        recipientName="Marcus Vance"
        companyName="Apex Health Systems"
        projectTitle="Enterprise Next.js 16 Web Architecture"
        quotationRef="LIT-QT-2026-0001"
        totalFormatted="₹50,000.00"
        validUntil="November 15, 2026"
        quotationUrl="https://www.logicintelligencetechnologies.in/quotation/sample-token"
        selectedServicesCount={1}
      />
    ),
  },
  "onboarding-invitation": {
    key: "onboarding-invitation",
    name: "Client Technical Onboarding",
    category: "lifecycle",
    description: "Invites client technical leads to initialize production onboarding, repositories, and credentials.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "LIT | Client Technical Onboarding & Systems Setup",
    getElement: () => (
      <OnboardingInvitationEmail
        recipientName="Marcus Vance"
        companyName="Apex Health Systems"
        projectTitle="Enterprise Digital Architecture"
        onboardingUrl="https://www.logicintelligencetechnologies.in/onboard?token=sample"
      />
    ),
  },
  "invoice": {
    key: "invoice",
    name: "Commercial Invoice",
    category: "billing",
    description: "Transmits official invoice details and secure payment link.",
    defaultSender: "billing@logicintelligencetechnologies.in",
    replyTo: "billing@logicintelligencetechnologies.in",
    subject: "Invoice INV-2026-104 from Logic Intelligence Technologies",
    getElement: () => (
      <InvoiceEmail
        fullName="Marcus Vance"
        invoiceNumber="INV-2026-104"
        amount="USD 25,000"
        dueDate="2026-11-15"
        paymentLink="https://www.logicintelligencetechnologies.in/billing/INV-2026-104"
      />
    ),
  },
  "payment-received": {
    key: "payment-received",
    name: "Payment Receipt",
    category: "billing",
    description: "Confirms receipt of client payment against an invoice.",
    defaultSender: "billing@logicintelligencetechnologies.in",
    replyTo: "billing@logicintelligencetechnologies.in",
    subject: "Payment received — thank you",
    getElement: () => (
      <PaymentReceivedEmail
        fullName="Marcus Vance"
        amount="USD 25,000"
        invoiceNumber="INV-2026-104"
      />
    ),
  },
  "payment-verified-dual-document": {
    key: "payment-verified-dual-document",
    name: "Payment Verified & Dual Documents",
    category: "billing",
    description: "Delivers verified Tax Invoice and Payment Receipt PDFs with stage unlocking instructions.",
    defaultSender: "billing@logicintelligencetechnologies.in",
    replyTo: "billing@logicintelligencetechnologies.in",
    subject: "Payment Verified & Documents Issued (Tax Invoice + Payment Receipt)",
    getElement: () => (
      <PaymentVerifiedDualDocumentEmail
        recipientName="Marcus Vance"
        milestoneTitle="Stage 6: Initial Project Milestone (50%)"
        amountPaid="₹1,50,000.00"
        paymentDate="October 14, 2026"
        utrReference="YESB2628810294"
        bankCreditReference="YESB-CMS-20261014-9918"
        invoiceDownloadUrl="https://www.logicintelligencetechnologies.in/portal"
        receiptDownloadUrl="https://www.logicintelligencetechnologies.in/portal"
        stageNumber={6}
        nextStageUrl="https://www.logicintelligencetechnologies.in/onboarding"
      />
    ),
  },
  "password-reset": {
    key: "password-reset",
    name: "Password Reset Request",
    category: "security",
    description: "Single-use secure credential recovery link for corporate account owners.",
    defaultSender: "security@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Reset your password",
    getElement: () => (
      <PasswordResetEmail
        fullName="Sarah Chen"
        resetLink="https://www.logicintelligencetechnologies.in/auth/reset-password?token=sample"
      />
    ),
  },
  "login-notification": {
    key: "login-notification",
    name: "Security Login Alert",
    category: "security",
    description: "Alerts user when a new browser session or IP address accesses their account.",
    defaultSender: "security@logicintelligencetechnologies.in",
    replyTo: "security@logicintelligencetechnologies.in",
    subject: "New login from macOS / Chrome 129",
    getElement: () => (
      <LoginNotificationEmail
        email="priya@example.com"
        parsedDevice="macOS / Chrome 129"
        ipAddress="103.21.14.8"
        location="Bengaluru, India"
        when="2026-10-14 18:30 IST"
      />
    ),
  },
  "free-demo-confirmation": {
    key: "free-demo-confirmation",
    name: "Free Demo Request Confirmation",
    category: "lifecycle",
    description: "Confirms client request to schedule an enterprise AI product demonstration.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Demo requested: Logic Voice Enterprise Engine",
    getElement: () => (
      <FreeDemoConfirmationEmail
        fullName="Marcus Vance"
      />
    ),
  },
  "demo-ready": {
    key: "demo-ready",
    name: "Demo Environment Ready",
    category: "lifecycle",
    description: "Provides credentials and URL for a provisioned client sandbox demo.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Your demo is ready",
    getElement: () => (
      <DemoReadyEmail
        fullName="Elena Rostova"
        demoUrl="https://www.logicintelligencetechnologies.in/demos/enterprise-ai"
      />
    ),
  },
  "project-kickoff": {
    key: "project-kickoff",
    name: "Project Kickoff",
    category: "operational",
    description: "Notifies team and client sponsors of project initiation and sprint schedules.",
    defaultSender: "delivery@logicintelligencetechnologies.in",
    replyTo: "delivery@logicintelligencetechnologies.in",
    subject: "Project kickoff: VoiceShield Real-Time Verification Module",
    getElement: () => (
      <ProjectKickoffEmail
        fullName="Marcus Vance"
        projectName="VoiceShield Real-Time Verification Module"
      />
    ),
  },
  "project-delivered": {
    key: "project-delivered",
    name: "Project Milestone Delivered",
    category: "operational",
    description: "Announces completion and verification of an engineering milestone.",
    defaultSender: "delivery@logicintelligencetechnologies.in",
    replyTo: "delivery@logicintelligencetechnologies.in",
    subject: "Project delivery milestone: VoiceShield Real-Time Verification Module",
    getElement: () => (
      <ProjectDeliveredEmail
        fullName="Marcus Vance"
        projectName="VoiceShield Real-Time Verification Module"
      />
    ),
  },
  "maintenance-renewal": {
    key: "maintenance-renewal",
    name: "Maintenance SLA Renewal",
    category: "billing",
    description: "Periodic notice for ongoing enterprise SLA support and maintenance renewal.",
    defaultSender: "billing@logicintelligencetechnologies.in",
    replyTo: "billing@logicintelligencetechnologies.in",
    subject: "Maintenance renewal notice: Enterprise SLA 24/7 Support Tier",
    getElement: () => (
      <MaintenanceRenewalEmail
        fullName="Priya Sharma"
        expiryDate="2026-12-01"
        renewLink="https://www.logicintelligencetechnologies.in/billing/renew"
      />
    ),
  },
  "newsletter-confirmation": {
    key: "newsletter-confirmation",
    name: "Newsletter Subscription Confirmed",
    category: "marketing",
    description: "Confirms newsletter opt-in with unsubscribe capability.",
    defaultSender: "newsletter@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Subscription confirmed",
    getElement: () => (
      <NewsletterConfirmationEmail
        email="subscriber@techhorizon.io"
        unsubscribeUrl="https://www.logicintelligencetechnologies.in/unsubscribe?token=sample"
      />
    ),
  },
  "newsletter-double-optin": {
    key: "newsletter-double-optin",
    name: "Newsletter Double Opt-In",
    category: "transactional",
    description: "Requires email verification click before adding subscriber to marketing lists.",
    defaultSender: "newsletter@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Confirm your newsletter subscription",
    getElement: () => (
      <NewsletterDoubleOptinEmail
        confirmUrl="https://www.logicintelligencetechnologies.in/newsletter/confirm?token=sample"
      />
    ),
  },
  "outreach-sequence": {
    key: "outreach-sequence",
    name: "Outreach Sequence",
    category: "commercial",
    description: "Direct relationship development email sent to verified enterprise executives.",
    defaultSender: "vikash@logicintelligencetechnologies.in",
    replyTo: "vikash@logicintelligencetechnologies.in",
    subject: "Enterprise Voice Systems Architecture",
    getElement: () => (
      <OutreachSequenceEmail
        bodyHtml="<p>Following up on our discussion regarding autonomous voice agent infrastructure for enterprise workflows.</p>"
      />
    ),
  },
  "checklist-download": {
    key: "checklist-download",
    name: "Checklist PDF Delivery",
    category: "commercial",
    description: "Delivers direct link to the 50-Point Enterprise Deployment Checklist PDF.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Your 50-Point Deployment Checklist PDF",
    getElement: () => (
      <ChecklistDownloadEmail
        fullName="Alexander Wright"
        downloadUrl="https://www.logicintelligencetechnologies.in/resources/checklist.pdf"
      />
    ),
  },
  "checklist-submission": {
    key: "checklist-submission",
    name: "Checklist General Submission",
    category: "operational",
    description: "Internal ledger receipt for standard checklist submissions.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "alexander@apexenterprises.com",
    subject: "Checklist review submitted by alexander@apexenterprises.com",
    getElement: () => (
      <ChecklistSubmissionEmail
        email="alexander@apexenterprises.com"
        type="Enterprise Deployment Checklist"
        answers={["Section 1: Architecture Completed", "Section 2: Security Review Passed"]}
        submissionDate="2026-10-14"
      />
    ),
  },
  "testimonial-request": {
    key: "testimonial-request",
    name: "Testimonial & Feedback Request",
    category: "marketing",
    description: "Requests project feedback and client testimonials following milestone completion.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "How was your experience with Logic Intelligence Technologies?",
    getElement: () => (
      <TestimonialRequestEmail
        fullName="Sarah Chen"
        reviewLink="https://www.logicintelligencetechnologies.in/testimonials/submit"
      />
    ),
  },
  "job-application": {
    key: "job-application",
    name: "Job Application Receipt",
    category: "hr",
    description: "Confirms receipt of candidate resume and application for open engineering positions.",
    defaultSender: "careers@logicintelligencetechnologies.in",
    replyTo: "careers@logicintelligencetechnologies.in",
    subject: "Application received — Principal Speech AI Engineer",
    getElement: () => (
      <JobApplicationEmail
        fullName="Priya Sharma"
        role="Principal Speech AI Engineer"
      />
    ),
  },
  "resource-access": {
    key: "resource-access",
    name: "Expiring Resource Access Link",
    category: "transactional",
    description: "Sends time-bounded download link for whitepapers and technical guides.",
    defaultSender: "resources@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Your resource is ready: Enterprise Deployment Whitepaper",
    getElement: () => (
      <ResourceAccessEmail
        fullName="Sarah Chen"
        resourceTitle="Enterprise Deployment Whitepaper"
        downloadUrl="https://www.logicintelligencetechnologies.in/resources/whitepaper-2026"
      />
    ),
  },
  "resource-delivery": {
    key: "resource-delivery",
    name: "Permanent Resource Delivery",
    category: "transactional",
    description: "Delivers public whitepaper or document attachment to requesting user.",
    defaultSender: "resources@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Enterprise Deployment Whitepaper from Logic Intelligence Technologies",
    getElement: () => (
      <ResourceDeliveryEmail
        fullName="Sarah Chen"
        resourceTitle="Enterprise Deployment Whitepaper"
        downloadUrl="https://www.logicintelligencetechnologies.in/resources"
      />
    ),
  },
  "weekly-recognition": {
    key: "weekly-recognition",
    name: "Weekly Internal Recognition",
    category: "hr",
    description: "Internal company announcement recognizing engineering and operational achievements.",
    defaultSender: "team@logicintelligencetechnologies.in",
    replyTo: "team@logicintelligencetechnologies.in",
    subject: "Weekly recognition: Arjun Dev",
    getElement: () => (
      <WeeklyRecognitionEmail
        fullName="Arjun Dev"
        detail="Outstanding contribution to low-latency streaming speech pipeline."
      />
    ),
  },
  "broadcast": {
    key: "broadcast",
    name: "Corporate Broadcast Announcement",
    category: "marketing",
    description: "Organization-wide announcement regarding platform updates and milestones.",
    defaultSender: "announcements@logicintelligencetechnologies.in",
    replyTo: "no-reply@logicintelligencetechnologies.in",
    subject: "Q4 Technology Roadmap Update",
    getElement: () => (
      <BroadcastEmail
        fullName="Valued Client"
        subjectLine="Q4 Technology Roadmap Update"
        messageBody="We are excited to share key updates on our enterprise speech and vision systems."
      />
    ),
  },
  "admin-generic": {
    key: "admin-generic",
    name: "Administrative System Notification",
    category: "operational",
    description: "Internal infrastructure maintenance alerts and automated job notifications.",
    defaultSender: "system@logicintelligencetechnologies.in",
    replyTo: "system@logicintelligencetechnologies.in",
    subject: "Scheduled maintenance completed",
    getElement: () => (
      <AdminGenericEmail message="Scheduled maintenance window completed successfully." />
    ),
  },
  "engagement-portal-invitation": {
    key: "engagement-portal-invitation",
    name: "Engagement Portal Invitation",
    category: "lifecycle",
    description: "Invites client stakeholders to access their dedicated client lifecycle engagement portal.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Your Client Lifecycle & Project Portal: Apex Logistics",
    getElement: () => (
      <EngagementPortalInvitationEmail
        recipientName="Marcus Vance"
        companyName="Apex Logistics"
        projectTitle="Enterprise AI & Cloud Infrastructure Architecture"
        engagementRef="ENG-2026-LIT-SAMPLE"
        portalUrl="https://www.logicintelligencetechnologies.in/engagement/ENG-2026-LIT-SAMPLE"
        workspaceUrl="https://www.logicintelligencetechnologies.in/client/login?ref=ENG-2026-LIT-SAMPLE"
      />
    ),
  },
  "stage-approved-client": {
    key: "stage-approved-client",
    name: "Stage Approved Client Notification",
    category: "lifecycle",
    description: "Notifies client when a submitted engagement stage is officially verified and approved.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Stage 4 Approved: Apex Logistics",
    getElement: () => (
      <StageApprovedClientEmail
        recipientName="Marcus Vance"
        companyName="Apex Logistics"
        engagementRef="ENG-2026-LIT-SAMPLE"
        approvedStageOrdinal={4}
        approvedStageTitle="SOW Execution & Verification"
        nextStageOrdinal={5}
        nextStageTitle="Commercial Invoice & Settlement"
        nextStageUrl="https://www.logicintelligencetechnologies.in/portal"
        adminNotes="All statement of work clauses and deliverables verified."
      />
    ),
  },
  "stage-submission-admin-alert": {
    key: "stage-submission-admin-alert",
    name: "Stage Submission Admin Alert",
    category: "operational",
    description: "Alerts engineering administrators when a client submits stage artifacts requiring review.",
    defaultSender: "system@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Action Required: Stage 4 submitted by Apex Logistics",
    getElement: () => (
      <StageSubmissionAdminAlertEmail
        companyName="Apex Logistics"
        contactName="Marcus Vance"
        contactEmail="marcus@apexlogistics.com"
        engagementRef="ENG-2026-LIT-SAMPLE"
        stageOrdinal={4}
        stageTitle="SOW Execution & Verification"
        submittedSummary="Signed SOW agreement submitted with authorized signature"
        detailsList={[
          { label: "Document Reference", value: "SOW-2026-APEX-01" },
          { label: "Signatory", value: "Marcus Vance (VP Engineering)" },
        ]}
        adminPortalUrl="https://www.logicintelligencetechnologies.in/admin"
      />
    ),
  },
  "stage-submission-client-receipt": {
    key: "stage-submission-client-receipt",
    name: "Stage Submission Client Receipt",
    category: "lifecycle",
    description: "Acknowledges receipt of client stage submission with record verification.",
    defaultSender: "hello@logicintelligencetechnologies.in",
    replyTo: "hello@logicintelligencetechnologies.in",
    subject: "Submission Confirmed · Stage 4 (SOW Verification)",
    getElement: () => (
      <StageSubmissionClientReceiptEmail
        recipientName="Marcus Vance"
        companyName="Apex Logistics"
        engagementRef="ENG-2026-LIT-SAMPLE"
        stageOrdinal={4}
        stageTitle="SOW Execution & Verification"
        submittedSummary="Signed SOW agreement received by engineering operations"
        detailsList={[
          { label: "Document Reference", value: "SOW-2026-APEX-01" },
          { label: "Status", value: "Queued for Executive Verification" },
        ]}
        portalUrl="https://www.logicintelligencetechnologies.in/portal"
        nextStageTitle="Commercial Invoice & Settlement"
      />
    ),
  },
  "staff-workspace-invitation": {
    key: "staff-workspace-invitation",
    name: "Staff Workspace Provisioning Invitation",
    category: "operational",
    description: "Invites provisioned LIT staff member to their private admin workspace with secure login instructions.",
    defaultSender: "operations@logicintelligencetechnologies.in",
    replyTo: "support@logicintelligencetechnologies.in",
    subject: "Your LIT Staff Admin Workspace Has Been Provisioned",
    getElement: () => (
      <StaffWorkspaceInvitationEmail
        recipientName="Arun Kumar"
        recipientEmail="arun.kumar@logicintelligencetechnologies.in"
        jobTitle="Senior Full-Stack Engineer"
        department="Engineering"
        systemRole="developer"
        workspaceUrl="https://www.logicintelligencetechnologies.in/login?next=/admin/workspaces/e0000000-0000-0000-0000-000000000001"
        workspaceUuid="e0000000-0000-0000-0000-000000000001"
      />
    ),
  },
};

export async function renderTemplatePreview(key: string) {
  const def = EMAIL_TEMPLATE_REGISTRY[key];
  if (!def) {
    throw new Error(`Unknown email template: ${key}`);
  }

  const el = def.getElement();
  const html = await render(el);
  const plainText = await render(el, { plainText: true });

  // Extract all hrefs for link audit
  const linkMatches = html.match(/href="([^"]+)"/g) || [];
  const links = linkMatches
    .map((m) => m.replace(/^href="/, "").replace(/"$/, ""))
    .filter((href) => !href.startsWith("mailto:") && !href.startsWith("#"));

  return {
    ...def,
    html,
    plainText,
    links: Array.from(new Set(links)),
  };
}
