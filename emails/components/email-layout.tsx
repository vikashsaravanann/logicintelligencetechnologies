import { Html, Head, Body, Container, Preview, Font } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

/** Professional Document Shell. Sandal background, White Card, IBM Plex Fonts. */
export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="IBM Plex Sans"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="IBM Plex Sans"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjQ76AIFcTA.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="JetBrains Mono"
          fallbackFontFamily="monospace"
          webFont={{
            url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwI.woff2",
            format: "woff2",
          }}
          fontWeight={400}
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
  padding: "40px 12px", // Increased padding to show off the sandal background
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
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", // PDF document shadow effect
  overflow: "hidden" as const,
};

export default EmailLayout;
