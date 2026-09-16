import { Link, Section } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  /** primary = filled CTA; secondary = outline-style for hierarchy */
  variant?: "primary" | "secondary";
}

export const EmailButton = ({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) => {
  const style = variant === "secondary" ? btnSecondary : btnPrimary;
  return (
    <Section style={wrap}>
      <Link href={href} style={style}>
        {children}
      </Link>
    </Section>
  );
};

const wrap = { textAlign: "center" as const, margin: "16px 0" };

const btnPrimary = {
  backgroundColor: EMAIL.colors.ctaBg,
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

const btnSecondary = {
  backgroundColor: EMAIL.colors.softBg,
  color: EMAIL.colors.link,
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

export default EmailButton;
