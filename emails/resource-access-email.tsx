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
  expiresInMinutes?: number;
}

export default function ResourceAccessEmail({
  fullName = "there",
  resourceTitle = "your resource",
  downloadUrl = "https://www.logicintelligencetechnologies.in/resources",
  expiresInMinutes = 15,
}: Props) {
  return (
    <EmailLayout preview={`Your resource is ready: ${resourceTitle}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your resource is ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for requesting <strong>{resourceTitle}</strong> from Logic
          Intelligence Technologies. Use the secure link below to access the PDF.
        </EmailBody>
        <EmailButton href={downloadUrl}>Access PDF</EmailButton>
        <EmailMuted>
          This secure link expires in approximately {expiresInMinutes} minutes
          for security reasons. If it expires, request the resource again from
          our website.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
