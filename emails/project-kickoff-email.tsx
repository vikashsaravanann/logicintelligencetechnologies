import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props { fullName?: string; actionUrl?: string; detail?: string; }

export default function ProjectKickoffEmail({ fullName = "there", actionUrl, detail }: Props) {
  return (
    <EmailLayout preview="Project kickoff">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Project kickoff</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>We're ready to begin. Here are the next steps for your project.</EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={actionUrl || EMAIL.siteUrl}>Open project</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
