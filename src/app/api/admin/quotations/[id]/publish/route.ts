import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { publishQuotation, getQuotationById } from "@/lib/quotations/service";
import { sendQuotationEmail } from "@/lib/email/send-quotation-email";

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
  const actorEmail = auth.session.email || "admin@logicintelligencetechnologies.in";
  const result = await publishQuotation(id, actorEmail);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  let emailSent = false;
  try {
    const quoteDetails = await getQuotationById(id);
    if (quoteDetails?.quotation && quoteDetails.quotation.recipient_email) {
      const selectedCount = quoteDetails.lines.filter((l) => l.is_selected).length;
      const emailRes = await sendQuotationEmail({
        quotation: quoteDetails.quotation,
        recipientEmail: quoteDetails.quotation.recipient_email,
        selectedServicesCount: selectedCount,
      });
      emailSent = emailRes.success;
    }
  } catch (mailErr) {
    console.error("[quotations/publish] Email dispatch error:", mailErr);
  }

  return NextResponse.json({ ok: true, emailSent });
}

