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

export interface TestimonialRequestEmailProps {
  fullName?: string;
  reviewLink?: string;
}

export default function TestimonialRequestEmail({
  fullName = "there",
  reviewLink,
}: TestimonialRequestEmailProps) {
  return (
    <EmailLayout preview="How did we do? We would value your feedback">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>We would value your feedback</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          If our work met your expectations, a short testimonial helps other
          teams decide with confidence. It only takes a minute.
        </EmailBody>
        <EmailButton href={reviewLink || `${EMAIL.siteUrl}/contact`}>
          Share feedback
        </EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
