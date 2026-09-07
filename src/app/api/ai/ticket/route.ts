import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import { env } from "@/config/env";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import * as React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`ticket:${clientIp(request)}`, 4, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const name = String(body.name || "Website visitor").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase();
    const summary = String(body.summary || body.transcript || "Asked to talk to a human from Logic AI.").slice(0, 4000);
    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Email is required so we can reply." }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const supabase = createServerComponentClient(
        { cookies: () => cookieStore as any },
        { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
      );
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      /* guest */
    }

    if (userId) {
      await supabaseAdmin.from("support_tickets").insert({
        user_id: userId,
        subject: "Logic AI — talk to a human",
        message: summary,
        status: "Open",
      });
    } else {
      await supabaseAdmin.from("contact_leads").insert({
        name,
        email,
        company: "AI human handoff",
        message: summary,
      });
    }

    await sendEmail({
      to: ["support@logicintelligencetechnologies.in", "vikash@logicintelligencetechnologies.in"],
      from: "noReply",
      replyTo: email,
      subject: `Human handoff: ${name}`,
      react: React.createElement(NewLeadNotificationEmail, {
        fullName: name,
        companyName: "",
        email,
        phone: "",
        service: "Talk to a human (Logic AI)",
        requirements: summary,
        submissionDate: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/ai/ticket]", err);
    return NextResponse.json({ ok: false, error: "Could not open a ticket." }, { status: 500 });
  }
}
