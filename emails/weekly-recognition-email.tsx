import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  fullName?: string;
  actionUrl?: string;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
  detail?: string;
}

export function WeeklyRecognitionEmail({
  fullName = "there",
  actionUrl,
  dashboardUrl,
  unsubscribeUrl,
  detail,
}: Props) {
  return (
    <EmailLayout preview="Weekly recognition">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Weekly recognition</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>A short note of recognition from the team.</EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={dashboardUrl || actionUrl || EMAIL.siteUrl}>
          View details
        </EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}

export default WeeklyRecognitionEmail;
