import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";

interface Props {
  email?: string;
  unsubscribeUrl?: string;
}

export default function NewsletterConfirmationEmail({
  email,
  unsubscribeUrl,
}: Props) {
  return (
    <EmailLayout preview="You're subscribed to Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Subscription confirmed</EmailTitle>
        <EmailBody>
          You're on the list for updates from Logic Intelligence Technologies
          {email ? <> ({email})</> : null}. We'll only send relevant product and
          company news.
        </EmailBody>
        <EmailMuted>You can unsubscribe at any time using the link below.</EmailMuted>
      </EmailContent>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}
