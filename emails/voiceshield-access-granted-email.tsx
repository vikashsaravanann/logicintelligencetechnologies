import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import { EmailContent, EmailGreeting, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";

interface Props {
  fullName?: string;
  consoleUrl?: string;
  accessType?: string;
}

export default function VoiceShieldAccessGrantedEmail({
  fullName = "there",
  consoleUrl = "https://voiceshield.logicintelligencetechnologies.in",
  accessType = "Demo",
}: Props) {
  return (
    <EmailLayout preview="Your VoiceShield access has been approved">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>VoiceShield Access Approved 🛡️</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          Your <strong>{accessType}</strong> access request for <strong>VoiceShield</strong> — our real-time AI voice deepfake detection platform — has been reviewed and <strong>approved</strong> by our team.
        </EmailBody>
        <EmailBody>
          Click the button below to access the VoiceShield console. This link is private and issued specifically for your organisation. Please do not share it publicly.
        </EmailBody>
        <EmailButton href={consoleUrl}>Access VoiceShield Console</EmailButton>
        <EmailMuted>
          If you have any questions or encounter any issues, please reply to this email or contact our support team at support@logicintelligencetechnologies.in
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
