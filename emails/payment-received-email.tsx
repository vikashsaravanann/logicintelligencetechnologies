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

export interface PaymentReceivedEmailProps {
  fullName?: string;
  amount?: string;
  invoiceNumber?: string;
}

export default function PaymentReceivedEmail({
  fullName = "there",
  amount = "—",
  invoiceNumber = "—",
}: PaymentReceivedEmailProps) {
  return (
    <EmailLayout preview="Payment received — thank you">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Payment received</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          We received your payment of <strong>{amount}</strong>
          {invoiceNumber !== "—" ? (
            <>
              {" "}
              for invoice <strong>{invoiceNumber}</strong>
            </>
          ) : null}
          . Thank you.
        </EmailBody>
        <EmailButton href={`${EMAIL.siteUrl}/dashboard`}>View dashboard</EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
