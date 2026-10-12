"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Sparkles,
  Lock,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";
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

  function parseSlotToTime(slot: string): string {
    const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return "10:00:00";
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const modifier = match[3];
    if (modifier) {
      if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${mins}:00`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    setError(null);

    const timePart = parseSlotToTime(selectedSlot);
    const slotDateTime = `${selectedDate}T${timePart}Z`;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          consultationType: selectedType.title,
          slotTime: slotDateTime,
          timezone: selectedTimezone,
          notes: notes.trim() || undefined,
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

      const bookingRef = data.requestId || data.bookingId || "";
      const queryParams = new URLSearchParams({
        name,
        type: selectedType.title,
        date: selectedDate,
        slot: selectedSlot,
        tz: selectedTimezone,
        ref: bookingRef,
        status: data.status || "received",
      });

      router.push(`/booking/success?${queryParams.toString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 transition-all text-sm font-sans";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Book Consultation", path: "/book-consultation" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Engineering Consultation Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.12] mb-4">
            Schedule a <span className="text-[#1565C0]">Technical Briefing</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Direct 1-on-1 architecture review with our Principal Engineers. Scrutinize latency requirements, data compliance, and full-stack feasibility before committing capital.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Select Consultation Format */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                1. Select Consultation Format
              </h2>
              <span className="text-xs font-semibold text-slate-400 uppercase">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONSULTATION_TYPES.map((type) => {
                const isSelected = selectedType.id === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`cursor-pointer p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#1565C0] bg-white ring-2 ring-[#1565C0]/20 shadow-md"
                        : "border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          {type.duration}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1565C0]" />}
                      </div>
                      <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">
                        {type.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
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
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                2. Choose Date, Slot & Timezone
              </h2>
              <span className="text-xs font-semibold text-slate-400 uppercase">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timezone */}
              <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1565C0]" />
                  Your Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-900 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 transition-all"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-2">
                  Slots automatically align to your selected local time.
                </p>
              </div>

              {/* Date */}
              <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2.5 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#1565C0]" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-900 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Consultations run Monday through Friday.
                </p>
              </div>

              {/* Slots */}
              <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1565C0]" />
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
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                          isSlot
                            ? "bg-[#1565C0] text-white shadow-sm"
                            : "bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 hover:border-slate-300"
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

          {/* Step 3: Contact Information */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                3. Contact Information & Brief
              </h2>
              <span className="text-xs font-semibold text-slate-400 uppercase">Step 3 of 3</span>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-[#1565C0]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Work Email <span className="text-[#1565C0]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@enterprise.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Phone / WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Systems Inc."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Architecture Notes / Topics to Discuss</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline your existing stack, cloud provider (AWS/GCP/Azure), latency targets, or compliance requirements…"
                  className={inputClass}
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1FA9A2] shrink-0" />
                  <span>Calendar invite with Google Meet / Teams link dispatched automatically.</span>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Reserving Slot…</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Consultation</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Value Proposition & Integrity Pillars */}
        <section className="mt-20 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                NDA Standards Guaranteed
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All architectural briefings are conducted under mutual non-disclosure standards. We never share proprietary system details or roadmaps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                Direct Engineering Lead
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You speak directly with a practicing solutions architect or principal engineer, not a junior sales development representative.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">
                Actionable Follow-up
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive an executive briefing memo within 24 hours summarizing discussed topology, identified bottlenecks, and recommended timelines.
              </p>
            </div>
          </div>
        </section>

        {/* Canonical Deep Navy CTA */}
        <CTASection
          title="Looking to Explore Turnkey Engagement Models?"
          subtitle="Review our transparent engineering packages or test your parameters in the ROI calculator before booking."
          primaryCta={{
            label: "Explore Packages",
            href: "/packages",
          }}
          secondaryCta={{
            label: "Calculate System ROI",
            href: "/roi-calculator",
          }}
        />
      </div>
    </main>
  );
}
