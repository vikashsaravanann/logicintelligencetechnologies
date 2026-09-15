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

interface Props {
  confirmUrl: string;
}

export default function NewsletterDoubleOptinEmail({ confirmUrl }: Props) {
  return (
    <EmailLayout preview="Confirm your subscription">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Confirm your subscription</EmailTitle>
        <EmailBody>
          Please confirm that you want to receive updates from Logic Intelligence
          Technologies.
        </EmailBody>
        <EmailButton href={confirmUrl}>Confirm subscription</EmailButton>
        <EmailMuted>
          If you did not request this, you can ignore this email.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
