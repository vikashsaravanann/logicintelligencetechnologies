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
    <EmailLayout preview={`Action Required: Stage ${stageOrdinal} (${stageTitle}) submitted by ${companyName}`}>
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
            padding: "18px 20px",
            backgroundColor: "#F7F9FC",
            borderRadius: "12px",
            border: "1px solid #DFE7EF",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#1565C0",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Client Submission Details
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C", width: "140px" }}>Company:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#0B2545" }}>{companyName}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Contact:</td>
                <td style={{ padding: "6px 0", color: "#0B2545" }}>
                  {contactName} ({contactEmail})
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Project Ref:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#0B2545", fontFamily: "monospace" }}>
                  {engagementRef}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Stage:</td>
                <td style={{ padding: "6px 0", fontWeight: "bold", color: "#1565C0" }}>
                  Stage {stageOrdinal}: {stageTitle}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#52677C" }}>Overview:</td>
                <td style={{ padding: "6px 0", color: "#0B2545" }}>{submittedSummary}</td>
              </tr>
              {detailsList.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px 0", color: "#52677C" }}>{item.label}:</td>
                  <td style={{ padding: "6px 0", color: "#0B2545", fontWeight: "500" }}>{item.value}</td>
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
