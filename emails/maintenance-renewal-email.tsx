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

export interface MaintenanceRenewalEmailProps {
  fullName?: string;
  expiryDate?: string;
  renewLink?: string;
}

export default function MaintenanceRenewalEmail({
  fullName = "there",
  expiryDate,
  renewLink,
}: MaintenanceRenewalEmailProps) {
  return (
    <EmailLayout preview="Maintenance and support plan renewal">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Maintenance renewal</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Your maintenance and support plan
          {expiryDate ? (
            <>
              {" "}
              is set to expire on <strong>{expiryDate}</strong>
            </>
          ) : (
            " is due for renewal"
          )}
          . Renew to keep uninterrupted support and updates.
        </EmailBody>
        <EmailButton href={renewLink || `${EMAIL.siteUrl}/dashboard`}>
          Renew plan
        </EmailButton>
        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
