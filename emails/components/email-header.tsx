import { Section, Img, Text, Row, Column } from "@react-email/components";
import * as React from "react";

const LOGO_URL =
  "https://www.logicintelligencetechnologies.in/assets/logo.jpg";

export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Row>
        <Column style={logoColumn}>
          <Img
            src={LOGO_URL}
            alt="Logic Intelligence Technologies Logo"
            width="44"
            height="44"
            style={logo}
          />
        </Column>
        <Column style={textColumn}>
          <Text style={brandTitle}>LOGIC INTELLIGENCE TECHNOLOGIES</Text>
          <Text style={brandSubtitle}>Enterprise Software &amp; AI Systems</Text>
        </Column>
      </Row>
    </Section>
  );
};

const header = {
  padding: "24px 28px 20px 28px",
  backgroundColor: "#0A0F1E",
  borderBottom: "1px solid rgba(0,191,255,0.25)",
};

const logoColumn = {
  width: "52px",
  verticalAlign: "middle" as const,
};

const logo = {
  display: "block",
  borderRadius: "8px",
  border: "1px solid rgba(0,191,255,0.45)",
};

const textColumn = {
  verticalAlign: "middle" as const,
  paddingLeft: "12px",
};

const brandTitle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700" as const,
  letterSpacing: "0.06em",
  lineHeight: "1.2",
};

const brandSubtitle = {
  margin: "3px 0 0 0",
  color: "#94a3b8",
  fontSize: "11px",
  letterSpacing: "0.03em",
  lineHeight: "1.2",
};
