import { NextResponse } from "next/server";
import { z } from "zod";
import * as React from "react";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import JobApplicationEmail from "@/emails/job-application-email";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  city: z.string().min(2),
  seat: z.string().min(1),
  linkedin: z.string().optional(),
  currentRole: z.string().min(2),
  years: z.string().min(1),
  start: z.string().min(1),
  shipped: z.string().min(20),
  ninety: z.string().min(20),
  why: z.string().min(20),
  cash: z.string().optional(),
  heard: z.string().optional(),
  cvName: z.string().optional(),
  cvBase64: z.string().optional(),
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
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;
    const message = [
      `SEAT: ${d.seat}`,
      `PHONE: ${d.phone}`,
      `CITY: ${d.city}`,
      d.linkedin ? `LINKEDIN: ${d.linkedin}` : "",
      `CURRENT ROLE: ${d.currentRole}`,
      `YEARS: ${d.years}`,
      `START: ${d.start}`,
      d.cash ? `CASH EXPECTATION: ${d.cash}` : "",
      d.heard ? `SOURCE: ${d.heard}` : "",
      d.cvName ? `CV: ${d.cvName}` : "",
      "",
      "WHAT THEY SHIPPED",
      d.shipped,
      "",
      "90-DAY OWNERSHIP",
      d.ninety,
      "",
      "WHY THIS SEAT",
      d.why,
    ].filter((line) => line !== "").join("\n");

    try {
      await supabaseAdmin.from("contact_leads").insert([
        { name: d.name, email: d.email.trim().toLowerCase(), company: d.seat, message },
      ]);
    } catch (e) {
      console.error("[jobs] lead insert", e);
    }

    const attachments =
      d.cvBase64 && d.cvName
        ? [{ filename: d.cvName, content: Buffer.from(d.cvBase64.split(",").pop() || d.cvBase64, "base64") }]
        : undefined;

    await sendEmail({
      to: process.env.LEAD_NOTIFICATION_EMAIL || "support@logicintelligencetechnologies.in",
      from: "noReply",
      replyTo: d.email,
      subject: `Leadership application: ${d.seat} — ${d.name}`,
      react: React.createElement(NewLeadNotificationEmail, {
        fullName: d.name,
        companyName: d.seat,
        email: d.email,
        phone: d.phone,
        service: `Jobs — ${d.seat}`,
        requirements: message,
        submissionDate: new Date().toISOString(),
      }),
      attachments,
    });

    await sendEmail({
      to: d.email,
      from: "noReply",
      subject: "We received your leadership application — Logic Intelligence Technologies",
      react: React.createElement(JobApplicationEmail, {
        fullName: d.name,
        seat: d.seat,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[jobs] apply", e);
    return NextResponse.json({ ok: false, error: "Could not send application." }, { status: 500 });
  }
}
