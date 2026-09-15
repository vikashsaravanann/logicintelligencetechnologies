import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import {
  EmailContent,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  email?: string;
  confirmUrl: string;
  requestedAt?: string;
}

export default function NewsletterDoubleOptinEmail({
  email,
  confirmUrl,
  requestedAt,
}: Props) {
  return (
    <EmailLayout preview="Confirm your subscription">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Confirm your subscription</EmailTitle>
        <EmailBody>
          Please confirm that you want to receive updates from Logic Intelligence
          Technologies{email ? <> for <strong>{email}</strong></> : null}.
        </EmailBody>
        {requestedAt ? <EmailMuted>Request time: {requestedAt}</EmailMuted> : null}
        <EmailButton href={confirmUrl || EMAIL.siteUrl}>Confirm subscription</EmailButton>
        <EmailMuted>
          If you did not request this, you can ignore this email.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
