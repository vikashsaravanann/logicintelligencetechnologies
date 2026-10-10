import { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Search,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Security Audit Ledger | Admin",
  description: "Immutable append-only ledger of administrative actions and access decisions.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const filtersSchema = z.object({
  action: z.string().trim().max(80).optional(),
  actor: z.string().trim().max(200).optional(),
  target_type: z.string().trim().max(80).optional(),
  outcome: z.enum(["succeeded", "failed", "denied"]).optional(),
  from: z.string().trim().max(40).optional(),
  to: z.string().trim().max(40).optional(),
  // keyset cursor: "<occurred_at>|<id>"
  cursor: z.string().trim().max(120).optional(),
});

interface AuditRow {
  id: string;
  occurred_at: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  outcome: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  error_code: string | null;
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const norm = role.toLowerCase();
  let tone = "bg-slate-100 text-slate-700 border-slate-200";

  if (norm === "super_admin") {
    tone = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (norm === "admin") {
    tone = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (norm === "agent" || norm === "operations") {
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (norm === "viewer") {
    tone = "bg-slate-100 text-slate-700 border-slate-200";
  } else if (norm === "support") {
    tone = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (norm === "developer") {
    tone = "bg-cyan-50 text-cyan-700 border-cyan-200";
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.2 rounded border text-[10px] font-bold font-mono uppercase tracking-wider ${tone}`}
    >
      {role}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  if (outcome === "succeeded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        <span>Succeeded</span>
      </span>
    );
  }
  if (outcome === "denied") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
        <ShieldAlert className="h-3 w-3 text-amber-600" />
        <span>Denied</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
      <XCircle className="h-3 w-3 text-rose-600" />
      <span>Failed</span>
    </span>
  );
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapabilityPage("audit.read", "/admin/audit");
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") flat[k] = v;
  const f = filtersSchema.safeParse(flat);
  const filters = f.success ? f.data : {};

  let q = supabaseAdmin
    .from("admin_audit_log")
    .select(
      "id, occurred_at, actor_email, actor_role, action, outcome, target_type, target_id, metadata, error_code"
    )
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (filters.action) q = q.ilike("action", `${filters.action}%`);
  if (filters.actor) q = q.ilike("actor_email", `%${filters.actor}%`);
  if (filters.target_type) q = q.eq("target_type", filters.target_type);
  if (filters.outcome) q = q.eq("outcome", filters.outcome);
  if (filters.from) q = q.gte("occurred_at", filters.from);
  if (filters.to) q = q.lte("occurred_at", filters.to);
  if (filters.cursor) {
    const [ts, id] = filters.cursor.split("|");
    // keyset: rows strictly "older" than the cursor in (occurred_at desc, id desc)
    if (ts && id) q = q.or(`occurred_at.lt.${ts},and(occurred_at.eq.${ts},id.lt.${id})`);
  }

  const { data, error } = await q;
  const rows = (data ?? []) as AuditRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? `${last.occurred_at}|${last.id}` : null;

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, cursor: undefined, ...extra })) {
      if (v) p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const batchCount = page.length;
  const succeededCount = page.filter((r) => r.outcome === "succeeded").length;
  const deniedCount = page.filter((r) => r.outcome === "denied").length;
  const failedCount = page.filter((r) => r.outcome === "failed").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Security Audit Ledger
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            Append-only record of administrative operations and access decisions. Timestamps in IST.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Current Batch</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
            {batchCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Records displayed on this page
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Succeeded</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {succeededCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Approved &amp; completed executions
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Policy Denied</span>
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
            {deniedCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Capability guard interceptions
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Execution Failures</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700">
            {failedCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            RPC &amp; handler exceptions
          </p>
        </div>
      </div>

      {/* Filter Form Card */}
      <form
        method="get"
        className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs"
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
          <Filter className="h-3.5 w-3.5 text-blue-600" />
          <span>Ledger Filter Controls</span>
        </div>

        <div className="flex flex-wrap items-end gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            Action Prefix
            <input
              name="action"
              defaultValue={filters.action ?? ""}
              placeholder="e.g. team. or proposal."
              className="w-48 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-1.5 text-xs text-[var(--lit-navy,#0B2545)] shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            Actor Email
            <input
              name="actor"
              defaultValue={filters.actor ?? ""}
              placeholder="Search by actor..."
              className="w-56 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-1.5 text-xs text-[var(--lit-navy,#0B2545)] shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            Outcome
            <select
              name="outcome"
              defaultValue={filters.outcome ?? ""}
              className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Outcomes</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="denied">Denied</option>
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#153a66] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Apply Filter</span>
            </button>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-2 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Link>
          </div>
        </div>
      </form>

      {/* Main Ledger Table Card */}
      {error ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-800 shadow-xs"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>Could not load the audit log. The database query failed.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 px-5 py-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Audit Event Entries ({page.length})
              </span>
              <span className="font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                Storage: Append-Only Immutable Store
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp (IST)</th>
                    <th className="px-5 py-3.5">Actor &amp; Role</th>
                    <th className="px-5 py-3.5">Action Name</th>
                    <th className="px-5 py-3.5">Outcome</th>
                    <th className="px-5 py-3.5">Target Resource</th>
                    <th className="px-5 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                  {page.map((r) => (
                    <tr key={r.id} className="align-top transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-medium text-[var(--lit-navy,#0B2545)]">
                        {formatIST(r.occurred_at, "datetime")}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                          {r.actor_email ?? "system / internal"}
                        </div>
                        {r.actor_role ? (
                          <div className="mt-1">
                            <RoleBadge role={r.actor_role} />
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                          {r.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <OutcomeBadge outcome={r.outcome} />
                        {r.error_code ? (
                          <div className="mt-1 font-mono text-[10px] text-rose-600">
                            Code: {r.error_code}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                        {r.target_type ? (
                          <span className="font-medium text-[var(--lit-navy,#0B2545)]">
                            {r.target_type}
                          </span>
                        ) : (
                          "—"
                        )}
                        {r.target_id ? (
                          <div className="font-mono text-[10px] text-[var(--lit-text-muted,#52677C)]">
                            {r.target_id}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-3.5">
                        {r.metadata && Object.keys(r.metadata).length ? (
                          <details className="group">
                            <summary className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 select-none">
                              Inspect Payload
                            </summary>
                            <pre className="mt-2 max-w-sm sm:max-w-md overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] leading-relaxed text-[var(--lit-navy,#0B2545)]">
                              {JSON.stringify(r.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {page.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]"
                      >
                        No audit records match the selected filter parameters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {nextCursor ? (
            <div className="flex justify-end pt-2">
              <Link
                href={`/admin/audit${qs({ cursor: nextCursor })}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-4 py-2 text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-xs transition-colors hover:bg-slate-50"
              >
                <span>Older Records</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
