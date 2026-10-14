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
  msmeRegistration,
  registeredAddress,
}: EmailFooterProps) => {
  return (
    <Section style={footer}>
      <Hr style={divider} />
      {signature ? (
        <Text style={sigText}>
          Warm regards,
          <br />
          <strong style={{ color: EMAIL.colors.text }}>{signature}</strong>
          <br />
          {EMAIL.company}
        </Text>
      ) : null}
      <Text style={company}>{EMAIL.company}</Text>
      {msmeRegistration ? (
        <Text style={msmeStyle}>MSME / Udyam: {msmeRegistration}</Text>
      ) : null}
      <Text style={addressText}>
        {registeredAddress || "Coimbatore, Tamil Nadu, India"}
      </Text>
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
  padding: "12px 32px 32px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const divider = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "0 0 24px 0",
};

const sigText = {
  color: EMAIL.colors.muted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px 0",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const company = {
  color: EMAIL.colors.text,
  fontSize: "13px",
  fontWeight: "700" as const,
  margin: "0 0 4px 0",
  fontFamily: EMAIL.font,
  letterSpacing: "0.02em",
};

const msmeStyle = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  fontWeight: "600" as const,
  margin: "0 0 4px 0",
  fontFamily: EMAIL.font,
  letterSpacing: "0.02em",
};

const addressText = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  margin: "0 0 8px 0",
  fontFamily: EMAIL.font,
};

const site = { margin: "0 0 12px 0" };

const siteLink = {
  color: EMAIL.colors.primary,
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
};

const links = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  margin: "0 0 10px 0",
  fontFamily: EMAIL.font,
};

const link = {
  color: EMAIL.colors.muted,
  textDecoration: "underline",
  fontSize: "12px",
};

const unsub = { margin: "0 0 10px 0", fontSize: "12px" };

const unsubLink = {
  color: EMAIL.colors.faint,
  textDecoration: "underline",
  fontSize: "11px",
};

const copy = {
  color: EMAIL.colors.faint,
  fontSize: "11px",
  margin: "16px 0 0 0",
  fontFamily: EMAIL.font,
};

export default EmailFooter;
