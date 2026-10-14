import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitChecklistSelections } from "@/lib/enterprise-checklist/invitations";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  selectedPoints: z.array(z.number().int().min(1).max(50)).min(1, "Select at least 1 checkpoint").max(50),
  submittedByName: z.string().max(100).optional(),
  clientNotes: z.string().max(2000).optional(),
});

interface Props {
  params: Promise<{ token: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const ip = clientIp(req);
    const allowed = await rateLimit(`chk-submit:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submission attempts. Please try again in a few moments." },
        { status: 429 }
      );
    }

    const { token } = await params;
    const body = await req.json().catch(() => null);
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid submission parameters.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const result = await submitChecklistSelections({
      rawToken: token,
      selectedPoints: parsed.data.selectedPoints,
      submittedByName: parsed.data.submittedByName,
      clientNotes: parsed.data.clientNotes,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      confirmationReference: result.confirmationReference,
      selectedCount: result.selectedCount,
      submittedAt: result.submittedAt,
    });
  } catch (err) {
    console.error("[Checklist API] Submit error:", err);
    return NextResponse.json({ error: "Failed to process checklist submission." }, { status: 500 });
  }
}
