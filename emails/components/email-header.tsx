import { Section, Img, Text } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";
import { EMAIL_DESIGNS, type EmailDesign } from "./email-design";

interface EmailHeaderProps {
  subBrand?: string;
  design?: EmailDesign;
}

/**
 * Centered circular logo (78x78px), single-line non-wrapping wordmark:
 * LOGIC INTELLIGENCE TECHNOLOGIES (14px, tracking 0.045em, bold uppercase)
 */
export const EmailHeader = ({ subBrand, design: designKey = "transactional" }: EmailHeaderProps) => {
  const design = EMAIL_DESIGNS[designKey];
  return (
    <>
    <Section className="ref-header" style={header}>
      <Img
        src={EMAIL.logoUrl}
        alt={EMAIL.company}
        width="78"
        height="78"
        style={logo}
      />
      <Text className="ref-wordmark" style={brand}>{EMAIL.companyFull}</Text>
      {subBrand ? <Text style={subBrandStyle}>{subBrand}</Text> : null}
    </Section>
    <Section style={{ padding: design.full ? "0" : "0 20px 4px", textAlign: "center" }}>
      <Img src={`${EMAIL.assetUrl}/${design.art}.png`} alt="" width={design.full ? "600" : "280"} style={{ display: "block", width: design.full ? "100%" : "70%", maxWidth: design.full ? 600 : 280, height: "auto", margin: "0 auto", borderRadius: design.full ? 0 : 5 }} />
    </Section>
    </>
  );
};

const header = {
  padding: "36px 24px 28px",
  textAlign: "center" as const,
  backgroundColor: EMAIL.colors.cardBg,
};

const logo = {
  display: "block",
  margin: "0 auto 14px auto",
  borderRadius: "50%",
  border: `1px solid ${EMAIL.colors.cardBorder}`,
  width: "78px",
  height: "78px",
  objectFit: "cover" as const,
};

const brand = {
  color: EMAIL.colors.inkPrimary,
  fontSize: "14px",
  fontWeight: "800" as const,
  lineHeight: "20px",
  margin: "0 auto",
  letterSpacing: "0.045em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const subBrandStyle = {
  color: EMAIL.colors.muted,
  fontSize: "11px",
  fontWeight: "700" as const,
  lineHeight: "16px",
  margin: "6px auto 0 auto",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

export default EmailHeader;
