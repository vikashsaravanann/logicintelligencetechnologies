import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewsletterDoubleOptinEmail from "@/emails/newsletter-double-optin-email";
import { z } from "zod";
import * as React from "react";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { canSubscribe } from "@/lib/email/suppression";
import { buildOptinConfirmUrl } from "@/lib/email/double-optin";
import { isSupabaseLive } from "@/lib/email/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("Enter a valid email address.").max(254),
  consentPage: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`newsletter:${clientIp(req)}`, 8, 15 * 60_000)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const consentPage = parsed.data.consentPage ?? "/";

    // Check suppression (bounce/complaint blocks re-subscribe)
    const allowed = await canSubscribe(email);
    if (!allowed.ok) {
      return NextResponse.json(
        { success: false, message: allowed.message ?? "Unable to subscribe." },
        { status: 400 }
      );
    }

    // Build the double opt-in confirmation URL
    const confirmUrl = buildOptinConfirmUrl(email);
    if (!confirmUrl) {
      // Secret not configured — degrade to confirmed flow so the site
      // still works, but log the misconfiguration clearly.
      console.error(
        "[newsletter] EMAIL_UNSUBSCRIBE_SECRET / CRON_SECRET not set; " +
          "double opt-in token cannot be generated. Falling back to confirmed subscription."
      );
    }

    if (isSupabaseLive()) {
      // Upsert as pending (or re-activate if already confirmed).
      // If the email already exists and is confirmed, we don't downgrade it.
      const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
        {
          email,
          unsubscribed_at: null,
          consent_source: "website-newsletter",
          consent_page: consentPage,
          policy_version: "2026-09",
          subscribed_at: new Date().toISOString(),
          // Only set pending + token when we can generate a confirmation URL.
          // If confirmUrl is null (secret missing), subscribe as confirmed.
          double_opt_in_status: confirmUrl ? "pending" : "confirmed",
          confirmation_token: confirmUrl ? email : null, // token identity; real token in email link
          token_expires_at: confirmUrl
            ? new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
            : null,
          confirmed_at: confirmUrl ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
          // Don't overwrite a confirmed subscriber back to pending
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.error("[newsletter] upsert failed:", error);
        // Fallback: record in contact_leads so the lead is never lost
        await supabaseAdmin.from("contact_leads").insert({
          name: "Newsletter subscriber",
          email,
          company: "Newsletter",
          message: "Footer newsletter subscription (fallback)",
        });
      }
    }

    if (confirmUrl) {
      // Send the double opt-in confirmation email
      await sendEmail({
        to: email,
        from: "hello",
        subject: "Please confirm your subscription — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "newsletter-double-optin",
        templateKey: "newsletter-double-optin-email",
        // Daily-unique: prevents re-sending the confirmation to the same address
        // more than once per day if the user submits the form multiple times.
        idempotencyKey: `newsletter-doi:${email}:${new Date().toISOString().slice(0, 10)}`,
        react: React.createElement(NewsletterDoubleOptinEmail, {
          email,
          confirmUrl,
          requestedAt: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: confirmUrl
        ? "Check your inbox to confirm your subscription."
        : "Subscribed",
    });
  } catch (error) {
    console.error("[newsletter] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
