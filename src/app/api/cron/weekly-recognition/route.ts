import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { WeeklyRecognitionEmail } from "@/emails/weekly-recognition-email";
import { COMPANY } from "@/config/company";
import { isSuppressed } from "@/lib/email/suppression";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe";
import { isSupabaseLive } from "@/lib/email/config";
import { isValidEmail, normalizeEmail } from "@/lib/email/validation";
import * as React from "react";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isoWeekKey(date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (!secret || !authHeader.startsWith("Bearer ") || !timingEqual(authHeader.slice(7), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseLive()) {
    return NextResponse.json({ success: true, processed: 0, reason: "database not configured" });
  }

  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("has_subscribed", false)
    .eq("has_converted", false)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }

  const week = isoWeekKey();
  const results: Array<{ recipient: string; success: boolean; status: string }> = [];

  for (const user of users || []) {
    if (user.unsubscribed_at) continue;
    const email = normalizeEmail(user.email || "");
    if (!isValidEmail(email)) continue;
    if (await isSuppressed(email, "marketing")) continue;

    const unsubscribeUrl = buildUnsubscribeUrl(email);
    const emailResponse = await sendEmail({
      to: email,
      subject: "Checking in from Logic Intelligence Technologies",
      react: React.createElement(WeeklyRecognitionEmail, {
        fullName: user.full_name || "there",
        dashboardUrl: "https://www.logicintelligencetechnologies.in/dashboard",
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
