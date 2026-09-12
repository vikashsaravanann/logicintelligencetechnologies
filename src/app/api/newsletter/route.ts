import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewsletterConfirmationEmail from "@/emails/newsletter-confirmation-email";
import { z } from "zod";
import * as React from "react";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { canSubscribe, clearUnsubscribe } from "@/lib/email/suppression";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe";
import { isSupabaseLive } from "@/lib/email/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("Enter a valid email address.").max(254),
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
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid email.",
        },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const allowed = await canSubscribe(email);
    if (!allowed.ok) {
      return NextResponse.json(
        { success: false, message: allowed.message || "Unable to subscribe." },
        { status: 400 }
      );
    }
    await clearUnsubscribe(email);

    if (isSupabaseLive()) {
      let error = (
        await supabaseAdmin.from("newsletter_subscribers").upsert(
          {
            email,
            unsubscribed_at: null,
            consent_source: "website-newsletter",
            subscribed_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        )
      ).error;

      if (error) {
        error = (
          await supabaseAdmin
            .from("newsletter_subscribers")
            .upsert({ email }, { onConflict: "email" })
        ).error;
      }

      if (error) {
        console.error("[Newsletter] primary insert failed, falling back:", error);
        const fallback = await supabaseAdmin.from("contact_leads").insert({
          name: "Newsletter subscriber",
          email,
          company: "Newsletter",
          message: "Footer newsletter subscription",
        });
        if (fallback.error) {
          console.error("[Newsletter] fallback insert failed:", fallback.error);
          return NextResponse.json(
            {
              success: false,
              message: "Unable to subscribe right now. Please try again.",
            },
            { status: 500 }
          );
        }
      }
    }

    try {
      const unsubscribeUrl = buildUnsubscribeUrl(email);
      const emailResult = await sendEmail({
        to: email,
        from: "hello",
        subject: "You're subscribed — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "newsletter-confirmation",
        templateKey: "newsletter-confirmation-email",
        idempotencyKey: `newsletter-confirmation:${email}:${new Date().toISOString().slice(0, 10)}`,
        listUnsubscribeEmail: email,
        react: React.createElement(NewsletterConfirmationEmail, {
          email,
          unsubscribeUrl,
        }),
      });
      if (!emailResult.success) {
        console.error("[Newsletter] confirmation email failed:", emailResult.message);
      }
    } catch (e) {
      console.error("[Newsletter] confirmation email exception:", e);
    }

    return NextResponse.json({ success: true, message: "Subscribed" });
  } catch (error) {
    console.error("[Newsletter] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
