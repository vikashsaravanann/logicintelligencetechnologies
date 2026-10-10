import React from "react";
import { Users2, MessageSquare, Terminal, Heart, Trophy, ArrowRight, ShieldCheck, Cpu, Code2, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Developer & Architect Community | Logic Intelligence Technologies",
  description: "Peer-to-peer technical discussions, systems architecture forums, and developer community for Logic Intelligence Technologies.",
};

export default function CommunityPage() {
  const topics = [
    {
      title: "Optimizing Logic Voice latency on edge networks (Sub-150ms)",
      author: "j.smith_arch",
      replies: 28,
      category: "Speech AI",
      icon: Cpu,
    },
    {
      title: "OmniPublisher AI automated multi-channel copy adaptation & distribution",
      author: "systems_lead",
      replies: 34,
      category: "Automation",
      icon: Sparkles,
    },
    {
      title: "Multi-tenant hospital governance with LIT Healthcare architecture",
      author: "researcher_phd",
      replies: 42,
      category: "Healthcare",
      icon: Heart,
    },
    {
      title: "Best practices for RAG with deterministic PostgreSQL scaffolding",
      author: "data_engineer_99",
      replies: 19,
      category: "RAG & LLM",
      icon: MessageSquare,
    },
    {
      title: "Handling webhook retry queues and idempotent payment events safely",
      author: "sysadmin_alex",
      replies: 14,
      category: "Backend",
      icon: Terminal,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 selection:bg-cyan-500 selection:text-black pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome />

        {/* Header Section */}
        <div className="text-center space-y-5 mb-16 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase">
            <Users2 className="w-3.5 h-3.5" />
            Engineering Knowledge Exchange
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Architect & Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">Community</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Connect with our core engineering team, share deployment patterns, inspect open architecture RFCs, and discuss production AI systems with enterprise engineers globally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Main Forum View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold tracking-wider text-[#45D9D2] uppercase">
                Active Architecture Discussions
              </h2>
              <span className="text-xs text-slate-400">
                5 Active Threads
              </span>
            </div>

            <div className="space-y-4">
              {topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-all duration-200 hover:border-cyan-500/30 group cursor-pointer shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <topic.icon className="w-5 h-5 text-slate-400 group-hover:text-[#45D9D2] transition-colors" />
                    </div>
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/5 text-[#45D9D2] uppercase tracking-wider mb-1.5">
                        {topic.category}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#45D9D2] transition-colors leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Posted by <span className="text-slate-300 font-mono">@{topic.author}</span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-center pl-4 border-l border-white/5">
                    <div className="text-base sm:text-lg font-bold text-[#45D9D2]">{topic.replies}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Replies</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Join CTA */}
            <div className="rounded-2xl border border-cyan-500/30 bg-[#10131A] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-3">
                Join the Network
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Collaborate directly with the engineers building Logic Voice, OmniPublisher AI, and the LIT Healthcare platform. Get early access to RFCs and system specifications.
              </p>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#45D9D2] hover:bg-[#45D9D2]/90 text-[#07090D] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                <span>Request Community Access</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Top Contributors */}
            <div className="rounded-2xl border border-white/10 bg-[#10131A] p-6 shadow-xl">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#45D9D2]" />
                Top Engineering Contributors
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 rounded-xl bg-[#151922] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <span className="text-xs font-bold text-[#45D9D2]">VS</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">Vikash Saravanan</span>
                      <span className="text-[10px] text-slate-400 font-mono">Founder & Architect</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#45D9D2] bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded">Core</span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-[#151922] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <span className="text-xs font-bold text-slate-300">AM</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">alex_m</span>
                      <span className="text-[10px] text-slate-400 font-mono">Systems Engineer</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-1 rounded">2.4k pts</span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-[#151922] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <span className="text-xs font-bold text-slate-300">DR</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">d.reynolds</span>
                      <span className="text-[10px] text-slate-400 font-mono">Security Architect</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">1.1k pts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <CTASection
          title="Explore the Code & Architecture"
          subtitle="Discover our technical documentation, public APIs, and foundational engineering principles."
          primaryCta={{ label: "View Architecture", href: "/architecture" }}
          secondaryCta={{ label: "Read Knowledge Base", href: "/knowledge-base" }}
        />
      </div>
    </div>
  );
}
