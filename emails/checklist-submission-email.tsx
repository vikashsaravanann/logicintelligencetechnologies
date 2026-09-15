import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailTitle, EmailBody, softBoxStyle } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  email: string;
  type?: string;
  answers?: string[];
  submissionDate?: string;
}

export default function ChecklistSubmissionEmail({ email, type, answers, submissionDate }: Props) {
  return (
    <EmailLayout preview={`Checklist request: ${email}`}>
      <EmailHeader />
      <EmailContent>
        <EmailTitle>New checklist request</EmailTitle>
        <EmailBody>Someone submitted the checklist form.</EmailBody>
        <Section style={softBoxStyle}>
          <Row><Column style={{ width: "100px" }}><Text style={label}>Email</Text></Column><Column><Text style={value}>{email}</Text></Column></Row>
          {type ? <Row><Column style={{ width: "100px" }}><Text style={label}>Type</Text></Column><Column><Text style={value}>{type}</Text></Column></Row> : null}
          {submissionDate ? <Row><Column style={{ width: "100px" }}><Text style={label}>When</Text></Column><Column><Text style={value}>{submissionDate}</Text></Column></Row> : null}
          {answers && answers.length > 0 ? <Row><Column style={{ width: "100px" }}><Text style={label}>Answers</Text></Column><Column><Text style={value}>{answers.join(" · ")}</Text></Column></Row> : null}
        </Section>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
const label = { color: EMAIL.colors.muted, fontSize: "13px", margin: "0 0 6px 0" };
const value = { color: EMAIL.colors.text, fontSize: "13px", margin: "0 0 6px 0", wordBreak: "break-word" as const };
