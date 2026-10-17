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

export interface StageDetailItem {
  label: string;
  value: string;
}

export interface StageSubmissionAdminAlertEmailProps {
  companyName: string;
  contactName: string;
  contactEmail: string;
  engagementRef: string;
  stageOrdinal: number;
  stageTitle: string;
  submittedSummary: string;
  detailsList?: StageDetailItem[];
  adminPortalUrl: string;
}

export default function StageSubmissionAdminAlertEmail({
  companyName,
  contactName,
  contactEmail,
  engagementRef,
  stageOrdinal,
  stageTitle,
  submittedSummary,
  detailsList = [],
  adminPortalUrl,
}: StageSubmissionAdminAlertEmailProps) {
  return (
    <EmailLayout design="notification" preview={`Action Required: Stage ${stageOrdinal} (${stageTitle}) submitted by ${companyName}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>New Client Submission · Action Required</EmailTitle>
        <EmailBody>
          A client has completed and submitted information for <strong>Stage {stageOrdinal}: {stageTitle}</strong>. Please review their submission in the Admin Console and approve to unlock the next lifecycle stage.
        </EmailBody>

        {/* Submission Information Table */}
        <div
          style={{
            margin: "20px 0",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
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
            Client Submission Details
          </div>

          <table style={{ width: "100%", maxWidth: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "13px", wordBreak: "break-word", overflowWrap: "anywhere" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body, width: "38%" }}>Company:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary }}>{companyName}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Contact:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>
                  {contactName} ({contactEmail})
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Project Ref:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.inkPrimary, fontFamily: "monospace" }}>
                  {engagementRef}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Stage:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: EMAIL.colors.primary }}>
                  Stage {stageOrdinal}: {stageTitle}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.body }}>Overview:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{submittedSummary}</td>
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

        <EmailButton href={adminPortalUrl} variant="primary">
          Review &amp; Approve in Admin Console
        </EmailButton>

        <EmailMuted>
          Once you verify the submission and click Approve in the Admin Engagement view, the client will be notified and their next lifecycle stage will unlock automatically.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
