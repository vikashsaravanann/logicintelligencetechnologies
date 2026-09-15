import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailFooterProps {
  unsubscribeUrl?: string;
}

export const EmailFooter = ({ unsubscribeUrl }: EmailFooterProps) => {
  return (
    <Section style={footer}>
      <Hr style={divider} />
      <Text style={company}>{EMAIL.company}</Text>
      <Text style={site}>
        <Link href={EMAIL.siteUrl} style={siteLink}>
          logicintelligencetechnologies.in
        </Link>
      </Text>
      <Text style={links}>
        <Link href={`${EMAIL.siteUrl}/privacy`} style={link}>
          Privacy
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/terms`} style={link}>
          Terms
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/contact`} style={link}>
          Contact
        </Link>
      </Text>
      {unsubscribeUrl ? (
        <Text style={unsub}>
          <Link href={unsubscribeUrl} style={link}>
            Unsubscribe
          </Link>
        </Text>
      ) : null}
      <Text style={copy}>
        © {new Date().getFullYear()} {EMAIL.company}
      </Text>
    </Section>
  );
};

const footer = {
  padding: "8px 32px 28px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const divider = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "0 0 20px 0",
};

const company = {
  color: EMAIL.colors.text,
  fontSize: "13px",
  fontWeight: "600" as const,
  margin: "0 0 4px 0",
  fontFamily: EMAIL.font,
};

const site = { margin: "0 0 12px 0" };
const siteLink = { color: EMAIL.colors.link, fontSize: "13px", textDecoration: "none" };
const links = { color: EMAIL.colors.muted, fontSize: "12px", margin: "0 0 8px 0", fontFamily: EMAIL.font };
const link = { color: EMAIL.colors.muted, textDecoration: "none", fontSize: "12px" };
const unsub = { margin: "0 0 8px 0", fontSize: "12px" };
const copy = { color: EMAIL.colors.faint, fontSize: "11px", margin: "12px 0 0 0", fontFamily: EMAIL.font };

export default EmailFooter;
