import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";

interface Props { fullName?: string; demoUrl?: string; }

export default function DemoReadyEmail({ fullName = "there", demoUrl = "https://www.logicintelligencetechnologies.in" }: Props) {
  return (
    <EmailLayout preview="Your demo is ready">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Your demo is ready</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>The demo you requested from Logic Intelligence Technologies is available.</EmailBody>
        <EmailButton href={demoUrl}>Open demo</EmailButton>
        <EmailMuted>If you have questions, reply to this email.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
