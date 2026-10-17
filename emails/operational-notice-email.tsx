import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailContent, EmailTitle, EmailBody } from "./components/email-content";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EMAIL } from "./components/email-styles";
import type { EmailDesign } from "./components/email-design";

export interface OperationalNoticeEmailProps {
  title: string;
  text: string;
  preview?: string;
  design?: EmailDesign;
  actionUrl?: string;
  actionLabel?: string;
}

// CTA destinations must be supplied explicitly and stay on the company origin.
function internalActionUrl(value?: string): string | undefined {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith("//")) return;
  if (!value.startsWith("/") && !value.startsWith("https://")) return;
  try {
    const site = new URL(EMAIL.siteUrl);
    const action = new URL(value, site);
    if (action.protocol !== "https:" || action.origin !== site.origin || action.username || action.password) return;
    return action.href;
  } catch {
    return;
  }
}

export function OperationalNoticeEmail({
  title,
  text,
  preview,
  design = "notification",
  actionUrl,
  actionLabel,
}: OperationalNoticeEmailProps) {
  const href = internalActionUrl(actionUrl);
  const label = actionLabel?.trim();

  return (
    <EmailLayout design={design} preview={preview ?? title}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>{title}</EmailTitle>
        <EmailBody>
          <span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {text.split(/\r\n|\r|\n/).map((line, index) => (
              <React.Fragment key={index}>
                {index > 0 ? <br /> : null}
                {line}
              </React.Fragment>
            ))}
          </span>
        </EmailBody>
        {href && label ? <EmailButton href={href}>{label}</EmailButton> : null}
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}

export default OperationalNoticeEmail;
