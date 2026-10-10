"use client";

import React, { useState } from "react";
import { LifeBuoy, FileText, Wrench, Search, MessageSquare, ArrowRight, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import PageShell from "@/components/layout/page-shell";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "How do I cycle and rotate my production API keys?",
      a: "Navigate to your enterprise dashboard under Settings > Security. Click 'Rotate Key', generate the new secret, and update your environment variables. The old secret remains active for a 2-hour grace period to prevent downtime.",
      category: "Security",
    },
    {
      q: "What are the guaranteed SLAs for enterprise platforms?",
      a: "Our enterprise contracts include 99.99% monthly availability SLAs with automated uptime monitoring. Production-halting incidents receive priority engineering triage within 2 hours.",
      category: "SLA",
    },
    {
      q: "Can we deploy Logic Intelligence AI models on-premise or in private VPCs?",
      a: "Yes. For maximum data sovereignty and sub-50ms latency, we deliver containerized Docker deployments compatible with AWS ECS, Google Cloud Run, Azure Kubernetes, and bare-metal environments.",
      category: "Deployment",
    },
    {
      q: "How do we escalate emergency production outages after hours?",
      a: "Enterprise clients receive dedicated on-call PagerDuty escalation channels and a direct Slack/Teams bridge into our Site Reliability Engineering (SRE) rotation.",
      category: "Support",
    },
    {
      q: "Does Logic Intelligence store or train on client proprietary data?",
      a: "Never. All client documents, vectors, and query payloads reside strictly in isolated tenant schemas with zero raw persistence beyond the execution context, adhering to strict GDPR and HIPAA principles.",
      category: "Privacy",
    },
    {
      q: "What is the typical deployment timeline for a custom AI agent?",
      a: "Standard scoped prototypes are delivered within 48–72 hours. Production hardened multi-agent workflows with RAG pipelines typically complete staging and validation in 2 to 4 weeks.",
      category: "Engineering",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Developer Support & Knowledge Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
            Enterprise Help Desk & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Knowledge Base
            </span>
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed font-light">
            Search our architectural guides, system protocols, and enterprise FAQs, or open a direct ticket with our L3 full-stack engineers.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-xl mx-auto relative mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-cyan-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, deployment specs, SLAs, and security..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#10131A] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors shadow-2xl"
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main FAQ List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-sm font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Frequently Answered Architecture Inquiries</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"}
              </span>
            </div>
            
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-[#10131A] p-6 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {faq.q}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light">
                      {faq.a}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl border border-white/10 bg-[#10131A] text-center">
                  <p className="text-sm text-zinc-400 mb-4">No matching technical guides found for &quot;{searchQuery}&quot;.</p>
                  <Link
                    href="/support/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest"
                  >
                    <span>Submit Direct Support Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Open Ticket Box */}
            <div className="rounded-3xl border border-cyan-500/30 bg-[#10131A] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-white uppercase mb-2">
                Submit an Engineering Ticket
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
                Facing unexpected exceptions or performance regressions? Submit a direct ticket to our on-call development desk.
              </p>
              <Link
                href="/support/new"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(69,217,210,0.25)]"
              >
                <span>Open Support Ticket</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Developer Documentation Box */}
            <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-white uppercase mb-2">
                Developer Documentation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
                Explore our full API specification, webhook signatures, and deterministic schema integration docs.
              </p>
              <Link
                href="/docs/api"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-white/10 bg-[#07090D] hover:bg-white/[0.06] text-white font-bold text-xs tracking-widest uppercase transition-all"
              >
                <span>View API Reference</span>
              </Link>
            </div>

            {/* Live Status Box */}
            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Systems Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  All Systems Operational
                </span>
              </div>
              <Link
                href="/status"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1"
              >
                <span>Status</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageShell>
  );
}
