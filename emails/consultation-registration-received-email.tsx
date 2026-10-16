import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
  EmailInfoGrid,
  EmailInfoRow,
  EmailNotice,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";
import { COMPANY } from "@/config/company";

export interface ConsultationRegistrationReceivedEmailProps {
  fullName?: string;
  consultationType?: string;
  bookingRef?: string;
  slotFormatted?: string;
  timezone?: string;
  duration?: string;
  companyName?: string;
  notes?: string;
}

export const ConsultationRegistrationReceivedEmail = ({
  fullName = "there",
  consultationType = "Technical Discovery Call",
  bookingRef = "LIT-BK-2026",
  slotFormatted = "Requested Slot",
  timezone = "Asia/Kolkata (IST · UTC+05:30)",
  duration = "45 Mins",
  companyName,
  notes,
}: ConsultationRegistrationReceivedEmailProps) => {
  const shortRef = bookingRef.includes("-") && bookingRef.length > 12
    ? bookingRef.slice(0, 8).toUpperCase()
    : bookingRef;

  return (
    <EmailLayout preview={`Consultation Request Received: ${consultationType} on ${slotFormatted}`}>
      <EmailHeader subBrand="Engineering Consultation & Technical Briefing" />
      <EmailContent>
        <EmailTitle>We Have Received Your Consultation Request</EmailTitle>
        <EmailGreeting name={fullName} />

        <EmailBody>
          Thank you for reaching out to Logic Intelligence Technologies. We have successfully logged
          your consultation booking request for our engineering advisory team.
        </EmailBody>

        {/* Appointment Ledger Grid */}
        <EmailInfoGrid>
          <EmailInfoRow label="Session Format" value={consultationType} />
          <EmailInfoRow
            label="Requested Slot"
            value={<strong style={{ color: EMAIL.colors.primary }}>{slotFormatted}</strong>}
          />
          <EmailInfoRow label="Timezone" value={timezone} />
          <EmailInfoRow label="Estimated Duration" value={duration} />
          <EmailInfoRow
            label="Booking Reference"
            value={<span style={{ fontFamily: "monospace", fontWeight: 700 }}>#{shortRef}</span>}
          />
          {companyName ? (
            <EmailInfoRow label="Organization" value={companyName} />
          ) : null}
          <EmailInfoRow
            label="Current Status"
            value={
              <span style={{ color: "#B45309", fontWeight: 700 }}>
                ⏳ Received · Pending Review & Confirmation
              </span>
            }
            isLast={true}
          />
        </EmailInfoGrid>

        {notes ? (
          <Section
            style={{
              backgroundColor: "#F7F9FC",
              border: `1px solid ${EMAIL.colors.border}`,
              borderRadius: "8px",
              padding: "14px 18px",
              margin: "16px 0 20px 0",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0B2545",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 6px 0",
                fontFamily: EMAIL.font,
              }}
            >
              Your Architecture & Project Notes:
            </Text>
            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: "#121826",
                fontFamily: "monospace",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {notes}
            </Text>
          </Section>
        ) : null}

        {/* Notice of next step */}
        <EmailNotice variant="info">
          <strong>What happens next?</strong> Our engineering architects are reviewing your briefing notes to pair you with the right specialist. Once confirmed, you will receive an official Google Meet conference link and a calendar (.ics) invitation directly to your inbox.
        </EmailNotice>

        <Section style={{ marginTop: 24, marginBottom: 16 }}>
          <EmailBody>
            If you need to reschedule or share additional architectural specifications prior to confirmation,
            simply reply to this email or reach us directly at{" "}
            <strong style={{ color: EMAIL.colors.primary }}>{COMPANY.email}</strong>.
          </EmailBody>
        </Section>

        <EmailMuted>
          We look forward to collaborating on your technology architecture.
        </EmailMuted>
      </EmailContent>
      <EmailFooter signature="Logic Intelligence Technologies Engineering Desk" />
    </EmailLayout>
  );
};

export default ConsultationRegistrationReceivedEmail;
