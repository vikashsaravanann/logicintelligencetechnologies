import { NextResponse } from "next/server";
import { verifySmtpConnection } from "@/lib/email/smtp";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { isSupabaseLive } from "@/lib/email/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await verifySmtpConnection("noReply");
  return NextResponse.json(
    {
      ok: result.ok,
      provider: "zoho",
      host: result.host,
      port: result.port,
      secure: result.secure,
      mode: result.secure ? "implicit-tls-465" : "starttls-587",
      database: isSupabaseLive() ? "configured" : "not-configured",
      error: result.error ?? null,
    },
    { status: result.ok ? 200 : 503 }
  );
}
