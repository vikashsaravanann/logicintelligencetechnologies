import { Html, Head, Body, Container, Preview, Font } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";
import type { EmailDesign } from "./email-design";
import { EmailHeader } from "./email-header";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
  design?: EmailDesign;
}

/** LIT EMAIL v3 Reference Layout: Warm canvas (#F8F6F3), 600px clean white card (#FFFFFF), 12px radius */
export const EmailLayout = ({ children, preview, design = "transactional" }: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <Font
          fontFamily="Nunito Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: `${EMAIL.assetUrl}/nunito-sans-latin.woff2`,
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Nunito Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: `${EMAIL.assetUrl}/nunito-sans-latin.woff2`,
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Nunito Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: `${EMAIL.assetUrl}/nunito-sans-latin.woff2`,
            format: "woff2",
          }}
          fontWeight={800}
          fontStyle="normal"
        />
        <style>{`
          body,table,td,a,p,h1,h2 { font-family: ${EMAIL.fontSans}; }
          img { max-width:100%; }
          .ref-cta { overflow-wrap:anywhere; }
          @media only screen and (max-width: 620px) {
            .ref-canvas { padding: 0 !important; }
            .ref-wordmark { font-size: 11px !important; letter-spacing: .025em !important; }
            .ref-heading { font-size:32px!important; line-height:38px!important; }
            .ref-header { padding: 24px 16px 16px !important; }
            .ref-content { padding-left: 20px !important; padding-right: 20px !important; }
            .ref-footer { padding: 36px 18px 28px !important; }
          }
        `}</style>
      </Head>
      {preview ? <Preview>{preview}</Preview> : null}
      <Body className="ref-canvas" style={main}>
        <Container style={wrapper}>{React.Children.map(children, child =>
          React.isValidElement<{ design?: EmailDesign }>(child) && child.type === EmailHeader
            ? React.cloneElement(child, { design })
            : child
        )}</Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: EMAIL.colors.pageBg,
  fontFamily: EMAIL.fontSans,
  padding: "32px 12px",
  margin: 0,
  width: "100%" as const,
  color: EMAIL.colors.inkPrimary,
};

const wrapper = {
  backgroundColor: EMAIL.colors.cardBg,
  maxWidth: `${EMAIL.width}px`,
  width: "100%" as const,
  margin: "0 auto",

  overflow: "hidden" as const,
};

export default EmailLayout;
