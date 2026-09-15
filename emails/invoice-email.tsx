import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  fullName?: string;
  invoiceNumber?: string;
  amount?: string;
  dueDate?: string;
  paymentLink?: string;
  actionUrl?: string;
  detail?: string;
}

export default function InvoiceEmail({
  fullName = "there",
  invoiceNumber,
  amount,
  dueDate,
  paymentLink,
  actionUrl,
  detail,
}: Props) {
  const href = paymentLink || actionUrl || EMAIL.siteUrl;
  return (
    <EmailLayout preview="Your invoice from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Invoice</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>Please find your invoice details below.</EmailBody>
        {invoiceNumber ? <EmailBody>Invoice: <strong>{invoiceNumber}</strong></EmailBody> : null}
        {amount ? <EmailBody>Amount: <strong>{amount}</strong></EmailBody> : null}
        {dueDate ? <EmailBody>Due: {dueDate}</EmailBody> : null}
        {detail ? <EmailBody>{detail}</EmailBody> : null}
        <EmailButton href={href}>View invoice</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
