import * as React from "react";
import { EMAIL } from "./components/email-styles";
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

export interface StageDetailItem {
  label: string;
  value: string;
}

export interface StageSubmissionClientReceiptEmailProps {
  recipientName?: string;
  companyName: string;
  engagementRef: string;
  stageOrdinal: number;
  stageTitle: string;
  submittedSummary: string;
  detailsList?: StageDetailItem[];
  portalUrl: string;
  nextStageTitle?: string;
}

export default function StageSubmissionClientReceiptEmail({
  recipientName = "there",
  companyName,
  engagementRef,
  stageOrdinal,
  stageTitle,
  submittedSummary,
  detailsList = [],
  portalUrl,
  nextStageTitle,
}: StageSubmissionClientReceiptEmailProps) {
  return (
    <EmailLayout design="transactional" preview={`Submission Confirmed: Stage ${stageOrdinal} (${stageTitle}) - ${engagementRef}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Submission Confirmed · Stage {stageOrdinal}</EmailTitle>
        <EmailGreeting name={recipientName} />
        <EmailBody>
          Thank you for completing and submitting your information for <strong>Stage {stageOrdinal}: {stageTitle}</strong> for <strong>{companyName}</strong>. Your inputs have been recorded in our engineering registry.
        </EmailBody>

        {/* Submission Details Card */}
        <div
          style={{
            margin: "20px 0",
            padding: "18px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            borderRadius: "12px",
            border: `1px solid ${EMAIL.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: EMAIL.colors.primary,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Engagement Submission Record
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body, width: "140px" }}>Project Ref:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary, fontFamily: "monospace" }}>
                  {engagementRef}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Current Stage:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary }}>
                  Stage {stageOrdinal}: {stageTitle}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Summary:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>
                  {submittedSummary}
                </td>
              </tr>
              {detailsList.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>{item.label}:</td>
                  <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, fontWeight: "500" }}>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Status Banner */}
        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            backgroundColor: "#FEF3C7",
            borderRadius: "10px",
            border: "1px solid #FCD34D",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#92400E", marginBottom: "4px" }}>
            Under Senior Engineering Verification
          </div>
          <div style={{ fontSize: "12px", color: "#78350F", lineHeight: "18px" }}>
            Our team will review and approve your submission. Once verified, you will receive an approval notification and {nextStageTitle ? `Stage ${stageOrdinal + 1}: ${nextStageTitle}` : "the next stage"} will automatically unlock in your portal.
          </div>
        </div>

        <EmailButton href={portalUrl} variant="primary">
          Open Your Client Portal
        </EmailButton>

        <EmailMuted>
          You can track live milestone progress and access project documents at any time from your portal.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
