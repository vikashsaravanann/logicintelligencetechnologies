import * as React from "react";
import { EMAIL } from "./components/email-styles";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import {
  EmailContent,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";

export interface EnterpriseChecklistAdminAlertEmailProps {
  recipientName: string;
  recipientEmail: string;
  company?: string;
  confirmationReference: string;
  selectedCount: number;
  adminUrl: string;
  clientNotes?: string;
}

export default function EnterpriseChecklistAdminAlertEmail({
  recipientName,
  recipientEmail,
  company = "—",
  confirmationReference,
  selectedCount,
  adminUrl,
  clientNotes = "None",
}: EnterpriseChecklistAdminAlertEmailProps) {
  return (
    <EmailLayout design="notification" preview={`New Checklist Selection: ${company} (${selectedCount} points)`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>New Enterprise Checklist Submission</EmailTitle>
        <EmailBody>
          A client has completed and submitted their selections on the 50-Point Enterprise Deployment Checklist.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            borderRadius: "12px",
            border: `1px solid ${EMAIL.colors.border}`,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body, width: "140px" }}>Reference:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary, fontFamily: "monospace" }}>
                  {confirmationReference}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Client Name:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary }}>{recipientName}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Company:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{company}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Email:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.primary }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Checkpoints Selected:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.primary }}>
                  {selectedCount} of 50
                </td>
              </tr>
              {clientNotes && clientNotes !== "None" && (
                <tr>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.body, verticalAlign: "top" }}>Client Notes:</td>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, whiteSpace: "pre-wrap" }}>{clientNotes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <EmailButton href={adminUrl}>Open In Admin Console</EmailButton>

        <EmailMuted>
          Action required: Review selected checkpoints, mark review status, and prepare an editable proposal draft if scope is ready.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
