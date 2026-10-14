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

export interface SelectedPointSummary {
  number: number;
  title: string;
  phase: string;
}

export interface EnterpriseChecklistSubmissionReceiptEmailProps {
  recipientName?: string;
  confirmationReference: string;
  selectedCount: number;
  selectedPoints: SelectedPointSummary[];
}

export default function EnterpriseChecklistSubmissionReceiptEmail({
  recipientName = "there",
  confirmationReference,
  selectedCount,
  selectedPoints,
}: EnterpriseChecklistSubmissionReceiptEmailProps) {
  return (
    <EmailLayout preview={`Receipt: Your 50-Point Enterprise Deployment Checklist selections (${confirmationReference})`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Checklist Selections Confirmed</EmailTitle>
        <EmailGreeting name={recipientName} />
        <EmailBody>
          Thank you for reviewing the 50-Point Enterprise Deployment Checklist. We have received your technical selections and recorded them under confirmation reference <strong>{confirmationReference}</strong>.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#F0FDF4",
            borderRadius: "12px",
            border: "1px solid #BBF7D0",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#166534", marginBottom: "6px" }}>
            Summary of Submission:
          </div>
          <div style={{ fontSize: "13px", color: "#15803D", lineHeight: "1.6" }}>
            Reference: <strong>{confirmationReference}</strong><br />
            Total Selected Points: <strong>{selectedCount} of 50</strong>
          </div>
        </div>

        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0B2545", marginBottom: "8px" }}>
          Selected Checkpoints:
        </div>
        <div
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            border: "1px solid #DFE7EF",
            borderRadius: "8px",
            padding: "12px 16px",
            backgroundColor: "#FAFBFD",
            fontSize: "12px",
            color: "#334155",
            marginBottom: "20px",
          }}
        >
          {selectedPoints.map((pt) => (
            <div key={pt.number} style={{ padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
              <strong style={{ color: "#0B2545" }}>#{pt.number}:</strong> {pt.title}
              <span style={{ display: "block", color: "#64748B", fontSize: "11px" }}>{pt.phase}</span>
            </div>
          ))}
        </div>

        <EmailBody>
          Our technical engineering team will review these selections against your architecture and reach out with tailored next steps and an aligned proposal draft.
        </EmailBody>

        <EmailMuted>
          Note: This submission registers your project checkpoint selections and does not constitute final commercial contract acceptance or regulatory compliance certification.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
