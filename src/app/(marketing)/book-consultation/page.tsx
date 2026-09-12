"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Globe, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react";
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
        throw new Error(data.error || "Failed to schedule booking.");
      }

      trackEvent("consultation_booked", {
        service: selectedType.title,
        timezone: selectedTimezone,
      });

      router.push(
        `/booking/success?name=${encodeURIComponent(name)}&type=${encodeURIComponent(
          selectedType.title
        )}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(
          selectedSlot
        )}&tz=${encodeURIComponent(selectedTimezone)}`
      );
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Direct Access to Principal Engineers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 uppercase">
            Schedule a Technical <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Consultation</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Select a session format, pick a time that matches your schedule, and meet directly with our systems architects.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Select Session & Date/Time */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Session Type */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>1. Select Consultation Type</span>
              </h2>
              <div className="space-y-3">
                {CONSULTATION_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedType.id === type.id
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,191,255,0.1)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm sm:text-base text-white">{type.title}</h3>
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                        {type.duration}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Date, Timezone & Slot Picker */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>2. Select Date & Slot</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Timezone</span>
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                  Available Slots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedSlot === slot
                          ? "border-primary bg-primary text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Details & Submit */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-2">3. Your Contact Details</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Meeting credentials and a calendar invite (.ics) will be sent here immediately.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Project Scope / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your objectives, existing stack, or key bottlenecks..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Selected Summary Badge */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-6 text-xs text-primary flex items-center justify-between">
                <span>{selectedDate} at {selectedSlot}</span>
                <span className="font-bold">{selectedType.duration}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,191,255,0.4)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Reservation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NDA & Confidentiality Protected</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
