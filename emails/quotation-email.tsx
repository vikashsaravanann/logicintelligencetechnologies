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

export interface QuotationEmailProps {
  recipientName?: string;
  companyName?: string;
  projectTitle?: string;
  quotationRef?: string;
  quotationUrl?: string;
  totalFormatted?: string;
  validUntil?: string;
  selectedServicesCount?: number;
  customMessage?: string;
}

export default function QuotationEmail({
  recipientName = "Client Partner",
  companyName = "Your Organization",
  projectTitle = "Enterprise Web & Cloud Engineering",
  quotationRef = "LIT-QT-2026-0001",
  quotationUrl = `${EMAIL.siteUrl}/quotation/sample-token`,
  totalFormatted,
  validUntil = "30 days from issuance",
  selectedServicesCount,
  customMessage,
}: QuotationEmailProps) {
  return (
    <EmailLayout design="documents" preview={`Project quotation ${quotationRef} for ${projectTitle} from Logic Intelligence Technologies`}>
      <EmailHeader subBrand="Commercial Engineering & Quotations" />
      <EmailContent>
        <EmailTitle>Your Project Quotation is Ready</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          We have prepared your customized project quotation for <strong>{companyName}</strong> covering{" "}
          <strong>{projectTitle}</strong> under reference{" "}
          <code
            style={{
              backgroundColor: EMAIL.colors.surfaceMuted,
              color: EMAIL.colors.primary,
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            {quotationRef}
          </code>
          .
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
            Quotation Specification & Terms:
          </div>
          <table style={{ width: "100%", fontSize: "13px", color: EMAIL.colors.inkPrimary, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 0", color: EMAIL.colors.body, width: "35%" }}>Organization:</td>
                <td style={{ padding: "5px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{companyName}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: EMAIL.colors.body }}>Project Title:</td>
                <td style={{ padding: "5px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>{projectTitle}</td>
              </tr>
              {selectedServicesCount !== undefined && (
                <tr>
                  <td style={{ padding: "5px 0", color: EMAIL.colors.body }}>Selected Services:</td>
                  <td style={{ padding: "5px 0", fontWeight: 600, color: EMAIL.colors.inkPrimary }}>
                    {selectedServicesCount} scoped {selectedServicesCount === 1 ? "service" : "services"}
                  </td>
                </tr>
              )}
              {totalFormatted && (
                <tr>
                  <td style={{ padding: "5px 0", color: EMAIL.colors.body }}>Total Approved:</td>
                  <td style={{ padding: "5px 0", fontWeight: 700, color: EMAIL.colors.primary }}>{totalFormatted}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: "5px 0", color: EMAIL.colors.body }}>Quotation Validity:</td>
                <td style={{ padding: "5px 0", color: EMAIL.colors.inkPrimary }}>{validUntil}</td>
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
            Two Contractual Payment Milestones:
          </div>
          <div style={{ fontSize: "12.5px", color: EMAIL.colors.body, lineHeight: "1.6" }}>
            <div style={{ marginBottom: "6px" }}>
              • <strong>Milestone 1 (50%):</strong> Due after executed Statement of Work (SOW) and before active project
              work commences.
            </div>
            <div>
              • <strong>Milestone 2 (50%):</strong> Due after agreed delivery acceptance and before final handover & IP access
              transfer.
            </div>
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "11.5px",
              color: EMAIL.colors.muted,
              fontStyle: "italic",
              borderTop: `1px dashed ${EMAIL.colors.border}`,
              paddingTop: "8px",
            }}
          >
            * Payment details and dedicated UPI transfer requests are supplied separately only at authorized payment
            stages. Quotation acceptance is not a payment receipt.
          </div>
        </div>

        <EmailButton href={quotationUrl}>Review & Accept Quotation</EmailButton>

        <EmailMuted>
          If you require any revisions or technical clarifications, you may request changes directly through your secure quotation
          link or reply to this email.
        </EmailMuted>

        <EmailMuted>— Logic Intelligence Technologies</EmailMuted>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}
