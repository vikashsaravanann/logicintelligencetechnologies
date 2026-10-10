import type { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listMessagesByStatus } from "@/lib/outreach/intelligence/queues";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import { ApproveButton, BatchApproveButton } from "./approve-button";
import {
  Inbox,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Outreach Dispatch & Approval Queue | Admin | Logic Intelligence Technologies",
  description: "Human authorization gate for AI-assisted B2B client outreach drafts before dispatch.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface TabConfig {
  key: string;
  label: string;
  statuses: string[];
  icon: typeof Inbox;
  description: string;
}

const TABS: TabConfig[] = [
  {
    key: "review",
    label: "Needs Review",
    statuses: ["needs_review"],
    icon: Clock,
    description: "Generated drafts with evidence awaiting human verification.",
  },
  {
    key: "draft",
    label: "Drafts",
    statuses: ["draft"],
    icon: FileText,
    description: "Work-in-progress drafts and initial generation candidates.",
  },
  {
    key: "approved",
    label: "Approved & Scheduled",
    statuses: ["approved", "scheduled"],
    icon: CheckCircle2,
    description: "Authorized by admin; queued for transmission window.",
  },
  {
    key: "sent",
    label: "Dispatched",
    statuses: ["sent"],
    icon: Send,
    description: "Successfully dispatched messages with tracking ledger.",
  },
];

export default async function OutreachQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/queue");
  const sp = await searchParams;
  const currentTab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const rows = await listMessagesByStatus(currentTab.statuses);

  const passingDrafts = rows.filter((r) => r.blockers_pass);
  const passableIds = passingDrafts.map((r) => r.id);
  const blockedDrafts = rows.filter((r) => !r.blockers_pass);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/outreach" label="Outreach Pipeline" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Inbox className="w-3 h-3" />
              Dispatch Control Gate
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Human-in-the-Loop Required
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Outreach Dispatch &amp; Approval Queue
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            Human authorization gate for outbound communications. Messages will never auto-dispatch without
            satisfying all 10 QA blockers and explicit human authorization.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="queue" />
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Current Tab Total
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {rows.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">{currentTab.label} items</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              QA Passed (Ready)
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {passingDrafts.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Passed all blocker checks
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              QA Blocked
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {blockedDrafts.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Requires studio revision
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Quality Gate
            </span>
            <span className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {rows.length > 0
                ? `${Math.round((passingDrafts.length / rows.length) * 100)}%`
                : "100%"}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Pass rate in view</p>
          </div>
        </div>
      </div>

      {/* Subtabs for Lifecycle Statuses */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isSelected = t.key === currentTab.key;
            return (
              <Link
                key={t.key}
                href={`/admin/outreach/queue?tab=${t.key}`}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[var(--lit-teal,#1FA9A2)] text-white shadow-2xs"
                    : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Batch Approval Action on Review Tab */}
        {currentTab.key === "review" && passableIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <BatchApproveButton messageIds={passableIds} />
          </div>
        ) : null}
      </div>

      {/* Messages Feed */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            No messages in {currentTab.label.toLowerCase()}
          </h3>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            {currentTab.description} Generate drafts from verified leads in the Outreach Studio.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/outreach/studio"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#12365e] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              Open Outreach Studio
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 sm:p-6 shadow-2xs transition-all hover:shadow-xs"
            >
              {/* Header: Company & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/outreach/studio?lead=${m.business_id}`}
                      className="font-extrabold text-base text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{m.company_name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--lit-teal,#1FA9A2)]" />
                    </Link>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] uppercase">
                      v{m.version}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] uppercase">
                      {m.channel}
                    </span>
                    {m.opportunity_type ? (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-purple-200 bg-purple-50 text-purple-800">
                        {m.opportunity_type}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono">
                    Generated: {formatIST(m.generated_at, "datetime")}
                    {m.generated_by ? ` · by ${m.generated_by}` : ""}
                  </p>
                </div>

                {/* QA & Blocker Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {typeof m.qa_score === "number" ? (
                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        m.qa_score >= 48
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : m.qa_score >= 36
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      QA {m.qa_score}/60
                    </span>
                  ) : null}

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      m.blockers_pass
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                  >
                    {m.blockers_pass ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Pass</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Blocked</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Subject Line */}
              {m.subject ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/75 px-3.5 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                    Subject Line
                  </span>
                  <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                    {m.subject}
                  </p>
                </div>
              ) : null}

              {/* Message Body Box */}
              <div className="mt-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[#F8FAFC] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                  Draft Body
                </span>
                <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed scrollbar-thin">
                  {m.body}
                </pre>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {currentTab.key === "review" ? (
                    <ApproveButton messageId={m.id} disabled={!m.blockers_pass} />
                  ) : m.approved_by ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Approved by {m.approved_by} on {formatIST(m.approved_at, "datetime")}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                      Status: {m.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/outreach/studio?lead=${m.business_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-blue,#1565C0)] hover:underline"
                  >
                    <span>Inspect in Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
