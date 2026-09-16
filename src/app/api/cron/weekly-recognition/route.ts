import { NextResponse } from "next/server";
import * as React from "react";
import { sendEmail } from "@/lib/email/send-email";
import WeeklyRecognitionEmail from "@/emails/weekly-recognition-email";
import { COMPANY } from "@/config/company";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSuppressed, buildUnsubscribeUrl } from "@/lib/email/unsubscribe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const week = new Date().toISOString().slice(0, 10);
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .not("email", "is", null)
    .limit(200);

  if (error) {
    console.error("[weekly-recognition]", error);
    return NextResponse.json({ error: "Failed to load recipients" }, { status: 500 });
  }

  const results: Array<{ recipient: string; success: boolean; status?: string }> = [];

  for (const user of users || []) {
    const email = String(user.email || "").trim().toLowerCase();
    if (!email) continue;
    if (await isSuppressed(email, "marketing")) continue;

    const unsubscribeUrl = buildUnsubscribeUrl(email);
    const emailResponse = await sendEmail({
      to: email,
      subject: "Checking in from Logic Intelligence Technologies",
      react: React.createElement(WeeklyRecognitionEmail, {
        fullName: user.full_name || "there",
        dashboardUrl: "https://www.logicintelligencetechnologies.in/client/dashboard",
        unsubscribeUrl,
      }),
      from: "hello",
      replyTo: COMPANY.emails.hello,
      category: "marketing",
      eventType: "weekly-recognition",
      templateKey: "weekly-recognition-email",
      idempotencyKey: `weekly:${week}:${user.id || email}`,
      listUnsubscribeEmail: email,
    });
    results.push({
      recipient: email.replace(/^.(.*)@/, "*$1@"),
      success: emailResponse.success,
      status: emailResponse.status,
    });
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
