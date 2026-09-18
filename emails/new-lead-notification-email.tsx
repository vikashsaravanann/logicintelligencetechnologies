import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton, EmailButtonGroup } from "./components/email-button";
import {
  EmailContent,
  EmailTitle,
  EmailBody,
  EmailMuted,
  softBoxStyle,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface NewLeadNotificationEmailProps {
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  service?: string;
  requirements?: string;
  submissionDate?: string;
  Budget?: string;
  budget?: string;
}

export const NewLeadNotificationEmail = ({
  fullName,
  companyName,
  email,
  phone,
  service,
  requirements,
  submissionDate,
  Budget,
  budget,
}: NewLeadNotificationEmailProps) => {
  return (
    <EmailLayout preview={`New lead: ${fullName || "unknown"}${service ? ` — ${service}` : ""}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>New website enquiry</EmailTitle>
        <EmailBody>A new lead was submitted on the website.</EmailBody>
        <Section style={softBoxStyle}>
          <InfoRow label="Name" value={fullName} />
          <InfoRow label="Email" value={email} />
          {phone ? <InfoRow label="Phone" value={phone} /> : null}
          {companyName ? <InfoRow label="Company" value={companyName} /> : null}
          {service ? <InfoRow label="Service" value={service} /> : null}
          {submissionDate ? <InfoRow label="Submitted" value={submissionDate} /> : null}
          {requirements ? <InfoRow label="Details" value={requirements} /> : null}
          {(Budget || budget) ? <InfoRow label="Budget" value={Budget || budget} /> : null}
        </Section>
        <EmailButtonGroup>
          <EmailButton href={`${EMAIL.siteUrl}/admin/command-center`}>Open Admin Dashboard</EmailButton>
          <EmailButton href={`${EMAIL.siteUrl}/admin/leads`} variant="secondary">Open leads</EmailButton>
        </EmailButtonGroup>
        <EmailMuted>Reply-To is set to the customer email when available.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <Row style={{ marginBottom: "8px" }}>
      <Column style={{ width: "110px", verticalAlign: "top" as const }}>
        <Text style={labelText}>{label}</Text>
      </Column>
      <Column>
        <Text style={valueText}>{value ?? "—"}</Text>
      </Column>
    </Row>
  );
}

const labelText = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  margin: "0",
  fontFamily: EMAIL.font,
};
const valueText = {
  color: EMAIL.colors.text,
  fontSize: "13px",
  margin: "0",
  fontFamily: EMAIL.font,
  wordBreak: "break-word" as const,
};

export default NewLeadNotificationEmail;
