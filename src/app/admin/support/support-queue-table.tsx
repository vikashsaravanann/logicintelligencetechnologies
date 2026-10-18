"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Flame,
  User,
  Mail,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { formatIST } from "@/lib/format/datetime";

export interface TicketRow {
  id: string;
  created_at: string | null;
  subject: string;
  message: string;
  status: string;
  user_id: string | null;
  requester_name?: string | null;
  requester_email?: string | null;
  priority?: string | null;
  source?: string | null;
  page_url?: string | null;
}

interface SupportQueueTableProps {
  tickets: TicketRow[];
}

export function getStatusBadge(status?: string | null) {
  const s = (status || "Open").toLowerCase().replace(/_/g, " ").trim();
  if (s === "open") {
    return {
      label: "Open",
      classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
    };
  }
  if (s === "in progress") {
    return {
      label: "In Progress",
      classes: "border-blue-200 bg-blue-50 text-blue-800",
      dot: "bg-blue-500",
    };
  }
  if (s === "waiting on client" || s === "waiting") {
    return {
      label: "Waiting on Client",
      classes: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    };
  }
  if (s === "resolved") {
    return {
      label: "Resolved",
      classes: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
    };
  }
  if (s === "closed") {
    return {
      label: "Closed",
      classes: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
    };
  }
  return {
    label: status || "Open",
    classes: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-400",
  };
}

export function getPriorityBadge(priority?: string | null) {
  const p = (priority || "Medium").toLowerCase().trim();
  if (p === "urgent") {
    return {
      label: "Urgent",
      classes: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      slaHours: 4,
    };
  }
  if (p === "high") {
    return {
      label: "High",
      classes: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      slaHours: 8,
    };
  }
  if (p === "medium") {
    return {
      label: "Medium",
      classes: "border-blue-200 bg-blue-50 text-blue-800",
      dot: "bg-blue-500",
      slaHours: 24,
    };
  }
  if (p === "low") {
    return {
      label: "Low",
      classes: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
      slaHours: 48,
    };
  }
  return {
    label: priority || "Medium",
    classes: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
    slaHours: 24,
  };
}

export function getSlaStatus(ticket: TicketRow) {
  const isCompleted = ["resolved", "closed"].includes((ticket.status || "").toLowerCase());
  if (isCompleted) {
    return {
      label: "SLA Met",
      sublabel: "Resolved",
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      icon: CheckCircle2,
      isBreached: false,
    };
  }

  const pConfig = getPriorityBadge(ticket.priority);
  const targetHours = pConfig.slaHours;

  if (!ticket.created_at) {
    return {
      label: "SLA Active",
      sublabel: `${targetHours}h Target`,
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      icon: Clock,
      isBreached: false,
    };
  }

  const elapsedMs = Date.now() - new Date(ticket.created_at).getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours > targetHours) {
    const overdueHours = Math.round(elapsedHours - targetHours);
    return {
      label: "Breached",
      sublabel: `+${overdueHours}h overdue`,
      badge: "border-rose-200 bg-rose-50 text-rose-800",
      icon: ShieldAlert,
      isBreached: true,
    };
  }

  const hoursRemaining = targetHours - elapsedHours;
  if (hoursRemaining <= 2) {
    return {
      label: "At Risk",
      sublabel: `< ${Math.ceil(hoursRemaining)}h left`,
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      icon: Flame,
      isBreached: false,
    };
  }

  return {
    label: "On Track",
    sublabel: `${Math.round(hoursRemaining)}h left (${targetHours}h SLA)`,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: ShieldCheck,
    isBreached: false,
  };
}

const STATUS_TABS = [
  { id: "all", label: "All Tickets" },
  { id: "Open", label: "Open" },
  { id: "In Progress", label: "In Progress" },
  { id: "Waiting on Client", label: "Waiting on Client" },
  { id: "Resolved", label: "Resolved" },
  { id: "Closed", label: "Closed" },
] as const;

export function SupportQueueTable({ tickets }: SupportQueueTableProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Tab filter
      if (activeTab !== "all") {
        const normStatus = (t.status || "Open").toLowerCase().replace(/_/g, " ").trim();
        const tabNorm = activeTab.toLowerCase().replace(/_/g, " ").trim();
        if (normStatus !== tabNorm) return false;
      }

      // Priority filter
      if (priorityFilter !== "all") {
        const normPriority = (t.priority || "Medium").toLowerCase().trim();
        if (normPriority !== priorityFilter.toLowerCase().trim()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const subjectMatch = t.subject?.toLowerCase().includes(q);
        const messageMatch = t.message?.toLowerCase().includes(q);
        const emailMatch = t.requester_email?.toLowerCase().includes(q);
        const nameMatch = t.requester_name?.toLowerCase().includes(q);
        const idMatch = t.id?.toLowerCase().includes(q);
        if (!subjectMatch && !messageMatch && !emailMatch && !nameMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeTab, priorityFilter, searchQuery]);

  // Telemetry metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(
    (t) => !["resolved", "closed"].includes((t.status || "").toLowerCase())
  ).length;
  const urgentCount = tickets.filter(
    (t) =>
      ["urgent", "high"].includes((t.priority || "").toLowerCase()) &&
      !["resolved", "closed"].includes((t.status || "").toLowerCase())
  ).length;
  const resolvedCount = tickets.filter((t) =>
    ["resolved", "closed"].includes((t.status || "").toLowerCase())
  ).length;
  const resolvedRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const isFiltered = activeTab !== "all" || priorityFilter !== "all" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setActiveTab("all");
    setPriorityFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Tickets
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <LifeBuoy className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {totalCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Logged support inquiries</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Open & In Triage
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {openCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Active client cases</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Urgent / High
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {urgentCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">SLA critical priority</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Resolved Rate
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {totalCount > 0 ? `${resolvedRate}%` : "—"}
            </span>
            <span className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)]">
              ({resolvedCount} closed)
            </span>
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Historical resolution</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, subject, email or keyword..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-navy,#0B2545)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:bg-white transition-colors"
            />
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--lit-text-muted,#52677C)] hidden sm:block" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-[var(--lit-navy,#0B2545)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)]"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] rounded-xl border border-[var(--lit-border-light,#DFE7EF)] transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[var(--lit-border-light,#DFE7EF)] pt-3">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "all"
                ? tickets.length
                : tickets.filter(
                    (t) =>
                      (t.status || "Open").toLowerCase().replace(/_/g, " ").trim() ===
                      tab.id.toLowerCase().replace(/_/g, " ").trim()
                  ).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                    : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ticket Ledger Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Support Desk Queue
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
            Showing {filteredTickets.length} of {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Ticket ID</th>
                <th className="px-6 py-3.5 font-semibold">Subject & Context</th>
                <th className="px-6 py-3.5 font-semibold">Requester</th>
                <th className="px-6 py-3.5 font-semibold">Priority</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">SLA Window</th>
                <th className="px-6 py-3.5 font-semibold">Created</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => {
                  const statusCfg = getStatusBadge(t.status);
                  const priorityCfg = getPriorityBadge(t.priority);
                  const sla = getSlaStatus(t);
                  const SlaIcon = sla.icon;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors group"
                    >
                      {/* Monospace Ticket ID */}
                      <td className="px-6 py-4 align-top">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors inline-flex items-center gap-1"
                        >
                          <span>#{t.id.slice(0, 8)}</span>
                        </Link>
                      </td>

                      {/* Subject & Preview */}
                      <td className="px-6 py-4 align-top max-w-md">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="font-bold text-sm text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors line-clamp-1"
                        >
                          {t.subject}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] line-clamp-2 leading-relaxed">
                          {t.message}
                        </p>
                      </td>

                      {/* Requester */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-xs text-[var(--lit-navy,#0B2545)] truncate max-w-[200px]">
                          {t.requester_name || t.requester_email || "Client User"}
                        </div>
                        {t.requester_email && t.requester_name && (
                          <div className="text-[11px] text-[var(--lit-text-muted,#52677C)] truncate max-w-[200px]">
                            {t.requester_email}
                          </div>
                        )}
                        <div className="mt-1">
                          {t.user_id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                              <User className="w-2.5 h-2.5" />
                              Client Account
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                              <Mail className="w-2.5 h-2.5" />
                              Web Guest
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityCfg.classes}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                          {priorityCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.classes}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* SLA Status */}
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sla.badge}`}
                          >
                            <SlaIcon className="w-3 h-3" />
                            {sla.label}
                          </span>
                          <div className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                            {sla.sublabel}
                          </div>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 align-top text-xs text-[var(--lit-text-muted,#52677C)] whitespace-nowrap">
                        {t.created_at ? formatIST(t.created_at, "datetime") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] text-xs font-bold hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mx-auto text-[var(--lit-text-muted,#52677C)]">
                        <LifeBuoy className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                        No tickets matching criteria
                      </div>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                        {isFiltered
                          ? "Try clearing your search keyword or selecting a different status tab."
                          : "Support queue is clear. No client inquiries have been submitted yet."}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-100 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
