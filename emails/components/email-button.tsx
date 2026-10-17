import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  /** primary = reference orange #F57820; secondary = outline/cream; teal/blue = #0755ED; charcoal = #4B5160 */
  variant?: "primary" | "secondary" | "teal" | "blue" | "charcoal";
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
  } else if (variant === "teal" || variant === "blue") {
    btnStyle = btnBlue;
  } else if (variant === "charcoal") {
    btnStyle = btnCharcoal;
  }

  return (
    <Section style={wrap}>
      <Link href={href} className="ref-cta" style={btnStyle}>
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

const wrap = { textAlign: "center" as const, margin: "28px 0 24px 0" };

const baseBtn: React.CSSProperties = {
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "800" as const,
  lineHeight: "22px",
  padding: "14px 32px",
  borderRadius: "9999px",
  textDecoration: "none",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
  letterSpacing: "0.015em",
  boxSizing: "border-box",
  maxWidth: "100%",
};

const btnPrimary: React.CSSProperties = {
  ...baseBtn,
  backgroundColor: EMAIL.colors.primary,
  color: EMAIL.colors.ctaText,
};

const btnBlue: React.CSSProperties = {
  ...baseBtn,
  backgroundColor: EMAIL.colors.blue,
  color: "#FFFFFF",
};

const btnCharcoal: React.CSSProperties = {
  ...baseBtn,
  backgroundColor: EMAIL.colors.charcoal,
  color: "#FFFFFF",
};

const btnSecondary: React.CSSProperties = {
  ...baseBtn,
  backgroundColor: EMAIL.colors.surfaceMuted,
  color: EMAIL.colors.inkPrimary,
  border: `1px solid ${EMAIL.colors.border}`,
};

const fallbackText = {
  color: EMAIL.colors.muted,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "18px 0 0 0",
  fontFamily: EMAIL.fontSans,
  textAlign: "center" as const,
};

const fallbackLink = {
  color: EMAIL.colors.link,
  wordBreak: "break-all" as const,
  textDecoration: "underline",
};

export default EmailButton;
