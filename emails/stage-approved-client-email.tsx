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

export interface StageApprovedClientEmailProps {
  recipientName?: string;
  companyName: string;
  engagementRef: string;
  approvedStageOrdinal: number;
  approvedStageTitle: string;
  nextStageOrdinal: number;
  nextStageTitle: string;
  nextStageUrl: string;
  adminNotes?: string;
}

export default function StageApprovedClientEmail({
  recipientName = "there",
  companyName,
  engagementRef,
  approvedStageOrdinal,
  approvedStageTitle,
  nextStageOrdinal,
  nextStageTitle,
  nextStageUrl,
  adminNotes,
}: StageApprovedClientEmailProps) {
  return (
    <EmailLayout preview={`Stage ${approvedStageOrdinal} Approved! Proceed to Stage ${nextStageOrdinal}: ${nextStageTitle}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Submission Approved · Milestone Unlocked</EmailTitle>
        <EmailGreeting name={recipientName} />
        <EmailBody>
          Great news! Your submission for <strong>Stage {approvedStageOrdinal}: {approvedStageTitle}</strong> has been verified and approved by the Logic Intelligence Technologies engineering leadership team for <strong>{companyName}</strong>.
        </EmailBody>

        {/* Approval Card */}
        <div
          style={{
            margin: "20px 0",
            padding: "18px 20px",
            backgroundColor: "#ECFDF5",
            borderRadius: "12px",
            border: "1px solid #A7F3D0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#065F46",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Milestone Status Update
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#047857", width: "150px" }}>Project Ref:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#064E3B", fontFamily: "monospace" }}>
                  {engagementRef}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#047857" }}>Approved Stage:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#064E3B" }}>
                  ✓ Stage {approvedStageOrdinal}: {approvedStageTitle}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#047857" }}>Unlocked Next Stage:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#1565C0" }}>
                  Stage {nextStageOrdinal}: {nextStageTitle}
                </td>
              </tr>
              {adminNotes ? (
                <tr>
                  <td style={{ padding: "6px 0", color: "#047857" }}>Engineering Note:</td>
                  <td style={{ padding: "6px 0", color: "#064E3B" }}>{adminNotes}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <EmailBody>
          You are now ready to continue to the next milestone in your enterprise project lifecycle. Click below to enter the newly unlocked stage:
        </EmailBody>

        <EmailButton href={nextStageUrl} variant="primary">
          Proceed to Stage {nextStageOrdinal}: {nextStageTitle} →
        </EmailButton>

        <EmailMuted>
          Your client portal maintains an immutable audit trail of all approved stages, agreements, and milestones.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
