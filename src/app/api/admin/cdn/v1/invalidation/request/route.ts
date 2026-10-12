import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { requestInvalidation, resolveCdnSiteId } from "@/lib/cdn/edge-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { siteId, paths, reason, approved } = body;

    if (!siteId || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: siteId and non-empty paths array" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "A substantive operational justification (minimum 8 characters) is required for edge invalidation.",
        },
        { status: 400 }
      );
    }

    const resolved = resolveCdnSiteId(siteId);
    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid siteId '${siteId}'. Expected: corporate, healthcare, logic_voice, voice_shield.`,
        },
        { status: 400 }
      );
    }

    // Determine if caller has super_admin override privileges for immediate dispatch
    const isSuperAdmin = auth.role === "super_admin";
    const grantApproved = Boolean(approved && isSuperAdmin);

    const result = await requestInvalidation({
      siteId: resolved,
      paths,
      reason: reason.trim(),
      actorEmail: auth.email || "admin@logicintelligencetechnologies.in",
      actorId: auth.userId.startsWith("system") ? undefined : auth.userId,
      approved: grantApproved,
    });

    return NextResponse.json({
      success: true,
      execution: result,
    });
  } catch (err) {
    console.error("[api/admin/cdn/v1/invalidation/request] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 422 }
    );
  }
}
