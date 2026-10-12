import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { resolveSiteCodes, validateSitemap } from "@/lib/seo/scheduler";
import { CANONICAL_GSC_SITES, listSitemaps } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { site } = await params;
  if (!site) {
    return NextResponse.json({ success: false, message: "Missing site identifier" }, { status: 400 });
  }

  const resolved = resolveSiteCodes(site);
  if (!resolved) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid site '${site}'. Expected one of: corporate, healthcare, logic_voice, voice_shield.`,
      },
      { status: 400 }
    );
  }

  try {
    const canonical = CANONICAL_GSC_SITES[resolved.siteCode];

    // Live XML parse & policy audit
    const validation = await validateSitemap(resolved.siteCode);

    // GSC Sitemaps API query
    const gscSitemaps = await listSitemaps(resolved.siteCode);

    return NextResponse.json({
      success: true,
      siteCode: resolved.siteCode,
      dbSiteId: resolved.dbSiteId,
      sitemapUrl: canonical.sitemapUrl,
      validation,
      gscSubmittedSitemaps: gscSitemaps,
    });
  } catch (err) {
    console.error("[api/admin/seo/v1/site/[site]/sitemaps] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
