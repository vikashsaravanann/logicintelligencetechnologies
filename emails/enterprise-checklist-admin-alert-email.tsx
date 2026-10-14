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
  company: string;
  confirmationReference: string;
  selectedCount: number;
  adminUrl: string;
  clientNotes: string;
}

export default function EnterpriseChecklistAdminAlertEmail({
  recipientName,
  recipientEmail,
  company,
  confirmationReference,
  selectedCount,
  adminUrl,
  clientNotes,
}: EnterpriseChecklistAdminAlertEmailProps) {
  return (
    <EmailLayout preview={`Action Required: Enterprise Checklist Submission from ${company} (${selectedCount} points)`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>New Enterprise Checklist Submission</EmailTitle>
        <EmailBody>
          A client has reviewed the 50-Point Enterprise Deployment Checklist and submitted their requirements.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid #CBD5E1",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0B2545", marginBottom: "8px" }}>
            Client Submission Details
          </div>
          <table style={{ width: "100%", fontSize: "13px", color: "#334155", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", width: "140px", color: "#64748B" }}>Client Name:</td>
                <td style={{ padding: "4px 0", fontWeight: "600" }}>{recipientName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#64748B" }}>Email:</td>
                <td style={{ padding: "4px 0" }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#64748B" }}>Company:</td>
                <td style={{ padding: "4px 0", fontWeight: "600" }}>{company}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#64748B" }}>Reference:</td>
                <td style={{ padding: "4px 0", fontFamily: "monospace" }}>{confirmationReference}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#64748B" }}>Checkpoints:</td>
                <td style={{ padding: "4px 0", fontWeight: "bold", color: "#0066CC" }}>
                  {selectedCount} of 50 Selected
                </td>
              </tr>
              {clientNotes && clientNotes !== "None" && (
                <tr>
                  <td style={{ padding: "4px 0", color: "#64748B", verticalAlign: "top" }}>Client Notes:</td>
                  <td style={{ padding: "4px 0", fontStyle: "italic" }}>{clientNotes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <EmailButton href={adminUrl}>Open Admin Review</EmailButton>

        <EmailMuted>
          You can inspect the exact checkpoints selected by the client, review each engineering requirement, and convert the selection into an editable draft proposal.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
