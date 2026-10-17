import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import { listClientActionItems, updateActionItemStatus } from "@/lib/client-portal/v4-actions";

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

    const actionItems = await listClientActionItems(client.email, engagementRef);
    return NextResponse.json({
      success: true,
      clientEmail: client.email,
      actionItems,
    });
  } catch (err) {
    console.error("[api/client/actions] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching action items" },
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
    const actionId = body?.actionId;
    const status = body?.status || "completed";

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "Action item ID is required" },
        { status: 400 }
      );
    }

    const ok = await updateActionItemStatus(client.email, actionId, status, client.email);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error("[api/client/actions] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error updating action item" },
      { status: 500 }
    );
  }
}
