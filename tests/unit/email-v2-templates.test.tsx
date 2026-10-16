import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { render } from "@react-email/components";

// Template Imports
import AdminGenericEmail from "../../emails/admin-generic-email";
import BroadcastEmail from "../../emails/broadcast-email";
import ChecklistDownloadEmail from "../../emails/checklist-download-email";
import ChecklistSubmissionEmail from "../../emails/checklist-submission-email";
import DemoReadyEmail from "../../emails/demo-ready-email";
import EnterpriseChecklistAdminAlertEmail from "../../emails/enterprise-checklist-admin-alert-email";
import EnterpriseChecklistInvitationEmail from "../../emails/enterprise-checklist-invitation-email";
import EnterpriseChecklistSubmissionReceiptEmail from "../../emails/enterprise-checklist-submission-receipt-email";
import FreeDemoConfirmationEmail from "../../emails/free-demo-confirmation-email";
import InvoiceEmail from "../../emails/invoice-email";
import JobApplicationEmail from "../../emails/job-application-email";
import LeadConfirmationEmail from "../../emails/lead-confirmation-email";
import ConsultationBookingConfirmationEmail from "../../emails/consultation-booking-confirmation-email";
import ConsultationRegistrationReceivedEmail from "../../emails/consultation-registration-received-email";
import LoginNotificationEmail from "../../emails/login-notification-email";
import MaintenanceRenewalEmail from "../../emails/maintenance-renewal-email";
import NewLeadNotificationEmail from "../../emails/new-lead-notification-email";
import NewsletterConfirmationEmail from "../../emails/newsletter-confirmation-email";
import NewsletterDoubleOptinEmail from "../../emails/newsletter-double-optin-email";
import OutreachSequenceEmail from "../../emails/outreach-sequence-email";
import PasswordResetEmail from "../../emails/password-reset-email";
import PaymentReceivedEmail from "../../emails/payment-received-email";
import ProjectDeliveredEmail from "../../emails/project-delivered-email";
import ProjectKickoffEmail from "../../emails/project-kickoff-email";
import ProposalSentEmail from "../../emails/proposal-sent-email";
import ResourceAccessEmail from "../../emails/resource-access-email";
import ResourceDeliveryEmail from "../../emails/resource-delivery-email";
import TestimonialRequestEmail from "../../emails/testimonial-request-email";
import WeeklyRecognitionEmail from "../../emails/weekly-recognition-email";
import WelcomeEmail from "../../emails/welcome-email";

describe("LIT EMAIL v2 Enterprise Template Suite", () => {
  const templates: Array<{ name: string; element: React.ReactElement }> = [
    {
      name: "AdminGenericEmail",
      element: <AdminGenericEmail message="Scheduled maintenance window completed successfully." />,
    },
    {
      name: "BroadcastEmail",
      element: (
        <BroadcastEmail
          fullName="Valued Client"
          subjectLine="Q4 Technology Roadmap Update"
          messageBody="We are excited to share key updates on our enterprise speech and vision systems."
        />
      ),
    },
    {
      name: "ChecklistDownloadEmail",
      element: (
        <ChecklistDownloadEmail
          fullName="Alexander Wright"
          downloadUrl="https://www.logicintelligencetechnologies.in/resources/checklist.pdf"
        />
      ),
    },
    {
      name: "ChecklistSubmissionEmail",
      element: (
        <ChecklistSubmissionEmail
          email="alexander@apexenterprises.com"
          type="Enterprise Deployment Checklist"
          answers={["Section 1: Completed", "Security Review: Passed"]}
          submissionDate="2026-10-14"
        />
      ),
    },
    {
      name: "DemoReadyEmail",
      element: (
        <DemoReadyEmail
          fullName="Elena Rostova"
          demoUrl="https://www.logicintelligencetechnologies.in/demos/enterprise-ai"
        />
      ),
    },
    {
      name: "EnterpriseChecklistAdminAlertEmail",
      element: (
        <EnterpriseChecklistAdminAlertEmail
          recipientName="Elena Rostova"
          recipientEmail="elena@novacare.com"
          company="NovaCare Health Systems"
          confirmationReference="LIT-CHK-2026-9842"
          selectedCount={42}
          adminUrl="https://www.logicintelligencetechnologies.in/admin/proposals/checklist-review?ref=LIT-CHK-2026-9842"
          clientNotes="Priority focus on zero-PHI compliance and HL7 FHIR integration."
        />
      ),
    },
    {
      name: "EnterpriseChecklistInvitationEmail",
      element: (
        <EnterpriseChecklistInvitationEmail
          recipientName="Marcus Vance"
          company="Apex Logistics"
          inviteUrl="https://www.logicintelligencetechnologies.in/checklist/invitation-token-123"
          expiresAt="2026-11-01"
        />
      ),
    },
    {
      name: "EnterpriseChecklistSubmissionReceiptEmail",
      element: (
        <EnterpriseChecklistSubmissionReceiptEmail
          recipientName="Marcus Vance"
          confirmationReference="LIT-CHK-2026-8812"
          selectedCount={38}
          selectedPoints={[
            { number: 1, title: "Deterministic Latency SLA", phase: "Phase 1: Architecture" },
            { number: 2, title: "Zero-PHI Boundary Enforcement", phase: "Phase 2: Security" },
          ]}
        />
      ),
    },
    {
      name: "FreeDemoConfirmationEmail",
      element: (
        <FreeDemoConfirmationEmail
          fullName="Marcus Vance"
        />
      ),
    },
    {
      name: "InvoiceEmail",
      element: (
        <InvoiceEmail
          fullName="Marcus Vance"
          invoiceNumber="INV-2026-104"
          amount="USD 25,000"
          dueDate="2026-11-15"
          paymentLink="https://www.logicintelligencetechnologies.in/billing/INV-2026-104"
        />
      ),
    },
    {
      name: "JobApplicationEmail",
      element: (
        <JobApplicationEmail
          fullName="Priya Sharma"
          role="Principal Speech AI Engineer"
        />
      ),
    },
    {
      name: "LeadConfirmationEmail",
      element: (
        <LeadConfirmationEmail
          fullName="Priya Sharma"
          service="Autonomous Voice Agents"
        />
      ),
    },
    {
      name: "ConsultationRegistrationReceivedEmail",
      element: (
        <ConsultationRegistrationReceivedEmail
          fullName="Priya Sharma"
          consultationType="Enterprise AI Architecture Session"
          bookingRef="LIT-BK-2026-TEST"
          slotFormatted="Saturday, October 17, 2026 at 10:00 AM (IST)"
          timezone="Asia/Kolkata (IST · UTC+05:30)"
          duration="45 Mins"
          companyName="OmniGlobal Tech"
          notes="Testing consultation registration received render."
        />
      ),
    },
    {
      name: "ConsultationBookingConfirmationEmail",
      element: (
        <ConsultationBookingConfirmationEmail
          fullName="Priya Sharma"
          consultationType="Enterprise AI Architecture Session"
          bookingRef="LIT-BK-2026-TEST"
          slotFormatted="Saturday, October 17, 2026 at 10:00 AM (IST)"
          timezone="Asia/Kolkata (IST · UTC+05:30)"
          duration="45 Mins"
          meetingUrl="https://meet.google.com/lit-arch-briefing"
          calendarAddUrl="https://calendar.google.com"
          companyName="OmniGlobal Tech"
          notes="Testing consultation confirmation render."
        />
      ),
    },
    {
      name: "LoginNotificationEmail",
      element: (
        <LoginNotificationEmail
          email="priya@example.com"
          parsedDevice="macOS / Chrome 129"
          ipAddress="103.21.14.8"
          location="Bengaluru, India"
          when="2026-10-14 18:30 IST"
        />
      ),
    },
    {
      name: "MaintenanceRenewalEmail",
      element: (
        <MaintenanceRenewalEmail
          fullName="Priya Sharma"
          expiryDate="2026-12-01"
          renewLink="https://www.logicintelligencetechnologies.in/billing/renew"
        />
      ),
    },
    {
      name: "NewLeadNotificationEmail",
      element: (
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
    {
      name: "NewsletterConfirmationEmail",
      element: (
        <NewsletterConfirmationEmail
          email="subscriber@techhorizon.io"
          unsubscribeUrl="https://www.logicintelligencetechnologies.in/unsubscribe?token=test"
        />
      ),
    },
    {
      name: "NewsletterDoubleOptinEmail",
      element: (
        <NewsletterDoubleOptinEmail
          confirmUrl="https://www.logicintelligencetechnologies.in/newsletter/confirm?token=xyz"
        />
      ),
    },
    {
      name: "OutreachSequenceEmail",
      element: (
        <OutreachSequenceEmail
          bodyHtml="<p>Following up on our discussion regarding autonomous voice agent infrastructure for enterprise workflows.</p>"
        />
      ),
    },
    {
      name: "PasswordResetEmail",
      element: (
        <PasswordResetEmail
          fullName="Sarah Chen"
          resetLink="https://www.logicintelligencetechnologies.in/auth/reset-password?token=secure123"
        />
      ),
    },
    {
      name: "PaymentReceivedEmail",
      element: (
        <PaymentReceivedEmail
          fullName="Marcus Vance"
          amount="USD 25,000"
          invoiceNumber="INV-2026-104"
        />
      ),
    },
    {
      name: "ProjectDeliveredEmail",
      element: (
        <ProjectDeliveredEmail
          fullName="Marcus Vance"
          projectName="VoiceShield Real-Time Verification Module"
        />
      ),
    },
    {
      name: "ProjectKickoffEmail",
      element: (
        <ProjectKickoffEmail
          fullName="Marcus Vance"
          projectName="VoiceShield Real-Time Verification Module"
        />
      ),
    },
    {
      name: "ProposalSentEmail",
      element: (
        <ProposalSentEmail
          fullName="Marcus Vance"
          proposalUrl="https://www.logicintelligencetechnologies.in/proposals/PRP-9021"
        />
      ),
    },
    {
      name: "ResourceAccessEmail",
      element: (
        <ResourceAccessEmail
          fullName="Sarah Chen"
          resourceTitle="Enterprise Deployment Whitepaper"
          downloadUrl="https://www.logicintelligencetechnologies.in/resources/whitepaper-2026"
        />
      ),
    },
    {
      name: "ResourceDeliveryEmail",
      element: (
        <ResourceDeliveryEmail
          fullName="Sarah Chen"
          resourceTitle="Enterprise Deployment Whitepaper"
          downloadUrl="https://www.logicintelligencetechnologies.in/resources"
        />
      ),
    },
    {
      name: "TestimonialRequestEmail",
      element: (
        <TestimonialRequestEmail
          fullName="Sarah Chen"
          reviewLink="https://www.logicintelligencetechnologies.in/testimonials/submit"
        />
      ),
    },
    {
      name: "WeeklyRecognitionEmail",
      element: (
        <WeeklyRecognitionEmail
          fullName="Arjun Dev"
          detail="Outstanding contribution to low-latency streaming speech pipeline."
        />
      ),
    },
    {
      name: "WelcomeEmail",
      element: (
        <WelcomeEmail
          fullName="Sarah Chen"
          email="sarah@example.com"
        />
      ),
    },
  ];

  it("verifies all 30 templates exist and are covered", () => {
    assert.equal(templates.length, 30);
  });

  for (const { name, element } of templates) {
    it(`renders ${name} adhering strictly to LIT EMAIL v2 specifications`, async () => {
      const html = await render(element);
      const text = await render(element, { plainText: true });

      // 1. Structure & Token Verification
      assert.ok(
        html.includes("#F7F9FC") || html.includes("rgb(247, 249, 252)") || html.includes("#F8F6F2") || html.includes("rgb(248, 246, 242)"),
        `${name}: HTML must contain cloud canvas background #F7F9FC or parchment #F8F6F2`
      );
      assert.ok(
        html.includes("#FFFFFF") || html.includes("#fff") || html.includes("rgb(255, 255, 255)") || html.includes("#FFFEFC") || html.includes("rgb(255, 254, 252)"),
        `${name}: HTML must contain crisp white card background #FFFFFF or soft white #FFFEFC`
      );
      assert.ok(
        html.includes("#0B2545") || html.includes("rgb(11, 37, 69)") || html.includes("#171717") || html.includes("rgb(23, 23, 23)"),
        `${name}: HTML must contain brand ink/navy (#0B2545 or #171717)`
      );

      // 2. Official Logo & Brand Header
      assert.ok(
        html.includes("https://www.logicintelligencetechnologies.in/assets/logo-icon.jpg"),
        `${name}: Header must contain official centered circular logo`
      );
      assert.ok(
        html.includes("LOGIC INTELLIGENCE TECHNOLOGIES"),
        `${name}: Header must contain uppercase wordmark LOGIC INTELLIGENCE TECHNOLOGIES`
      );

      // 3. Email Security Invariants
      assert.equal(
        html.includes("<script"),
        false,
        `${name}: Strictly forbidden to include <script> tags`
      );
      assert.equal(
        html.includes("javascript:"),
        false,
        `${name}: Strictly forbidden to use javascript: URLs`
      );

      // 4. Plain Text Generation Quality
      assert.ok(
        text && text.trim().length > 30,
        `${name}: Plain text rendition must be non-empty and readable`
      );
      assert.equal(
        text.includes("<table"),
        false,
        `${name}: Plain text must not include raw HTML table tags`
      );
      assert.equal(
        text.includes("<div>"),
        false,
        `${name}: Plain text must not include raw HTML div tags`
      );

      // 5. Zero Unauthenticated PHI Invariant
      const phiKeywords = [
        "diagnosis:",
        "prescription:",
        "patient blood test",
        "medical chart #",
        "hiv positive",
        "biopsy result",
      ];
      for (const kw of phiKeywords) {
        assert.equal(
          html.toLowerCase().includes(kw),
          false,
          `${name}: Strictly forbidden to leak clinical PHI: ${kw}`
        );
      }
    });
  }
});
