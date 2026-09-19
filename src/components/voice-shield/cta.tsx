"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

/**
 * VoiceShield CTA — Request a Demo.
 *
 * Submits to the existing LIT contact API (/api/contact) with projectType
 * set to "VoiceShield Demo Request". This reuses LIT's lead capture, DB,
 * email notification, and rate-limiting infrastructure without duplication.
 */

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  description: string;
}

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  description: "",
};

export default function VoiceShieldCTA() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          companyName: form.companyName.trim(),
          projectType: "VoiceShield Demo Request",
          description: form.description.trim(),
          pageUrl: "/voice-shield",
        }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success !== false) {
        setSent(true);
        setForm(INITIAL);
      } else {
        setError(
          (data as { message?: string })?.message ||
            "Submission failed. Please try again or email us directly."
        );
      }
    } catch {
      setError(
        "Connection error. Please check your network and try again, or email support@logicintelligencetechnologies.in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all";
  const labelClass =
    "block text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 mb-1.5";

  return (
    <section
      id="request-demo"
      className="py-24 px-6"
      aria-labelledby="vs-cta-heading"
    >
      <div className="mx-auto max-w-5xl">
        {/* Hero CTA */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-6">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              VoiceShield by Logic Intelligence Technologies
            </div>
            <h2
              id="vs-cta-heading"
              className="text-3xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight"
            >
              Ready to protect your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                voice infrastructure?
              </span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Request a demonstration of VoiceShield. Our team will contact you
              to schedule a session tailored to your use case.
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <GlassSurface variant="prominent" className="p-8">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" aria-hidden />
                <h3 className="text-lg font-bold text-white">
                  Demo request received
                </h3>
                <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                  Thank you. Our team at Logic Intelligence Technologies will
                  review your request and be in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-2 text-xs text-cyan-400 underline underline-offset-2"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="text-base font-bold text-white mb-6">
                  Request a VoiceShield Demo
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="vs-fullName" className={labelClass}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="vs-fullName"
                      name="fullName"
                      type="text"
                      required
                      maxLength={120}
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={inputClass}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="vs-email" className={labelClass}>
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="vs-email"
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="vs-phone" className={labelClass}>
                      Phone
                    </label>
                    <input
                      id="vs-phone"
                      name="phone"
                      type="tel"
                      maxLength={40}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="vs-company" className={labelClass}>
                      Organisation
                    </label>
                    <input
                      id="vs-company"
                      name="companyName"
                      type="text"
                      maxLength={160}
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="Company or institution"
                      className={inputClass}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="vs-description" className={labelClass}>
                    Use Case / Requirements
                  </label>
                  <textarea
                    id="vs-description"
                    name="description"
                    rows={4}
                    maxLength={2000}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your use case, deployment context, or questions about VoiceShield…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.fullName || !form.email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(6,182,212,0.25)]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden />
                      Request VoiceShield Demo
                    </>
                  )}
                </button>

                <p className="mt-4 text-[11px] text-zinc-600 text-center leading-relaxed">
                  By submitting, you agree to be contacted by Logic Intelligence
                  Technologies regarding VoiceShield. No spam. No unsolicited
                  marketing.
                </p>
              </form>
            )}
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
