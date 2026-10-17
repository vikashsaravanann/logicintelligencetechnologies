import { Section, Text, Link, Hr, Img } from "@react-email/components";
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
    <Section className="ref-footer" style={footer}>
      {signature ? (
        <Text style={sigText}>
          Warm regards,
          <br />
          <strong style={{ color: EMAIL.colors.inkPrimary }}>{signature}</strong>
          <br />
          <span style={{ color: EMAIL.colors.muted }}>{EMAIL.company}</span>
        </Text>
      ) : null}

      <Text style={supportText}>
        Questions? We’re here to help. Visit our{" "}
        <Link href={`${EMAIL.siteUrl}/support`} style={supportLink}>
          support page
        </Link>{" "}
        or email{" "}
        <Link href={`mailto:${EMAIL.supportEmail}`} style={supportLink}>
          {EMAIL.supportEmail}
        </Link>.
      </Text>

      <Hr style={divider} />

      <table
        role="presentation"
        cellPadding="0"
        cellSpacing="0"
        align="center"
        style={socialTable}
      >
        <tbody>
          <tr>
            {EMAIL.socials.map((social) => (
              <td key={social.name} style={socialCell}>
                <Link href={social.href} aria-label={social.name}>
                  <Img
                    src={`${EMAIL.assetUrl}/social-${social.icon}.png`}
                    width="19"
                    height="19"
                    alt={social.name}
                    style={socialIcon}
                  />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <Text style={navLinks}>
        <Link href={EMAIL.siteUrl} style={footerLink}>
          Our website
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/login`} style={footerLink}>
          My account
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/terms`} style={footerLink}>
          Terms
        </Link>
        {"  ·  "}
        <Link href={`${EMAIL.siteUrl}/privacy`} style={footerLink}>
          Privacy
        </Link>
      </Text>

      {unsubscribeUrl ? (
        <Text style={unsubText}>
          You’re receiving company updates.{" "}
          <Link href={unsubscribeUrl} style={unsubLink}>
            Manage preferences or unsubscribe
          </Link>.
        </Text>
      ) : null}

      <Text style={companyInfo}>
        {EMAIL.company}
        <br />
        {registeredAddress}
        <br />
        MSME / Udyam: {msmeRegistration}
      </Text>

      <Text style={copyright}>
        © {new Date().getFullYear()} {EMAIL.company}. All rights reserved.
      </Text>
    </Section>
  );
};

const footer = {
  padding: "48px 38px 34px 38px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.footerBg,
  borderTop: `1px solid ${EMAIL.colors.footerBorder}`,
};

const sigText = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0 0 24px 0",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const supportText = {
  margin: "0 auto 22px auto",
  fontSize: "12px",
  lineHeight: "20px",
  color: EMAIL.colors.body,
  maxWidth: "420px",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const supportLink = {
  color: EMAIL.colors.orange,
  fontWeight: "800" as const,
  textDecoration: "none",
};

const divider = {
  width: "160px",
  margin: "0 auto 20px auto",
  border: "none",
  borderTop: `1px solid ${EMAIL.colors.divider}`,
};

const socialTable = {
  margin: "0 auto 20px auto",
};

const socialCell = {
  padding: "0 12px",
};

const socialIcon = {
  display: "block",
  border: 0,
  width: "19px",
  height: "19px",
};

const navLinks = {
  margin: "0 0 20px 0",
  fontSize: "11px",
  lineHeight: "22px",
  color: EMAIL.colors.muted,
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const footerLink = {
  color: EMAIL.colors.footerLink,
  textDecoration: "none",
};

const unsubText = {
  margin: "0 0 16px 0",
  fontSize: "11px",
  lineHeight: "18px",
  color: EMAIL.colors.muted,
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const unsubLink = {
  color: EMAIL.colors.footerLink,
  textDecoration: "underline",
};

const companyInfo = {
  color: EMAIL.colors.muted,
  fontSize: "10px",
  lineHeight: "17px",
  margin: "0 0 4px 0",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const copyright = {
  color: EMAIL.colors.muted,
  fontSize: "10px",
  lineHeight: "17px",
  margin: "8px 0 0 0",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

export default EmailFooter;
