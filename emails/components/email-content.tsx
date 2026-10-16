import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EMAIL } from "./email-styles";

export const contentPad = { padding: "32px 32px 12px 32px" };

export const titleStyle = {
  color: EMAIL.colors.inkPrimary,
  fontSize: "24px",
  fontWeight: "700" as const,
  lineHeight: "32px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.fontSerif,
  letterSpacing: "-0.01em",
};

export const greetingStyle = {
  color: EMAIL.colors.inkPrimary,
  fontSize: "15px",
  fontWeight: "600" as const,
  lineHeight: "24px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.fontSans,
};

export const bodyStyle = {
  color: EMAIL.colors.body,
  fontSize: "14.5px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
  fontFamily: EMAIL.fontSans,
};

export const mutedStyle = {
  color: EMAIL.colors.muted,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
  fontFamily: EMAIL.fontSans,
};

export const dividerStyle = {
  borderColor: EMAIL.colors.divider,
  borderTop: `1px solid ${EMAIL.colors.divider}`,
  margin: "24px 0",
};

export const softBoxStyle = {
  backgroundColor: EMAIL.colors.surfaceMuted,
  border: `1px solid ${EMAIL.colors.surfaceBorder}`,
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 20px 0",
};

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return <Text style={titleStyle}>{children}</Text>;
}

export function EmailGreeting({ name }: { name?: string }) {
  const text = name && name.trim() ? `Hi ${name.trim()},` : "Hello,";
  return <Text style={greetingStyle}>{text}</Text>;
}

export function EmailHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundColor: EMAIL.colors.highlightBg,
        color: EMAIL.colors.highlightText,
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
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

export function EmailNotice({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "alert";
}) {
  let bg: string = EMAIL.colors.surfaceMuted;
  let border: string = EMAIL.colors.surfaceBorder;
  let text: string = EMAIL.colors.inkPrimary;

  if (variant === "success") {
    bg = EMAIL.colors.successBg;
    border = EMAIL.colors.successBorder;
    text = EMAIL.colors.successText;
  } else if (variant === "warning") {
    bg = EMAIL.colors.warningBg;
    border = EMAIL.colors.warningBorder;
    text = EMAIL.colors.warningText;
  } else if (variant === "alert") {
    bg = EMAIL.colors.alertBg;
    border = EMAIL.colors.alertBorder;
    text = EMAIL.colors.alertText;
  }

  return (
    <Section
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        padding: "16px 20px",
        margin: "16px 0 20px 0",
      }}
    >
      <Text
        style={{
          color: text,
          fontSize: "14px",
          lineHeight: "22px",
          margin: 0,
          fontFamily: EMAIL.fontSans,
        }}
      >
        {children}
      </Text>
    </Section>
  );
}

export function EmailInfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        borderCollapse: "collapse",
        backgroundColor: EMAIL.colors.surfaceMuted,
        border: `1px solid ${EMAIL.colors.surfaceBorder}`,
        borderRadius: "8px",
        margin: "16px 0 20px 0",
        overflow: "hidden",
      }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

export function EmailInfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <tr
      style={{
        borderBottom: isLast ? "none" : `1px solid ${EMAIL.colors.surfaceBorder}`,
      }}
    >
      <td
        style={{
          padding: "12px 16px",
          color: EMAIL.colors.muted,
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: EMAIL.fontSans,
          width: "35%",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "12px 16px",
          color: EMAIL.colors.inkPrimary,
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: EMAIL.fontSans,
          verticalAlign: "top",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

export function EmailStepList({
  steps,
}: {
  steps: Array<{ title: string; desc: string }>;
}) {
  return (
    <Section style={{ margin: "16px 0 20px 0" }}>
      {steps.map((s, idx) => (
        <div key={idx} style={{ marginBottom: idx === steps.length - 1 ? 0 : "14px" }}>
          <Text
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "22px",
              fontFamily: EMAIL.font,
              color: EMAIL.colors.body,
            }}
          >
            <strong style={{ color: EMAIL.colors.text }}>
              {idx + 1}. {s.title}:
            </strong>{" "}
            {s.desc}
          </Text>
        </div>
      ))}
    </Section>
  );
}

export function EmailBulletList({ items }: { items: string[] }) {
  return (
    <Section style={{ margin: "12px 0 16px 0" }}>
      {items.map((it, idx) => (
        <Text
          key={idx}
          style={{
            margin: "0 0 6px 0",
            fontSize: "14px",
            lineHeight: "22px",
            fontFamily: EMAIL.font,
            color: EMAIL.colors.body,
          }}
        >
          • {it}
        </Text>
      ))}
    </Section>
  );
}
