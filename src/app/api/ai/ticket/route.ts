import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { requireVerifiedUser } from "@/lib/auth/require-user";
import { readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { isValidEmail, sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";
import * as React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await rateLimit("ai:enquiry:global:day", 200, 24 * 60 * 60_000)) ||
      !(await rateLimit(`ticket:${clientIp(request)}`, 4, 10 * 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }
  try {
    const raw = await readBoundedAiJson(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }
    const body = raw as Record<string, unknown>;
    const user = await requireVerifiedUser();
    const name = sanitizePersonName(String(body.name || "Website visitor"), 80);
    // Authenticated handoffs must use the remotely verified account recipient.
    const email = String(user?.email || body.email || "").trim().toLowerCase();
    const summary = sanitizeMultilineText(
      String(body.summary || body.transcript || "Asked to talk to a human from Logic AI."),
      4000
    );
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Email is required so we can reply." }, { status: 400 });
    }

    const saved = user
      ? await supabaseAdmin.from("support_tickets").insert({
        user_id: user.id,
        requester_email: email,
        subject: "Logic AI — talk to a human",
        message: summary,
        status: "Open",
      })
      : await supabaseAdmin.from("contact_leads").insert({
        name,
        email,
        company: "AI human handoff",
        message: summary,
      });
    if (saved.error) {
      console.error("[api/ai/ticket] persistence failed");
      return NextResponse.json({ ok: false, error: "Could not open a ticket." }, { status: 503 });
    }

    await sendEmail({
      to: getLeadNotificationRecipients(),
      from: "noReply",
      replyTo: email,
      subject: `Human handoff: ${name}`,
      category: "transactional",
      eventType: "ai-handoff",
      templateKey: "new-lead-notification-email",
      idempotencyKey: `ai-handoff:${email}:${new Date().toISOString().slice(0, 13)}`,
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
    if (err instanceof InvalidAiRequest) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    console.error("[api/ai/ticket] request failed");
    return NextResponse.json({ ok: false, error: "Could not open a ticket." }, { status: 500 });
  }
}
