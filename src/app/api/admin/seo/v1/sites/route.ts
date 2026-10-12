import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CANONICAL_GSC_SITES, resolveGscCredentials, type SiteCode } from "@/lib/seo/gsc-client";
import {
  SITE_CODE_TO_DB_ID,
  calculate72hSlot,
  formatKolkataTime,
  type DbSiteId,
} from "@/lib/seo/scheduler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const currentSlot = calculate72hSlot();
    const gscCreds = resolveGscCredentials();

    // Fetch site properties from database
    let dbProperties: any[] = [];
    try {
      const { data } = await supabaseAdmin.from("seo_site_properties").select("*");
      if (data && data.length > 0) {
        dbProperties = data;
      }
    } catch {
      // Non-fatal fallback
    }

    const dbMap = new Map(dbProperties.map((p) => [p.site_id, p]));

    const siteCodes: SiteCode[] = ["LIT-CORP", "LIT-HC", "LIT-LV", "LIT-VS"];
    const sites = siteCodes.map((sc) => {
      const dbId: DbSiteId = SITE_CODE_TO_DB_ID[sc];
      const gsc = CANONICAL_GSC_SITES[sc];
      const dbRecord = dbMap.get(dbId);

      const lastCrawlUtc = dbRecord?.last_crawl_at || null;
      const nextCrawlUtc = dbRecord?.next_crawl_at || currentSlot.slotEndUtc;

      return {
        siteCode: sc,
        dbSiteId: dbId,
        displayName: gsc.name,
        domain: gsc.siteUrl,
        sitemapUrl: gsc.sitemapUrl,
        robotsUrl: `${gsc.siteUrl}robots.txt`,
        gscPropertyId: dbRecord?.gsc_property_id || gsc.siteUrl,
        isVerified: dbRecord?.gsc_verified ?? gscCreds.configured,
        quotaLimitPerDay: dbRecord?.quota_limit_per_day ?? 2000,
        quotaUsedToday: dbRecord?.quota_used_today ?? 0,
        monitoringIntervalHours: 72,
        lastCrawlUtc,
        lastCrawlKolkata: formatKolkataTime(lastCrawlUtc),
        nextCrawlUtc,
        nextCrawlKolkata: formatKolkataTime(nextCrawlUtc),
        isDue: currentSlot.isDue,
      };
    });

    return NextResponse.json({
      success: true,
      displayTimezone: "Asia/Kolkata",
      persistenceTimezone: "UTC",
      currentSlot,
      sites,
    });
  } catch (err) {
    console.error("[api/admin/seo/v1/sites] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
