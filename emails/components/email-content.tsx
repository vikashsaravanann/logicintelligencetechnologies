import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

export const contentPad = { padding: "28px 32px 8px 32px" };
export const titleStyle = {
  color: EMAIL.colors.text,
  fontSize: "24px",
  fontWeight: "700" as const,
  lineHeight: "32px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.font,
  letterSpacing: "-0.01em",
};
export const greetingStyle = {
  color: EMAIL.colors.text,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.font,
};
export const bodyStyle = {
  color: EMAIL.colors.body,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.font,
};
export const mutedStyle = {
  color: EMAIL.colors.muted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px 0",
  fontFamily: EMAIL.font,
};
export const dividerStyle = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "20px 0",
};
export const softBoxStyle = {
  backgroundColor: EMAIL.colors.softBg,
  border: `1px solid ${EMAIL.colors.border}`,
  borderRadius: "6px",
  padding: "14px 16px",
  margin: "0 0 16px 0",
};

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return <Text style={titleStyle}>{children}</Text>;
}
export function EmailGreeting({ name }: { name?: string }) {
  const text = name && name.trim() ? `Hi ${name.trim()},` : "Hello,";
  return <Text style={greetingStyle}>{text}</Text>;
}
export function EmailBody({ children }: { children: React.ReactNode }) {
  return <Text style={bodyStyle}>{children}</Text>;
}
export function EmailMuted({ children }: { children: React.ReactNode }) {
  return <Text style={mutedStyle}>{children}</Text>;
}
export function EmailDivider() {
  return <Hr style={dividerStyle} />;
}
export function EmailContent({ children }: { children: React.ReactNode }) {
  return <Section style={contentPad}>{children}</Section>;
}
