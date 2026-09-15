import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";

interface Props {
  fullName?: string;
}

export default function FreeDemoConfirmationEmail({
  fullName = "there",
}: Props) {
  return (
    <EmailLayout preview="We've received your demo request">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Demo request received</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for requesting a free demo from Logic Intelligence
          Technologies. Our team will review your details and follow up by email.
        </EmailBody>
        <EmailMuted>
          Reply to this message if you want to share more about your goals.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
