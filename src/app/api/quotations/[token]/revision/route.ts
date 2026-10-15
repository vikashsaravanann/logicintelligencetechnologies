import { NextRequest, NextResponse } from "next/server";
import { requestQuotationRevision } from "@/lib/quotations/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    if (!body.feedbackNotes?.trim()) {
      return NextResponse.json(
        { error: "Please enter your requested changes or feedback notes." },
        { status: 400 }
      );
    }

    const result = await requestQuotationRevision(token, {
      name: body.name || "Client Representative",
      email: body.email || "",
      feedbackNotes: body.feedbackNotes,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Feedback submitted. Our team will review and update your quotation.",
    });
  } catch (err: any) {
    console.error("[public quotation revision POST] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit revision request" },
      { status: 500 }
    );
  }
}
