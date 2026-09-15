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

export interface ProposalSentEmailProps {
  fullName?: string;
  proposalUrl?: string;
}

export default function ProposalSentEmail({
  fullName = "there",
  proposalUrl,
}: ProposalSentEmailProps) {
  return (
    <EmailLayout preview="Project proposal from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your proposal is ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          We have prepared a detailed proposal for your project. Review the
          scope, timeline, and investment below.
        </EmailBody>
        <EmailButton href={proposalUrl || EMAIL.siteUrl}>View proposal</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
