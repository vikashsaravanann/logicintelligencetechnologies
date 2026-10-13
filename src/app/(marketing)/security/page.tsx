import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  FileCheck, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  EyeOff,
  Cpu,
  Layers,
  Terminal,
  Database,
  Network
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Security & Trust Architecture | Logic Intelligence Technologies",
  description: "Enterprise security controls, zero-persistence processing, cryptographic isolation, and responsible disclosure at Logic Intelligence Technologies.",
};

const SECURITY_METRICS = [
  {
    label: "Cryptography Standard",
    value: "TLS 1.3 + AES-256",
    detail: "Strict cipher suites & KMS envelope keys",
  },
  {
    label: "Audio & Inference Retention",
    value: "Zero Persistence",
    detail: "Volatile RAM execution with immediate zeroization",
  },
  {
    label: "Tenant Boundary",
    value: "PostgreSQL RLS",
    detail: "Row-level isolation enforced at storage kernel",
  },
  {
    label: "AI Training Policy",
    value: "100% Zero Training",
    detail: "Client data is never ingested into shared models",
  },
];

const SECURITY_PILLARS = [
  {
    icon: Lock,
    title: "Cryptographic Encryption",
    subtitle: "In Transit & At Rest",
    description: "All client communications and streaming APIs require TLS 1.3 with strict ephemeral forward-secrecy cipher suites. Database records and configuration secrets are protected with AES-256 encryption at rest via dedicated Key Management Services (KMS).",
  },
  {
    icon: EyeOff,
    title: "Zero-Persistence Inference",
    subtitle: "Volatile Memory Execution",
    description: "Voice intelligence streams and conversational micro-frames exist strictly in volatile RAM during active inference. Raw customer audio, biometric waveforms, and transcripts are never written to physical disk storage.",
  },
  {
    icon: Key,
    title: "Identity & Fine-Grained RBAC",
    subtitle: "Zero-Trust Access Control",
    description: "Row-level database isolation, cryptographically signed session tokens, and multi-tenant authorization guards guarantee that each organization can access solely its own authorized telemetry and records.",
  },
  {
    icon: Server,
    title: "Hardened Infrastructure",
    subtitle: "DDoS Mitigation & Edge Filtering",
    description: "Global edge networks provide automated distributed denial-of-service (DDoS) mitigation, global Web Application Firewall (WAF) rule sets, and intelligent IP rate-limiting to prevent brute force or resource exhaustion.",
  },
  {
    icon: Cpu,
    title: "Secure SDLC & Pipeline Linting",
    subtitle: "Automated Continuous Scans",
    description: "Continuous integration pipelines enforce automated vulnerability scanning, strict dependency verification, secret-leak prevention tools, and mandatory peer review for every production commit.",
  },
  {
    icon: FileCheck,
    title: "Compliance & Governance Alignment",
    subtitle: "GDPR, HIPAA & ISO Preparedness",
    description: "Our engineering operations adhere to rigorous data hygiene principles, maintaining auditability, privacy by design, and alignment with international healthcare and corporate privacy statutes.",
  },
];

const OPERATIONAL_PROTOCOLS = [
  {
    title: "Strict Secret Hygiene",
    description: "API credentials, service keys, and database tokens remain strictly within runtime environment variables on secured servers. No secret tokens are bundled into client-side JavaScript or build artifacts.",
  },
  {
    title: "Server-Side Authorization Guards",
    description: "Every administrative action and private file download is verified server-side with session tokens and cryptographic signatures, preventing client-side route bypasses.",
  },
  {
    title: "Database Row-Level Isolation (RLS)",
    description: "PostgreSQL Row Level Security (RLS) policies isolate client data at the database engine level, rendering accidental multi-tenant leaks impossible even under application regression.",
  },
  {
    title: "Intelligent Abuse & Rate Throttling",
    description: "Inbound contact forms, whitepaper downloads, and diagnostic APIs enforce sliding-window Redis rate limiting to block automated credential stuffing and bot spam.",
  },
  {
    title: "Zero Model Training on Client Data",
    description: "Customer data, voice packets, documents, and transcripts are never ingested or pooled into shared foundation model training corpora.",
  },
  {
    title: "Audit Log Immutability",
    description: "Security-critical administrative events are logged to append-only storage with timestamps, IP footprints, and cryptographic actor IDs for complete post-incident forensic readiness.",
  },
];

const ARCHITECTURE_LAYERS = [
  {
    layer: "01",
    name: "Edge & Ingress",
    icon: Network,
    items: ["Global WAF Filtering", "Automated DDoS Mitigation", "TLS 1.3 Strict Ciphers", "Geo-distributed Rate Limiting"],
  },
  {
    layer: "02",
    name: "Gateway & Auth",
    icon: Key,
    items: ["Cryptographic Session Verification", "Scoped API Key Validation", "Zero-Trust Service Mesh", "Role-Based Access Control"],
  },
  {
    layer: "03",
    name: "Inference Engine",
    icon: Cpu,
    items: ["Volatile Memory Sandboxing", "Ephemeral Micro-Frame Execution", "Zero Raw Audio Disk Writes", "Immediate Memory Zeroization"],
  },
  {
    layer: "04",
    name: "Storage & Persistence",
    icon: Database,
    items: ["PostgreSQL Row-Level Security", "AES-256 Envelope KMS Encryption", "Encrypted Daily Backups", "Isolated Multi-Tenant Schemas"],
  },
];

export default function SecurityPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Security & Trust", path: "/security" },
        ])}
      />

      <div className="bg-[var(--lit-cloud,#F7F9FC)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Back Navigation */}
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Hero Section */}
          <div className="mt-4 mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wide uppercase mb-4">
              <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Enterprise Security & Zero-Trust Infrastructure
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight">
              Security by <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Architecture</span>, Not Afterthought
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              How Logic Intelligence Technologies secures enterprise AI workloads, protects confidential customer records, and guarantees complete tenant isolation across volatile inference runtimes, edge networks, and storage tiers.
            </p>
          </div>

          {/* Quick Security Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {SECURITY_METRICS.map((metric, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
              >
                <div className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1">
                  {metric.label}
                </div>
                <div className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-[var(--lit-text-muted,#52677C)] leading-normal">
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>

          {/* 6 Core Security Pillars Grid */}
          <div className="mb-20">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] text-xs font-semibold uppercase tracking-wider mb-2">
                Core Defense Pillars
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Architectural Guarantees
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Foundational engineering principles implemented across every microservice and system component.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECURITY_PILLARS.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/50 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] group-hover:bg-[var(--lit-teal,#1FA9A2)]/10 group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors mb-6">
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-heading tracking-tight mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-[var(--lit-teal,#1FA9A2)] uppercase tracking-wider mb-3">
                      {pillar.subtitle}
                    </p>
                    <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layered Defense Pipeline Diagram */}
          <div className="mb-20">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-soft-lilac,#EDE7F6)] text-[#6D28D9] text-xs font-semibold uppercase tracking-wider mb-2">
                Layered Defense
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Four-Tier Isolation Architecture
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Defense-in-depth security model ensuring threat isolation from public request ingress to long-term storage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ARCHITECTURE_LAYERS.map((layer) => (
                <div
                  key={layer.layer}
                  className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs flex flex-col justify-between hover:border-[var(--lit-teal,#1FA9A2)]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[var(--lit-teal,#1FA9A2)] px-2.5 py-1 rounded-md bg-[var(--lit-teal,#1FA9A2)]/10">
                        Tier {layer.layer}
                      </span>
                      <layer.icon className="w-5 h-5 text-[var(--lit-text-muted,#52677C)]" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-4">
                      {layer.name}
                    </h3>
                    <ul className="space-y-2.5">
                      {layer.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Everyday Defensive Posture & Operational Controls */}
          <div className="mb-20 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 shadow-sm">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-gold,#FFF4D9)] text-[#B45309] text-xs font-semibold uppercase tracking-wider mb-2">
                Operational Protocols
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Everyday Defensive Controls & Verification
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Continuous technical safeguards enforced across infrastructure provisioning, runtime execution, and administrative workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {OPERATIONAL_PROTOCOLS.map((protocol, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/60">
                  <div className="w-8 h-8 rounded-lg bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                      {protocol.title}
                    </h4>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                      {protocol.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsible Vulnerability Disclosure Section */}
          <div className="rounded-3xl border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-light-blue,#E7F3FF)]/40 p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-20">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-white text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                Vulnerability Management Desk
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--lit-navy,#0B2545)] tracking-tight">
                Responsible Vulnerability Disclosure
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                If you identify a security, cryptographic, or privacy vulnerability within our web properties, inference APIs, or infrastructure, please report it directly and privately. We prioritize security inquiries and investigate all submissions within 24 business hours.
              </p>
              <div className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                Direct security inbox:{" "}
                <a 
                  href={`mailto:${COMPANY.adminEmail}`}
                  className="text-[var(--lit-blue,#1565C0)] font-bold hover:underline"
                >
                  {COMPANY.adminEmail}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
              <a
                href={`mailto:${COMPANY.adminEmail}?subject=Security%20Vulnerability%20Report`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-teal,#1FA9A2)] font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <Mail className="w-4 h-4" />
                Report Security Issue
              </a>
              <Link
                href="/architecture"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                System Architecture
                <ArrowRight className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              </Link>
            </div>
          </div>

          {/* Canonical CTA Section */}
          <CTASection
            title="Deploy Enterprise AI with Complete Cryptographic Confidence"
            subtitle="Request our complete vendor risk assessment package, system architecture whitepaper, or schedule an executive security briefing with our infrastructure architects."
            primaryCta={{
              label: "Schedule Security Briefing",
              href: "/contact",
            }}
            secondaryCta={{
              label: "Explore System Architecture",
              href: "/architecture",
            }}
          />

        </div>
      </div>
    </PageShell>
  );
}
