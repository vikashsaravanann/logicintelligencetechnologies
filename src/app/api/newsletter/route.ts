import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewsletterDoubleOptinEmail from "@/emails/newsletter-double-optin-email";
import { z } from "zod";
import * as React from "react";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { canSubscribe } from "@/lib/email/suppression";
import { buildOptinConfirmUrl } from "@/lib/email/double-optin";
import { requireDatabase } from "@/lib/forms/persist";

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

    const missing = requireDatabase();
    if (missing) {
      return NextResponse.json({ success: false, message: missing.message }, { status: 503 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const consentPage = parsed.data.consentPage ?? "/";

    const allowed = await canSubscribe(email);
    if (!allowed.ok) {
      return NextResponse.json(
        { success: false, message: allowed.message ?? "Unable to subscribe." },
        { status: 400 }
      );
    }

    const confirmUrl = buildOptinConfirmUrl(email);
    if (!confirmUrl) {
      console.error(
        "[newsletter] EMAIL_UNSUBSCRIBE_SECRET / CRON_SECRET not set; " +
          "double opt-in token cannot be generated. Falling back to confirmed subscription."
      );
    }

    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email,
        unsubscribed_at: null,
        consent_source: "website-newsletter",
        consent_page: consentPage,
        policy_version: "2026-09",
        subscribed_at: new Date().toISOString(),
        double_opt_in_status: confirmUrl ? "pending" : "confirmed",
        confirmation_token: confirmUrl ? email : null,
        token_expires_at: confirmUrl
          ? new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
          : null,
        confirmed_at: confirmUrl ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false }
    );

    if (error) {
      console.error("[newsletter] upsert failed:", error);
      return NextResponse.json(
        { success: false, message: "We could not save your subscription. Please try again." },
        { status: 503 }
      );
    }

    if (confirmUrl) {
      await sendEmail({
        to: email,
        from: "hello",
        subject: "Please confirm your subscription — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "newsletter-double-optin",
        templateKey: "newsletter-double-optin-email",
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
