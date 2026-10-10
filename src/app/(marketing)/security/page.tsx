import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  FileCheck, 
  AlertOctagon, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  EyeOff,
  Cpu
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Security & Trust | Logic Intelligence Technologies",
  description: "Enterprise security protocols, encryption architecture, zero-persistence processing, and responsible vulnerability disclosure at Logic Intelligence Technologies.",
};

const SECURITY_PILLARS = [
  {
    icon: Lock,
    title: "Cryptographic Encryption",
    subtitle: "In Transit & At Rest",
    description: "All client communications and API streams require TLS 1.3 encryption with strict cipher suites. Database records and configuration secrets are protected with AES-256 encryption at rest via dedicated Key Management Services (KMS).",
  },
  {
    icon: EyeOff,
    title: "Zero-Persistence Audio",
    subtitle: "Volatile Memory Execution",
    description: "Voice intelligence streams and conversational micro-frames exist strictly in volatile RAM during active inference. Raw customer audio and biometrics are never written to physical disk storage.",
  },
  {
    icon: Key,
    title: "Identity & Fine-Grained RBAC",
    subtitle: "Zero-Trust Access Control",
    description: "Row-level database isolation, scoped API keys, and multi-tenant authorization guards guarantee that each organization can access solely its own authorized telemetry and records.",
  },
  {
    icon: Server,
    title: "Hardened Infrastructure",
    subtitle: "DDoS Mitigation & Edge Filtering",
    description: "Edge networks provide automated distributed denial-of-service (DDoS) mitigation, global Web Application Firewall (WAF) rule sets, and intelligent IP rate-limiting to prevent brute force or resource exhaustion.",
  },
  {
    icon: Cpu,
    title: "Secure SDLC & Static Analysis",
    subtitle: "Automated Pipeline Scans",
    description: "Continuous integration pipelines enforce automated vulnerability scanning, strict dependency verification, secret-leak prevention tools, and strict peer review for every production commit.",
  },
  {
    icon: FileCheck,
    title: "Compliance & Governance Alignment",
    subtitle: "GDPR, HIPAA & ISO Preparedness",
    description: "Our engineering operations adhere to rigorous data hygiene principles, maintaining auditability, privacy by design, and adherence to international privacy statutes.",
  },
];

export default function SecurityPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Security", path: "/security" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Hero Section */}
        <div className="mt-8 mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Enterprise Trust & Security
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            Security by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Architecture</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            How Logic Intelligence Technologies secures enterprise artificial intelligence systems, protects sensitive patient and corporate data, and guarantees data isolation across every tier.
          </p>
        </div>

        {/* 6 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {SECURITY_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl border border-white/10 bg-[#151922] shadow-xl hover:border-cyan-500/40 hover:bg-[#181d28] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform mb-6 shadow-[0_0_15px_rgba(69,217,210,0.2)]">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase font-heading tracking-wide mb-1">
                  {pillar.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400/90 uppercase tracking-wider mb-4">
                  {pillar.subtitle}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Operations & Key Practices Breakdown */}
        <div className="mb-20 rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Operational Protocols
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-heading">
              Our Everyday Defensive Posture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">Strict Secret Hygiene</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    API credentials, service keys, and database tokens remain strictly within runtime environment variables on secured servers. No secret tokens are bundled into client-side JavaScript.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">Server-Side Authorization</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Every administrative action and private file download is verified server-side with session tokens and cryptographic signatures, preventing client bypasses.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">Database Row-Level Isolation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    PostgreSQL Row Level Security (RLS) policies isolate client data at the database engine level, rendering accidental multi-tenant leaks impossible even under application regression.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">Intelligent Abuse Throttling</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Inbound contact forms, whitepaper downloads, and diagnostic APIs enforce sliding-window rate limiting to block automated credential stuffing and bot spam.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">No Model Training on Client Data</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Customer data, voice packets, documents, and transcripts are never ingested or pooled into shared foundation model training corpora.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">Audit Log Immutability</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Security-critical administrative events are logged to append-only storage with timestamps, IP footprints, and cryptographic actor IDs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Vulnerability Disclosure Section */}
        <div className="rounded-3xl border border-cyan-500/30 bg-[#151922] p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-semibold uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              Responsible Disclosure
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white uppercase tracking-tight">
              Reporting Security Vulnerabilities
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              If you identify a security or privacy vulnerability within our web properties, voice APIs, or infrastructure, please report it directly and privately. We prioritize security inquiries and investigate all submissions promptly.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Direct security contact: <span className="text-cyan-400 font-bold">{COMPANY.adminEmail}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
            <a
              href={`mailto:${COMPANY.adminEmail}?subject=Security%20Vulnerability%20Report`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Mail className="w-4 h-4" />
              Report Security Issue
            </a>
            <Link
              href="/architecture"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-cyan-500/40 font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              System Architecture
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
