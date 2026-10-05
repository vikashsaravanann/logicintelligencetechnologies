import { NextResponse } from "next/server";
import { ensureWelcomeEmail } from "@/lib/email/send-welcome";
import { requireVerifiedUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Verified-user retry only. Confirmation/OAuth callback covers first delivery.
 * Recipient and ownership are never supplied by the browser.
 */
export async function POST(req: Request) {
  try {
    const user = await requireVerifiedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await rateLimit(`welcome:${user.id}`, 3, 60 * 60_000))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const result = await ensureWelcomeEmail({
      userId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Could not send welcome email" }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: result.message, alreadySent: result.alreadySent });
  } catch (error) {
    console.error("Send Welcome API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
