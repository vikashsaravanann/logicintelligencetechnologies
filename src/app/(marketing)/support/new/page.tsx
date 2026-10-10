"use client";

import { useState } from "react";
import BackButton from "@/components/navigation/back-button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, HelpCircle, Loader2, Send, ShieldAlert } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          priority,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create support ticket.");
      }

      router.push(`/support/${data.ticketId}`);
    } catch (err: any) {
      setError(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#07090D] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors font-sans";
  const labelClass =
    "block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2";

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <BackButton fallbackHref="/support" label="Back to Support Hub" inline />
        </div>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Direct Engineering Intake</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mb-2">
            Submit Support Ticket
          </h1>
          <p className="text-sm text-zinc-400 font-light">
            Our engineering team will triage your issue according to selected priority and response SLA.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Corporate Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@vance.io"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className={labelClass}>Subject / Issue Summary *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Database connection timeout during peak webhook payload"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-4">
              <label className={labelClass}>Severity Level</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className={inputClass}
              >
                <option value="Low" className="bg-[#10131A]">Low (Inquiry)</option>
                <option value="Medium" className="bg-[#10131A]">Medium (Minor Glitch)</option>
                <option value="High" className="bg-[#10131A]">High (Degradation)</option>
                <option value="Critical" className="bg-[#10131A]">Critical (Outage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Detailed Description & Logs *</label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe steps to reproduce, affected endpoint URLs, stack traces, and environment details..."
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Ticket…</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Ticket to Engineers</span>
              </>
            )}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
