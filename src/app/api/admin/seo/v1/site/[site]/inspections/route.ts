import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { resolveSiteCodes } from "@/lib/seo/scheduler";
import {
  CANONICAL_GSC_SITES,
  inspectUrl,
  getRemainingDailyQuota,
  assertIndexingApiEligibility,
} from "@/lib/seo/gsc-client";

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
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    const canonical = CANONICAL_GSC_SITES[resolved.siteCode];
    const urlToInspect = targetUrl || canonical.siteUrl;

    // Check daily quota remaining
    const remainingQuota = getRemainingDailyQuota();
    if (remainingQuota <= 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Inspection quota exhausted for today. Rate limiting protection active.",
          remainingQuota,
        },
        { status: 429 }
      );
    }

    // Verify compliance with Section 10.3 / QA-50
    let indexingApiPolicyNote = "GSC URL Inspection & Sitemaps are the sole authorized discovery channels.";
    try {
      assertIndexingApiEligibility("StandardWebPage", urlToInspect);
      indexingApiPolicyNote = "Indexing API permitted (JobPosting/BroadcastEvent)";
    } catch {
      indexingApiPolicyNote = "QA-50 / Section 10.3: Google Indexing API is strictly forbidden for standard pages. Inspection via Search Console only.";
    }

    // Call GSC URL Inspection API
    const result = await inspectUrl(resolved.siteCode, urlToInspect);

    return NextResponse.json({
      success: true,
      siteCode: resolved.siteCode,
      dbSiteId: resolved.dbSiteId,
      inspectedUrl: urlToInspect,
      remainingDailyQuota: getRemainingDailyQuota(),
      indexingApiPolicyNote,
      inspectionResult: result,
    });
  } catch (err) {
    console.error("[api/admin/seo/v1/site/[site]/inspections] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
