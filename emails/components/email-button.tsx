import { Link, Section } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
  return (
    <Section style={wrap}>
      <Link href={href} style={btn}>
        {children}
      </Link>
    </Section>
  );
};

const wrap = { textAlign: "center" as const, margin: "24px 0" };
const btn = {
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

export default EmailButton;
