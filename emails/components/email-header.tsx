import { Section, Img, Text, Row, Column } from "@react-email/components";
import * as React from "react";

const LOGO_URL =
  "https://www.logicintelligencetechnologies.in/assets/logo.jpg";
const BANNER_URL =
  "https://www.logicintelligencetechnologies.in/assets/og-banner.jpg";

export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Row>
        <Column style={{ width: "50%", verticalAlign: "middle", textAlign: "left" }}>
          <Img
            src={LOGO_URL}
            alt="Logic Intelligence Technologies"
            width="48"
            height="48"
            style={logo}
          />
        </Column>
        <Column style={{ width: "50%", verticalAlign: "middle", textAlign: "right" }}>
          <Img
            src={BANNER_URL}
            alt="Logic Intelligence Technologies"
            width="160"
            height="48"
            style={banner}
          />
        </Column>
      </Row>
      <Text style={brandFallback}>Logic Intelligence Technologies</Text>
    </Section>
  );
};

const header = {
  padding: "20px 28px 16px 28px",
  backgroundColor: "#0A0F1E",
  borderBottom: "1px solid rgba(0,191,255,0.25)",
};

const logo = {
  display: "block",
  borderRadius: "999px",
  border: "2px solid rgba(0,191,255,0.45)",
};

const banner = {
  display: "block",
  marginLeft: "auto",
  maxWidth: "160px",
  height: "48px",
  objectFit: "cover" as const,
  borderRadius: "8px",
};

const brandFallback = {
  margin: "10px 0 0 0",
  color: "#94a3b8",
  fontSize: "11px",
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
};
