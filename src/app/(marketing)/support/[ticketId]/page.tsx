import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Hub</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block mb-1">
                Ticket ID: {ticket.id}
              </span>
              <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                ticket.status === "Open"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Original Submission
            </h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
              {ticket.message}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-2">
            <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assigned to On-Call Architect</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
