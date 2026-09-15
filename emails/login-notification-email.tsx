import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailTitle,
  EmailBody,
  EmailMuted,
  softBoxStyle,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

export interface LoginNotificationEmailProps {
  email?: string;
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
  when?: string;
  loginTimestamp?: string;
  timeZone?: string;
  timezone?: string;
  location?: string;
  parsedDevice?: string;
  screenSize?: string;
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
}: LoginNotificationEmailProps) {
  const resolvedIp = ipAddress || ip || "—";
  const resolvedWhen = loginTimestamp || when;
  const device = parsedDevice || userAgent || "—";
  const tz = timezone || timeZone;

  return (
    <EmailLayout preview="Login activity notification">
      <EmailHeader />
      <EmailContent>
        <EmailTitle>Login activity</EmailTitle>
        <EmailBody>
          A sign-in was recorded for a Logic Intelligence Technologies account.
        </EmailBody>
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
              <Text style={value}>{resolvedIp}</Text>
            </Column>
          </Row>
          <Row>
            <Column style={{ width: "100px" }}>
              <Text style={label}>Device</Text>
            </Column>
            <Column>
              <Text style={value}>{device}</Text>
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
          {resolvedWhen ? (
            <Row>
              <Column style={{ width: "100px" }}>
                <Text style={label}>When</Text>
              </Column>
              <Column>
                <Text style={value}>{resolvedWhen}</Text>
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
        </Section>
        <EmailMuted>
          If this was not you, reset your password and contact support.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}

const label = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  margin: "0 0 6px 0",
};
const value = {
  color: EMAIL.colors.text,
  fontSize: "13px",
  margin: "0 0 6px 0",
  wordBreak: "break-word" as const,
};
