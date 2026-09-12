import { Text, Section, Link, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";

interface WeeklyRecognitionEmailProps {
  fullName: string;
  dashboardUrl: string;
  unsubscribeUrl?: string;
}

export const WeeklyRecognitionEmail = ({
  fullName,
  dashboardUrl,
  unsubscribeUrl,
}: WeeklyRecognitionEmailProps) => {
  return (
    <EmailLayout preview="Checking in from Logic Intelligence Technologies">
      <EmailHeader />
      <Section style={content}>
        <Text style={greeting}>Hi {fullName},</Text>

        <Text style={heroText}>Let's bring your ideas to life</Text>

        <Text style={paragraph}>
          We noticed you've been exploring what Logic Intelligence Technologies
          has to offer. If you have a project in mind, we would like to help you
          build it.
        </Text>

        <Text style={paragraph}>
          Whether you have a detailed brief or just a concept, we can help with
          web products, AI systems, and production software.
        </Text>

        <Text style={paragraph}>
          <EmailButton href={dashboardUrl}>Visit your dashboard</EmailButton>
        </Text>

        <Hr style={divider} />

        <Text style={paragraph}>
          If you would like a short conversation about your needs, reply to this
          email.
        </Text>

        <Section style={signatureBlock}>
          <Text style={signatureName}>Vikash Saravanan</Text>
          <Text style={signatureTitle}>Founder</Text>
          <Text style={signatureCompany}>Logic Intelligence Technologies</Text>
          <Link
            href="https://www.logicintelligencetechnologies.in"
            style={signatureLink}
          >
            www.logicintelligencetechnologies.in
          </Link>
        </Section>
      </Section>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
};

export default WeeklyRecognitionEmail;

const content = {
  padding: "36px 40px",
};

const greeting = {
  color: "#111827",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 8px 0",
};

const heroText = {
  color: "#111827",
  fontSize: "22px",
  fontWeight: "700" as const,
  lineHeight: "30px",
  margin: "0 0 24px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0 0 16px 0",
};

const divider = {
  borderTop: "1px solid #e5e7eb",
  margin: "28px 0",
};

const signatureBlock = {
  borderLeft: "3px solid #2563eb",
  paddingLeft: "16px",
  margin: "0",
};

const signatureName = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "700" as const,
  margin: "0 0 4px 0",
  lineHeight: "18px",
};

const signatureTitle = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 2px 0",
  lineHeight: "18px",
};

const signatureCompany = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 4px 0",
  lineHeight: "18px",
};

const signatureLink = {
  color: "#2563eb",
  fontSize: "13px",
  textDecoration: "underline",
};
