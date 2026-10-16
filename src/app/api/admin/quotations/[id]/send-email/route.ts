import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { getQuotationById } from "@/lib/quotations/service";
import { sendQuotationEmail } from "@/lib/email/send-quotation-email";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import { recordAdminAction } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Policy 1: Quotation sending is restricted to Super Admin
  const auth = await requireCapabilityApi(req, "quotation.send");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  const { id } = await context.params;
  const quoteData = await getQuotationById(id);
  if (!quoteData) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const { quotation, lines } = quoteData;

  const raw = await req.json().catch(() => ({}));
  const customMessage = raw?.customMessage?.trim() || undefined;
  const recipientEmail = (raw?.recipientEmail?.trim() || quotation.recipient_email || "").trim();

  try {
    const selectedCount = lines.filter((l) => l.is_selected).length;

    const sendRes = await sendQuotationEmail({
      quotation,
      recipientEmail,
      customMessage,
      selectedServicesCount: selectedCount,
    });

    if (!sendRes.success) {
      quotation.delivery_state = "email_failed";
      if (isAdminClientConfigured()) {
        await supabaseAdmin
          .from("quotations")
          .update({ delivery_state: "email_failed", updated_at: new Date().toISOString() })
          .eq("id", quotation.id);
      }

      await recordAdminAction({
        actor,
        action: "quotation.send",
        capability: "quotation.send",
        target: { type: "quotation", id: quotation.id },
        outcome: "failed",
        errorCode: sendRes.errorCode || "email_delivery_failed",
        metadata: { quotationRef: quotation.quotation_ref, recipientEmail, error: sendRes.message },
        request: req,
      });

      return NextResponse.json(
        { ok: false, error: sendRes.message || "Failed to deliver quotation email", status: sendRes.status },
        { status: 502 }
      );
    }

    quotation.delivery_state = "email_sent";
    if (isAdminClientConfigured()) {
      await supabaseAdmin
        .from("quotations")
        .update({ delivery_state: "email_sent", updated_at: new Date().toISOString() })
        .eq("id", quotation.id);
    }

    await recordAdminAction({
      actor,
      action: "quotation.send",
      capability: "quotation.send",
      target: { type: "quotation", id: quotation.id },
      outcome: "succeeded",
      metadata: { quotationRef: quotation.quotation_ref, recipientEmail, messageId: sendRes.messageId },
      request: req,
    });

    return NextResponse.json({
      ok: true,
      messageId: sendRes.messageId,
      deliveryState: "email_sent",
    });
  } catch (err: any) {
    console.error("[send-email] error sending quotation email:", err);
    await recordAdminAction({
      actor,
      action: "quotation.send",
      capability: "quotation.send",
      target: { type: "quotation", id: quotation.id },
      outcome: "failed",
      errorCode: "unexpected",
      metadata: { quotationRef: quotation.quotation_ref, error: err?.message },
      request: req,
    });
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
