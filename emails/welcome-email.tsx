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

interface WelcomeEmailProps {
  fullName: string;
}

export const WelcomeEmail = ({ fullName }: WelcomeEmailProps) => {
  return (
    <EmailLayout preview="Welcome to Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Welcome</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Your account with Logic Intelligence Technologies is ready. You can
          sign in anytime to explore our services and AI workspace.
        </EmailBody>
        <EmailButton href={`${EMAIL.siteUrl}/login`}>Sign in</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
};

export default WelcomeEmail;
