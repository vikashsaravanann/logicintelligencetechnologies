import { Section, Img, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailHeaderProps {
  subBrand?: string;
}

/** Centered circular logo (64x64px), company wordmark, and optional sub-brand */
export const EmailHeader = ({ subBrand }: EmailHeaderProps) => {
  return (
    <Section style={header}>
      <Img
        src={EMAIL.logoUrl}
        alt={EMAIL.company}
        width="64"
        height="64"
        style={logo}
      />
      <Text style={brand}>LOGIC INTELLIGENCE TECHNOLOGIES</Text>
      {subBrand ? <Text style={subBrandStyle}>{subBrand}</Text> : null}
      <Hr style={divider} />
    </Section>
  );
};

const header = {
  padding: "36px 32px 16px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const logo = {
  display: "block",
  margin: "0 auto 12px auto",
  borderRadius: "50%",
  border: `1px solid ${EMAIL.colors.border}`,
  width: "64px",
  height: "64px",
  objectFit: "cover" as const,
};

const brand = {
  color: EMAIL.colors.text,
  fontSize: "15px",
  fontWeight: "700" as const,
  lineHeight: "22px",
  margin: "0 auto",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const subBrandStyle = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  fontWeight: "500" as const,
  lineHeight: "18px",
  margin: "4px auto 0 auto",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const divider = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "20px 0 0 0",
  width: "100%",
};

export default EmailHeader;
