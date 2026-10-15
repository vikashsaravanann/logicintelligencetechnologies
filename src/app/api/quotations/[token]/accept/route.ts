import { NextRequest, NextResponse } from "next/server";
import { acceptQuotation } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "client-web";

    const result = await acceptQuotation(token, {
      fullName: body.fullName || body.name || "",
      designation: body.designation || body.title || "",
      email: body.email || "",
      consentChecked: Boolean(body.consentChecked),
      ipAddress: clientIp,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Quotation accepted successfully" });
  } catch (err: any) {
    console.error("[public quotation accept POST] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process quotation acceptance" },
      { status: 500 }
    );
  }
}
