import { Section, Img, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailHeaderProps {
  subBrand?: string;
}

/**
 * Centered circular logo (48x48px), single-line non-wrapping wordmark:
 * LOGIC INTELLIGENCE TECHNOLOGIES (12px, tracking 0.14em, bold uppercase)
 */
export const EmailHeader = ({ subBrand }: EmailHeaderProps) => {
  return (
    <Section style={header}>
      <Img
        src={EMAIL.logoUrl}
        alt={EMAIL.company}
        width="48"
        height="48"
        style={logo}
      />
      <Text style={brand}>{EMAIL.companyFull}</Text>
      {subBrand ? <Text style={subBrandStyle}>{subBrand}</Text> : null}
      <Hr style={divider} />
    </Section>
  );
};

const header = {
  padding: "32px 32px 16px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const logo = {
  display: "block",
  margin: "0 auto 12px auto",
  borderRadius: "50%",
  border: `1px solid ${EMAIL.colors.cardBorder}`,
  width: "48px",
  height: "48px",
  objectFit: "cover" as const,
};

const brand = {
  color: EMAIL.colors.inkPrimary,
  fontSize: "12px",
  fontWeight: "800" as const,
  lineHeight: "16px",
  margin: "0 auto",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const subBrandStyle = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  fontWeight: "500" as const,
  lineHeight: "18px",
  margin: "6px auto 0 auto",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
  letterSpacing: "0.02em",
};

const divider = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "20px 0 0 0",
  width: "100%",
};

export default EmailHeader;
