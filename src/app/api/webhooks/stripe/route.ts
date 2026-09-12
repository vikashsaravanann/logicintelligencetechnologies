import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReceivedEmail from "@/emails/payment-received-email";
import * as React from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-08-26.dahlia" as any,
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update invoice in Supabase
      const { data: invoice, error: dbError } = await supabaseAdmin
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id)
        .select()
        .single();

      if (dbError) {
        console.error("Error updating invoice status:", dbError);
      } else if (invoice) {
        const amountPaid = session.amount_total ? session.amount_total / 100 : invoice.amount;
        const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`;

        // Send payment received email
        await sendEmail({
          to: invoice.client_email,
          subject: `Payment received for ${invoiceNumber}`,
          from: "vikash",
          category: "transactional",
          eventType: "payment-received",
          templateKey: "payment-received-email",
          idempotencyKey: `payment-received:${session.id}`,
          react: React.createElement(PaymentReceivedEmail, {
            fullName: invoice.client_name,
            amount: `₹${amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            invoiceNumber: invoiceNumber,
          }),
        });
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update invoice status to expired
      const { error: dbError } = await supabaseAdmin
        .from("invoices")
        .update({
          status: "expired",
        })
        .eq("stripe_session_id", session.id);

      if (dbError) {
        console.error("Error updating invoice status to expired:", dbError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error in Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

