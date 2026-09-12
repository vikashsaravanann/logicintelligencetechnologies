import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";
import { suppressEmail } from "@/lib/email/suppression";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function unsubscribeFromToken(token: string | null) {
  if (!token) return { ok: false as const, message: "Missing token" };
  const verified = verifyUnsubscribeToken(token);
  if (!verified) return { ok: false as const, message: "Invalid or expired link" };
  await suppressEmail(verified.email, "unsubscribe", "one-click");
  return { ok: true as const, message: "You have been unsubscribed." };
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const contentType = req.headers.get("content-type") || "";
  let token = url.searchParams.get("token");
  let oneClick = false;
  let browserForm = false;

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    if (!token) token = String(form.get("token") || "");
    oneClick = String(form.get("List-Unsubscribe") || "") === "One-Click";
    browserForm = !oneClick;
  } else if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({} as { token?: unknown }));
    if (!token && typeof body.token === "string") token = body.token;
  }

  const result = await unsubscribeFromToken(token);

  if (browserForm) {
    const dest = result.ok ? "/unsubscribe?done=1" : "/unsubscribe?error=1";
    return NextResponse.redirect(new URL(dest, url.origin), 303);
  }

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: result.message });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  return NextResponse.redirect(
    new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, url.origin)
  );
}
