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

export interface ProjectDeliveredEmailProps {
  fullName?: string;
  projectName?: string;
  liveUrl?: string;
}

export default function ProjectDeliveredEmail({
  fullName = "there",
  projectName = "Your Project",
  liveUrl,
}: ProjectDeliveredEmailProps) {
  return (
    <EmailLayout preview={`Project delivered: ${projectName}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Project delivered</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          <strong>{projectName}</strong> is live. Review the delivery and share
          any feedback with our team.
        </EmailBody>
        <EmailButton href={liveUrl || EMAIL.siteUrl}>View live project</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
