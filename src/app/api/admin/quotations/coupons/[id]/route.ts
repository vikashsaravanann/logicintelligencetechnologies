import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { toggleCoupon } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(req, "coupon.activate");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "is_active boolean required" }, { status: 400 });
    }

    const result = await toggleCoupon(id, body.is_active, {
      discount_type: body.discount_type,
      discount_value: body.discount_value !== undefined ? Number(body.discount_value) : undefined,
      max_discount_paise: body.max_discount_paise !== undefined ? Number(body.max_discount_paise) : undefined,
      min_subtotal_paise: body.min_subtotal_paise !== undefined ? Number(body.min_subtotal_paise) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[coupons PATCH] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update coupon" }, { status: 500 });
  }
}
