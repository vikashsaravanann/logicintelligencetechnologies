import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReceivedEmail from "@/emails/payment-received-email";
import {
  recordWebhookEvent,
  markWebhookProcessed,
} from "@/lib/email/webhook-events";
import * as React from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-08-26.dahlia" as any });
}

export async function POST(req: NextRequest) {
  let webhookRowId: string | undefined;

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

    // ── 1. Verify Stripe signature ────────────────────────────────────────
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("[stripe-webhook] Signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // ── 2. Deduplicate via webhook events table ───────────────────────────
    const record = await recordWebhookEvent("stripe", event.id, event.type, payload);
    if (!record.ok) {
      // Supabase unavailable — continue processing but log the gap
      console.warn("[stripe-webhook] Could not record event in webhook_events table:", record.error);
    } else if (record.duplicate) {
      // Already processed — acknowledge without re-processing
      return NextResponse.json({ received: true, duplicate: true });
    } else {
      webhookRowId = record.id;
    }

    // ── 3. Handle events ─────────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { data: invoice, error: dbError } = await supabaseAdmin
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id)
        .select()
        .single();

      if (dbError) {
        console.error("[stripe-webhook] Error updating invoice status:", dbError);
      } else if (invoice) {
        const amountPaid = session.amount_total
          ? session.amount_total / 100
          : invoice.amount;
        const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`;

        await sendEmail({
          to: invoice.client_email,
          subject: `Payment received for ${invoiceNumber}`,
          from: "vikash",
          category: "transactional",
          eventType: "payment-received",
          templateKey: "payment-received-email",
          // Stripe event ID ensures one email per unique payment event
          idempotencyKey: `payment-received:${event.id}`,
          react: React.createElement(PaymentReceivedEmail, {
            fullName: invoice.client_name,
            amount: `₹${amountPaid.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`,
            invoiceNumber,
          }),
        });
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error: dbError } = await supabaseAdmin
        .from("invoices")
        .update({ status: "expired" })
        .eq("stripe_session_id", session.id);

      if (dbError) {
        console.error("[stripe-webhook] Error updating invoice to expired:", dbError);
      }
    }

    // ── 4. Mark event processed ───────────────────────────────────────────
    if (webhookRowId) {
      await markWebhookProcessed(webhookRowId, "processed");
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[stripe-webhook] Handler failed:", error);
    if (webhookRowId) {
      await markWebhookProcessed(
        webhookRowId,
        "failed",
        error instanceof Error ? error.message : String(error)
      );
    }
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
