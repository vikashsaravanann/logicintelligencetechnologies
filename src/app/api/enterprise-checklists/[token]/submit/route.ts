import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitChecklistSelections } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

const submitSchema = z.object({
  selectedPoints: z.array(z.number().int().min(1).max(50)).min(1, "Please select at least 1 checkpoint."),
  submittedByName: z.string().max(160).optional(),
  clientNotes: z.string().max(3000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => null);

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message || "Invalid submission payload.",
        },
        { status: 400 }
      );
    }

    const result = await submitChecklistSelections({
      rawToken: token,
      selectedPoints: parsed.data.selectedPoints,
      submittedByName: parsed.data.submittedByName,
      clientNotes: parsed.data.clientNotes,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[EnterpriseChecklist API] Submit error:", error);
    return NextResponse.json(
      { ok: false, message: "Server error occurred while submitting checklist selections." },
      { status: 500 }
    );
  }
}
