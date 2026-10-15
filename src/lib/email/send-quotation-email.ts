import * as React from "react";
import QuotationEmail from "@/emails/quotation-email";
import { sendEmail, type EmailResponse } from "@/lib/email/client";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import type { QuotationRecord } from "@/types/quotations";

export interface SendQuotationEmailOptions {
  quotation: QuotationRecord;
  recipientEmail?: string;
  customMessage?: string;
  selectedServicesCount?: number;
}

/**
 * Dispatches formal client quotation presentation email using the verified LIT template.
 * 
 * Invariants:
 * - Subject: "Quotation: [Project Title] — Logic Intelligence Technologies"
 * - Zero unverified links (uses secure_token)
 * - Never throws (defensive transactional error handling)
 */
export async function sendQuotationEmail({
  quotation,
  recipientEmail,
  customMessage,
  selectedServicesCount,
}: SendQuotationEmailOptions): Promise<EmailResponse> {
  const targetEmail = (recipientEmail || quotation.recipient_email || "").trim();
  if (!targetEmail) {
    return {
      success: false,
      message: "Recipient email is required to send quotation",
      status: "failed",
      errorCategory: "validation",
      errorCode: "MISSING_RECIPIENT",
    };
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.logicintelligencetechnologies.in"
  ).replace(/\/$/, "");

  const quotationUrl = `${baseUrl}/quotation/${quotation.secure_token}`;

  const validUntilFormatted = quotation.valid_until
    ? new Date(quotation.valid_until).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "30 days from issuance";

  const totalFormatted = formatPaiseToINR(quotation.total_payable_paise);

  const subject = `Quotation: ${quotation.project_title} — Logic Intelligence Technologies`;

  return sendEmail({
    to: targetEmail,
    subject,
    react: React.createElement(QuotationEmail, {
      recipientName: quotation.recipient_name || "Client Partner",
      companyName: quotation.company_name || "Your Organization",
      projectTitle: quotation.project_title,
      quotationRef: quotation.quotation_ref,
      quotationUrl,
      totalFormatted,
      validUntil: validUntilFormatted,
      selectedServicesCount,
      customMessage,
    }),
    from: "hello",
    category: "transactional",
    eventType: "quotation_published",
    idempotencyKey: `quote-email-${quotation.id}-${quotation.version_number}-${Date.now()}`,
    correlationId: quotation.id,
  });
}
