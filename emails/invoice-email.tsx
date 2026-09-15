import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props { fullName?: string; actionUrl?: string; detail?: string; }

export default function InvoiceEmail({ fullName = "there", actionUrl, detail }: Props) {
  return (
    <EmailLayout preview="Your invoice from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Invoice</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>Please find your invoice details below.</EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={actionUrl || EMAIL.siteUrl}>View invoice</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
