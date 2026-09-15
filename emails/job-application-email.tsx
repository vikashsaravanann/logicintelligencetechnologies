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
  role?: string;
}

export default function JobApplicationEmail({
  fullName = "there",
  role = "the role",
}: Props) {
  return (
    <EmailLayout preview="We've received your application">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Application received</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for applying for <strong>{role}</strong> at Logic Intelligence
          Technologies. Our team will review your application and contact you if
          there is a match.
        </EmailBody>
        <EmailMuted>— Careers, Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
