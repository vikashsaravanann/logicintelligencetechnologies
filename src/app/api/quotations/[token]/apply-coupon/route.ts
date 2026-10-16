import { NextRequest, NextResponse } from "next/server";
import { validateQuotationCoupon } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    if (!body.couponCode?.trim()) {
      return NextResponse.json(
        { valid: false, error: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    const result = await validateQuotationCoupon(token, body.couponCode.trim());
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: result.statusCode || 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountPaise: result.discountPaise,
      label: result.label,
      newTotalPaise: result.newTotalPaise,
      milestone1Paise: result.milestone1Paise,
      milestone2Paise: result.milestone2Paise,
    });
  } catch (err: any) {
    console.error("[public quotation coupon POST] error:", err);
    return NextResponse.json(
      { valid: false, error: err.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
