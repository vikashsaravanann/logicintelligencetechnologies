import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  /** primary = corporate blue #1565C0; secondary = outline; teal = #1FA9A2 */
  variant?: "primary" | "secondary" | "teal";
  showFallbackUrl?: boolean;
}

export const EmailButton = ({
  href,
  children,
  variant = "primary",
  showFallbackUrl = false,
}: EmailButtonProps) => {
  let btnStyle: React.CSSProperties = btnPrimary;
  if (variant === "secondary") {
    btnStyle = btnSecondary;
  } else if (variant === "teal") {
    btnStyle = btnTeal;
  }

  return (
    <Section style={wrap}>
      <Link href={href} style={btnStyle}>
        {children}
      </Link>
      {showFallbackUrl ? (
        <Text style={fallbackText}>
          If the button above does not work, copy and paste this link into your browser:
          <br />
          <Link href={href} style={fallbackLink}>
            {href}
          </Link>
        </Text>
      ) : null}
    </Section>
  );
};

const wrap = { textAlign: "center" as const, margin: "20px 0" };

const btnPrimary = {
  backgroundColor: EMAIL.colors.primary,
  color: EMAIL.colors.ctaText,
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "700" as const,
  lineHeight: "20px",
  padding: "14px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const btnTeal = {
  backgroundColor: EMAIL.colors.accent,
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "700" as const,
  lineHeight: "20px",
  padding: "14px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const btnSecondary = {
  backgroundColor: EMAIL.colors.softBg,
  color: EMAIL.colors.text,
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600" as const,
  lineHeight: "20px",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
  border: `1px solid ${EMAIL.colors.border}`,
};

const fallbackText = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "14px 0 0 0",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
  wordBreak: "break-all" as const,
};

const fallbackLink = {
  color: EMAIL.colors.primary,
  textDecoration: "none",
  wordBreak: "break-all" as const,
};

export default EmailButton;
