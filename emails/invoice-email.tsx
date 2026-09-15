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

export interface InvoiceEmailProps {
  fullName?: string;
  invoiceNumber?: string;
  amount?: string;
  dueDate?: string;
  paymentLink?: string;
}

export default function InvoiceEmail({
  fullName = "there",
  invoiceNumber = "INV-000",
  amount = "—",
  dueDate = "Upon receipt",
  paymentLink,
}: InvoiceEmailProps) {
  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} from Logic Intelligence Technologies`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Invoice {invoiceNumber}</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong> is ready.
          Payment is due by <strong>{dueDate}</strong>.
        </EmailBody>
        <EmailButton href={paymentLink || EMAIL.siteUrl}>Pay invoice</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
