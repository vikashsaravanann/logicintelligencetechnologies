import { Html, Head, Body, Container, Preview } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

/** White-background transactional shell. Centered 640px. No banners. */
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
  fontFamily: EMAIL.font,
  padding: "24px 12px",
  margin: 0,
  width: "100%" as const,
};

const wrapper = {
  backgroundColor: EMAIL.colors.cardBg,
  maxWidth: `${EMAIL.width}px`,
  width: "100%" as const,
  margin: "0 auto",
  border: `1px solid ${EMAIL.colors.border}`,
  borderRadius: "8px",
  overflow: "hidden" as const,
};

export default EmailLayout;
