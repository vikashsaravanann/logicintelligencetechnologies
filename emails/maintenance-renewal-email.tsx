import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props { fullName?: string; actionUrl?: string; detail?: string; }

export default function MaintenanceRenewalEmail({ fullName = "there", actionUrl, detail }: Props) {
  return (
    <EmailLayout preview="Maintenance renewal reminder">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Maintenance renewal</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>A maintenance plan is due for renewal.</EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={actionUrl || EMAIL.siteUrl}>Review plan</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
