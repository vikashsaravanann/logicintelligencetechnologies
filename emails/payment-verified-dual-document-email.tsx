import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailButton } from "./components/email-button";
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
  milestoneTitle = "Project Milestone Payment",
  amountPaid,
  paymentDate,
  utrReference,
  bankCreditReference,
  invoiceDownloadUrl,
  receiptDownloadUrl,
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
      : typeof amountPaid === "string" && amountPaid.trim().length > 0
      ? amountPaid.startsWith("₹")
        ? amountPaid
        : `₹${amountPaid}`
      : "Verified per milestone schedule";

  const isStage6 = stageNumber === 6;
  const isStage11 = stageNumber === 11;

  const defaultNextStageUrl = isStage6
    ? "https://www.logicintelligencetechnologies.in/onboarding"
    : "https://www.logicintelligencetechnologies.in/portal";

  const targetNextStageUrl = nextStageUrl || defaultNextStageUrl;

  return (
    <EmailLayout design="payment" preview="Payment Verified & Official Financial Documents Issued">
      <EmailHeader subBrand="Financial Operations & Ledger Reconciliation" />

      <EmailContent>
        <EmailTitle>Payment Verified & Documents Issued</EmailTitle>
        <EmailGreeting name={recipientName} />

        <EmailBody>
          We are pleased to confirm that your milestone payment has been successfully verified
          against our bank ledger. Your official Tax Invoice and Payment Receipt have been issued
          and are accessible below.
        </EmailBody>

        {/* Financial Settlement Summary Card */}
        <EmailInfoGrid>
          <EmailInfoRow label="Milestone Title" value={milestoneTitle} />
          <EmailInfoRow
            label="Amount Paid (INR)"
            value={
              <strong style={{ color: EMAIL.colors.inkPrimary, fontSize: "15px" }}>
                {formattedAmount}
              </strong>
            }
          />
          {paymentDate ? (
            <EmailInfoRow label="Payment Date" value={paymentDate} />
          ) : null}
          {utrReference ? (
            <EmailInfoRow
              label="UTR / Reference"
              value={
                <span style={{ fontFamily: EMAIL.fontMono, fontSize: "13px" }}>
                  {utrReference}
                </span>
              }
            />
          ) : null}
          {bankCreditReference ? (
            <EmailInfoRow
              label="Bank Reconciliation"
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
          ) : null}
        </EmailInfoGrid>

        {/* Dual Document Download Action Buttons (if URLs provided) */}
        {(invoiceDownloadUrl || receiptDownloadUrl) ? (
          <Section style={dualButtonContainer}>
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                {invoiceDownloadUrl ? (
                  <tr>
                    <td align="center" style={{ padding: "8px 0" }}>
                      <EmailButton href={invoiceDownloadUrl}>
                        Download Tax Invoice (PDF)
                      </EmailButton>
                    </td>
                  </tr>
                ) : null}
                {receiptDownloadUrl ? (
                  <tr>
                    <td align="center" style={{ padding: "4px 0 12px 0" }}>
                      <EmailButton href={receiptDownloadUrl} variant="secondary">
                        Download Payment Receipt (PDF)
                      </EmailButton>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Section>
        ) : (
          <Section style={dualButtonContainer}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <EmailButton href={targetNextStageUrl}>
                Access Official Documents in Client Portal &rarr;
              </EmailButton>
            </div>
          </Section>
        )}

        {/* Next Stage Unlocking Card */}
        {isStage6 ? (
          <Section style={unlockCard}>
            <div style={{ marginBottom: "8px" }}>
              <span style={badgeActive}>STAGE 6 COMPLETED · ENGAGEMENT ACTIVE</span>
            </div>
            <Text style={unlockTitle}>
              Your engagement is active! Proceed to Stage 7: Client Onboarding
            </Text>
            <Text style={unlockDesc}>
              Our engineering workspace and kickoff roadmap have been provisioned. Please complete
              the client intake onboarding to begin phase sprint execution.
            </Text>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <EmailButton href={targetNextStageUrl}>
                Proceed to Stage 7: Client Onboarding &rarr;
              </EmailButton>
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
              <EmailButton href={targetNextStageUrl}>
                Proceed to Stage 12: Production Handover &rarr;
              </EmailButton>
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
              <EmailButton href={targetNextStageUrl}>
                View Client Portal &rarr;
              </EmailButton>
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
        registeredAddress="Coimbatore, Tamil Nadu, India"
      />
    </EmailLayout>
  );
}

const dualButtonContainer = {
  margin: "12px 0 24px 0",
  textAlign: "center" as const,
};

const unlockCard = {
  backgroundColor: EMAIL.colors.surfaceMuted,
  border: `1px solid ${EMAIL.colors.surfaceBorder}`,
  borderRadius: "8px",
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
  fontFamily: EMAIL.fontSans,
  display: "inline-block",
};

const unlockTitle = {
  color: EMAIL.colors.inkPrimary,
  fontSize: "16px",
  fontWeight: "700" as const,
  lineHeight: "24px",
  margin: "8px 0 6px 0",
  fontFamily: EMAIL.fontSans,
};

const unlockDesc = {
  color: EMAIL.colors.body,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
  fontFamily: EMAIL.fontSans,
};
