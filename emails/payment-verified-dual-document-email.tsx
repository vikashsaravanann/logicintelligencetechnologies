import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { EmailHeader } from "./components/email-header";
import { EmailFooter } from "./components/email-footer";
import {
  EmailContent,
  EmailGreeting,
  EmailTitle,
  EmailBody,
  EmailNotice,
  EmailInfoGrid,
  EmailInfoRow,
} from "./components/email-content";
import { EMAIL } from "./components/email-styles";

export interface PaymentVerifiedDualDocumentEmailProps {
  recipientName?: string;
  milestoneTitle?: string;
  amountPaid?: string | number;
  paymentDate?: string;
  utrReference?: string;
  bankCreditReference?: string;
  invoiceDownloadUrl?: string;
  receiptDownloadUrl?: string;
  stageNumber?: 6 | 11 | number;
  nextStageUrl?: string;
}

export default function PaymentVerifiedDualDocumentEmail({
  recipientName = "Partner",
  milestoneTitle = "Stage 6: Initial Project Milestone (50%)",
  amountPaid = "₹1,50,000.00",
  paymentDate = "October 14, 2026",
  utrReference = "UPI/428910398471",
  bankCreditReference = "YESB-CMS-20261014-9918",
  invoiceDownloadUrl = "https://www.logicintelligencetechnologies.in/api/documents/invoice-demo",
  receiptDownloadUrl = "https://www.logicintelligencetechnologies.in/api/documents/receipt-demo",
  stageNumber = 6,
  nextStageUrl,
}: PaymentVerifiedDualDocumentEmailProps) {
  const formattedAmount =
    typeof amountPaid === "number"
      ? "₹" +
        amountPaid.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : amountPaid.startsWith("₹")
      ? amountPaid
      : `₹${amountPaid}`;

  const isStage6 = stageNumber === 6;
  const isStage11 = stageNumber === 11;

  const defaultNextStageUrl = isStage6
    ? "https://www.logicintelligencetechnologies.in/onboarding"
    : "https://www.logicintelligencetechnologies.in/dashboard";

  const targetNextStageUrl = nextStageUrl || defaultNextStageUrl;

  return (
    <EmailLayout preview="Payment Verified & Official Financial Documents Issued">
      <EmailHeader subBrand="Financial Operations & Ledger Reconciliation" />

      <EmailContent>
        <EmailTitle>Payment Verified & Documents Issued</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          We are pleased to confirm that your milestone payment has been successfully verified
          against our bank ledger. Your official Tax Invoice and Payment Receipt have been issued
          and are ready for download.
        </EmailBody>

        {/* Financial Settlement Summary Card */}
        <EmailInfoGrid>
          <EmailInfoRow label="Milestone Title" value={milestoneTitle} />
          <EmailInfoRow
            label="Amount Paid (INR)"
            value={
              <strong style={{ color: EMAIL.colors.primary, fontSize: "15px" }}>
                {formattedAmount}
              </strong>
            }
          />
          <EmailInfoRow label="Payment Date" value={paymentDate} />
          <EmailInfoRow
            label="UTR / UPI Reference"
            value={
              <span style={{ fontFamily: EMAIL.fontMono, fontSize: "13px" }}>
                {utrReference}
              </span>
            }
          />
          <EmailInfoRow
            label="Bank Credit Ref"
            value={
              <span
                style={{
                  fontFamily: EMAIL.fontMono,
                  fontSize: "13px",
                  color: EMAIL.colors.successText,
                  fontWeight: 600,
                }}
              >
                {bankCreditReference}
              </span>
            }
            isLast={true}
          />
        </EmailInfoGrid>

        {/* Dual Document Download Action Buttons */}
        <Section style={dualButtonContainer}>
          <table
            role="presentation"
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ borderCollapse: "collapse" }}
          >
            <tr>
              <td align="center" style={{ padding: "8px 0" }}>
                <Link href={invoiceDownloadUrl} style={btnPrimary}>
                  Download Tax Invoice (PDF)
                </Link>
              </td>
            </tr>
            <tr>
              <td align="center" style={{ padding: "4px 0 12px 0" }}>
                <Link href={receiptDownloadUrl} style={btnSecondary}>
                  Download Payment Receipt (PDF)
                </Link>
              </td>
            </tr>
          </table>
        </Section>

        {/* Next Stage Unlocking Card */}
        {isStage6 ? (
          <Section style={unlockCard}>
            <div style={{ marginBottom: "8px" }}>
              <span style={badgeActive}>STAGE 6 COMPLETED · ENGAGEMENT ACTIVE</span>
            </div>
            <Text style={unlockTitle}>
              Your engagement is now active! Proceed to Stage 7: Client Onboarding
            </Text>
            <Text style={unlockDesc}>
              Our engineering workspace and kickoff roadmap have been provisioned. Please complete
              the client intake onboarding to begin phase sprint execution.
            </Text>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link href={targetNextStageUrl} style={btnUnlock}>
                Proceed to Stage 7: Client Onboarding &rarr;
              </Link>
            </div>
          </Section>
        ) : isStage11 ? (
          <Section style={unlockCard}>
            <div style={{ marginBottom: "8px" }}>
              <span style={badgeActive}>STAGE 11 COMPLETED · MILESTONE SETTLED</span>
            </div>
            <Text style={unlockTitle}>
              Final milestone payment confirmed! Proceed to Stage 12: Production Handover
            </Text>
            <Text style={unlockDesc}>
              All contractual obligations and deliverable sign-offs have been confirmed. Proceed to
              Stage 12 to finalize production release credentials, source repositories, and warranties.
            </Text>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link href={targetNextStageUrl} style={btnUnlock}>
                Proceed to Stage 12: Production Handover &rarr;
              </Link>
            </div>
          </Section>
        ) : (
          <Section style={unlockCard}>
            <Text style={unlockTitle}>Milestone Payment Confirmed</Text>
            <Text style={unlockDesc}>
              Your payment has been successfully recorded. You may monitor all project deliverables
              and milestone progress from your client portal.
            </Text>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link href={targetNextStageUrl} style={btnUnlock}>
                View Client Portal &rarr;
              </Link>
            </div>
          </Section>
        )}

        {/* Security Assurance Note */}
        <EmailNotice variant="info">
          <strong>Security Note:</strong> All issued financial documents are cryptographically
          hashed (SHA-256) and recorded in our tamper-evident ledger. Official enterprise credentials
          are certified under MSME Udyam Registration <strong>UDYAM-TN-03-0345274</strong>.
        </EmailNotice>
      </EmailContent>

      <EmailFooter
        msmeRegistration="UDYAM-TN-03-0345274"
        registeredAddress="Eachanari, Coimbatore, Tamil Nadu 641021, India"
      />
    </EmailLayout>
  );
}

const dualButtonContainer = {
  margin: "12px 0 24px 0",
  textAlign: "center" as const,
};

const btnPrimary = {
  backgroundColor: EMAIL.colors.primary,
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700" as const,
  lineHeight: "20px",
  padding: "13px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
  boxShadow: "0 2px 4px rgba(21, 101, 192, 0.2)",
};

const btnSecondary = {
  backgroundColor: "#FFFFFF",
  color: EMAIL.colors.primary,
  border: `1.5px solid ${EMAIL.colors.primary}`,
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600" as const,
  lineHeight: "20px",
  padding: "11px 26px",
  borderRadius: "8px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
  textAlign: "center" as const,
};

const unlockCard = {
  backgroundColor: EMAIL.colors.softBg,
  border: `1px solid ${EMAIL.colors.border}`,
  borderRadius: "10px",
  padding: "20px",
  margin: "20px 0",
};

const badgeActive = {
  backgroundColor: EMAIL.colors.successBg,
  color: EMAIL.colors.successText,
  border: `1px solid ${EMAIL.colors.successBorder}`,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.05em",
  padding: "4px 8px",
  borderRadius: "4px",
  fontFamily: EMAIL.font,
  display: "inline-block",
};

const unlockTitle = {
  color: EMAIL.colors.text,
  fontSize: "16px",
  fontWeight: "700" as const,
  lineHeight: "24px",
  margin: "8px 0 6px 0",
  fontFamily: EMAIL.font,
};

const unlockDesc = {
  color: EMAIL.colors.body,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
  fontFamily: EMAIL.font,
};

const btnUnlock = {
  backgroundColor: EMAIL.colors.accent,
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: "700" as const,
  lineHeight: "18px",
  padding: "10px 20px",
  borderRadius: "6px",
  textDecoration: "none",
  fontFamily: EMAIL.font,
};
