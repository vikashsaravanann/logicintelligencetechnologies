import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import InvoiceEmail from "@/emails/invoice-email";
import * as React from "react";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { isValidEmail, normalizeEmail, sanitizePersonName } from "@/lib/email/validation";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const body = await req.json();
    const clientName = sanitizePersonName(String(body.clientName || ""), 120);
    const clientEmail = normalizeEmail(String(body.clientEmail || ""));
    const amount = Number(body.amount);
    const description = sanitizePersonName(String(body.description || ""), 300);
    const dueDate = sanitizePersonName(String(body.dueDate || ""), 40);

    if (!clientName || !isValidEmail(clientEmail) || !amount || !description || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      COMPANY.websiteUrl;

    const { data: invoice, error: dbError } = await supabaseAdmin
      .from("invoices")
      .insert({
        client_name: clientName,
        client_email: clientEmail,
        amount,
        description,
        due_date: dueDate,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error inserting invoice:", dbError);
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
    }

    const invoiceNumber = `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`;

    const emailResult = await sendEmail({
      to: clientEmail,
      subject: "Invoice from Logic Intelligence Technologies",
      from: "vikash",
      category: "transactional",
      eventType: "invoice",
      templateKey: "invoice-email",
      idempotencyKey: `invoice:${invoice.id}`,
      react: React.createElement(InvoiceEmail, {
        fullName: clientName,
        invoiceNumber,
        amount: `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        dueDate,
        paymentLink: `${origin}/contact?invoice=${invoiceNumber}`,
      }),
    });

    return NextResponse.json({ success: true, invoice, emailStatus: emailResult.status });
  } catch (error: unknown) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
