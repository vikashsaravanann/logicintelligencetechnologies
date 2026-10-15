import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { getQuotationById } from "@/lib/quotations/service";
import { sendEmail } from "@/lib/email/send-email";
import QuotationEmail from "@/emails/quotation-email";
import * as React from "react";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import { formatIST } from "@/lib/format/datetime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const quoteData = await getQuotationById(id);
  if (!quoteData) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const { quotation, lines } = quoteData;

  const raw = await req.json().catch(() => ({}));
  const customMessage = raw?.customMessage?.trim() || undefined;
  const recipientEmail = raw?.recipientEmail?.trim() || quotation.recipient_email;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.logicintelligencetechnologies.in";
  const quotationUrl = `${siteUrl}/quotation/${quotation.secure_token}`;

  try {
    const selectedCount = lines.filter((l) => l.is_selected).length;
    const formattedTotal = formatPaiseToINR(quotation.total_payable_paise);
    const validUntilFormatted = quotation.valid_until
      ? formatIST(quotation.valid_until)
      : "14 days from issue";

    const emailComponent = React.createElement(QuotationEmail, {
      recipientName: quotation.recipient_name,
      companyName: quotation.company_name,
      projectTitle: quotation.project_title,
      quotationRef: quotation.quotation_ref,
      quotationUrl,
      totalFormatted: formattedTotal,
      validUntil: validUntilFormatted,
      selectedServicesCount: selectedCount,
      customMessage,
    });

    const sendRes = await sendEmail({
      to: recipientEmail,
      from: "billing",
      subject: `Project Quotation: ${quotation.project_title} [${quotation.quotation_ref}]`,
      react: emailComponent,
    });

    quotation.delivery_state = "email_sent";

    return NextResponse.json({
      ok: true,
      messageId: sendRes.messageId,
      deliveryState: quotation.delivery_state,
    });
  } catch (err: any) {
    console.error("[send-email] error sending quotation email:", err);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
