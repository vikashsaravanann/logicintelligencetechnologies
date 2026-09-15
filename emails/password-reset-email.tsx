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

interface PasswordResetEmailProps {
  fullName: string;
  resetLink: string;
}

export const PasswordResetEmail = ({
  fullName,
  resetLink,
}: PasswordResetEmailProps) => {
  return (
    <EmailLayout preview="Reset your password — Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Reset your password</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          We received a request to reset the password for your Logic Intelligence
          Technologies account.
        </EmailBody>
        <EmailButton href={resetLink}>Reset password</EmailButton>
        <EmailMuted>
          This link expires for security. If you did not request a reset, you can
          ignore this email.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
};

export default PasswordResetEmail;
