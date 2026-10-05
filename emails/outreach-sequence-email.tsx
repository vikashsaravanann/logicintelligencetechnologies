import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  subject?: string;
  bodyHtml: string;
}

export default function OutreachSequenceEmail({ bodyHtml }: Props) {
  return (
    <EmailLayout preview="Message from Logic Intelligence Technologies">
      <EmailHeader />
      <EmailContent>
        <Section
          style={{
            color: EMAIL.colors.text,
            fontSize: "15px",
            lineHeight: "1.6",
            fontFamily: EMAIL.font,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </Section>
        <EmailMuted>
          You received this because you contacted Logic Intelligence Technologies
          or are part of an authorized outreach sequence. Unsubscribe links are
          included for marketing messages.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
