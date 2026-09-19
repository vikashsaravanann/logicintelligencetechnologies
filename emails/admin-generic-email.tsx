import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailBody, EmailMuted } from "./components/email-content";

export interface AdminGenericEmailProps {
  message: string;
}

export default function AdminGenericEmail({ message }: AdminGenericEmailProps) {
  return (
    <EmailLayout preview="Message from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <EmailBody>
          {message.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </EmailBody>
        <EmailMuted>— Logic Intelligence Technologies Admin Team</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
