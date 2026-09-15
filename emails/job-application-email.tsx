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
  seat?: string;
}

export default function JobApplicationEmail({
  fullName = "there",
  role,
  seat,
}: Props) {
  const position = role || seat || "the role";
  return (
    <EmailLayout preview="We've received your application">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Application received</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for applying for <strong>{position}</strong> at Logic Intelligence
          Technologies. Our team will review your application and contact you if
          there is a match.
        </EmailBody>
        <EmailMuted>— Careers, Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
