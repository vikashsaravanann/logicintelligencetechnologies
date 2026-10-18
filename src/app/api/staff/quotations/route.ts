import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { createQuotationTechnicalDraft } from "@/lib/quotations/technical-drafts";
import type { StaffRole } from "@/config/roles";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const result = await createQuotationTechnicalDraft({
      actorUserId: session.userId,
      actorEmail: session.email,
      actorRole: session.role as StaffRole,
      engagementId: typeof body.engagementId === "string" ? body.engagementId : null,
      clientId: typeof body.clientId === "string" ? body.clientId : null,
      rawPayload: body,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, forbiddenFields: result.forbiddenFields },
        { status: result.status }
      );
    }
    return NextResponse.json({ success: true, draft: result.draft }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CREATE_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
