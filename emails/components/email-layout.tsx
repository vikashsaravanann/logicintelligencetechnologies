import { Html, Head, Body, Container, Preview, Font } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

/** LIT EMAIL v3 Layout: Warm parchment canvas (#F8F6F2), 600px soft white card (#FFFEFC), 12px radius */
export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body style={main}>
        <Container style={wrapper}>{children}</Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: EMAIL.colors.pageBg,
  fontFamily: EMAIL.fontSans,
  padding: "36px 16px",
  margin: 0,
  width: "100%" as const,
};

const wrapper = {
  backgroundColor: EMAIL.colors.cardBg,
  maxWidth: `${EMAIL.width}px`,
  width: "100%" as const,
  margin: "0 auto",
  border: `1px solid ${EMAIL.colors.cardBorder}`,
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(23, 23, 23, 0.04), 0 1px 3px rgba(23, 23, 23, 0.02)",
  overflow: "hidden" as const,
};

export default EmailLayout;
