import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { listCoupons, createCoupon } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const raw = await req.json();
    if (!raw.code?.trim() || !raw.campaign_name?.trim() || raw.discount_value === undefined) {
      return NextResponse.json(
        { error: "Coupon code, campaign name, and discount value are required" },
        { status: 400 }
      );
    }

    const result = await createCoupon({
      code: raw.code,
      campaign_name: raw.campaign_name,
      description: raw.description,
      discount_type: raw.discount_type || "percentage",
      discount_value: Number(raw.discount_value),
      min_subtotal_paise: raw.min_subtotal_paise ? Number(raw.min_subtotal_paise) : undefined,
      max_discount_paise: raw.max_discount_paise ? Number(raw.max_discount_paise) : undefined,
      max_redemptions: raw.max_redemptions ? Number(raw.max_redemptions) : 100,
      is_active: raw.is_active ?? true,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, coupon: result.coupon }, { status: 201 });
  } catch (err: any) {
    console.error("[coupons POST] error:", err);
    return NextResponse.json({ error: err.message || "Failed to create coupon" }, { status: 500 });
  }
}
