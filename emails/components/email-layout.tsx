import { Html, Head, Body, Container, Preview, Font } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

/** LIT EMAIL v2 Layout: Cloud-gray canvas (#F7F9FC), 620px white card (#FFFFFF), 12px radius */
export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V1s.woff2",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDD4V1s.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
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
  padding: "36px 16px",
  margin: 0,
  width: "100%" as const,
};

const wrapper = {
  backgroundColor: EMAIL.colors.cardBg,
  maxWidth: `${EMAIL.width}px`,
  width: "100%" as const,
  margin: "0 auto",
  border: `1px solid ${EMAIL.colors.border}`,
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(11, 37, 69, 0.04), 0 1px 3px rgba(11, 37, 69, 0.02)",
  overflow: "hidden" as const,
};

export default EmailLayout;
