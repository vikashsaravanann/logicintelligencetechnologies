import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailFooterProps {
  unsubscribeUrl?: string;
  signature?: string;
  msmeRegistration?: string;
  registeredAddress?: string;
}

export const EmailFooter = ({
  unsubscribeUrl,
  signature,
  msmeRegistration = EMAIL.msmeRegistration,
  registeredAddress = EMAIL.registeredAddress,
}: EmailFooterProps) => {
  return (
    <Section style={footer}>
      {signature ? (
        <Text style={sigText}>
          Warm regards,
          <br />
          <strong style={{ color: EMAIL.colors.footerHeading }}>{signature}</strong>
          <br />
          <span style={{ color: EMAIL.colors.footerText }}>{EMAIL.company}</span>
        </Text>
      ) : null}
      <Text style={company}>{EMAIL.companyFull}</Text>
      <Text style={msmeStyle}>MSME / Udyam: {msmeRegistration}</Text>
      <Text style={addressText}>{registeredAddress}</Text>
      <Text style={site}>
        <Link href={EMAIL.siteUrl} style={siteLink}>
          logicintelligencetechnologies.in
        </Link>
      </Text>
      <Text style={links}>
        <Link href={`${EMAIL.siteUrl}/privacy`} style={link}>
          Privacy Policy
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/terms`} style={link}>
          Terms of Service
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/contact`} style={link}>
          Contact Us
        </Link>
      </Text>
      {unsubscribeUrl ? (
        <Text style={unsub}>
          <Link href={unsubscribeUrl} style={unsubLink}>
            Unsubscribe from this list
          </Link>
        </Text>
      ) : null}
      <Text style={copy}>
        © {new Date().getFullYear()} {EMAIL.company}. All rights reserved.
      </Text>
    </Section>
  );
};

const footer = {
  padding: "32px 32px 32px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.footerBg,
  borderTop: `1px solid ${EMAIL.colors.footerBorder}`,
};

const sigText = {
  color: EMAIL.colors.footerText,
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0 0 20px 0",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const company = {
  color: EMAIL.colors.footerHeading,
  fontSize: "12px",
  fontWeight: "800" as const,
  margin: "0 0 4px 0",
  fontFamily: EMAIL.fontSans,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const msmeStyle = {
  color: EMAIL.colors.footerText,
  fontSize: "11px",
  fontWeight: "600" as const,
  margin: "0 0 4px 0",
  fontFamily: EMAIL.fontSans,
  letterSpacing: "0.02em",
};

const addressText = {
  color: EMAIL.colors.footerText,
  fontSize: "11px",
  margin: "0 0 10px 0",
  fontFamily: EMAIL.fontSans,
};

const site = { margin: "0 0 10px 0" };

const siteLink = {
  color: EMAIL.colors.footerLink,
  fontSize: "12px",
  fontWeight: "600" as const,
  textDecoration: "none",
};

const links = {
  color: EMAIL.colors.footerText,
  fontSize: "11px",
  margin: "0 0 10px 0",
  fontFamily: EMAIL.fontSans,
};

const link = {
  color: EMAIL.colors.footerText,
  textDecoration: "underline",
  fontSize: "11px",
};

const unsub = { margin: "0 0 8px 0", fontSize: "11px" };

const unsubLink = {
  color: "#6B7280",
  textDecoration: "underline",
  fontSize: "11px",
};

const copy = {
  color: "#6B7280",
  fontSize: "11px",
  margin: "12px 0 0 0",
  fontFamily: EMAIL.fontSans,
};

export default EmailFooter;
