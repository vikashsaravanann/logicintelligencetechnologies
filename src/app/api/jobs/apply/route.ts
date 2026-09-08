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
  name: z.string().min(1),
  email: z.string().email(),
  seat: z.string().min(1),
  pitch: z.string().min(10),
  start: z.string().optional(),
  cvName: z.string().optional(),
  cvBase64: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { name, email, seat, pitch, start, cvName, cvBase64 } = parsed.data;
    const message = [`Seat: ${seat}`, start ? `Start: ${start}` : "", pitch, cvName ? `CV: ${cvName}` : ""].filter(Boolean).join("\n\n");

    try {
      await supabaseAdmin.from("contact_leads").insert([
        { name, email: email.trim().toLowerCase(), company: seat, message },
      ]);
    } catch (e) {
      console.error("[jobs] lead insert", e);
    }

    const attachments =
      cvBase64 && cvName
        ? [{ filename: cvName, content: Buffer.from(cvBase64.split(",").pop() || cvBase64, "base64") }]
        : undefined;

    await sendEmail({
      to: process.env.LEAD_NOTIFICATION_EMAIL || "support@logicintelligencetechnologies.in",
      from: "noReply",
      replyTo: email,
      subject: `Leadership application: ${seat} — ${name}`,
      react: React.createElement(NewLeadNotificationEmail, {
        fullName: name,
        companyName: seat,
        email,
        phone: "",
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
      react: React.createElement(JobApplicationEmail, {
        fullName: name,
        seat,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[jobs] apply", e);
    return NextResponse.json({ ok: false, error: "Could not send application." }, { status: 500 });
  }
}
