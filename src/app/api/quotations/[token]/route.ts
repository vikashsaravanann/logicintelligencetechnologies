import { NextRequest, NextResponse } from "next/server";
import { getQuotationByToken } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const quotation = await getQuotationByToken(token);
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found or link has expired" }, { status: 404 });
    }

    return NextResponse.json({ quotation });
  } catch (err: any) {
    console.error("[public quotation GET] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load quotation" },
      { status: 500 }
    );
  }
}
