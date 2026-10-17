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

export interface ProjectInvitationEmailProps {
  recipientName?: string;
  recipientEmail?: string;
  projectTitle?: string;
  requestedRole?: string;
  invitationUrl?: string;
  inviterName?: string;
  expiresInDays?: number;
}

export default function ProjectInvitationEmail({
  recipientName = "Team Member",
  recipientEmail = "member@logicintelligencetechnologies.in",
  projectTitle = "Enterprise Client Project",
  requestedRole = "Technical Collaborator",
  invitationUrl = "https://www.logicintelligencetechnologies.in/admin/invitations/sample-token/accept",
  inviterName = "Project Lead",
  expiresInDays = 7,
}: ProjectInvitationEmailProps) {
  return (
    <EmailLayout preview={`You have been invited to collaborate on ${projectTitle} (${requestedRole}).`}>
      <EmailHeader subBrand="Project Engineering & Delivery" />
      <EmailContent>
        <EmailTitle>Project Collaboration Invitation</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          You have been invited by <strong>{inviterName}</strong> to join the delivery team for:
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#F7F9FC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600, width: "140px" }}>Project:</td>
                <td style={{ padding: "6px 0", color: "#0B2545", fontWeight: 700 }}>{projectTitle}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>Assigned Role:</td>
                <td style={{ padding: "6px 0", color: "#1565C0", fontWeight: 700, textTransform: "capitalize" }}>{requestedRole}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>Recipient:</td>
                <td style={{ padding: "6px 0", color: "#0B2545", fontWeight: 600 }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>Valid For:</td>
                <td style={{ padding: "6px 0", color: "#0B2545" }}>{expiresInDays} days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmailBody>
          Accepting this invitation grants you project delivery access within your existing staff account. Your private individual workspace and document wallet remain completely isolated.
        </EmailBody>

        <div style={{ textAlign: "center", margin: "28px 0" }}>
          <EmailButton href={invitationUrl}>
            Accept & Join Project Team
          </EmailButton>
        </div>

        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            backgroundColor: "#EFF6FF",
            borderLeft: "4px solid #3B82F6",
            borderRadius: "4px",
            fontSize: "12.5px",
            color: "#1E40AF",
            lineHeight: "1.5",
          }}
        >
          <strong>Security Notice:</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
            <li>This invitation link is cryptographically bound to your official account and is valid for a single use.</li>
            <li>You must be logged in with <strong>{recipientEmail}</strong> to accept.</li>
            <li>Commercial financials (Stage 6 and Stage 11) remain strictly restricted to the Super Admin.</li>
          </ul>
        </div>

        <EmailMuted>
          Direct Acceptance Link: <br />
          <a
            href={invitationUrl}
            style={{ color: "#1565C0", wordBreak: "break-all", fontSize: "12px", textDecoration: "underline" }}
          >
            {invitationUrl}
          </a>
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
