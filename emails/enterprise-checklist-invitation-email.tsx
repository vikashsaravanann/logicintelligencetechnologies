import * as React from "react";
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
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

export interface EnterpriseChecklistInvitationEmailProps {
  recipientName?: string;
  company?: string;
  inviteUrl?: string;
  expiresAt?: string;
}

export default function EnterpriseChecklistInvitationEmail({
  recipientName = "there",
  company,
  inviteUrl = EMAIL.siteUrl,
  expiresAt,
}: EnterpriseChecklistInvitationEmailProps) {
  const expiryFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <EmailLayout preview="Review the technical checklist and select the areas for your project.">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your 50-Point Enterprise Deployment Checklist</EmailTitle>
        <EmailGreeting name={recipientName} />
        <EmailBody>
          Please review the official Logic Intelligence Technologies 50-Point Enterprise Deployment
          Checklist{company ? ` prepared for ${company}` : ""}. It includes 50 technical checkpoints
          across eight engineering phases. You can read the complete document, select the checkpoints
          most relevant to your project, and submit your selections securely.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#F7F9FC",
            borderRadius: "12px",
            border: "1px solid #DFE7EF",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0B2545", marginBottom: "8px" }}>
            How it works:
          </div>
          <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#52677C", lineHeight: "1.6" }}>
            <li><strong>Open</strong> your private checklist invitation link below.</li>
            <li><strong>Review</strong> the full 50-point engineering specification or embedded 21-page PDF.</li>
            <li><strong>Select</strong> the checkpoints you want our engineering team to consider for your scope.</li>
            <li><strong>Submit</strong> your selection securely to receive an official confirmation reference.</li>
            <li><strong>Our team reviews</strong> the technical requirements and prepares tailored next steps.</li>
          </ol>
        </div>

        <EmailButton href={inviteUrl}>Review Your Checklist</EmailButton>

        {expiryFormatted && (
          <EmailMuted>
            This secure invitation link is active until {expiryFormatted}.
          </EmailMuted>
        )}

        <EmailMuted>
          Note: This is a project requirements selection, not a compliance certification or contractual
          acceptance. If you did not expect this message, please contact the company using verified channels.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
