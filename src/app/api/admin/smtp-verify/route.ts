import { NextResponse } from "next/server";
import { verifySmtpConnection } from "@/lib/email/smtp";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { isSupabaseLive } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send-email";
import * as React from "react";
import WelcomeEmail from "@/emails/welcome-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cronSecret = process.env.CRON_SECRET;

  const isSecretAuthorized =
    Boolean(cronSecret) &&
    (secretParam === cronSecret ||
      bearerToken === cronSecret ||
      request.headers.get("x-cron-secret") === cronSecret);

  if (!isSecretAuthorized) {
    const auth = await requireAdminApi(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  const noreplyResult = await verifySmtpConnection("noReply");
  const helloResult = await verifySmtpConnection("hello");

  let testSendResult = null;
  const testTo = url.searchParams.get("testTo");
  if (testTo) {
    try {
      const emailRes = await sendEmail({
        to: testTo,
        from: "hello",
        subject: "Logic Intelligence Technologies — Email Delivery Verified",
        react: React.createElement(WelcomeEmail, {
          fullName: "Vikash",
          email: testTo,
        }),
      });
      testSendResult = emailRes;
    } catch (sendErr: any) {
      testSendResult = { success: false, error: sendErr?.message || String(sendErr) };
    }
  }

  const allOk = noreplyResult.ok && helloResult.ok;

  return NextResponse.json(
    {
      ok: allOk,
      provider: "zoho",
      pools: {
        noReply: noreplyResult,
        hello: helloResult,
      },
      database: isSupabaseLive() ? "configured" : "not-configured",
      testSend: testSendResult,
    },
    { status: allOk ? 200 : 503 }
  );
}
