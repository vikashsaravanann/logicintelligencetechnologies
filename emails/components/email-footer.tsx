import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";
import { COMPANY } from "../config-stub";

export const EmailFooter = ({ unsubscribeUrl }: { unsubscribeUrl?: string }) => {
  return (
    <Section style={footer}>
      <Hr style={topDivider} />
      <Text style={companyLine}>{COMPANY.legalName}</Text>
      <Text style={addressLine}>{COMPANY.address}</Text>
      <Section style={linksContainer}>
        <Link href={COMPANY.websiteUrl} style={footerBtn}>Website</Link>
        <Link href={`${COMPANY.websiteUrl}/privacy`} style={footerBtn}>Privacy</Link>
        <Link href={`${COMPANY.websiteUrl}/contact`} style={footerBtn}>Contact</Link>
        <Link href={COMPANY.linkedinUrl} style={footerBtn}>LinkedIn</Link>
      </Section>
      {unsubscribeUrl ? (
        <Text style={unsubLine}>
          You are receiving this because you subscribed to updates from Logic
          Intelligence Technologies.{" "}
          <Link href={unsubscribeUrl} style={unsubLink}>Unsubscribe</Link>
        </Text>
      ) : null}
      <Text style={copyright}>
        © {new Date().getFullYear()} Logic Intelligence Technologies. All rights reserved.
      </Text>
    </Section>
  );
};

const footer = {
  padding: "24px 40px 32px 40px",
  backgroundColor: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
};

const topDivider = {
  display: "none" as const,
};

const companyLine = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "600" as const,
  margin: "0 0 4px 0",
};

const addressLine = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0 0 12px 0",
};

const copyright = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "0",
};

const linksContainer = {
  margin: "16px 0 20px 0",
  display: "block",
};

const footerBtn = {
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  padding: "6px 12px",
  borderRadius: "16px",
  textDecoration: "none",
  fontSize: "11px",
  fontWeight: "600" as const,
  display: "inline-block",
  marginRight: "8px",
  marginBottom: "8px",
  border: "1px solid #bfdbfe",
};

const unsubLine = {
  color: "#6b7280",
  fontSize: "11px",
  lineHeight: "18px",
  margin: "0 0 12px 0",
};

const unsubLink = {
  color: "#2563eb",
  fontSize: "11px",
  textDecoration: "underline",
};
