import test from "node:test";
import assert from "node:assert/strict";
import {
  platformScores,
  trendSeries,
  latestPerQueryPlatform,
  istDayKey,
  VISIBILITY_PLATFORMS,
  type VisibilityCheckRow,
} from "../../src/lib/visibility/metrics.ts";

function row(partial: Partial<VisibilityCheckRow>): VisibilityCheckRow {
  return {
    id: Math.random().toString(36).slice(2),
    query_id: "q1",
    platform: "google",
    run_at: "2026-10-10T06:00:00.000Z",
    mentioned: false,
    cited: false,
    rank: null,
    snippet: null,
    ...partial,
  };
}

test("latestPerQueryPlatform keeps the newest run per (query, platform)", () => {
  const rows = [
    row({ query_id: "q1", platform: "google", run_at: "2026-10-10T06:00:00Z", mentioned: false }),
    row({ query_id: "q1", platform: "google", run_at: "2026-10-11T06:00:00Z", mentioned: true }),
  ];
  const latest = latestPerQueryPlatform(rows);
  assert.equal(latest.size, 1);
  assert.equal([...latest.values()][0].mentioned, true);
});

test("latestPerQueryPlatform excludes failed probes (ok=false)", () => {
  // q1/google: latest run failed; the earlier successful run should win.
  const rows = [
    row({ query_id: "q1", platform: "google", run_at: "2026-10-10T06:00:00Z", mentioned: true, ok: true }),
    row({ query_id: "q1", platform: "google", run_at: "2026-10-11T06:00:00Z", mentioned: false, ok: false }),
  ];
  const latest = latestPerQueryPlatform(rows);
  assert.equal(latest.size, 1);
  assert.equal([...latest.values()][0].mentioned, true);
});

test("platformScores: denominator excludes failed probes (per-platform successful count)", () => {
  // google: q1 mentioned (ok), q2 not mentioned (ok) -> 1/2 = 50%.
  // q3's only google check FAILED (ok=false) -> excluded, not counted as invisible.
  const rows = [
    row({ query_id: "q1", platform: "google", run_at: "2026-10-11T06:00:00Z", mentioned: true, ok: true }),
    row({ query_id: "q2", platform: "google", run_at: "2026-10-11T06:00:00Z", mentioned: false, ok: true }),
    row({ query_id: "q3", platform: "google", run_at: "2026-10-11T06:00:00Z", mentioned: false, ok: false }),
  ];
  const scores = platformScores(rows);
  const google = scores.find((s) => s.platform === "google")!;
  assert.equal(google.mentionedCount, 1);
  assert.equal(google.total, 2); // q3's failed probe excluded from the denominator
  assert.equal(google.pct, 50);
  assert.equal(google.hasData, true);

  // a platform with only failed/absent checks has no data and 0%
  const claude = scores.find((s) => s.platform === "claude")!;
  assert.equal(claude.hasData, false);
  assert.equal(claude.pct, 0);
});

test("platformScores returns one entry per known platform", () => {
  const scores = platformScores([]);
  assert.equal(scores.length, VISIBILITY_PLATFORMS.length);
});

test("trendSeries buckets by IST day; denominator is that day's successful checks", () => {
  const rows = [
    row({ query_id: "q1", platform: "google", run_at: "2026-10-10T06:00:00Z", mentioned: true, ok: true }),
    row({ query_id: "q1", platform: "perplexity", run_at: "2026-10-10T06:00:00Z", mentioned: false, ok: true }),
    row({ query_id: "q2", platform: "perplexity", run_at: "2026-10-10T06:00:00Z", mentioned: false, ok: false }),
  ];
  const trend = trendSeries(rows);
  assert.equal(trend.length, 1);
  assert.equal(trend[0].date, "2026-10-10");
  assert.equal(trend[0].google, 100);
  assert.equal(trend[0].perplexity, 0); // 0 of 1 successful (the ok=false row excluded)
  // a platform with no runs that day is null (chart gap), not a fake zero
  assert.equal(trend[0].claude, null);
});

test("istDayKey shifts a late-UTC timestamp into the Indian day", () => {
  // 2026-10-10T20:00Z is 2026-10-11 01:30 IST
  assert.equal(istDayKey("2026-10-10T20:00:00Z"), "2026-10-11");
});
