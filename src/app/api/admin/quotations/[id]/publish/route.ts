import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { publishQuotation } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(req, "quotation.publish");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const actorEmail = auth.session.email || "admin@logicintelligencetechnologies.in";
  const result = await publishQuotation(id, actorEmail);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Publishing transitions status to 'published'. Email dispatch is an explicit manual action.
  return NextResponse.json({ ok: true, quotation: result.quotation });
}

