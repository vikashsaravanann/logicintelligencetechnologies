import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../components/AdminBackLink";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Tag,
  Inbox,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Outbound Email Dispatch Log | Admin | Logic Intelligence Technologies",
  description: "Live outbound email activity, delivery audit ledger, and SMTP dispatch tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function getStatusBadge(statusRaw: string | null | undefined) {
  const status = (statusRaw || "queued").toLowerCase();

  if (status === "delivered" || status === "success" || status === "succeeded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Delivered
      </span>
    );
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue,#1565C0)]" />
        Sent
      </span>
    );
  }

  if (status === "bounced") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Bounced
      </span>
    );
  }

  if (
    status === "failed" ||
    status === "dead_letter" ||
    status === "error" ||
    status === "suppressed" ||
    status === "cancelled"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Failed
      </span>
    );
  }

  if (
    status === "queued" ||
    status === "pending" ||
    status === "processing" ||
    status === "retrying"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {status === "pending" ? "Pending" : status === "retrying" ? "Retrying" : "Queued"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200 bg-slate-50 text-slate-700 capitalize">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {status}
    </span>
  );
}

export default async function EmailsPage() {
  await requireCapabilityPage("emails.read", "/admin/emails");

  const [statusRes, recentRes, auditCountRes] = await Promise.all([
    supabaseAdmin.from("email_outbox").select("status"),
    supabaseAdmin.from("email_outbox").select("*").order("created_at", { ascending: false }).limit(50),
    supabaseAdmin.from("email_admin_audit").select("*", { count: "exact", head: true }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    const s = String((row as { status: string | null }).status ?? "unknown").toLowerCase();
    counts[s] = (counts[s] ?? 0) + 1;
  }
  const total = (statusRes.data ?? []).length;
  const recent = (recentRes.data ?? []) as Array<Record<string, unknown>>;

  const sentCount = counts["sent"] ?? 0;
  const deliveredCount =
    (counts["delivered"] ?? 0) + (counts["success"] ?? 0) + (counts["succeeded"] ?? 0);
  const failedCount =
    (counts["failed"] ?? 0) + (counts["dead_letter"] ?? 0) + (counts["error"] ?? 0);
  const bouncedCount = (counts["bounced"] ?? 0) + (counts["suppressed"] ?? 0);
  const queuedCount =
    (counts["queued"] ?? 0) +
    (counts["pending"] ?? 0) +
    (counts["processing"] ?? 0) +
    (counts["retrying"] ?? 0);

  const str = (r: Record<string, unknown>, ...keys: string[]) => {
    for (const k of keys) if (typeof r[k] === "string" && r[k]) return r[k] as string;
    return "—";
  };

  const getTemplateTag = (r: Record<string, unknown>) => {
    if (typeof r.template_key === "string" && r.template_key.trim()) return r.template_key;
    if (typeof r.event_type === "string" && r.event_type.trim()) return r.event_type;
    if (typeof r.category === "string" && r.category.trim()) return r.category;
    return "—";
  };

  const getSentAt = (r: Record<string, unknown>) => {
    if (typeof r.sent_at === "string" && r.sent_at) return r.sent_at;
    if (typeof r.created_at === "string" && r.created_at) return r.created_at;
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Mail className="w-3 h-3" />
              Dispatch Ledger
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              SMTP Outbox
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Outbound Email Dispatch Log
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Live counts from the SMTP outbox. Administrative email actions are also audited.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/emails/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--lit-navy,#0B2545)]/90 shadow-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
          >
            <Send className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Compose Email</span>
          </Link>
        </div>
      </div>

      {/* Error state if outbox query failed */}
      {statusRes.error && (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-800 shadow-xs flex items-center gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-semibold">Could not load the email outbox.</p>
            <p className="text-xs text-rose-700 mt-0.5">Please check database permissions or network connectivity.</p>
          </div>
        </div>
      )}

      {/* KPI Tiles: Sent, Delivered, Failed, Bounced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sent */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Sent
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-blue,#1565C0)]">
              {statusRes.error ? "—" : sentCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Dispatched outbox records</p>
          </div>
        </div>

        {/* Delivered */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Delivered
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {statusRes.error ? "—" : deliveredCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Confirmed delivery events</p>
          </div>
        </div>

        {/* Failed */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Failed
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {statusRes.error ? "—" : failedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Execution / transport errors</p>
          </div>
        </div>

        {/* Bounced */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Bounced
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-600">
              {statusRes.error ? "—" : bouncedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Hard &amp; soft bounce events</p>
          </div>
        </div>
      </div>

      {/* Outbox & Audit Meta Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--lit-text-muted,#52677C)] px-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span>
            Outbox total:{" "}
            <strong className="font-mono font-semibold text-[var(--lit-navy,#0B2545)]">
              {statusRes.error ? "—" : total}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Audited admin email actions:{" "}
            <strong className="font-mono font-semibold text-[var(--lit-navy,#0B2545)]">
              {auditCountRes.error ? "unavailable" : (auditCountRes.count ?? 0)}
            </strong>
          </span>
          {queuedCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-amber-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <strong className="font-mono">{queuedCount}</strong> queued in outbox
              </span>
            </>
          )}
        </div>
      </div>

      {/* Outbox Dispatch Data Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <Inbox className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Recent Dispatch Activity ({recent.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
              <tr>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Template / Tag</th>
                <th className="px-5 py-3.5">Sent At</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {recent.map((r, i) => {
                const recipient = str(r, "recipient", "to_email", "to", "email");
                const subject = str(r, "subject");
                const templateTag = getTemplateTag(r);
                const sentAt = getSentAt(r);
                const statusRaw = (typeof r.status === "string" ? r.status : null) ?? "queued";

                return (
                  <tr key={(r.id as string) ?? i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-slate-100 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                          {recipient}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--lit-navy,#0B2545)] max-w-[280px]">
                      <span className="line-clamp-1 font-medium" title={subject}>
                        {subject}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {templateTag !== "—" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 font-mono text-[11px] font-medium text-[var(--lit-navy,#0B2545)]">
                          <Tag className="w-2.5 h-2.5 text-[var(--lit-text-muted,#52677C)]" />
                          {templateTag}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[var(--lit-text-muted,#52677C)] whitespace-nowrap">
                      {sentAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatIST(sentAt, "datetime")}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(statusRaw)}
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Mail className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-[var(--lit-navy,#0B2545)]">No outbox entries yet</span>
                      <span className="text-xs text-slate-400">
                        Emails dispatched via the SMTP outbox will appear in this ledger.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
