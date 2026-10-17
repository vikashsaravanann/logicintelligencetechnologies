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

export interface ClientRequestRoutedEmailProps {
  staffName?: string;
  requestType?: string;
  summary?: string;
  clientEmail?: string;
  actionUrl?: string;
}

export default function ClientRequestRoutedEmail({
  staffName = "Team Member",
  requestType = "CLIENT MESSAGE",
  summary = "Client submitted an inquiry regarding project delivery.",
  clientEmail = "client@example.com",
  actionUrl = "https://www.logicintelligencetechnologies.in/admin/command-center",
}: ClientRequestRoutedEmailProps) {
  return (
    <EmailLayout design="support" preview={`[Action Required] New ${requestType} from ${clientEmail}`}>
      <EmailHeader subBrand="Client Request Operations" />
      <EmailContent>
        <EmailTitle>New Client Request Assigned to You</EmailTitle>
        <EmailGreeting name={staffName} />

        <EmailBody>
          A client action has been automatically routed to your queue based on your active project assignment:
        </EmailBody>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            border: `1px solid ${EMAIL.colors.border}`,
            borderRadius: "8px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600, width: "140px" }}>Category:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.primary, fontWeight: 700 }}>{requestType}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>Client Email:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary, fontWeight: 600 }}>{clientEmail}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: EMAIL.colors.muted, fontWeight: 600 }}>Summary:</td>
                <td style={{ padding: "6px 0", color: EMAIL.colors.inkPrimary }}>{summary}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmailBody>
          Please review the request and respond through the official Command Center portal under your verified staff credentials.
        </EmailBody>

        <div style={{ textAlign: "center", margin: "28px 0" }}>
          <EmailButton href={actionUrl}>
            View in Command Center
          </EmailButton>
        </div>

        <EmailMuted>
          Direct Action Link: <br />
          <a
            href={actionUrl}
            style={{ color: EMAIL.colors.primary, wordBreak: "break-all", fontSize: "12px", textDecoration: "underline" }}
          >
            {actionUrl}
          </a>
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
