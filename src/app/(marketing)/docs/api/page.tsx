import React from "react";
import { Terminal, Shield, Zap, Lock } from "lucide-react";
import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import ApiDocsInteractive from "./components/ApiDocsInteractive";

export const metadata: Metadata = {
  title: "Developer API Documentation | Logic Intelligence Technologies",
  description:
    "Integrate enterprise AI endpoints, real-time voice intelligence, and platform services with Logic Intelligence Technologies REST & WebSocket APIs.",
  alternates: {
    canonical: "/docs/api",
  },
  openGraph: {
    title: "Developer API Documentation | Logic Intelligence Technologies",
    description:
      "Integrate enterprise AI endpoints, real-time voice intelligence, and platform services with Logic Intelligence Technologies REST & WebSocket APIs.",
    images: [
      {
        url: "/api/og?title=Developer+API+Documentation&category=Technical+Reference",
        width: 1200,
        height: 630,
        alt: "LIT Developer API Documentation",
      },
    ],
  },
};

export default function ApiDocsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: "API Documentation", path: "/docs/api" },
        ])}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Back Navigation */}
          <div>
            <BackButton fallbackHref="/products" label="Products" inline className="mb-6" />
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Reference v1.2 • Production APIs</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Enterprise AI Platform APIs
            </h1>

            <p className="font-serif italic text-base sm:text-lg md:text-xl text-[var(--lit-teal,#1FA9A2)]">
              High-throughput REST and streaming WebSockets for voice intelligence, autonomous agents, and zero-persistence inference pipelines.
            </p>

            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto">
              Embed real-time machine intelligence directly into your infrastructure stack. Connect via secure REST or streaming WebSockets to receive instant structured classifications, entity payloads, and agentic executions.
            </p>
          </div>

          {/* Interactive Playground & Documentation */}
          <ApiDocsInteractive />

          {/* Architecture & Reliability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E7F3FF] text-[#1565C0] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                Zero-Persistence Audio
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                Raw audio buffers and incoming voice streams are processed strictly in volatile RAM and discarded upon inference completion. Zero disk caching guarantees full HIPAA &amp; DPDP compliance.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00796B] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                Sub-50ms Roundtrip SLA
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                Global edge accelerators co-located in Mumbai, Frankfurt, and Northern Virginia route API requests to dedicated GPU clusters for guaranteed low-jitter delivery.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE7F6] text-[#5E35B1] flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                Enterprise Quotas &amp; VPC
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                High-capacity token buckets supporting over 5,000 req/min with automated burst buffering, private AWS DirectConnect, and GCP Cloud Interconnect endpoints.
              </p>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Ready to Integrate Enterprise AI Endpoints?"
            subtitle="Request production API credentials, sandbox credentials, and dedicated developer onboarding from our systems engineering team."
            primaryCta={{
              label: "Request API Credentials",
              href: "/contact",
            }}
            secondaryCta={{
              label: "Explore Architecture Blueprints",
              href: "/architecture",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
