import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { SupportTicketActions } from "./support-ticket-actions";
import { formatIST } from "@/lib/format/datetime";
import {
  LifeBuoy,
  Clock,
  User,
  Mail,
  Building2,
  ExternalLink,
  ShieldCheck,
  Lock,
  MessageSquare,
  AlertCircle,
  FileText,
  Calendar,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Ticket Details | Admin Command Center | Logic Intelligence Technologies",
  description: "Enterprise ticket inspection, thread history, triage actions, and client communications.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

function getStatusBadge(status?: string | null) {
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

function getPriorityBadge(priority?: string | null) {
  const p = (priority || "Medium").toLowerCase().trim();
  if (p === "urgent") {
    return {
      label: "Urgent",
      classes: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      slaTarget: "4 Hours",
    };
  }
  if (p === "high") {
    return {
      label: "High",
      classes: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      slaTarget: "8 Hours",
    };
  }
  if (p === "medium") {
    return {
      label: "Medium",
      classes: "border-blue-200 bg-blue-50 text-blue-800",
      dot: "bg-blue-500",
      slaTarget: "24 Hours",
    };
  }
  if (p === "low") {
    return {
      label: "Low",
      classes: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
      slaTarget: "48 Hours",
    };
  }
  return {
    label: priority || "Medium",
    classes: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
    slaTarget: "24 Hours",
  };
}

export default async function AdminSupportDetailPage({ params }: Props) {
  await requireCapabilityPage("support.read", "/admin/support");
  const { id } = await params;
  await requireAdminPage(`/admin/support/${id}`);

  const { data: ticket, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const { data: messages } = await supabaseAdmin
    .from("support_ticket_messages")
    .select("id, ticket_id, sender_type, sender_name, sender_id, message, attachments, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  let clientProfile: {
    full_name?: string | null;
    company_name?: string | null;
  } | null = null;

  if (ticket.user_id) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", ticket.user_id)
      .maybeSingle();
    clientProfile = profile;
  }

  const statusCfg = getStatusBadge(ticket.status);
  const priorityCfg = getPriorityBadge(ticket.priority);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/support" label="Back to Support Queue" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                ID: {ticket.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityCfg.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                {priorityCfg.label} Priority
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
              {ticket.subject}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[var(--lit-text-muted,#52677C)] flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Opened: {ticket.created_at ? formatIST(ticket.created_at, "datetime") : "—"}
              </span>
              {ticket.requester_email && (
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  {ticket.requester_email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Original Submission, Message History Timeline, and Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Original Submission Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  Original Ticket Submission
                </h2>
              </div>
              <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                {ticket.created_at ? formatIST(ticket.created_at, "time") : ""}
              </span>
            </div>

            <div className="bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-4 text-sm text-[var(--lit-navy,#0B2545)] whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </div>

            {ticket.page_url && (
              <div className="pt-2 text-xs text-[var(--lit-text-muted,#52677C)] flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted from route:</span>
                <Link
                  href={ticket.page_url}
                  target="_blank"
                  className="font-mono text-[var(--lit-teal,#1FA9A2)] hover:underline inline-flex items-center gap-1"
                >
                  <span>{ticket.page_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Conversation History Timeline / Chat Bubbles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  Conversation Thread
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
                {messages?.length || 0} {messages?.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((m) => {
                  const isAgent = m.sender_type === "agent";
                  const isInternal = m.sender_type === "internal";

                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl border p-5 shadow-2xs transition-all ${
                        isInternal
                          ? "border-amber-200 bg-amber-50/70 text-amber-950"
                          : isAgent
                          ? "border-blue-200 bg-blue-50/50 text-[var(--lit-navy,#0B2545)]"
                          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)]"
                      }`}
                    >
                      {/* Thread Item Header */}
                      <div className="mb-2.5 flex items-center justify-between text-xs pb-2 border-b border-black/5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {isInternal ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-300 bg-amber-100 text-amber-900">
                              <Lock className="w-2.5 h-2.5" />
                              Internal Staff Note
                            </span>
                          ) : isAgent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-300 bg-blue-100 text-blue-900">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              LIT Support Staff
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-300 bg-slate-100 text-slate-800">
                              <User className="w-2.5 h-2.5" />
                              Client
                            </span>
                          )}
                          <span className="font-semibold text-xs text-[var(--lit-navy,#0B2545)]">
                            {m.sender_name}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                          {formatIST(m.created_at, "datetime")}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p
                        className={`whitespace-pre-wrap leading-relaxed text-sm ${
                          isInternal ? "text-amber-950 font-medium" : "text-[var(--lit-navy,#0B2545)]"
                        }`}
                      >
                        {m.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 text-center shadow-2xs space-y-2">
                <MessageSquare className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                  No replies yet in this ticket thread
                </div>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
                  Use the composer below to draft an email response to the client or log private internal notes.
                </p>
              </div>
            )}
          </div>

          {/* Action Hub & Reply Composer */}
          <div className="pt-2">
            <SupportTicketActions
              ticketId={ticket.id}
              email={ticket.requester_email || ""}
              status={ticket.status}
              priority={ticket.priority || "Medium"}
            />
          </div>
        </div>

        {/* Right Sidebar: Client Card & SLA Telemetry */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  Requester Card
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)]">
                {ticket.user_id ? "Client Account" : "Guest Contact"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  Full Name / Contact
                </label>
                <div className="text-sm font-bold text-[var(--lit-navy,#0B2545)] mt-0.5">
                  {ticket.requester_name || clientProfile?.full_name || "Enterprise User"}
                </div>
                {clientProfile?.company_name && (
                  <div className="text-xs text-[var(--lit-text-muted,#52677C)] flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    <span>{clientProfile.company_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  Email Address
                </label>
                <div className="text-sm font-mono text-[var(--lit-navy,#0B2545)] mt-0.5 break-all">
                  {ticket.requester_email ? (
                    <a
                      href={`mailto:${ticket.requester_email}`}
                      className="text-[var(--lit-teal,#1FA9A2)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{ticket.requester_email}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[var(--lit-text-muted,#52677C)]">Linked Client Account</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  Origin Source
                </label>
                <div className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] mt-0.5">
                  {ticket.source || "web-form"}
                </div>
              </div>

              {ticket.user_id && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                    Linked User ID
                  </label>
                  <div className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] mt-0.5 break-all bg-[var(--lit-cloud,#F7F9FC)] p-2 rounded-lg border border-[var(--lit-border-light,#DFE7EF)]">
                    {ticket.user_id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Telemetry & SLA Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <Clock className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                SLA & Operations Telemetry
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-[var(--lit-text-muted,#52677C)]">SLA Commitment</span>
                <span className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                  {priorityCfg.slaTarget}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-[var(--lit-text-muted,#52677C)]">Current Priority</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityCfg.classes}`}
                >
                  {priorityCfg.label}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-[var(--lit-text-muted,#52677C)]">Current Status</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusCfg.classes}`}
                >
                  {statusCfg.label}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-[var(--lit-text-muted,#52677C)]">Thread Messages</span>
                <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                  {messages?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-[var(--lit-text-muted,#52677C)]">First Logged</span>
                <span className="font-mono text-[var(--lit-navy,#0B2545)] text-[11px]">
                  {ticket.created_at ? formatIST(ticket.created_at, "datetime") : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
