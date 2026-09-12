import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";

export default function NewsletterConfirmationEmail({
  email,
  unsubscribeUrl,
}: {
  email: string;
  unsubscribeUrl?: string;
}) {
  return (
    <EmailLayout preview="You're subscribed to LIT updates. Unsubscribe any time.">
      <EmailHeader />
      <Section style={{ padding: "24px 32px" }}>
        <Text
          style={{
            color: "#0A0F1E",
            fontSize: "22px",
            fontWeight: 800,
            margin: "0 0 12px",
          }}
        >
          You're on the list
        </Text>
        <Text style={{ color: "#334155", fontSize: "15px", lineHeight: "1.6" }}>
          Thanks for subscribing{email ? ` (${email})` : ""}. You'll receive
          practical updates on web, AI, and product delivery from Logic
          Intelligence Technologies.
        </Text>
        <Text style={{ color: "#334155", fontSize: "15px", lineHeight: "1.6" }}>
          Prefer a free demo or project chat? Reply to this email or book below.
        </Text>
        <EmailButton href="https://www.logicintelligencetechnologies.in/free-demo">
          Book a free demo
        </EmailButton>
      </Section>
      <EmailFooter unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}
