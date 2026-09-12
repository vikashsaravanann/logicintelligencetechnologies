import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Globe, User, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Consultation Bookings | Admin Command Center",
};

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Consultation Bookings Ledger
          </h1>
          <p className="text-zinc-400 text-sm">
            Scheduled client discovery sessions, architectural reviews, and scoping calls.
          </p>
        </div>

        <Link
          href="/book-consultation"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
        >
          View Public Booking Form
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/50 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Client / Company</th>
                <th className="p-4">Session Format</th>
                <th className="p-4">Slot Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {bookings && bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{b.name}</div>
                      <div className="text-xs text-zinc-400">{b.email} {b.phone ? `· ${b.phone}` : ""}</div>
                      {b.company && <div className="text-[10px] text-zinc-500">{b.company}</div>}
                    </td>
                    <td className="p-4 text-xs font-semibold text-primary">
                      {b.consultation_type}
                    </td>
                    <td className="p-4 text-xs text-zinc-300">
                      <div>{new Date(b.slot_time).toLocaleDateString()}</div>
                      <div className="text-zinc-500 text-[10px]">{new Date(b.slot_time).toLocaleTimeString()} ({b.timezone})</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400 max-w-xs truncate">
                      {b.notes || "No notes"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-500 text-xs">
                    No consultation bookings scheduled yet.
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
