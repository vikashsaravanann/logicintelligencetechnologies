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

interface Props {
  fullName?: string;
  resourceTitle?: string;
  downloadUrl?: string;
}

export default function ResourceDeliveryEmail({
  fullName = "there",
  resourceTitle = "your requested document",
  downloadUrl = "https://www.logicintelligencetechnologies.in/resources",
}: Props) {
  return (
    <EmailLayout preview={`${resourceTitle} from Logic Intelligence Technologies`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>{resourceTitle} is ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thanks for requesting {resourceTitle} from Logic Intelligence
          Technologies. The document is attached to this email. You can also use
          the button below to browse the full resource library.
        </EmailBody>
        <EmailButton href={downloadUrl}>Browse resources</EmailButton>
        <EmailMuted>Keep this email for easy access later.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
