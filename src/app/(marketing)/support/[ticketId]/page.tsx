import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, HelpCircle, MessageSquare, ShieldCheck, Ticket } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PageShell from "@/components/layout/page-shell";

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

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div>
          <BackButton fallbackHref="/support" label="Back to Support Hub" inline />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase block mb-1">
                Ticket ID: {ticket.id}
              </span>
              <h1 className="uppercase text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {ticket.subject}
              </h1>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider self-start sm:self-auto ${
                ticket.status === "Open"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Original Submission
            </h2>
            <div className="p-5 rounded-2xl bg-[#07090D] border border-white/5 text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-mono">
              {ticket.message}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-3 font-mono">
            <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
            <span className="text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Assigned to On-Call Systems Architect</span>
            </span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
