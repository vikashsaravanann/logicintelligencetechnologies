"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Send,
  ShieldAlert,
  Clock,
  Lock,
  FileCode,
  AlertCircle,
  Terminal,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

const PRIORITIES = [
  {
    value: "Low",
    label: "Low (Sev-4)",
    desc: "General inquiry or advisory",
    sla: "24h SLA",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    value: "Medium",
    label: "Medium (Sev-3)",
    desc: "Minor glitch or non-blocking defect",
    sla: "4h SLA",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "High",
    label: "High (Sev-2)",
    desc: "Performance degradation or workflow stall",
    sla: "1h SLA",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "Critical",
    label: "Critical (Sev-1)",
    desc: "Production outage or core inference down",
    sla: "15m SLA (24/7)",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
] as const;

type PriorityType = "Low" | "Medium" | "High" | "Critical";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Support", path: "/support" },
    { name: "New Ticket", path: "/support/new" },
  ];

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
      setError(err?.message || "An unexpected error occurred while submitting your ticket.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-3.5 text-sm text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all font-sans shadow-2xs";
  const labelClass =
    "block text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2";

  return (
    <PageShell>
      <JsonLd data={breadcrumb(breadcrumbItems)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-8">
            <BackButton fallbackHref="/support" label="Back to Support Hub" inline />
          </div>

          {/* Header Section */}
          <div className="mb-10 text-center sm:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Direct Engineering Intake</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Submit Support Ticket
            </h1>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
              Our site reliability and platform engineers will triage your issue according to the selected priority and contractual SLA commitment.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm mb-6 flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to submit ticket</p>
                <p className="font-light">{error}</p>
              </div>
            </div>
          )}

          {/* Main Submission Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 shadow-sm space-y-6"
          >
            {/* Name & Corporate Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
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
                  placeholder="e.g. marcus@enterprise.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Subject / Issue Summary */}
            <div>
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

            {/* Priority Selection Cards */}
            <div>
              <label className={labelClass}>
                Severity Level & SLA Commitment *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setPriority(p.value as PriorityType)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#1565C0] bg-[#E7F3FF]/40 ring-2 ring-[#1565C0]/20 shadow-xs"
                          : "border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                          {p.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}
                        >
                          {p.sla}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] leading-snug font-light">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Description & Logs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Detailed Description & Logs *</label>
                <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                  Markdown & Code blocks supported
                </span>
              </div>
              <textarea
                required
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe steps to reproduce, affected endpoint URLs, HTTP status codes, stack traces, and environment details..."
                className={`${inputClass} font-mono text-xs sm:text-sm leading-relaxed`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#45D9D2]" />
                  <span>Submitting to On-Call SRE…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#45D9D2]" />
                  <span>Submit Ticket to Engineers</span>
                </>
              )}
            </button>

            {/* Security Guarantee Strip */}
            <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--lit-text-muted,#52677C)] font-light">
                <Lock className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Encrypted at rest</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--lit-text-muted,#52677C)] font-light">
                <Clock className="w-3.5 h-3.5 text-[#00796B]" />
                <span>Automated SLA timer</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--lit-text-muted,#52677C)] font-light">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5E35B1]" />
                <span>Senior engineer assigned</span>
              </div>
            </div>
          </form>
        </div>
      </main>
    </PageShell>
  );
}
