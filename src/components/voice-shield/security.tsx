"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Eye, Database, ShieldCheck, Key, AlertTriangle } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const CONTROLS = [
  {
    icon: Lock,
    title: "Encrypted Transport",
    description:
      "All audio data is transmitted over WSS (WebSocket Secure) / HTTPS. No raw audio traverses unencrypted connections.",
    implemented: true,
  },
  {
    icon: Eye,
    title: "Zero Audio Retention",
    description:
      "By default, raw audio chunks are never written to disk (STORE_RAW_AUDIO=false). Processing occurs in-memory and audio is discarded after inference.",
    implemented: true,
  },
  {
    icon: Database,
    title: "Row-Level Security (RLS)",
    description:
      "Supabase RLS policies enforce that users can only access their own sessions and detection events. Admin access requires explicit role assignment.",
    implemented: true,
  },
  {
    icon: Key,
    title: "Server-Side Secrets",
    description:
      "API keys (THROUGHPUTS, Supabase service role) are server-side only. Never exposed to browser JavaScript or client bundles.",
    implemented: true,
  },
  {
    icon: ShieldCheck,
    title: "Supabase JWT Validation",
    description:
      "The FastAPI backend validates every WebSocket connection using the Supabase JWT secret, ensuring only authenticated users can start detection sessions.",
    implemented: true,
  },
  {
    icon: AlertTriangle,
    title: "Audit Logging",
    description:
      "All WebSocket connection events (connect, disconnect) and authentication actions are logged with timestamps, session IDs, and client IP addresses.",
    implemented: true,
  },
] as const;

const COMPLIANCE_SUPPORT = [
  "Designed to support DPDP compliance",
  "Designed to support GDPR compliance",
];

const NOT_CLAIMED = [
  "SOC 2 certification",
  "ISO 27001 certification",
  "Military-grade security",
  "Zero false positives",
];

export default function VoiceShieldSecurity() {
  return (
    <section className="py-24 px-6" aria-labelledby="vs-security-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
            Security & Privacy
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2
            id="vs-security-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            Implemented security controls
          </h2>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">
            The following controls are verified as implemented in the current
            VoiceShield architecture. Only factual, implemented controls are listed.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {CONTROLS.map((ctrl, i) => (
            <motion.div
              key={ctrl.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <GlassSurface variant="card" className="p-5 h-full">
                <div className="flex items-start gap-3 mb-3">
                  <ctrl.icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                  <h3 className="text-sm font-bold text-white leading-tight">{ctrl.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{ctrl.description}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Implemented
                  </span>
                </div>
              </GlassSurface>
            </motion.div>
          ))}
        </div>

        {/* Transparency — what is NOT claimed */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <GlassSurface variant="subtle" className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <h3 className="text-sm font-bold text-white">
                What we do not currently claim
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              VoiceShield does not currently hold the following certifications or
              make the following guarantees. We believe in transparency.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {COMPLIANCE_SUPPORT.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {NOT_CLAIMED.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-600"
                >
                  {c}
                </span>
              ))}
            </div>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
