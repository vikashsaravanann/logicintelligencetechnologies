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
  phase: number | string;
}

export interface EnterpriseChecklistSubmissionReceiptEmailProps {
  recipientName?: string;
  confirmationReference: string;
  selectedCount: number;
  selectedPoints?: SelectedPointSummary[];
}

export default function EnterpriseChecklistSubmissionReceiptEmail({
  recipientName = "there",
  confirmationReference,
  selectedCount,
  selectedPoints = [],
}: EnterpriseChecklistSubmissionReceiptEmailProps) {
  return (
    <EmailLayout preview={`Receipt: ${selectedCount} checkpoints submitted [${confirmationReference}]`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Checklist Selection Received</EmailTitle>
        <EmailGreeting name={recipientName} />
        <EmailBody>
          Thank you for submitting your project requirements from the 50-Point Enterprise Deployment
          Checklist. We have recorded your selections securely in our engineering registry.
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#E7F3FF",
            borderRadius: "12px",
            border: "1px solid #B9DCFF",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1565C0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Confirmation Reference
          </div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0B2545", fontFamily: "monospace" }}>
            {confirmationReference}
          </div>
          <div style={{ fontSize: "12px", color: "#52677C", marginTop: "4px" }}>
            Total checkpoints selected: <strong>{selectedCount} of 50</strong>
          </div>
        </div>

        {selectedPoints.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0B2545", marginBottom: "10px" }}>
              Summary of Selected Scope Areas:
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#52677C", lineHeight: "1.6" }}>
              {selectedPoints.slice(0, 15).map((pt) => (
                <li key={pt.number}>
                  Point {String(pt.number).padStart(2, "0")} ({typeof pt.phase === "number" || !String(pt.phase).toLowerCase().startsWith("phase") ? `Phase ${pt.phase}` : pt.phase}): {pt.title}
                </li>
              ))}
              {selectedPoints.length > 15 && (
                <li>... and {selectedPoints.length - 15} additional checkpoints.</li>
              )}
            </ul>
          </div>
        )}

        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            backgroundColor: "#F7F9FC",
            borderRadius: "10px",
            border: "1px solid #DFE7EF",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#0B2545", marginBottom: "4px" }}>
            What happens next:
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#52677C", lineHeight: "1.5" }}>
            Our principal engineering team is reviewing your selected points against our architectural
            baseline. We will schedule a brief technical discovery discussion or prepare a tailored
            commercial Statement of Work for your review.
          </p>
        </div>

        <EmailMuted>
          Please keep this confirmation reference for your records. If you need to make changes or have questions, reply directly to this email.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
