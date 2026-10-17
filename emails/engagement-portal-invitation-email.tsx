import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import { EmailButton } from "./components/email-button";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailMuted,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

export interface EngagementPortalInvitationEmailProps {
  recipientName?: string;
  companyName?: string;
  projectTitle?: string;
  engagementRef?: string;
  portalUrl?: string;
  workspaceUrl?: string;
  customMessage?: string;
}

export default function EngagementPortalInvitationEmail({
  recipientName = "Client Partner",
  companyName = "Your Organization",
  projectTitle = "Enterprise AI & Cloud Infrastructure Architecture",
  engagementRef = "ENG-2026-LIT-SAMPLE",
  portalUrl = `${EMAIL.siteUrl}/engagement/${engagementRef}`,
  workspaceUrl = `${EMAIL.siteUrl}/client/login?ref=${engagementRef}`,
  customMessage,
}: EngagementPortalInvitationEmailProps) {
  return (
    <EmailLayout design="workspace" preview={`Your confidential client portal for ${projectTitle} is ready.`}>
      <EmailHeader subBrand="Client Lifecycle Portal" />
      <EmailContent>
        <EmailTitle>Your Client Lifecycle & Project Portal</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          Your dedicated client portal for <strong>{companyName}</strong> has been provisioned
          under engagement reference <code style={{ backgroundColor: EMAIL.colors.surfaceMuted, color: EMAIL.colors.primary, padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: 700 }}>{engagementRef}</code>.
        </EmailBody>

        {customMessage && (
          <div
            style={{
              margin: "16px 0",
              padding: "12px 16px",
              backgroundColor: EMAIL.colors.surfaceMuted,
              borderLeft: `3px solid ${EMAIL.colors.primary}`,
              borderRadius: "4px",
              fontSize: "13px",
              color: EMAIL.colors.inkPrimary,
              lineHeight: "1.5",
            }}
          >
            {customMessage}
          </div>
        )}

        <div
          style={{
            margin: "20px 0",
            padding: "18px 20px",
            backgroundColor: EMAIL.colors.surfaceMuted,
            borderRadius: "12px",
            border: `1px solid ${EMAIL.colors.border}`,
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "bold", color: EMAIL.colors.inkPrimary, marginBottom: "10px" }}>
            Engagement Details & Scope:
          </div>
          <table style={{ width: "100%", fontSize: "13px", color: EMAIL.colors.inkPrimary, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body, width: "35%" }}>Organization:</td>
                <td style={{ padding: "4px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{companyName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Project Scope:</td>
                <td style={{ padding: "4px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{projectTitle}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Portal Ref:</td>
                <td style={{ padding: "4px 0", fontWeight: 700, color: EMAIL.colors.primary, fontFamily: "monospace" }}>{engagementRef}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: EMAIL.colors.body }}>Governance:</td>
                <td style={{ padding: "4px 0", color: "#065F46" }}>Universal 13-Stage Client Lifecycle</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: `1px solid ${EMAIL.colors.border}`,
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "bold", color: EMAIL.colors.inkPrimary, marginBottom: "8px" }}>
            What you can access inside your portal:
          </div>
          <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: EMAIL.colors.body, lineHeight: "1.6" }}>
            <li><strong>Stage 01: 50-Point Checklist</strong> — Review technical specifications and select requirements.</li>
            <li><strong>Stage 03 &amp; 04: Proposal &amp; SOW</strong> — Merged commercial terms, deliverables, and service agreement.</li>
            <li><strong>Stage 06 &amp; 11: Milestone Invoices</strong> — Transparent 50/50 payment stages with direct bank UPI transfer audit.</li>
            <li><strong>Stage 07: Infrastructure Onboarding</strong> — Secure cloud credentials intake and security verification.</li>
            <li><strong>Stages 10 &amp; 12: Acceptance &amp; Handover</strong> — Code repository delivery, sign-off reports, and warranty.</li>
          </ol>
        </div>

        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <EmailButton href={workspaceUrl}>Launch Client Workspace</EmailButton>
        </div>

        <div style={{ marginTop: "16px", padding: "14px 16px", backgroundColor: EMAIL.colors.surfaceMuted, borderRadius: "10px", border: `1px solid ${EMAIL.colors.border}`, fontSize: "12px", color: EMAIL.colors.body }}>
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ color: EMAIL.colors.inkPrimary }}>Client Portal Workspace:</strong><br />
            <a href={workspaceUrl} style={{ color: EMAIL.colors.primary, wordBreak: "break-all", textDecoration: "underline" }}>
              {workspaceUrl}
            </a>
          </div>
          <div>
            <strong style={{ color: EMAIL.colors.inkPrimary }}>Direct 13-Stage Milestone Portal:</strong><br />
            <a href={portalUrl} style={{ color: EMAIL.colors.link, wordBreak: "break-all", textDecoration: "underline" }}>
              {portalUrl}
            </a>
          </div>
        </div>

        <EmailMuted>
          Security Notice: All commercial transactions are governed by bank-grade manual UPI transfer audit. We never use third-party payment gateways. Authoritative company credentials are authenticated under MSME UDYAM-TN-03-0345274.
        </EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
