import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { createInvoicePreparationRequest } from "@/lib/invoices/preparation";
import type { StaffRole } from "@/config/roles";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const result = await createInvoicePreparationRequest({
      actorUserId: session.userId,
      actorEmail: session.email,
      actorRole: session.role as StaffRole,
      rawPayload: body,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status || 400 });
    }
    return NextResponse.json({ success: true, request: result.request }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CREATE_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
