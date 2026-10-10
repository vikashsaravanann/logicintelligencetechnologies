"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Ticket, AlertCircle } from "lucide-react";

export default function TicketLookupBar() {
  const router = useRouter();
  const [ticketInput, setTicketInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = ticketInput.trim();
    if (!cleanId) {
      setError("Please enter a valid Ticket ID or UUID.");
      return;
    }
    setError(null);
    router.push(`/support/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleLookup} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Ticket className="w-5 h-5 text-[#1565C0]" />
          </div>
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => {
              setTicketInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Track existing ticket (e.g. paste Ticket UUID)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-sm text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] shadow-sm focus:outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all font-sans"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Track</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 justify-center">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
