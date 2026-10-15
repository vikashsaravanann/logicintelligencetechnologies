import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { toggleCoupon } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "is_active boolean required" }, { status: 400 });
    }

    const result = await toggleCoupon(id, body.is_active);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[coupons PATCH] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update coupon" }, { status: 500 });
  }
}
