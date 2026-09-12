import * as React from "react";
import { Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";

interface NewsletterDoubleOptinEmailProps {
  email: string;
  confirmUrl: string;
  /** ISO date string — shown so the user can identify a specific request */
  requestedAt?: string;
}

export default function NewsletterDoubleOptinEmail({
  email,
  confirmUrl,
  requestedAt,
}: NewsletterDoubleOptinEmailProps) {
  const dateLabel = requestedAt
    ? new Date(requestedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  return (
    <EmailLayout preview="Confirm your subscription to Logic Intelligence Technologies updates.">
      <EmailHeader />
      <Section style={{ padding: "32px 32px 8px" }}>
        <Text
          style={{
            color: "#0A0F1E",
            fontSize: "22px",
            fontWeight: 800,
            margin: "0 0 12px",
          }}
        >
          Confirm your subscription
        </Text>
        <Text style={{ color: "#334155", fontSize: "15px", lineHeight: "1.7", margin: "0 0 8px" }}>
          We received a request to add <strong>{email}</strong> to the Logic
          Intelligence Technologies update list.
        </Text>
        <Text style={{ color: "#334155", fontSize: "15px", lineHeight: "1.7", margin: "0 0 24px" }}>
          Click the button below to confirm. This link expires in{" "}
          <strong>72 hours</strong>.
        </Text>
        <EmailButton href={confirmUrl}>Confirm my subscription</EmailButton>
        <Text
          style={{
            color: "#64748b",
            fontSize: "12px",
            lineHeight: "1.6",
            margin: "24px 0 0",
          }}
        >
          If you did not request this, you can safely ignore this email — you
          will not be subscribed.
          {dateLabel ? ` Request received: ${dateLabel} IST.` : ""}
        </Text>
      </Section>
      <Hr style={{ borderColor: "#e2e8f0", margin: "24px 32px 0" }} />
      <EmailFooter />
    </EmailLayout>
  );
}
