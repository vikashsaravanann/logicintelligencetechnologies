"use client";

import React, { useState, useMemo } from "react";
import {
  Cpu,
  ShieldCheck,
  Heart,
  MessageSquare,
  Terminal,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  replies: number;
  category: "Speech AI" | "AI Security" | "Healthcare" | "RAG & LLM" | "Backend";
  summary: string;
  tags: string[];
  pinned?: boolean;
  status: "Open RFC" | "Under Review" | "Community Draft" | "Shipped Pattern";
}

const TOPICS_DATA: Topic[] = [
  {
    id: "rfc-108",
    title: "Optimizing Logic Voice latency on edge networks (Sub-150ms)",
    author: "j.smith_arch",
    authorRole: "Edge Systems Specialist",
    replies: 28,
    category: "Speech AI",
    summary:
      "Benchmarking opus packetization, jitter buffers, and WebSockets vs WebTransport for bi-directional streaming audio across South Asian edge nodes.",
    tags: ["WebRTC", "Edge Audio", "Sub-150ms", "Opus"],
    pinned: true,
    status: "Open RFC",
  },
  {
    id: "rfc-109",
    title: "Voice Shield real-time acoustic phase analysis & deepfake telephony firewall",
    author: "systems_lead",
    authorRole: "Security Research Lead",
    replies: 34,
    category: "AI Security",
    summary:
      "Evaluating zero-latency micro-features in carrier SIP streams to detect vocoder synthesis artifacts, phase continuity breaks, and spoofing signatures.",
    tags: ["Telephony", "Deepfake Defense", "Phase Analysis", "SIP Trunk"],
    pinned: true,
    status: "Under Review",
  },
  {
    id: "rfc-110",
    title: "Multi-tenant hospital governance with LIT Healthcare architecture",
    author: "researcher_phd",
    authorRole: "Clinical Informatics Fellow",
    replies: 42,
    category: "Healthcare",
    summary:
      "Cryptographic partitioning of clinical record stores, deterministic audit trails, and strict role-based EMR authorization across institutional boundaries.",
    tags: ["FHIR", "HIPAA/ABDM", "Cryptographic Isolation", "Audit Logs"],
    status: "Open RFC",
  },
  {
    id: "rfc-111",
    title: "Best practices for RAG with deterministic PostgreSQL scaffolding",
    author: "data_engineer_99",
    authorRole: "Database Systems Architect",
    replies: 19,
    category: "RAG & LLM",
    summary:
      "Replacing unconstrained vector cosine similarity with hybrid pgvector indexing, relational foreign-key validation, and deterministic reranking thresholds.",
    tags: ["PostgreSQL", "pgvector", "Deterministic RAG", "Hybrid Search"],
    status: "Shipped Pattern",
  },
  {
    id: "rfc-112",
    title: "Handling webhook retry queues and idempotent payment events safely",
    author: "sysadmin_alex",
    authorRole: "Reliability Engineer",
    replies: 14,
    category: "Backend",
    summary:
      "Guaranteeing exactly-once execution semantics for Razorpay and Stripe webhooks via transactional outbox patterns and Redis distributed locks.",
    tags: ["Idempotency", "Outbox Pattern", "Redis Locks", "Webhooks"],
    status: "Community Draft",
  },
  {
    id: "rfc-113",
    title: "Decentralized model checkpoint verification via SHA-256 integrity rings",
    author: "sec_ops_vik",
    authorRole: "Platform Security Engineer",
    replies: 21,
    category: "AI Security",
    summary:
      "Securing edge inference binary weights against supply chain tampering using cryptographically signed manifests and runtime hash attestation.",
    tags: ["Attestation", "Supply Chain", "SHA-256", "Inference Integrity"],
    status: "Open RFC",
  },
];

const CATEGORIES = [
  "All Discussions",
  "Speech AI",
  "AI Security",
  "Healthcare",
  "RAG & LLM",
  "Backend",
] as const;

function getCategoryBadge(category: Topic["category"]) {
  switch (category) {
    case "Speech AI":
      return {
        bg: "bg-[#E0F2F1]",
        text: "text-[#00796B]",
        border: "border-[#80CBC4]",
        icon: Cpu,
      };
    case "AI Security":
      return {
        bg: "bg-[#EDE7F6]",
        text: "text-[#5E35B1]",
        border: "border-[#D1C4E9]",
        icon: ShieldCheck,
      };
    case "Healthcare":
      return {
        bg: "bg-[#E7F3FF]",
        text: "text-[#1565C0]",
        border: "border-[#BBDEFB]",
        icon: Heart,
      };
    case "RAG & LLM":
      return {
        bg: "bg-[#FFF4D9]",
        text: "text-[#B45309]",
        border: "border-[#FDE68A]",
        icon: MessageSquare,
      };
    case "Backend":
    default:
      return {
        bg: "bg-[#F1F5F9]",
        text: "text-[#334155]",
        border: "border-[#CBD5E1]",
        icon: Terminal,
      };
  }
}

export function CommunityTopics() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Discussions");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = useMemo(() => {
    return TOPICS_DATA.filter((topic) => {
      const matchesCategory =
        selectedCategory === "All Discussions" || topic.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.author.toLowerCase().includes(q) ||
        topic.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              placeholder="Search architecture RFCs, protocols, or engineers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/30 focus:border-[var(--lit-teal,#1FA9A2)] transition-all"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 py-2 text-xs font-mono text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] self-center"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/60 mt-3.5 no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Topic:</span>
          </div>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs font-semibold"
                    : "bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] hover:bg-slate-200/80 hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discussion List Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--lit-navy,#0B2545)] uppercase flex items-center gap-2">
          <span>Active Architecture RFCs</span>
          <span className="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00796B] font-mono text-[11px] font-bold">
            {filteredTopics.length}
          </span>
        </h2>
        <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
          Coimbatore Peer Review
        </span>
      </div>

      {/* Thread Cards */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-[var(--lit-navy,#0B2545)]">
              No matching architectural threads found
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
              Try adjusting your search terms or clearing the topic filter to view all discussions.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Discussions");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const badge = getCategoryBadge(topic.category);
            const CategoryIcon = badge.icon;

            return (
              <div
                key={topic.id}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)]/50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl ${badge.bg} border ${badge.border} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                    >
                      <CategoryIcon className={`w-5 h-5 ${badge.text}`} />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border} uppercase tracking-wider`}
                        >
                          {topic.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700">
                          {topic.status}
                        </span>
                        {topic.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Pinned RFC
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-poppins font-semibold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors leading-snug">
                        {topic.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                        {topic.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--lit-cloud,#F7F9FC)] border border-slate-200 text-slate-600"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center gap-3 text-xs text-[var(--lit-text-muted,#52677C)]">
                        <span className="font-mono font-medium text-slate-700">
                          @{topic.author}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500">{topic.authorRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Counter & Action */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto pt-3 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-[var(--lit-border-light,#DFE7EF)]/70 shrink-0">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                        {topic.replies}
                      </div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-[var(--lit-text-muted,#52677C)]">
                        Replies
                      </div>
                    </div>

                    <Link
                      href="/contact?subject=Community+RFC+Inquiry"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:text-[#00796B] transition-colors"
                    >
                      <span>Join RFC</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
