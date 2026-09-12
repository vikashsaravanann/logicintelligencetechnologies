import { Text, Section, Link, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";

interface LeadConfirmationEmailProps {
  fullName: string;
  service: string;
}

export const LeadConfirmationEmail = ({ fullName, service }: LeadConfirmationEmailProps) => {
  return (
    <EmailLayout preview="We received your request — Logic Intelligence Technologies">
      <EmailHeader />
      <Section style={content}>
        <Text style={greeting}>Hi {fullName},</Text>

        <Text style={heroText}>We received your request.</Text>

        <Text style={paragraph}>
          Thank you for reaching out to <strong>Logic Intelligence Technologies</strong>.
          This message confirms we received your submission regarding <strong>{service}</strong>.
        </Text>

        <Text style={paragraph}>
          Our team will review your details and follow up by email. If you need
          to add anything, reply directly to this message.
        </Text>

        <Text style={paragraph}>
          <EmailButton href="https://www.logicintelligencetechnologies.in/work">
            Explore our work
          </EmailButton>
        </Text>

        <Hr style={divider} />

        <Section style={signatureBlock}>
          <Text style={signatureName}>The team at Logic Intelligence Technologies</Text>
          <Text style={signatureContact}>
            support@logicintelligencetechnologies.in
          </Text>
          <Link
            href="https://www.logicintelligencetechnologies.in"
            style={signatureLink}
          >
            www.logicintelligencetechnologies.in
          </Link>
        </Section>
      </Section>
      <EmailFooter />
    </EmailLayout>
  );
};

export default LeadConfirmationEmail;

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

const signatureContact = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 2px 0",
  lineHeight: "18px",
};

const signatureLink = {
  color: "#2563eb",
  fontSize: "13px",
  textDecoration: "underline",
};
