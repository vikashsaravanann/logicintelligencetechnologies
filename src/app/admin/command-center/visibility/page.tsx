import { Metadata } from "next";
import Link from "next/link";
import { Eye, Quote, AlertTriangle, ArrowLeft } from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import {
  platformScores,
  trendSeries,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  type VisibilityCheckRow,
  type VisibilityPlatform,
} from "@/lib/visibility/metrics";
import { EntitySelect, type EntityOption } from "./EntitySelect";
import { VisibilityTrendChart } from "./VisibilityTrendChart";

export const metadata: Metadata = {
  title: "Visibility Engine | Command Center",
  description:
    "Where Logic Intelligence Technologies appears across Google and AI answer engines (Perplexity, ChatGPT, Gemini, Claude).",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{ entity?: string }>;
};

export default async function VisibilityPage({ searchParams }: PageProps) {
  await requireCapabilityPage("seo.read", "/admin/command-center/visibility");

  const params = searchParams ? await searchParams : {};

  // --- Entities (for the selector; default to the 'self' entity) -------------
  const entitiesRes = await supabaseAdmin
    .from("tracked_entities")
    .select("id, name, type, domain")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  const entities = (entitiesRes.data ?? []) as EntityOption[];
  const selfEntity = entities.find((e) => e.type === "self");
  const selected =
    entities.find((e) => e.id === params.entity) ?? selfEntity ?? entities[0] ?? null;

  // --- Active queries for the selected entity --------------------------------
  const queriesRes = selected
    ? await supabaseAdmin
        .from("target_queries")
        .select("id, query_text")
        .eq("entity_id", selected.id)
        .eq("active", true)
    : { data: [], error: null };

  const activeQueries = (queriesRes.data ?? []) as { id: string; query_text: string }[];
  const queryTextById = new Map(activeQueries.map((q) => [q.id, q.query_text]));
  const queryIds = activeQueries.map((q) => q.id);

  // --- Checks for those queries (newest first) -------------------------------
  const checksRes =
    queryIds.length > 0
      ? await supabaseAdmin
          .from("visibility_checks")
          .select("id, query_id, platform, run_at, mentioned, cited, rank, snippet")
          .in("query_id", queryIds)
          .order("run_at", { ascending: false })
          .limit(5000)
      : { data: [], error: null };

  const checks = (checksRes.data ?? []) as VisibilityCheckRow[];

  const anyError = Boolean(entitiesRes.error || queriesRes.error || checksRes.error);

  const scores = platformScores(checks, queryIds.length);
  const trend = trendSeries(checks, queryIds.length);
  const latestChecks = checks.slice(0, 50);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--lit-border-light,#DFE7EF)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/command-center"
            className="mb-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)]"
          >
            <ArrowLeft className="h-3 w-3" />
            Command Center
          </Link>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] sm:text-3xl">
            Visibility Engine
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
            Share of tracked queries where the entity is mentioned across Google and AI answer engines.
          </p>
        </div>
        {entities.length > 0 && selected ? (
          <EntitySelect entities={entities} selectedId={selected.id} />
        ) : null}
      </div>

      {anyError ? (
        <div
          className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800 shadow-2xs"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Some visibility data could not be loaded. Figures may be incomplete.</span>
        </div>
      ) : null}

      {!selected ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 text-center text-sm font-medium text-[var(--lit-text-muted,#52677C)] shadow-2xs">
          No tracked entities yet. Seed a <code className="font-mono">tracked_entities</code> row to begin.
        </div>
      ) : (
        <>
          {/* Context line */}
          <p className="-mt-4 text-xs text-[var(--lit-text-muted,#52677C)]">
            <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{selected.name}</span>
            {selected.domain ? ` · ${selected.domain}` : ""} · {queryIds.length} active{" "}
            {queryIds.length === 1 ? "query" : "queries"} tracked
          </p>

          {/* Score cards (most recent run per query/platform) */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {scores.map((s) => (
              <div
                key={s.platform}
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                    {s.label}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[s.platform] }}
                    aria-hidden
                  />
                </div>
                <div className="font-mono text-2xl font-black tracking-tight text-[var(--lit-navy,#0B2545)] sm:text-3xl">
                  {s.hasData ? `${s.pct}%` : "—"}
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-[var(--lit-text-muted,#52677C)]">
                  {s.hasData
                    ? `Mentioned in ${s.mentionedCount} of ${s.total}`
                    : "No probe data yet"}
                </p>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                  <Eye className="h-4 w-4" />
                </span>
                Visibility Score Trend
              </h2>
            </div>
            <VisibilityTrendChart data={trend} />
          </div>

          {/* Latest checks table */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                  <Quote className="h-4 w-4" />
                </span>
                Latest Checks
              </h2>
              <span className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)]">
                {latestChecks.length} most recent
              </span>
            </div>

            {latestChecks.length === 0 ? (
              <p className="py-8 text-center text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
                No checks recorded yet. Run the Visibility Probe to populate this table.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                      <th className="py-2 pr-3">Query</th>
                      <th className="px-3 py-2">Platform</th>
                      <th className="px-3 py-2">Mentioned</th>
                      <th className="px-3 py-2">Cited</th>
                      <th className="px-3 py-2">Rank</th>
                      <th className="px-3 py-2">Snippet</th>
                      <th className="px-3 py-2">Run At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                    {latestChecks.map((c) => (
                      <tr key={c.id} className="align-top hover:bg-[var(--lit-cloud,#F7F9FC)]">
                        <td className="py-2.5 pr-3 font-medium text-[var(--lit-navy,#0B2545)]">
                          {queryTextById.get(c.query_id) ?? c.query_id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[c.platform as VisibilityPlatform] ?? "#94a3b8" }}
                              aria-hidden
                            />
                            {PLATFORM_LABELS[c.platform as VisibilityPlatform] ?? c.platform}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <BoolBadge value={c.mentioned} />
                        </td>
                        <td className="px-3 py-2.5">
                          <BoolBadge value={c.cited} />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">
                          {typeof c.rank === "number" ? `#${c.rank}` : "—"}
                        </td>
                        <td className="max-w-xs px-3 py-2.5 text-[var(--lit-text-muted,#52677C)]">
                          <span className="line-clamp-2">{c.snippet || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                          {formatIST(c.run_at, "datetime")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
      Yes
    </span>
  ) : (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
      No
    </span>
  );
}
