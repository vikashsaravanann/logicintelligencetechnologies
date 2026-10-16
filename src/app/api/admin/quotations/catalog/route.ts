import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { hasCapability } from "@/config/roles";
import { CANONICAL_SERVICES_CATALOG, QUOTATION_CATEGORIES } from "@/lib/quotations/catalog-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const canReadPrices = hasCapability(auth.session.role, "quotation.price.read");
  const services = canReadPrices
    ? CANONICAL_SERVICES_CATALOG
    : CANONICAL_SERVICES_CATALOG.map(({ default_unit_price_paise: _omit, ...rest }) => ({
        ...rest,
        default_unit_price_paise: null,
      }));

  return NextResponse.json({
    services,
    categories: QUOTATION_CATEGORIES,
    totalServices: services.length,
    preconfiguredPriceServices: canReadPrices
      ? CANONICAL_SERVICES_CATALOG.filter((s) => s.default_unit_price_paise !== null)
      : [],
    financialRedacted: !canReadPrices,
  });
}

