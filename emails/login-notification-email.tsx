import * as React from "react";
import { Text, Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailContent, EmailTitle, EmailBody, EmailMuted } from "./components/email-content";
import { EMAIL } from "./components/email-styles";

interface Props {
  email?: string;
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
  when?: string;
  loginTimestamp?: string;
  location?: string;
  parsedDevice?: string;
  screenSize?: string;
  timezone?: string;
  timeZone?: string;
}

export default function LoginNotificationEmail({
  email = "—",
  ip,
  ipAddress,
  userAgent = "—",
  when,
  loginTimestamp,
  location,
  parsedDevice,
  screenSize,
  timezone,
  timeZone,
}: Props) {
  const ipVal = ipAddress || ip || "—";
  const whenVal = loginTimestamp || when;
  const deviceVal = parsedDevice || userAgent || "—";
  const tz = timezone || timeZone;

  return (
    <EmailLayout preview="Login activity notification">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Login activity</EmailTitle>
        <EmailBody>A sign-in was recorded for a Logic Intelligence Technologies account.</EmailBody>
        <Section style={softBoxStyle}>
          <Row>
            <Column style={{ width: "100px" }}>
              <Text style={label}>Account</Text>
            </Column>
            <Column>
              <Text style={value}>{email}</Text>
            </Column>
          </Row>
          <Row>
            <Column style={{ width: "100px" }}>
              <Text style={label}>IP</Text>
            </Column>
            <Column>
              <Text style={value}>{ipVal}</Text>
            </Column>
          </Row>
          {location ? (
            <Row>
              <Column style={{ width: "100px" }}>
                <Text style={label}>Location</Text>
              </Column>
              <Column>
                <Text style={value}>{location}</Text>
              </Column>
            </Row>
          ) : null}
          <Row>
            <Column style={{ width: "100px" }}>
              <Text style={label}>Device</Text>
            </Column>
            <Column>
              <Text style={value}>{deviceVal}</Text>
            </Column>
          </Row>
          {screenSize ? (
            <Row>
              <Column style={{ width: "100px" }}>
                <Text style={label}>Screen</Text>
              </Column>
              <Column>
                <Text style={value}>{screenSize}</Text>
              </Column>
            </Row>
          ) : null}
          {tz ? (
            <Row>
              <Column style={{ width: "100px" }}>
                <Text style={label}>Timezone</Text>
              </Column>
              <Column>
                <Text style={value}>{tz}</Text>
              </Column>
            </Row>
          ) : null}
          {whenVal ? (
            <Row>
              <Column style={{ width: "100px" }}>
                <Text style={label}>When</Text>
              </Column>
              <Column>
                <Text style={value}>{whenVal}</Text>
              </Column>
            </Row>
          ) : null}
        </Section>
        <EmailMuted>If this was not you, reset your password and contact support.</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}

const softBoxStyle = {
  backgroundColor: EMAIL.colors.softBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};
const label = { color: EMAIL.colors.muted, fontSize: "13px", margin: "0 0 6px 0" };
const value = {
  color: EMAIL.colors.text,
  fontSize: "13px",
  margin: "0 0 6px 0",
  wordBreak: "break-word" as const,
};
