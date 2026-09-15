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

export interface ProjectKickoffEmailProps {
  fullName?: string;
  projectName?: string;
}

export default function ProjectKickoffEmail({
  fullName = "there",
  projectName = "Your Project",
}: ProjectKickoffEmailProps) {
  return (
    <EmailLayout preview={`Project kickoff: ${projectName}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Project kickoff</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          We are excited to start work on <strong>{projectName}</strong>. Our
          team will reach out shortly with next steps and timelines.
        </EmailBody>
        <EmailButton href={`${EMAIL.siteUrl}/dashboard`}>Open dashboard</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
