/**
 * Pure metrics helpers for the Visibility Engine dashboard. No Supabase/import
 * side effects — the page fetches rows with the admin client, these functions
 * derive the numbers so they are unit-testable and the platform list lives in
 * exactly one place (and matches the visibility_checks.platform check + the
 * n8n probe config).
 */

export const VISIBILITY_PLATFORMS = [
  "google",
  "google_ai_overview",
  "perplexity",
  "chatgpt",
  "gemini",
  "claude",
] as const;
export type VisibilityPlatform = (typeof VISIBILITY_PLATFORMS)[number];

export const PLATFORM_LABELS: Record<VisibilityPlatform, string> = {
  google: "Google",
  google_ai_overview: "Google AI Overview",
  perplexity: "Perplexity",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
};

/** Shared, colour-blind-safe hue per platform (used by cards + trend chart). */
export const PLATFORM_COLORS: Record<VisibilityPlatform, string> = {
  google: "#1A73E8",
  google_ai_overview: "#8AB4F8",
  perplexity: "#20B2AA",
  chatgpt: "#10A37F",
  gemini: "#9334E6",
  claude: "#D97757",
};

export interface VisibilityCheckRow {
  id: string;
  query_id: string;
  platform: string;
  run_at: string;
  mentioned: boolean;
  cited: boolean;
  rank: number | null;
  snippet: string | null;
  /** false = the probe call failed/was skipped; such rows are excluded from scores. */
  ok?: boolean;
}

export interface PlatformScore {
  platform: VisibilityPlatform;
  label: string;
  mentionedCount: number;
  /** denominator = queries with a SUCCESSFUL latest check on this platform. */
  total: number;
  /** 0–100, rounded. */
  pct: number;
  /** whether any successful check exists for this platform yet. */
  hasData: boolean;
}

export interface TrendPoint {
  /** IST day key, yyyy-mm-dd. */
  date: string;
  /** per-platform score (0–100) for that day, or null when no runs that day. */
  [platform: string]: number | string | null;
}

function keyOf(queryId: string, platform: string): string {
  return `${queryId}\u0000${platform}`;
}

/**
 * Collapse rows to the most recent run per (query, platform). When `rows` is
 * already scoped to a single day this yields that day's latest-per-query.
 */
export function latestPerQueryPlatform(rows: VisibilityCheckRow[]): Map<string, VisibilityCheckRow> {
  const latest = new Map<string, VisibilityCheckRow>();
  for (const r of rows) {
    if (r.ok === false) continue; // exclude failed/skipped probes from the "latest" set
    const k = keyOf(r.query_id, r.platform);
    const prev = latest.get(k);
    if (!prev || new Date(r.run_at).getTime() > new Date(prev.run_at).getTime()) {
      latest.set(k, r);
    }
  }
  return latest;
}

/**
 * Visibility score per platform = % of SUCCESSFULLY-probed queries where
 * mentioned=true, from the most recent successful run per (query, platform).
 * Failed/skipped probes (ok=false) are excluded, so a provider outage does not
 * masquerade as genuine invisibility. The denominator is therefore the number
 * of queries with a successful latest check on that platform, not every query.
 */
export function platformScores(rows: VisibilityCheckRow[]): PlatformScore[] {
  const latest = latestPerQueryPlatform(rows); // already excludes ok=false
  const mentioned: Record<string, number> = {};
  const seen: Record<string, number> = {};
  for (const r of latest.values()) {
    seen[r.platform] = (seen[r.platform] ?? 0) + 1;
    if (r.mentioned) mentioned[r.platform] = (mentioned[r.platform] ?? 0) + 1;
  }
  return VISIBILITY_PLATFORMS.map((platform) => {
    const total = seen[platform] ?? 0;
    const mentionedCount = mentioned[platform] ?? 0;
    return {
      platform,
      label: PLATFORM_LABELS[platform],
      mentionedCount,
      total,
      pct: total > 0 ? Math.round((mentionedCount / total) * 100) : 0,
      hasData: total > 0,
    };
  });
}

/** yyyy-mm-dd in IST for a timestamp (so the trend buckets by Indian day). */
export function istDayKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // en-CA gives yyyy-mm-dd; pin the timezone so server UTC doesn't shift days.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * One series per platform of the daily visibility score over time. Each point
 * is a day; a platform value is null when there were no runs that day so the
 * chart can show a gap rather than a fake zero.
 */
export function trendSeries(rows: VisibilityCheckRow[]): TrendPoint[] {
  const byDay = new Map<string, VisibilityCheckRow[]>();
  for (const r of rows) {
    const day = istDayKey(r.run_at);
    if (!day) continue;
    const bucket = byDay.get(day);
    if (bucket) bucket.push(r);
    else byDay.set(day, [r]);
  }
  const days = Array.from(byDay.keys()).sort();
  return days.map((day) => {
    const latest = latestPerQueryPlatform(byDay.get(day)!); // excludes ok=false
    const mentioned: Record<string, number> = {};
    const seen: Record<string, number> = {};
    for (const r of latest.values()) {
      seen[r.platform] = (seen[r.platform] ?? 0) + 1;
      if (r.mentioned) mentioned[r.platform] = (mentioned[r.platform] ?? 0) + 1;
    }
    const point: TrendPoint = { date: day };
    for (const platform of VISIBILITY_PLATFORMS) {
      const total = seen[platform] ?? 0; // successful latest checks that day
      point[platform] = total > 0 ? Math.round(((mentioned[platform] ?? 0) / total) * 100) : null;
    }
    return point;
  });
}
