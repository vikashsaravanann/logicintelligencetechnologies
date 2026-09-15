import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailTitle, EmailBody, EmailMuted, softBoxStyle } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props { email?: string; ip?: string; userAgent?: string; when?: string; }

export default function LoginNotificationEmail({ email = "—", ip = "—", userAgent = "—", when }: Props) {
  return (
    <EmailLayout preview="Login activity notification">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Login activity</EmailTitle>
        <EmailBody>A sign-in was recorded for a Logic Intelligence Technologies account.</EmailBody>
        <Section style={softBoxStyle}>
          <Row><Column style={{ width: "100px" }}><Text style={label}>Account</Text></Column><Column><Text style={value}>{email}</Text></Column></Row>
          <Row><Column style={{ width: "100px" }}><Text style={label}>IP</Text></Column><Column><Text style={value}>{ip}</Text></Column></Row>
          <Row><Column style={{ width: "100px" }}><Text style={label}>Device</Text></Column><Column><Text style={value}>{userAgent}</Text></Column></Row>
          {when ? <Row><Column style={{ width: "100px" }}><Text style={label}>When</Text></Column><Column><Text style={value}>{when}</Text></Column></Row> : null}
        </Section>
        <EmailMuted>If this was not you, reset your password and contact support.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
const label = { color: EMAIL.colors.muted, fontSize: "13px", margin: "0 0 6px 0" };
const value = { color: EMAIL.colors.text, fontSize: "13px", margin: "0 0 6px 0", wordBreak: "break-word" as const };
