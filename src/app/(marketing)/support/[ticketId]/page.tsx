import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Ticket,
  ArrowRight,
  User,
  Mail,
  AlertCircle,
  Plus,
  LifeBuoy,
  Activity,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import CopyTicketIdButton from "./components/CopyTicketIdButton";

interface Props {
  params: Promise<{ ticketId: string }>;
}

export const metadata: Metadata = {
  title: "Ticket Details | Support Desk",
  robots: { index: false, follow: false },
};

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;

  const { data: ticket, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Support", path: "/support" },
    { name: `Ticket ${ticketId.slice(0, 8)}`, path: `/support/${ticketId}` },
  ];

  const isResolved =
    ticket.status?.toLowerCase() === "resolved" ||
    ticket.status?.toLowerCase() === "closed";

  const priorityColor =
    ticket.priority === "Critical"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : ticket.priority === "High"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : ticket.priority === "Medium"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <PageShell>
      <JsonLd data={breadcrumb(breadcrumbItems)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back button */}
          <div>
            <BackButton fallbackHref="/support" label="Back to Support Hub" inline />
          </div>

          {/* Main Ticket Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 space-y-6 shadow-sm">
            {/* Header: Ticket ID, Subject, Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#1565C0] uppercase tracking-wider">
                    Ticket ID: {ticket.id}
                  </span>
                  <CopyTicketIdButton ticketId={ticket.id} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-[var(--lit-navy,#0B2545)] tracking-tight leading-snug">
                  {ticket.subject}
                </h1>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                {ticket.priority && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${priorityColor}`}
                  >
                    {ticket.priority}
                  </span>
                )}
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                    isResolved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]"
                  }`}
                >
                  {ticket.status || "Open"}
                </span>
              </div>
            </div>

            {/* Requester & Timestamp Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-text-muted,#52677C)]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">
                  {ticket.requester_name || "Enterprise User"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 truncate">
                  {ticket.requester_email || "Email on file"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Original Submission Body */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Submitted Technical Details
              </h2>
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-sm text-[var(--lit-ink,#121826)] whitespace-pre-line leading-relaxed font-mono overflow-x-auto">
                {ticket.message}
              </div>
            </div>

            {/* Status & Engineering Escalation Banner */}
            <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Assigned to Site Reliability Engineering (SRE) On-Call Desk</span>
              </div>
              <span className="font-mono text-slate-500">
                SLA Status: Active Resolution Window
              </span>
            </div>
          </div>

          {/* Quick Actions Navigation Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/support/new"
              className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group flex items-center justify-between text-xs font-semibold text-[var(--lit-navy,#0B2545)]"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1565C0]" />
                <span>Submit Another Ticket</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/help-center"
              className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group flex items-center justify-between text-xs font-semibold text-[var(--lit-navy,#0B2545)]"
            >
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#5E35B1]" />
                <span>Browse Help Center</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/status"
              className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group flex items-center justify-between text-xs font-semibold text-[var(--lit-navy,#0B2545)]"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>System Health & Status</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Canonical CTA Section */}
        <div className="mt-20">
          <CTASection
            title="Have Additional Architecture Questions?"
            subtitle="Schedule an engineering review or speak with our solutions architect for mission-critical deployments."
            primaryCta={{
              label: "Schedule Consultation",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "View All Support Options",
              href: "/support",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
