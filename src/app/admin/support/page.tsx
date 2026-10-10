import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import { SupportQueueTable, type TicketRow } from "./support-queue-table";
import { LifeBuoy, ShieldAlert, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support Desk Queue | Admin Command Center | Logic Intelligence Technologies",
  description: "Enterprise ticket triage, client inquiries, priority escalation, and SLA tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminSupportPage() {
  await requireCapabilityPage("support.read", "/admin/support");

  const { data: rawTickets, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  const tickets = (rawTickets ?? []) as TicketRow[];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <LifeBuoy className="w-3 h-3" />
              Support Desk
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              SLA Managed Queue
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Support Desk Queue
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Triage client issues, bug alerts, and feature requests. Ticket content stays inside the admin console — not on public routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            <span>Public Support Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
          </Link>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Database Error
          </div>
          Could not load support tickets from the database.
        </div>
      ) : (
        <SupportQueueTable tickets={tickets} />
      )}
    </div>
  );
}
