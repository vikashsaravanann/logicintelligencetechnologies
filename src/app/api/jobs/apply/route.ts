import { NextResponse } from "next/server";
import { z } from "zod";
import * as React from "react";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import JobApplicationEmail from "@/emails/job-application-email";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { preparePdfAttachment } from "@/lib/email/attachments";
import { isSupabaseLive } from "@/lib/email/config";
import { sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().min(8).max(40),
  city: z.string().min(2).max(80),
  seat: z.string().min(1).max(80),
  linkedin: z.string().max(300).optional(),
  currentRole: z.string().min(2).max(120),
  years: z.string().min(1).max(40),
  start: z.string().min(1).max(80),
  shipped: z.string().min(20).max(5000),
  ninety: z.string().min(20).max(5000),
  why: z.string().min(20).max(5000),
  cash: z.string().max(80).optional(),
  heard: z.string().max(160).optional(),
  cvName: z.string().max(120).optional(),
  cvBase64: z.string().max(3_000_000).optional(),
}).superRefine((val, ctx) => {
  if (!val.cvBase64 && !val.cvName) return;
  const name = (val.cvName || "").toLowerCase();
  if (!name.endsWith(".pdf")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CV must be a PDF under 2 MB.", path: ["cvName"] });
  }
  const b64 = (val.cvBase64 || "").split(",").pop() || "";
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > 2 * 1024 * 1024) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CV must be 2 MB or smaller.", path: ["cvBase64"] });
  }
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`jobs:${clientIp(req)}`, 5, 15 * 60_000)) {
      return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;
    const name = sanitizePersonName(d.name);
    const email = d.email.trim().toLowerCase();
    const seat = sanitizePersonName(d.seat, 80);
    const message = [
      `SEAT: ${seat}`,
      `PHONE: ${sanitizePersonName(d.phone, 40)}`,
      `CITY: ${sanitizePersonName(d.city, 80)}`,
      d.linkedin ? `LINKEDIN: ${sanitizeMultilineText(d.linkedin, 300)}` : "",
      `CURRENT ROLE: ${sanitizePersonName(d.currentRole, 120)}`,
      `YEARS: ${sanitizePersonName(d.years, 40)}`,
      `START: ${sanitizePersonName(d.start, 80)}`,
      d.cash ? `CASH EXPECTATION: ${sanitizePersonName(d.cash, 80)}` : "",
      d.heard ? `SOURCE: ${sanitizePersonName(d.heard, 160)}` : "",
      d.cvName ? `CV: ${sanitizePersonName(d.cvName, 120)}` : "",
      "",
      "WHAT THEY SHIPPED",
      sanitizeMultilineText(d.shipped),
      "",
      "90-DAY OWNERSHIP",
      sanitizeMultilineText(d.ninety),
      "",
      "WHY THIS SEAT",
      sanitizeMultilineText(d.why),
    ].filter((line) => line !== "").join("\n");

    let leadId: string | null = null;
    if (isSupabaseLive()) {
      try {
        const { data } = await supabaseAdmin
          .from("contact_leads")
          .insert([{ name, email, company: seat, message }])
          .select("id")
          .maybeSingle();
        leadId = data?.id || null;
      } catch (e) {
        console.error("[jobs] lead insert", e);
      }
    }

    let attachments: Array<{ filename: string; content: Buffer; contentType: string }> | undefined;
    if (d.cvBase64 && d.cvName) {
      try {
        const raw = Buffer.from(d.cvBase64.split(",").pop() || d.cvBase64, "base64");
        attachments = [preparePdfAttachment(d.cvName, raw)];
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Invalid CV file." },
          { status: 400 }
        );
      }
    }

    const idemBase = leadId || `${email}:${seat}:${new Date().toISOString().slice(0, 13)}`;

    await sendEmail({
      to: getLeadNotificationRecipients(),
      from: "noReply",
      replyTo: email,
      subject: `Leadership application: ${seat} — ${name}`,
      category: "transactional",
      eventType: "career-internal",
      templateKey: "new-lead-notification-email",
      idempotencyKey: `career-internal:${idemBase}`,
      react: React.createElement(NewLeadNotificationEmail, {
        fullName: name,
        companyName: seat,
        email,
        phone: d.phone,
        service: `Jobs — ${seat}`,
        requirements: message,
        submissionDate: new Date().toISOString(),
      }),
      attachments,
    });

    await sendEmail({
      to: email,
      from: "noReply",
      subject: "We received your leadership application — Logic Intelligence Technologies",
      category: "transactional",
      eventType: "career-confirmation",
      templateKey: "job-application-email",
      idempotencyKey: `career-confirmation:${idemBase}`,
      react: React.createElement(JobApplicationEmail, {
        fullName: name,
        seat,
      }),
    });

    return NextResponse.json({ ok: true, message: "Application received" });
  } catch (e) {
    console.error("[jobs] apply", e);
    return NextResponse.json({ ok: false, error: "Could not send application." }, { status: 500 });
  }
}
