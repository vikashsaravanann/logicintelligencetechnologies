import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import InvoiceEmail from "@/emails/invoice-email";
import * as React from "react";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { isValidEmail, normalizeEmail, sanitizePersonName } from "@/lib/email/validation";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const invoiceSchema = z.object({
  clientName: z.string().trim().min(1).max(120),
  clientEmail: z.string().trim().email().max(200),
  amount: z.number().finite().positive().max(10_000_000),
  description: z.string().trim().min(1).max(300),
  dueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD"),
});

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "invoices.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const raw = await req.json().catch(() => null);
    const parsed = invoiceSchema.safeParse({
      clientName: sanitizePersonName(String(raw?.clientName ?? ""), 120),
      clientEmail: normalizeEmail(String(raw?.clientEmail ?? "")),
      amount: Number(raw?.amount),
      description: sanitizePersonName(String(raw?.description ?? ""), 300),
      dueDate: String(raw?.dueDate ?? ""),
    });
    if (!parsed.success || !isValidEmail(parsed.data.clientEmail)) {
      return NextResponse.json({ error: "Invalid invoice details" }, { status: 400 });
    }
    const { clientName, clientEmail, amount, description, dueDate } = parsed.data;

    // Server-generated reference (LIT-INV-YYYY-NNNN). This is the invoice_code.
    const { data: invoiceCode, error: refError } = await supabaseAdmin.rpc("next_reference", {
      p_prefix: "LIT-INV",
    });
    if (refError || !invoiceCode) {
      console.error("next_reference failed", refError?.message);
      return NextResponse.json({ error: "Could not allocate an invoice number" }, { status: 500 });
    }

    const { data: invoice, error: dbError } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_code: invoiceCode as string,
        client_name: clientName,
        client_email: clientEmail,
        amount,
        description,
        currency: "INR",
        due_date: dueDate,
        status: "Pending",
      })
      .select()
      .single();

    if (dbError || !invoice) {
      console.error("Database error inserting invoice:", dbError?.message);
      await recordAdminAction({
        actor,
        action: "invoice.create",
        capability: "invoices.write",
        outcome: "failed",
        errorCode: "db_insert_failed",
        request: req,
      });
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || COMPANY.websiteUrl;

    const emailResult = await sendEmail({
      to: clientEmail,
      subject: `Invoice ${invoice.invoice_code} from Logic Intelligence Technologies`,
      from: "vikash",
      category: "transactional",
      eventType: "invoice",
      templateKey: "invoice-email",
      idempotencyKey: `invoice:${invoice.id}`,
      react: React.createElement(InvoiceEmail, {
        fullName: clientName,
        invoiceNumber: invoice.invoice_code,
        amount: `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        dueDate,
        paymentLink: `${origin}/contact?invoice=${encodeURIComponent(invoice.invoice_code)}`,
      }),
    });

    const emailSent = emailResult.status === "sent" || emailResult.status === "queued";
    await recordAdminAction({
      actor,
      action: "invoice.create",
      capability: "invoices.write",
      target: { type: "invoice", id: invoice.id },
      outcome: "succeeded",
      metadata: { invoiceCode: invoice.invoice_code, amount, emailStatus: emailResult.status },
      request: req,
    });

    return NextResponse.json({
      success: true,
      invoice,
      // Truthful: the invoice is saved regardless; the email may still be pending.
      emailStatus: emailResult.status,
      emailSent,
    });
  } catch (error: unknown) {
    console.error("Error creating invoice:", error);
    await recordAdminAction({
      actor,
      action: "invoice.create",
      capability: "invoices.write",
      outcome: "failed",
      errorCode: "unexpected",
      request: req,
    });
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
