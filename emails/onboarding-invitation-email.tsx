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
import { COMPANY } from "@/config/company";

export interface OnboardingInvitationEmailProps {
  recipientName?: string;
  companyName?: string;
  projectTitle?: string;
  onboardingUrl?: string;
  expiresAt?: string;
}

export default function OnboardingInvitationEmail({
  recipientName = "Client Partner",
  companyName = "Your Organization",
  projectTitle = "Enterprise Digital Architecture",
  onboardingUrl = `${EMAIL.siteUrl}/onboard`,
  expiresAt,
}: OnboardingInvitationEmailProps) {
  const expiryFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "14 days from issuance";

  return (
    <EmailLayout design="onboarding" preview={`Complete technical onboarding for ${companyName} (${projectTitle})`}>
      <EmailHeader subBrand="Client Technical Onboarding" />
      <EmailContent>
        <EmailTitle>Client Technical Onboarding & Systems Setup</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          Welcome to Logic Intelligence Technologies. Your project <strong>{projectTitle}</strong> is
          ready for technical onboarding. Please access your dedicated onboarding portal to configure
          technical specifications, team member access, and repository permissions.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "18px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            borderRadius: "12px",
            border: `1px solid ${EMAIL.colors.border}`,
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "bold", color: EMAIL.colors.inkPrimary, marginBottom: "10px" }}>
            Onboarding Overview:
          </div>
          <table style={{ width: "100%", fontSize: "13px", color: EMAIL.colors.inkPrimary, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body, width: "35%" }}>Organization:</td>
                <td style={{ padding: "4px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{companyName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Project Scope:</td>
                <td style={{ padding: "4px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{projectTitle}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Token Validity:</td>
                <td style={{ padding: "4px 0", color: "#065F46", fontWeight: 600 }}>Until {expiryFormatted}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Security:</td>
                <td style={{ padding: "4px 0", color: EMAIL.colors.primary }}>Single-Use Cryptographic Token · SHA-256 Hashed</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: "center", margin: "28px 0" }}>
          <EmailButton href={onboardingUrl}>
            Start Technical Onboarding
          </EmailButton>
        </div>

        <div
          style={{
            margin: "20px 0",
            padding: "14px 16px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            border: `1px solid ${EMAIL.colors.border}`,
            fontSize: "12px",
            color: EMAIL.colors.body,
            lineHeight: "1.5",
          }}
        >
          <strong>Security Note:</strong> This onboarding link contains a high-entropy, single-use authentication token.
          Do not forward this email. Once your onboarding information has been submitted and verified by our engineering team,
          your production environment provisioning will begin immediately.
        </div>

        <EmailMuted>
          If you have questions or require technical assistance during setup, please reply directly to this email or reach us at {COMPANY.supportEmail}.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
