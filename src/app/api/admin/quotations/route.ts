import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { hasCapability } from "@/config/roles";
import {
  listQuotations,
  createQuotation,
  CreateQuotationInput,
  redactQuotationForStaff,
} from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const quotations = await listQuotations({ status, search });
  const canReadPrices = hasCapability(auth.session.role, "quotation.price.read");
  const payload = canReadPrices
    ? quotations
    : quotations.map((q) => redactQuotationForStaff(q));

  return NextResponse.json({
    quotations: payload,
    financialRedacted: !canReadPrices,
  });
}

export async function POST(req: NextRequest) {
  // Policy 1: Only Super Admin may create commercial quotations with unit prices.
  // Staff must use /api/admin/quotations/technical-drafts for non-commercial technical preparation.
  const auth = await requireCapabilityApi(req, "quotation.price.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = (await req.json()) as CreateQuotationInput;
    if (!body.companyName?.trim() || !body.contactEmail?.trim() || !body.projectTitle?.trim()) {
      return NextResponse.json(
        { error: "Company name, contact email, and project title are required." },
        { status: 400 }
      );
    }

    const actorEmail = auth.session.email || "admin@logicintelligencetechnologies.in";
    const result = await createQuotation(body, actorEmail);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, quotation: result.quotation }, { status: 201 });
  } catch (err: any) {
    console.error("[api/admin/quotations POST] error:", err);
    return NextResponse.json({ error: err.message || "Failed to create quotation" }, { status: 500 });
  }
}

