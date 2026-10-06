import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// VoiceShield realtime forensic analysis is not implemented in the corporate app.
// This endpoint previously returned a fabricated result; it now reports NOT
// IMPLEMENTED so nothing downstream mistakes a placeholder for a real score.
// The admin guard is kept so the route's authorization contract is unchanged.
export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  return NextResponse.json(
    { success: false, error: "NOT_IMPLEMENTED", message: "VoiceShield realtime analysis is not available in this application." },
    { status: 501 },
  );
}
