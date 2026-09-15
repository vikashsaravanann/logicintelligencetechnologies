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
    <EmailLayout preview="Your website checklist is ready">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your checklist is ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thanks for requesting the website checklist from Logic Intelligence
          Technologies. Use the button below to access it.
        </EmailBody>
        <EmailButton href={downloadUrl}>Download checklist</EmailButton>
        <EmailMuted>Keep this email for easy access later.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
