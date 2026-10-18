import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

export interface StaffPasswordChangedEmailProps {
  recipientName?: string;
  recipientEmail?: string;
  employeeCode?: string | null;
  changedAt?: string;
  eventReference?: string;
  supportUrl?: string;
}

export default function StaffPasswordChangedEmail({
  recipientName = "Team Member",
  recipientEmail = "member@logicintelligencetechnologies.in",
  employeeCode = null,
  changedAt = new Date().toISOString(),
  eventReference = "SEC-0000",
  supportUrl = "https://www.logicintelligencetechnologies.in/login",
}: StaffPasswordChangedEmailProps) {
  const when = (() => {
    try {
      return new Date(changedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return changedAt;
    }
  })();

  return (
    <EmailLayout
      design="workspace"
      preview="Security alert: your LIT Staff account password was changed."
    >
      <EmailHeader subBrand="Account Security Notification" />
      <EmailContent>
        <EmailTitle>Security Alert — Password Changed</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          The password for your <strong>Logic Intelligence Technologies Staff Workspace</strong>{" "}
          account has been successfully changed.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 18px",
            backgroundColor: EMAIL.colors.surfaceMuted || "#F8FAFC",
            borderRadius: "8px",
            border: `1px solid ${EMAIL.colors.border || "#E2E8F0"}`,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>
                  Account email
                </td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{recipientEmail}</td>
              </tr>
              {employeeCode ? (
                <tr>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>
                    Employee code
                  </td>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{employeeCode}</td>
                </tr>
              ) : null}
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>
                  Changed at
                </td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{when} IST</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>
                  Event reference
                </td>
                <td
                  style={{
                    padding: "6px 0",
                    color: EMAIL.colors.inkPrimary,
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                >
                  {eventReference}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmailBody>
          If you made this change, no further action is required. If you did not change your
          password, contact an authorized LIT administrator immediately and use the approved
          account-recovery process.
        </EmailBody>

        <EmailMuted>
          This message never contains passwords or tokens. Sign in only at{" "}
          <a href={supportUrl} style={{ color: EMAIL.colors.primary }}>
            the official LIT portal
          </a>
          .
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
