import { NextRequest, NextResponse } from "next/server";
import { recordChecklistView } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function POST(
  _req: NextRequest,
  { params }: Props
) {
  try {
    const { token } = await params;
    await recordChecklistView(token);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[EnterpriseChecklist API] View tracking error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
