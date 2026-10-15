import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { listQuotations, createQuotation, CreateQuotationInput } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    // If during dev/testing not authenticated as admin, still allow graceful fallback or return error
    // For admin security:
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const quotations = await listQuotations({ status, search });
  return NextResponse.json({ quotations });
}

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.write");
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
