import { Text, Section, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";

export function JobApplicationEmail({
  fullName,
  seat,
}: {
  fullName: string;
  seat: string;
}) {
  const isCeo = /ceo|chief executive/i.test(seat);
  return (
    <EmailLayout preview={`We received your ${seat} application`}>
      <EmailHeader />
      <Section style={{ padding: "24px 32px" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>Hi {fullName},</Text>
        <Text style={{ color: "#d4d4d8", fontSize: 14, lineHeight: "22px" }}>
          Thank you for applying for <strong>{seat}</strong> at Logic Intelligence Technologies.
          This is not a partnership programme and the title is not for sale.
        </Text>
        {isCeo ? (
          <Text style={{ color: "#d4d4d8", fontSize: 14, lineHeight: "22px" }}>
            CEO applications are reviewed by the founder. Next step is a 45-minute call on
            operations, pipeline, and a six-month trial. Modest salary starts after first revenue.
            Bring what you will own in ninety days.
          </Text>
        ) : (
          <Text style={{ color: "#d4d4d8", fontSize: 14, lineHeight: "22px" }}>
            Director applications are reviewed for delivery, not for a cheque. Next step is a
            45-minute call. Letters of intent until incorporation; equity vests over four years
            with a one-year cliff after the entity exists.
          </Text>
        )}
        <Text style={{ color: "#d4d4d8", fontSize: 14, lineHeight: "22px" }}>
          We reply personally within 24 hours. Reply to this email if you need to add a CV or
          a start date.
        </Text>
        <Hr />
      </Section>
      <EmailFooter />
    </EmailLayout>
  );
}

export default JobApplicationEmail;
