import { NextRequest, NextResponse } from "next/server";
import { recordChecklistView } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { token } = await params;
    await recordChecklistView(token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Checklist API] Error recording view:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
