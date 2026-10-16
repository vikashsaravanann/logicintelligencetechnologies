import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { hasCapability } from "@/config/roles";
import { getQuotationById, redactQuotationDetailsForStaff } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const data = await getQuotationById(id);

  if (!data) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const canReadPrices = hasCapability(auth.session.role, "quotation.price.read");
  if (!canReadPrices) {
    return NextResponse.json({
      ...redactQuotationDetailsForStaff(data),
      financialRedacted: true,
    });
  }

  return NextResponse.json(data);
}

