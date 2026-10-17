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

interface Props {
  fullName?: string;
  downloadUrl?: string;
}

export default function ChecklistDownloadEmail({
  fullName = "there",
  downloadUrl = "https://www.logicintelligencetechnologies.in/checklist",
}: Props) {
  return (
    <EmailLayout design="documents" preview="Your 50-point enterprise deployment checklist is ready">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your 50-Point Enterprise Deployment Checklist is Ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for requesting the official 50-Point Enterprise Deployment Checklist (Standard Operating Procedure) from Logic Intelligence
          Technologies.
        </EmailBody>
        <EmailBody>
          We have attached the complete 21-page specification PDF directly to this email. You can also access or download the latest copy anytime using the secure button below:
        </EmailBody>
        <EmailButton href={downloadUrl}>Download Checklist PDF</EmailButton>
        <EmailMuted>
          This official SOP defines 50 testable checkpoints across 8 software-development lifecycle phases, from architecture and database integrity to AI/voice pipelines and zero-downtime release governance.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
