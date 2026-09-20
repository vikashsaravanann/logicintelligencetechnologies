import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";

interface BroadcastEmailProps {
  fullName?: string;
  subjectLine?: string;
  messageBody?: string;
}

/** Admin-composed transactional message (not bulk marketing automation). */
export const BroadcastEmail = ({
  fullName,
  subjectLine,
  messageBody,
}: BroadcastEmailProps) => {
  const body = (messageBody || "").slice(0, 8000);
  const title = (subjectLine || "Message from Logic Intelligence Technologies").slice(0, 200);
  return (
    <EmailLayout preview={title}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>{title}</EmailTitle>
        <EmailGreeting name={fullName} />
        <EmailBody>
          {body.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </EmailBody>
        <EmailMuted>— Logic Intelligence Technologies Pvt. Ltd.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
};

export default BroadcastEmail;
