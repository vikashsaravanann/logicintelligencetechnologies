import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  fullName?: string;
  reviewLink?: string;
  actionUrl?: string;
  detail?: string;
}

export default function TestimonialRequestEmail({
  fullName = "there",
  reviewLink,
  actionUrl,
  detail,
}: Props) {
  return (
    <EmailLayout preview="Would you share feedback?">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Share your feedback</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>If you have a moment, we'd appreciate a short note about working with us.</EmailBody>
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={reviewLink || actionUrl || EMAIL.siteUrl}>Share feedback</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
