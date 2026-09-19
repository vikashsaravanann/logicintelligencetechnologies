import { Link, Section } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const EmailButton = ({ href, children, variant = "primary" }: EmailButtonProps) => {
  const isSecondary = variant === "secondary";
  
  const btnStyle = {
    backgroundColor: isSecondary ? "transparent" : EMAIL.colors.ctaBg,
    color: isSecondary ? EMAIL.colors.text : EMAIL.colors.ctaText,
    border: isSecondary ? `1px solid ${EMAIL.colors.border}` : "none",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: "700" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    lineHeight: "20px",
    padding: isSecondary ? "13px 27px" : "14px 28px",
    borderRadius: "4px",
    textDecoration: "none",
    fontFamily: EMAIL.font,
    textAlign: "center" as const,
  };

  return (
    <Section style={wrap}>
      <Link href={href} style={btnStyle}>
        {children}
      </Link>
    </Section>
  );
};

export const EmailButtonGroup = ({ children }: { children: React.ReactNode }) => {
  return (
    <Section style={groupWrap}>
      {children}
    </Section>
  );
};

const wrap = { textAlign: "center" as const, margin: "24px 0" };
const groupWrap = { textAlign: "center" as const, margin: "24px 0", gap: "12px", display: "inline-block", width: "100%" };

export default EmailButton;
