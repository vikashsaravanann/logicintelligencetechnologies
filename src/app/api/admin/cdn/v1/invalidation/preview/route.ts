import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { previewInvalidation, resolveCdnSiteId } from "@/lib/cdn/edge-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { siteId, paths } = body;

    if (!siteId || !Array.isArray(paths)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: siteId and paths array" },
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

    const preview = previewInvalidation(resolved, paths);

    if (preview.safetyViolation) {
      return NextResponse.json(
        {
          success: false,
          violation: preview.safetyViolation,
          preview,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      preview,
    });
  } catch (err) {
    console.error("[api/admin/cdn/v1/invalidation/preview] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
