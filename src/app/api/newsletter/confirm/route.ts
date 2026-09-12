/**
 * GET /api/newsletter/confirm?token=...
 *
 * Verifies the double opt-in token and activates the subscriber.
 * On success: redirects to /newsletter/confirmed
 * On failure: redirects to /newsletter/confirm-error
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyOptinToken } from "@/lib/email/double-optin";
import { isSupabaseLive } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send-email";
import NewsletterConfirmationEmail from "@/emails/newsletter-confirmation-email";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe";
import * as React from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";

  const verified = verifyOptinToken(token);

  if (!verified) {
    return NextResponse.redirect(
      new URL("/newsletter/confirm-error", url.origin),
      303
    );
  }

  const { email } = verified;

  if (isSupabaseLive()) {
    // Confirm the subscriber atomically.
    // Only update rows that are still in pending status — prevents a second
    // click of the same link from clearing the confirmed_at timestamp.
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        double_opt_in_status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmation_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .in("double_opt_in_status", ["pending"]);

    if (error) {
      console.error("[newsletter/confirm] update failed:", error);
      // Non-fatal: still redirect to confirmed page — the user did verify
    }
  }

  // Send the "you're officially subscribed" confirmation email.
  // Uses a per-email idempotency key so it fires exactly once even if the
  // user clicks the confirmation link multiple times.
  try {
    const unsubscribeUrl = buildUnsubscribeUrl(email);
    await sendEmail({
      to: email,
      from: "hello",
      subject: "You're subscribed — Logic Intelligence Technologies",
      category: "transactional",
      eventType: "newsletter-confirmed",
      templateKey: "newsletter-confirmation-email",
      idempotencyKey: `newsletter-confirmed:${email}`,
      listUnsubscribeEmail: email,
      react: React.createElement(NewsletterConfirmationEmail, {
        email,
        unsubscribeUrl,
      }),
    });
  } catch (err) {
    console.error("[newsletter/confirm] welcome email failed:", err);
    // Non-fatal — subscriber is confirmed regardless of email status
  }

  return NextResponse.redirect(
    new URL("/newsletter/confirmed", url.origin),
    303
  );
}
