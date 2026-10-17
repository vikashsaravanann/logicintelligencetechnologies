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
    <EmailLayout design="workspace" preview={`Your private LIT Staff Admin Workspace (${jobTitle}) is ready.`}>
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
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            padding: "16px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            border: `1px solid ${EMAIL.colors.border}`,
            borderRadius: "8px",
          }}
        >
          <table style={{ width: "100%", maxWidth: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "13px", wordBreak: "break-word", overflowWrap: "anywhere" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600, width: "38%" }}>Official Account:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, fontWeight: 700 }}>{recipientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>Designation:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, fontWeight: 600 }}>{jobTitle} ({department})</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>System Role:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.primary, fontWeight: 700, textTransform: "uppercase" }}>{systemRole}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>Workspace ID:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, fontFamily: "monospace", fontSize: "12px" }}>{workspaceUuid}</td>
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
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
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
            style={{ color: EMAIL.colors.primary, wordBreak: "break-all", overflowWrap: "anywhere", fontSize: "12px", textDecoration: "underline" }}
          >
            {workspaceUrl}
          </a>
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
