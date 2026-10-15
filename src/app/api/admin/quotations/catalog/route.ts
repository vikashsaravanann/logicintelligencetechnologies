import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { CANONICAL_SERVICES_CATALOG, QUOTATION_CATEGORIES } from "@/lib/quotations/catalog-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  return NextResponse.json({
    services: CANONICAL_SERVICES_CATALOG,
    categories: QUOTATION_CATEGORIES,
    totalServices: CANONICAL_SERVICES_CATALOG.length,
    preconfiguredPriceServices: CANONICAL_SERVICES_CATALOG.filter((s) => s.default_unit_price_paise !== null),
  });
}
