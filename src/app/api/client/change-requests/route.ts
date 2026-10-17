import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedClientUser } from "@/lib/auth/client-auth";
import { listClientChangeRequests, createChangeRequest } from "@/lib/client-portal/v4-actions";

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

    const changeRequests = await listClientChangeRequests(client.email, engagementRef);
    return NextResponse.json({
      success: true,
      clientEmail: client.email,
      changeRequests,
    });
  } catch (err) {
    console.error("[api/client/change-requests] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching change requests" },
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
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const engagementRef = body.engagementRef;
    const title = body.title?.trim();
    const category = body.category || "scope_expansion";
    const description = body.description?.trim();

    if (!engagementRef || !title || !description) {
      return NextResponse.json(
        { success: false, error: "Engagement reference, title, and description are required" },
        { status: 400 }
      );
    }

    const result = await createChangeRequest({
      clientEmail: client.email,
      engagementRef,
      title,
      category,
      description,
      justification: body.justification?.trim(),
      impactSummary: body.impactSummary?.trim(),
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create change request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rfcRef: result.rfcRef,
    });
  } catch (err) {
    console.error("[api/client/change-requests] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error submitting change request" },
      { status: 500 }
    );
  }
}
