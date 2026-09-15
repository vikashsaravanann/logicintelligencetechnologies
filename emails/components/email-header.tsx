import { Section, Img, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

/** Centered circular logo + single-line company name. No banner. */
export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Img
        src={EMAIL.logoUrl}
        alt="Logic Intelligence Technologies"
        width="64"
        height="64"
        style={logo}
      />
      <Text style={brand}>{EMAIL.company}</Text>
      <Hr style={divider} />
    </Section>
  );
};

const header = {
  padding: "32px 32px 8px 32px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const logo = {
  display: "block",
  margin: "0 auto 16px auto",
  borderRadius: "50%",
  border: `1px solid ${EMAIL.colors.border}`,
  width: "64px",
  height: "64px",
  objectFit: "cover" as const,
};

const brand = {
  color: EMAIL.colors.text,
  fontSize: "16px",
  fontWeight: "700" as const,
  lineHeight: "22px",
  margin: "0 0 20px 0",
  letterSpacing: "0.01em",
  whiteSpace: "nowrap" as const,
  fontFamily: EMAIL.font,
};

const divider = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "0",
  width: "100%",
};

export default EmailHeader;
