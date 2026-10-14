import * as React from "react";
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
    <EmailLayout preview={`New Checklist Selection: ${company} (${selectedCount} points)`}>
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
            backgroundColor: "#F7F9FC",
            borderRadius: "12px",
            border: "1px solid #DFE7EF",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C", width: "140px" }}>Reference:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#0B2545", fontFamily: "monospace" }}>
                  {confirmationReference}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Client Name:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#0B2545" }}>{recipientName}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Company:</td>
                <td style={{ padding: "6px 0", color: "#0B2545" }}>{company}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Email:</td>
                <td style={{ padding: "6px 0", color: "#1565C0" }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Checkpoints Selected:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#1565C0" }}>
                  {selectedCount} of 50
                </td>
              </tr>
              {clientNotes && clientNotes !== "None" && (
                <tr>
                  <td style={{ padding: "6px 0", color: "#52677C", verticalAlign: "top" }}>Client Notes:</td>
                  <td style={{ padding: "6px 0", color: "#0B2545", whiteSpace: "pre-wrap" }}>{clientNotes}</td>
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
