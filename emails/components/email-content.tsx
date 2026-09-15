import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

export const contentPad = { padding: "28px 32px 8px 32px" };
export const titleStyle = {
  color: EMAIL.colors.text,
  fontSize: "22px",
  fontWeight: "700" as const,
  lineHeight: "30px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.font,
};
export const greetingStyle = {
  color: EMAIL.colors.text,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
  fontFamily: EMAIL.font,
};
export const bodyStyle = {
  color: EMAIL.colors.body,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 14px 0",
  fontFamily: EMAIL.font,
};
export const mutedStyle = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  lineHeight: "20px",
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
