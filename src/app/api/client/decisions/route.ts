import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import { listSharedDecisions, acknowledgeDecision } from "@/lib/client-portal/v4-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const engagementRef = searchParams.get("ref") || undefined;

    const decisions = await listSharedDecisions(client.email, engagementRef);
    return NextResponse.json({
      success: true,
      clientEmail: client.email,
      decisions,
    });
  } catch (err) {
    console.error("[api/client/decisions] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching decisions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await getVerifiedClientUser();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const decisionId = body?.decisionId;

    if (!decisionId) {
      return NextResponse.json(
        { success: false, error: "Decision ID is required" },
        { status: 400 }
      );
    }

    const ok = await acknowledgeDecision(client.email, decisionId);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error("[api/client/decisions] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error acknowledging decision" },
      { status: 500 }
    );
  }
}
