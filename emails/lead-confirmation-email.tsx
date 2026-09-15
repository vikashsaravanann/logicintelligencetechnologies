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

interface LeadConfirmationEmailProps {
  fullName?: string;
  service?: string;
}

export const LeadConfirmationEmail = ({
  fullName = "there",
  service = "your enquiry",
}: LeadConfirmationEmailProps) => {
  return (
    <EmailLayout preview="We've received your request — Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>We've received your request</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Thank you for contacting Logic Intelligence Technologies. Your request
          regarding <strong>{service}</strong> is with our team.
        </EmailBody>
        <EmailBody>
          We'll review the details and follow up by email. You can reply to this
          message if you'd like to add more information.
        </EmailBody>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
};

export default LeadConfirmationEmail;
