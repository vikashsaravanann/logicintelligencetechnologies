import { Metadata } from "next";
import Link from "next/link";
import { Eye, Quote, AlertTriangle, ArrowLeft, Crosshair, FileText, Link2, Sparkles } from "lucide-react";
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
import { ContentReviewControls } from "./ContentReviewControls";
import { CitationControls } from "./CitationControls";

export const metadata: Metadata = {
  title: "Visibility Engine | Command Center",
  description:
    "Where Logic Intelligence Technologies appears across Google and AI answer engines (Perplexity, ChatGPT, Gemini, Claude).",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    entity?: string;
    gapPlatform?: string;
    tab?: string;
    cStatus?: string;
    cKind?: string;
    ctType?: string;
  }>;
};

const CITATION_STATUSES = ["identified", "queued", "actioned", "live", "rejected"] as const;
const CITATION_TYPES = ["directory", "community", "press", "wiki_source", "review_site", "partner"] as const;
const CITATION_TYPE_LABELS: Record<string, string> = {
  directory: "Directory",
  community: "Community",
  press: "Press",
  wiki_source: "Wiki source",
  review_site: "Review site",
  partner: "Partner",
};

interface CitationRow {
  id: string;
  type: string;
  name: string;
  url: string;
  status: "identified" | "queued" | "actioned" | "live" | "rejected";
  citation_url: string | null;
  relevance_note: string | null;
  is_live: boolean;
  seen_in_ai: boolean;
}

const SUGGESTION_KINDS = ["json_ld", "faq", "meta", "factual_sentences"] as const;
const SUGGESTION_STATUSES = ["draft", "approved", "rejected", "applied"] as const;
const KIND_LABELS: Record<string, string> = {
  json_ld: "JSON-LD",
  faq: "FAQ",
  meta: "Meta",
  factual_sentences: "Factual sentences",
};

interface SuggestionRow {
  id: string;
  kind: string;
  status: "draft" | "approved" | "rejected" | "applied";
  rationale: string | null;
  payload: unknown;
  reviewed_by: string | null;
  reviewed_at: string | null;
  pr_url: string | null;
  created_at: string;
  page_url: string;
  query_text: string | null;
}

/** A gap row flattened from the embedded PostgREST select. */
interface GapRow {
  id: string;
  platform: string;
  note: string | null;
  computed_at: string;
  query_text: string;
  competitor_name: string;
}

/** PostgREST embeds a to-one relation as an object, but types widen to arrays. */
function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

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
  const companyEntity = entities.find((e) => e.domain === "logicintelligencetechnologies.in");
  const selfEntity = entities.find((e) => e.type === "self");
  const selected =
    entities.find((e) => e.id === params.entity) ?? companyEntity ?? selfEntity ?? entities[0] ?? null;

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

  // --- Gaps for the selected entity (competitor cited/ranked where we aren't) -
  const gapsRes = selected
    ? await supabaseAdmin
        .from("visibility_gaps")
        .select(
          "id, platform, note, computed_at, target_queries!inner(query_text, entity_id), competitors!inner(name)",
        )
        .eq("target_queries.entity_id", selected.id)
        .order("computed_at", { ascending: false })
        .limit(200)
    : { data: [], error: null };

  const gapRows: GapRow[] = (gapsRes.data ?? []).map((g: Record<string, unknown>) => {
    const q = one(g.target_queries as { query_text?: string } | { query_text?: string }[]);
    const c = one(g.competitors as { name?: string } | { name?: string }[]);
    return {
      id: String(g.id),
      platform: String(g.platform),
      note: (g.note as string | null) ?? null,
      computed_at: String(g.computed_at),
      query_text: q?.query_text ?? "—",
      competitor_name: c?.name ?? "—",
    };
  });

  const gapPlatforms = Array.from(new Set(gapRows.map((g) => g.platform))).sort();
  const gapPlatform = params.gapPlatform;
  const filteredGaps = gapPlatform ? gapRows.filter((g) => g.platform === gapPlatform) : gapRows;

  // --- Content suggestions for the selected entity (Content tab) -------------
  const tab =
    params.tab === "content" ? "content" : params.tab === "citations" ? "citations" : "overview";
  const suggestionsRes =
    selected && tab === "content"
      ? await supabaseAdmin
          .from("content_suggestions")
          .select(
            "id, kind, status, rationale, payload, reviewed_by, reviewed_at, pr_url, created_at, content_assets!inner(url, entity_id), target_queries(query_text)",
          )
          .eq("content_assets.entity_id", selected.id)
          .order("created_at", { ascending: false })
          .limit(300)
      : { data: [], error: null };

  const suggestions: SuggestionRow[] = (suggestionsRes.data ?? []).map(
    (s: Record<string, unknown>) => {
      const asset = one(s.content_assets as { url?: string } | { url?: string }[]);
      const q = one(s.target_queries as { query_text?: string } | { query_text?: string }[]);
      return {
        id: String(s.id),
        kind: String(s.kind),
        status: s.status as SuggestionRow["status"],
        rationale: (s.rationale as string | null) ?? null,
        payload: s.payload,
        reviewed_by: (s.reviewed_by as string | null) ?? null,
        reviewed_at: (s.reviewed_at as string | null) ?? null,
        pr_url: (s.pr_url as string | null) ?? null,
        created_at: String(s.created_at),
        page_url: asset?.url ?? "—",
        query_text: q?.query_text ?? null,
      };
    },
  );

  const cStatus = SUGGESTION_STATUSES.includes(params.cStatus as (typeof SUGGESTION_STATUSES)[number])
    ? params.cStatus
    : undefined;
  const cKind = SUGGESTION_KINDS.includes(params.cKind as (typeof SUGGESTION_KINDS)[number])
    ? params.cKind
    : undefined;
  const filteredSuggestions = suggestions.filter(
    (s) => (!cStatus || s.status === cStatus) && (!cKind || s.kind === cKind),
  );
  // group filtered suggestions by page url
  const suggestionsByPage = new Map<string, SuggestionRow[]>();
  for (const s of filteredSuggestions) {
    const bucket = suggestionsByPage.get(s.page_url);
    if (bucket) bucket.push(s);
    else suggestionsByPage.set(s.page_url, [s]);
  }

  // --- Citation targets + latest mention check (Citations tab) ---------------
  const citationsRes =
    selected && tab === "citations"
      ? await supabaseAdmin
          .from("citation_targets")
          .select("id, type, name, url, status, citation_url, relevance_note, created_at")
          .eq("entity_id", selected.id)
          .order("created_at", { ascending: false })
          .limit(500)
      : { data: [], error: null };

  const citationTargetsRaw = (citationsRes.data ?? []) as Array<Record<string, unknown>>;
  const liveIds = citationTargetsRaw.filter((t) => t.status === "live").map((t) => String(t.id));
  const mentionsRes =
    liveIds.length > 0
      ? await supabaseAdmin
          .from("mention_checks")
          .select("citation_target_id, is_live, seen_in_ai, checked_at")
          .in("citation_target_id", liveIds)
          .order("checked_at", { ascending: false })
      : { data: [], error: null };
  const latestMention = new Map<string, { is_live: boolean; seen_in_ai: boolean }>();
  for (const m of (mentionsRes.data ?? []) as Array<Record<string, unknown>>) {
    const key = String(m.citation_target_id);
    if (!latestMention.has(key)) {
      latestMention.set(key, { is_live: Boolean(m.is_live), seen_in_ai: Boolean(m.seen_in_ai) });
    }
  }

  const citationRows: CitationRow[] = citationTargetsRaw.map((t) => {
    const mc = latestMention.get(String(t.id));
    return {
      id: String(t.id),
      type: String(t.type),
      name: String(t.name),
      url: String(t.url),
      status: t.status as CitationRow["status"],
      citation_url: (t.citation_url as string | null) ?? null,
      relevance_note: (t.relevance_note as string | null) ?? null,
      is_live: mc?.is_live ?? false,
      seen_in_ai: mc?.seen_in_ai ?? false,
    };
  });

  const citationFunnel: Record<string, number> = {};
  for (const st of CITATION_STATUSES) citationFunnel[st] = 0;
  for (const c of citationRows) citationFunnel[c.status] = (citationFunnel[c.status] ?? 0) + 1;
  const seenInAiCount = citationRows.filter((c) => c.status === "live" && c.seen_in_ai).length;
  const ctType = CITATION_TYPES.includes(params.ctType as (typeof CITATION_TYPES)[number])
    ? params.ctType
    : undefined;
  const citationTypes = Array.from(new Set(citationRows.map((c) => c.type))).sort();
  const filteredCitations = ctType ? citationRows.filter((c) => c.type === ctType) : citationRows;

  const anyError = Boolean(
    entitiesRes.error ||
      queriesRes.error ||
      checksRes.error ||
      gapsRes.error ||
      suggestionsRes.error ||
      citationsRes.error ||
      mentionsRes.error,
  );

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

          {/* Tab nav */}
          <div className="flex items-center gap-1 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <TabLink entityId={selected.id} tab="overview" active={tab === "overview"} label="Overview" />
            <TabLink entityId={selected.id} tab="content" active={tab === "content"} label="Content" />
            <TabLink entityId={selected.id} tab="citations" active={tab === "citations"} label="Citations" />
          </div>

          {tab === "overview" ? (
          <>
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

          {/* Gaps — where a competitor is cited/ranked and we are not */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs">
            <div className="mb-4 flex flex-col gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-amber-500/10 text-amber-600">
                  <Crosshair className="h-4 w-4" />
                </span>
                Visibility Gaps
              </h2>
              {gapPlatforms.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <GapFilterPill
                    entityId={selected.id}
                    platform={undefined}
                    active={!gapPlatform}
                    label="All"
                  />
                  {gapPlatforms.map((p) => (
                    <GapFilterPill
                      key={p}
                      entityId={selected.id}
                      platform={p}
                      active={gapPlatform === p}
                      label={PLATFORM_LABELS[p as VisibilityPlatform] ?? p}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {filteredGaps.length === 0 ? (
              <p className="py-8 text-center text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
                No gaps found — or no competitor data yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                      <th className="py-2 pr-3">Query</th>
                      <th className="px-3 py-2">Platform</th>
                      <th className="px-3 py-2">Competitor</th>
                      <th className="px-3 py-2">Note</th>
                      <th className="px-3 py-2">Computed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                    {filteredGaps.map((g) => (
                      <tr key={g.id} className="align-top hover:bg-[var(--lit-cloud,#F7F9FC)]">
                        <td className="py-2.5 pr-3 font-medium text-[var(--lit-navy,#0B2545)]">
                          {g.query_text}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[g.platform as VisibilityPlatform] ?? "#94a3b8" }}
                              aria-hidden
                            />
                            {PLATFORM_LABELS[g.platform as VisibilityPlatform] ?? g.platform}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-rose-700">
                          {g.competitor_name}
                        </td>
                        <td className="max-w-md px-3 py-2.5 text-[var(--lit-text-muted,#52677C)]">
                          {g.note || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                          {formatIST(g.computed_at, "datetime")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          ) : null}

          {tab === "content" ? (
            <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs">
              <div className="mb-4 flex flex-col gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                    <FileText className="h-4 w-4" />
                  </span>
                  Content Suggestions
                </h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Status</span>
                    <ContentFilterPill entityId={selected.id} param="cStatus" value={undefined} current={cStatus} kind={cKind} status={cStatus} label="All" />
                    {SUGGESTION_STATUSES.map((st) => (
                      <ContentFilterPill key={st} entityId={selected.id} param="cStatus" value={st} current={cStatus} kind={cKind} status={cStatus} label={st} />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Kind</span>
                    <ContentFilterPill entityId={selected.id} param="cKind" value={undefined} current={cKind} kind={cKind} status={cStatus} label="All" />
                    {SUGGESTION_KINDS.map((k) => (
                      <ContentFilterPill key={k} entityId={selected.id} param="cKind" value={k} current={cKind} kind={cKind} status={cStatus} label={KIND_LABELS[k]} />
                    ))}
                  </div>
                </div>
              </div>

              {filteredSuggestions.length === 0 ? (
                <p className="py-8 text-center text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
                  No content suggestions yet. Run the Content Engine workflow to generate drafts for underperforming pages.
                </p>
              ) : (
                <div className="space-y-6">
                  {Array.from(suggestionsByPage.entries()).map(([pageUrl, rows]) => (
                    <div key={pageUrl}>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                        <span className="truncate font-mono">{pageUrl}</span>
                        <span className="text-[var(--lit-text-muted,#52677C)]">· {rows.length}</span>
                      </div>
                      <div className="space-y-3">
                        {rows.map((s) => (
                          <div key={s.id} className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                                  {KIND_LABELS[s.kind] ?? s.kind}
                                </span>
                                {s.query_text ? (
                                  <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                                    for “{s.query_text}”
                                  </span>
                                ) : null}
                              </div>
                              <ContentReviewControls id={s.id} status={s.status} />
                            </div>
                            {s.rationale ? (
                              <p className="mb-2 text-[11px] leading-relaxed text-[var(--lit-text-muted,#52677C)]">
                                {s.rationale}
                              </p>
                            ) : null}
                            <SuggestionPayload kind={s.kind} payload={s.payload} />
                            {s.reviewed_by ? (
                              <p className="mt-2 text-[10px] text-[var(--lit-text-muted,#52677C)]">
                                {s.status} by {s.reviewed_by}
                                {s.reviewed_at ? ` · ${formatIST(s.reviewed_at, "datetime")}` : ""}
                                {s.pr_url ? (
                                  <>
                                    {" · "}
                                    <a href={s.pr_url} className="text-[var(--lit-teal,#1FA9A2)] underline" target="_blank" rel="noreferrer">
                                      PR
                                    </a>
                                  </>
                                ) : null}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === "citations" ? (
            <div className="space-y-6">
              {/* Funnel */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {CITATION_STATUSES.map((st) => (
                  <div
                    key={st}
                    className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-2xs"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                      {st}
                    </div>
                    <div className="mt-1 font-mono text-2xl font-black text-[var(--lit-navy,#0B2545)]">
                      {citationFunnel[st] ?? 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Proven-in-AI highlight */}
              <div
                className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-medium shadow-2xs ${
                  seenInAiCount > 0
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)]"
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  <span className="font-bold">{seenInAiCount}</span> live citation
                  {seenInAiCount === 1 ? "" : "s"} proven to feed AI answers (seen in a probe's source
                  URLs) — the money metric.
                </span>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs">
                <div className="mb-4 flex flex-col gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                      <Link2 className="h-4 w-4" />
                    </span>
                    Citation Targets
                  </h2>
                  {citationTypes.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CitationTypePill entityId={selected.id} value={undefined} current={ctType} label="All" />
                      {citationTypes.map((t) => (
                        <CitationTypePill
                          key={t}
                          entityId={selected.id}
                          value={t}
                          current={ctType}
                          label={CITATION_TYPE_LABELS[t] ?? t}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                {filteredCitations.length === 0 ? (
                  <p className="py-8 text-center text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
                    No citation targets yet. Run the Citation Discovery workflow to populate them.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                          <th className="py-2 pr-3">Target</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Proven in AI</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                        {filteredCitations.map((c) => (
                          <tr key={c.id} className="align-top hover:bg-[var(--lit-cloud,#F7F9FC)]">
                            <td className="py-3 pr-3">
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)]"
                              >
                                {c.name}
                              </a>
                              {c.relevance_note ? (
                                <p className="mt-0.5 max-w-sm text-[10px] text-[var(--lit-text-muted,#52677C)]">
                                  {c.relevance_note}
                                </p>
                              ) : null}
                              {c.citation_url ? (
                                <a
                                  href={c.citation_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-0.5 block truncate text-[10px] text-[var(--lit-teal,#1FA9A2)] underline"
                                >
                                  {c.citation_url}
                                </a>
                              ) : null}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-slate-700">
                              {CITATION_TYPE_LABELS[c.type] ?? c.type}
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                {c.status}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              {c.status === "live" && c.seen_in_ai ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                  <Sparkles className="h-3 w-3" /> Seen in AI
                                </span>
                              ) : c.status === "live" ? (
                                <span className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                                  {c.is_live ? "live" : "not verified"}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[var(--lit-text-muted,#52677C)]">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <CitationControls id={c.id} status={c.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function CitationTypePill({
  entityId,
  value,
  current,
  label,
}: {
  entityId: string;
  value: string | undefined;
  current: string | undefined;
  label: string;
}) {
  const qs = new URLSearchParams({ entity: entityId, tab: "citations" });
  if (value) qs.set("ctType", value);
  const active = current === value || (!current && !value);
  return (
    <Link
      href={`?${qs.toString()}`}
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? "border-[var(--lit-teal,#1FA9A2)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)]"
          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:border-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}

function TabLink({
  entityId,
  tab,
  active,
  label,
}: {
  entityId: string;
  tab: string;
  active: boolean;
  label: string;
}) {
  const qs = new URLSearchParams({ entity: entityId });
  if (tab !== "overview") qs.set("tab", tab);
  return (
    <Link
      href={`?${qs.toString()}`}
      aria-current={active ? "page" : undefined}
      className={`-mb-px border-b-2 px-4 py-2 text-xs font-bold transition-colors ${
        active
          ? "border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)]"
          : "border-transparent text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
      }`}
    >
      {label}
    </Link>
  );
}

function ContentFilterPill({
  entityId,
  param,
  value,
  current,
  kind,
  status,
  label,
}: {
  entityId: string;
  param: "cStatus" | "cKind";
  value: string | undefined;
  current: string | undefined;
  kind: string | undefined;
  status: string | undefined;
  label: string;
}) {
  const qs = new URLSearchParams({ entity: entityId, tab: "content" });
  // preserve the other filter
  if (param === "cStatus") {
    if (value) qs.set("cStatus", value);
    if (kind) qs.set("cKind", kind);
  } else {
    if (status) qs.set("cStatus", status);
    if (value) qs.set("cKind", value);
  }
  const active = current === value || (!current && !value);
  return (
    <Link
      href={`?${qs.toString()}`}
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? "border-[var(--lit-teal,#1FA9A2)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)]"
          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:border-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}

/** Readable render of a suggestion payload by kind. */
function SuggestionPayload({ kind, payload }: { kind: string; payload: unknown }) {
  if (kind === "faq" && Array.isArray(payload)) {
    return (
      <div className="space-y-2">
        {(payload as Array<{ question?: string; answer?: string }>).map((qa, i) => (
          <div key={i} className="rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3">
            <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">{qa.question ?? "—"}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--lit-text-muted,#52677C)]">{qa.answer ?? ""}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "meta" && payload && typeof payload === "object") {
    const m = payload as { title?: string; description?: string };
    return (
      <div className="space-y-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 text-[11px]">
        <div>
          <span className="font-bold text-[var(--lit-navy,#0B2545)]">New title</span>{" "}
          <span className="text-[var(--lit-text-muted,#52677C)]">({(m.title ?? "").length} chars)</span>
          <p className="font-mono text-slate-700">{m.title ?? "—"}</p>
        </div>
        <div>
          <span className="font-bold text-[var(--lit-navy,#0B2545)]">New description</span>{" "}
          <span className="text-[var(--lit-text-muted,#52677C)]">({(m.description ?? "").length} chars)</span>
          <p className="font-mono text-slate-700">{m.description ?? "—"}</p>
        </div>
      </div>
    );
  }
  if (kind === "factual_sentences" && Array.isArray(payload)) {
    return (
      <ul className="list-disc space-y-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 pl-6 text-[11px] text-slate-700">
        {(payload as string[]).map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    );
  }
  // json_ld or anything else: pretty-printed JSON
  return (
    <pre className="max-h-72 overflow-auto rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 text-[10px] leading-relaxed text-slate-700">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

function GapFilterPill({
  entityId,
  platform,
  active,
  label,
}: {
  entityId: string;
  platform: string | undefined;
  active: boolean;
  label: string;
}) {
  const qs = new URLSearchParams({ entity: entityId });
  if (platform) qs.set("gapPlatform", platform);
  return (
    <Link
      href={`?${qs.toString()}`}
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? "border-[var(--lit-teal,#1FA9A2)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-navy,#0B2545)]"
          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:border-slate-300"
      }`}
    >
      {label}
    </Link>
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
