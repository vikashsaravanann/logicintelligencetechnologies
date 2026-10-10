"use client";

import { useState } from "react";
import BackToHome from "@/components/ui/back-to-home";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  User,
  Mail,
  Phone,
  Building,
  FileText
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { trackEvent } from "@/lib/analytics";

const CONSULTATION_TYPES = [
  {
    id: "discovery",
    title: "Technical Discovery Call",
    duration: "30 Mins",
    desc: "Initial project scoping, requirements analysis, architecture feasibility, and ballpark estimation.",
  },
  {
    id: "ai-architecture",
    title: "Enterprise AI Architecture Session",
    duration: "45 Mins",
    desc: "In-depth review of your data pipeline, LLM/RAG integration, model latency, and cloud infrastructure.",
  },
  {
    id: "full-stack",
    title: "Full-Stack System Scoping",
    duration: "60 Mins",
    desc: "Comprehensive database modeling, API specification, security compliance, and delivery timeline planning.",
  },
];

const TIMEZONES = [
  { label: "India Standard Time (IST) UTC+5:30", value: "Asia/Kolkata" },
  { label: "Eastern Time (US & Canada) UTC-5:00", value: "America/New_York" },
  { label: "Pacific Time (US & Canada) UTC-8:00", value: "America/Los_Angeles" },
  { label: "Greenwich Mean Time (GMT) UTC+0:00", value: "Europe/London" },
  { label: "Singapore Time (SGT) UTC+8:00", value: "Asia/Singapore" },
  { label: "Gulf Standard Time (GST) UTC+4:00", value: "Asia/Dubai" },
];

const AVAILABLE_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

export default function BookConsultationPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(CONSULTATION_TYPES[0]);
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[0].value);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    setError(null);

    const slotDateTime = `${selectedDate}T${selectedSlot}:00Z`;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          consultationType: selectedType.title,
          slotTime: slotDateTime,
          timezone: selectedTimezone,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to schedule booking.");
      }

      trackEvent("consultation_booked", {
        service: selectedType.title,
        timezone: selectedTimezone,
      });

      const queryParams = new URLSearchParams({
        name,
        type: selectedType.title,
        date: selectedDate,
        slot: selectedSlot,
        tz: selectedTimezone,
      });

      router.push(`/booking/success?${queryParams.toString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Book Consultation", path: "/book-consultation" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Hero Section */}
        <div className="mt-8 mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <CalendarIcon className="w-3.5 h-3.5" />
            Engineering Consultation Schedule
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            Schedule a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Technical Briefing</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Direct 1-on-1 architecture review with our Principal Engineers. Scrutinize latency requirements, data compliance, and full-stack feasibility.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="max-w-4xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Select Consultation Format */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">
                1. Select Consultation Format
              </h2>
              <span className="text-xs font-mono text-slate-500 uppercase">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONSULTATION_TYPES.map((type) => {
                const isSelected = selectedType.id === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`cursor-pointer p-8 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-cyan-400 bg-[#151922] shadow-[0_0_25px_rgba(69,217,210,0.15)] ring-1 ring-cyan-400/50"
                        : "border-white/10 bg-[#10131A] hover:border-white/20 hover:bg-[#151922]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
                          <Clock className="w-3 h-3" />
                          {type.duration}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <h3 className="text-base font-bold text-white uppercase font-heading tracking-wide mb-2">
                        {type.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Slot Selection */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">
                2. Choose Date, Slot & Timezone
              </h2>
              <span className="text-xs font-mono text-slate-500 uppercase">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Timezone */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A]">
                <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Your Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#151922] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value} className="bg-[#10131A]">
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A]">
                <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#151922] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Slots */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#10131A]">
                <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Available Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isSlot = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                          isSlot
                            ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(69,217,210,0.35)]"
                            : "bg-[#151922] border border-white/5 text-slate-300 hover:border-cyan-500/40"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Contact & Project Briefing Details */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">
                3. Contact Information
              </h2>
              <span className="text-xs font-mono text-slate-500 uppercase">Step 3 of 3</span>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#151922] shadow-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Work Email <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@enterprise.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Systems"
                    className="w-full px-4 py-3 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Architecture Notes / Topics to Discuss
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline your existing stack, cloud provider, latency targets, or compliance requirements…"
                  className="w-full px-4 py-3 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Calendar invite with Google Meet / Teams link dispatched automatically.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reserving Slot…</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>
    </PageShell>
  );
}
