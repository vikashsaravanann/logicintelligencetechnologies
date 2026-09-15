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

export interface WeeklyRecognitionEmailProps {
  fullName?: string;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
  actionUrl?: string;
  detail?: string;
}

export function WeeklyRecognitionEmail({
  fullName = "there",
  dashboardUrl,
  unsubscribeUrl,
  actionUrl,
  detail,
}: WeeklyRecognitionEmailProps) {
  const cta = dashboardUrl || actionUrl || EMAIL.siteUrl;
  return (
    <EmailLayout preview="Checking in from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Weekly check-in</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          A short note from the Logic Intelligence Technologies team — we hope
          your week is going well.
        </EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={cta}>Open dashboard</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}

export default WeeklyRecognitionEmail;
