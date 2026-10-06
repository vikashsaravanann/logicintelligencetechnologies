import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStaffSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Records that a client opened a proposal. Called once by the viewer on mount,
 * never on a page GET. Staff previews are skipped so an internal look does not
 * flip the proposal to "Viewed". Always returns 204 so nothing is leaked.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const noContent = new NextResponse(null, { status: 204 });

  if (!token || token.length < 8 || token.length > 64) return noContent;

  // Rate limit per ip+token; fails closed in production without Redis.
  const ok = await rateLimit(`proposal-view:${clientIp(req)}:${token}`, 10, 60_000);
  if (!ok) return noContent;

  // Do not record staff previews.
  const staff = await getStaffSession().catch(() => null);
  if (staff) return noContent;

  try {
    await supabaseAdmin.rpc("record_proposal_view", { p_token: token });
  } catch {
    // Swallow: view tracking is best-effort and must never surface to a client.
  }
  return noContent;
}
