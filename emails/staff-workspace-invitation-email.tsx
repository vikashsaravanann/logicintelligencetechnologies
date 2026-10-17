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
import { EMAIL } from "./components/email-styles";

export interface StaffWorkspaceInvitationEmailProps {
  recipientName?: string;
  recipientEmail?: string;
  jobTitle?: string;
  department?: string;
  systemRole?: string;
  workspaceUrl?: string;
  workspaceUuid?: string;
}

export default function StaffWorkspaceInvitationEmail({
  recipientName = "Team Member",
  recipientEmail = "member@logicintelligencetechnologies.in",
  jobTitle = "Software Engineer",
  department = "Engineering",
  systemRole = "developer",
  workspaceUrl = "https://www.logicintelligencetechnologies.in/login?next=/admin/workspaces/sample-uuid",
  workspaceUuid = "e0000000-0000-0000-0000-000000000001",
}: StaffWorkspaceInvitationEmailProps) {
  return (
    <EmailLayout preview={`Your private LIT Staff Admin Workspace (${jobTitle}) is ready.`}>
      <EmailHeader subBrand="Staff Identity & Workspace Provisioning" />
      <EmailContent>
        <EmailTitle>Your Staff Admin Workspace Is Ready</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          A private, person-specific <strong>Logic Intelligence Technologies Admin Workspace</strong> has been provisioned for your official account.
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
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600, width: "140px" }}>Official Account:</td>
                <td style={{ padding: "6px 0", color: "#0B2545", fontWeight: 700 }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>Designation:</td>
                <td style={{ padding: "6px 0", color: "#0B2545", fontWeight: 600 }}>{jobTitle} ({department})</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>System Role:</td>
                <td style={{ padding: "6px 0", color: "#1565C0", fontWeight: 700, textTransform: "uppercase" }}>{systemRole}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#64748B", fontWeight: 600 }}>Workspace ID:</td>
                <td style={{ padding: "6px 0", color: "#0B2545", fontFamily: "monospace", fontSize: "12px" }}>{workspaceUuid}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmailBody>
          To access your workspace, click the button below to sign in at the official LIT portal. Please use your registered email and the <strong>temporary initial password communicated separately by company leadership</strong>.
        </EmailBody>

        <div style={{ textAlign: "center", margin: "28px 0" }}>
          <EmailButton href={workspaceUrl}>
            Open My Admin Workspace
          </EmailButton>
        </div>

        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            backgroundColor: "#FFFBEB",
            borderLeft: "4px solid #F59E0B",
            borderRadius: "4px",
            fontSize: "12.5px",
            color: "#92400E",
            lineHeight: "1.5",
          }}
        >
          <strong>Security Notice:</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
            <li>You will be prompted to verify your email and set a new personal password upon your first sign-in.</li>
            <li>For security compliance, passwords are <em>never</em> sent via email. If you have not received your initial temporary password, please contact the founder or administrator directly.</li>
            <li>Do not forward this email or share your workspace link.</li>
          </ul>
        </div>

        <EmailMuted>
          Direct Workspace Link: <br />
          <a
            href={workspaceUrl}
            style={{ color: "#1565C0", wordBreak: "break-all", fontSize: "12px", textDecoration: "underline" }}
          >
            {workspaceUrl}
          </a>
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
