import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
  EmailInfoGrid,
  EmailInfoRow,
  EmailNotice,
  EmailStepList,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";
import { COMPANY } from "@/config/company";

export interface ConsultationBookingConfirmationEmailProps {
  fullName?: string;
  consultationType?: string;
  bookingRef?: string;
  slotFormatted?: string;
  timezone?: string;
  duration?: string;
  meetingUrl?: string;
  calendarAddUrl?: string;
  companyName?: string;
  notes?: string;
}

export const ConsultationBookingConfirmationEmail = ({
  fullName = "there",
  consultationType = "Technical Discovery Call",
  bookingRef = "LIT-BK-2026",
  slotFormatted = "Upcoming Confirmed Slot",
  timezone = "Asia/Kolkata (IST · UTC+05:30)",
  duration = "45 Mins",
  meetingUrl = "https://meet.google.com/lit-arch-briefing",
  calendarAddUrl,
  companyName,
  notes,
}: ConsultationBookingConfirmationEmailProps) => {
  const shortRef = bookingRef.includes("-") && bookingRef.length > 12
    ? bookingRef.slice(0, 8).toUpperCase()
    : bookingRef;

  return (
    <EmailLayout design="transactional" preview={`Consultation Confirmed: ${consultationType} on ${slotFormatted}`}>
      <EmailHeader subBrand="Engineering Consultation & Technical Briefing" />
      <EmailContent>
        <EmailTitle>Your Technical Consultation is Confirmed</EmailTitle>
        <EmailGreeting name={fullName} />

        <EmailBody>
          Thank you for scheduling a technical consultation session with Logic Intelligence Technologies.
          Your briefing slot has been confirmed and reserved with our engineering leadership.
        </EmailBody>

        {/* Appointment Ledger Grid */}
        <EmailInfoGrid>
          <EmailInfoRow label="Session Format" value={consultationType} />
          <EmailInfoRow
            label="Scheduled Slot"
            value={<strong style={{ color: EMAIL.colors.primary }}>{slotFormatted}</strong>}
          />
          <EmailInfoRow label="Timezone" value={timezone} />
          <EmailInfoRow label="Duration" value={duration} />
          <EmailInfoRow
            label="Reference ID"
            value={<span style={{ fontFamily: "monospace", fontWeight: 700 }}>#{shortRef}</span>}
          />
          <EmailInfoRow
            label="Video Platform"
            value="Google Meet (Secure HD Teleconference)"
          />
          {companyName ? (
            <EmailInfoRow label="Organization" value={companyName} />
          ) : null}
          <EmailInfoRow
            label="Status"
            value={
              <span style={{ color: "#065F46", fontWeight: 600 }}>
                ● Confirmed · Calendar Invitation Attached
              </span>
            }
            isLast={true}
          />
        </EmailInfoGrid>

        {/* Prominent Video Invitation Link */}
        <Section style={{ textAlign: "center", margin: "24px 0 16px 0" }}>
          <EmailButton href={meetingUrl} variant="primary">
            Join Video Briefing (Google Meet)
          </EmailButton>
          <Text
            style={{
              fontSize: "12px",
              color: EMAIL.colors.muted,
              margin: "8px 0 0 0",
              fontFamily: EMAIL.fontSans,
            }}
          >
            Direct Video Link:{" "}
            <Link href={meetingUrl} style={{ color: EMAIL.colors.primary, textDecoration: "underline" }}>
              {meetingUrl}
            </Link>
          </Text>
          {calendarAddUrl ? (
            <Text
              style={{
                fontSize: "12px",
                color: EMAIL.colors.muted,
                margin: "6px 0 0 0",
                fontFamily: EMAIL.fontSans,
              }}
            >
              <Link
                href={calendarAddUrl}
                style={{
                  color: EMAIL.colors.link,
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                + Add to Google Calendar directly
              </Link>
            </Text>
          ) : null}
        </Section>

        {/* Calendar Attachment Notice */}
        <EmailNotice variant="success">
          <strong>Calendar Invitation (.ics) Attached:</strong> An official iCalendar (.ics) invite is attached
          to this message. Opening or previewing the attachment will automatically synchronize this appointment,
          including the Google Meet link, to your Google Calendar, Apple Calendar, or Microsoft Outlook.
        </EmailNotice>

        {/* Agenda / Notes if provided */}
        {notes ? (
          <Section
            style={{
              backgroundColor: EMAIL.colors.surfaceMuted,
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
                color: EMAIL.colors.inkPrimary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 6px 0",
                fontFamily: EMAIL.fontSans,
              }}
            >
              Submitted Agenda / Architecture Scope:
            </Text>
            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: EMAIL.colors.body,
                margin: 0,
                fontFamily: EMAIL.fontSans,
              }}
            >
              {notes}
            </Text>
          </Section>
        ) : null}

        {/* Preparation Guidelines */}
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: EMAIL.colors.inkPrimary,
            margin: "24px 0 10px 0",
            fontFamily: EMAIL.fontSans,
          }}
        >
          What to Expect During Your Briefing:
        </Text>

        <EmailStepList
          steps={[
            {
              title: "Scoping & Architecture Analysis",
              desc: "Our engineering leads review your requirements and latency targets beforehand so we jump straight into technical solutions.",
            },
            {
              title: "Direct Principal Engineer Review",
              desc: "You will collaborate directly with our solutions architects to scrutinize database modeling, LLM pipelines, and cloud topology.",
            },
            {
              title: "NDA Standard Guaranteed",
              desc: "All discussions and proprietary architecture patterns are conducted under strict mutual confidentiality.",
            },
            {
              title: "Actionable Engineering Memo",
              desc: "Within 24 hours post-briefing, you will receive an executive architecture summary with recommended specifications.",
            },
          ]}
        />

        <EmailMuted>
          Need to reschedule or add colleagues to the briefing? Simply reply directly to this email or reach our
          engineering desk on WhatsApp at {COMPANY.phone}.
        </EmailMuted>
      </EmailContent>
      <EmailFooter signature="Logic Intelligence Technologies Solutions Team" />
    </EmailLayout>
  );
};

export default ConsultationBookingConfirmationEmail;
