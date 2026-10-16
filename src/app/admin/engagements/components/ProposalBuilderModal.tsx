"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Send,
  Save,
} from "lucide-react";
import { ClientEngagement } from "@/lib/engagements/types";
import { calculateEngagementFinancials } from "@/lib/engagements/financials";

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: ClientEngagement;
  onUpdated: (updatedEngagement: ClientEngagement) => void;
}

const DEFAULT_DELIVERABLES = [
  {
    id: "D-01",
    title: "50-Point Enterprise Architectural Audit & Compliance Alignment",
    description: "Comprehensive assessment of cloud infrastructure, security topology, TLS 1.3, PostgreSQL RLS, and HIPAA/data minimization compliance rules.",
    format: "Formal Verification Report & Audit Matrix (PDF)",
    acceptance: "AC-01: Zero failing security checks; signed compliance statement",
  },
  {
    id: "D-02",
    title: "Production Next.js 15 Web Application + Custom REST Middleware",
    description: "Full-stack responsive web application with React Server Components, TypeScript, Tailwind design tokens, and modular domain route handlers.",
    format: "Production GitHub Repository & Vercel Edge Deployment",
    acceptance: "AC-02: Lighthouse score >= 90; edge TTFB <= 50ms; zero console errors",
  },
  {
    id: "D-03",
    title: "Supabase Database Schema with Strict RLS & Immutable Audit Trails",
    description: "PostgreSQL 15 schema featuring Row Level Security (RLS), multi-tenant isolation, automated migrations, and SHA-256 cryptographic audit ledgers.",
    format: "Supabase Migration Scripts + Verification Test Suite",
    acceptance: "AC-03: 100% RLS coverage; anon client unauthorized access blocked",
  },
  {
    id: "D-04",
    title: "Zero-Gateway Audited Manual UPI Payment Clearance Architecture",
    description: "Direct UPI payment verification suite with dynamic amount-specific QR generation, UTR reporting, Super Admin bank reconciliation, and zero third-party gateway cuts.",
    format: "Payment Clearance Module + Admin Reconciliation Portal",
    acceptance: "AC-04: UTR uniqueness constraint; verified bank matching workflow",
  },
  {
    id: "D-05",
    title: "AI Assistant Pipeline with Groq LPU + Domain-Isolated RAG Embeddings",
    description: "Bespoke conversational AI pipeline utilizing Groq LPU high-speed inference, FastEmbed bge-small-en-v1.5 embeddings, and domain-isolated knowledge retrieval.",
    format: "Edge AI Service + Knowledge Ingestion CLI Pipeline",
    acceptance: "AC-05: Zero unauthenticated PHI leakage; p95 latency <= 150ms",
  },
  {
    id: "D-06",
    title: "Comprehensive Handover Manifest, Transfer Runbooks & 90-Day SLA Support",
    description: "Complete intellectual property transfer package, deployment runbooks, developer setup documentation, and 90-day comprehensive post-launch warranty.",
    format: "Transfer Manifest + Signed IP Certificate + Runbooks",
    acceptance: "AC-06: Verified GitHub org transfer; bilateral handover sign-off",
  },
];

const DEFAULT_PHASES = [
  {
    phase: "Phase 1 · Weeks 1–2",
    title: "Architecture Audit, Wireframing & Scope Baselining",
    desc: "Formalize 50-point checklist scope, conduct technical discovery session, finalize schema models, and set up GitHub repository structure.",
    gate: "Gate 1: Statement of Work (Stage 5) & Initial Payment (Stage 6) cleared.",
  },
  {
    phase: "Phase 2 · Weeks 3–4",
    title: "Supabase PostgreSQL Migration & Core Domain Engine",
    desc: "Implement relational database tables, enforce 100% Row-Level Security, configure auth sessions, and scaffold Next.js App Router layout.",
    gate: "Gate 2: Technical Specification (Stage 8) approved by client.",
  },
  {
    phase: "Phase 3 · Weeks 5–6",
    title: "Client Engagement Portal & PDF Document Generation Engine",
    desc: "Build 13-stage progression workflows, A4 Tax Invoice / Receipt single-page generators, and interactive checklist interfaces.",
    gate: "Gate 3: Mid-sprint progress review and demo deployment.",
  },
  {
    phase: "Phase 4 · Weeks 7–8",
    title: "Direct UPI Payment Engine & AI Assistant Integration",
    desc: "Implement dynamic UPI QR code generator, UTR duplicate prevention, Super Admin reconciliation portal, and Groq LPU RAG assistant.",
    gate: "Gate 4: Integration testing and compliance audit complete.",
  },
  {
    phase: "Phase 5 · Weeks 9–10",
    title: "End-to-End QA, Security Audit & Production Launch",
    desc: "Execute full automated test suite, mobile responsive verification, Lighthouse latency tuning, and formal handover to production.",
    gate: "Gate 5: Delivery Acceptance (Stage 10) and Final Settlement (Stage 11).",
  },
];

function getInitialProposalValues(engagement: ClientEngagement) {
  const meta = (engagement.metadata || {}) as Record<string, any>;
  const savedProposal = meta.proposal_data || {};

  const cleanRef = (engagement.engagement_ref || "ENG").replace(/[^A-Z0-9]/gi, "");
  const proposalRef = savedProposal.proposalRef || `LIT-PROP-${cleanRef}-01`;
  const validUntil =
    savedProposal.validUntil ||
    new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const initialSubtotal =
    savedProposal.subtotal ||
    meta.contract_subtotal ||
    meta.subtotal ||
    meta.contract_value ||
    meta.budget_range ||
    "0";
  const subtotalInput = String(initialSubtotal).replace(/[^0-9.]/g, "") || "0";

  const executiveSummary =
    savedProposal.executiveSummary ||
    `Logic Intelligence Technologies (LIT) is pleased to submit this comprehensive Project Proposal and Commercial Quotation to ${engagement.company_name}. Following our review of your Stage 1 Enterprise Deployment Checklist and Stage 2 Discovery inputs, this document formalizes our architectural approach, work breakdown structure, technology stack, and commercial terms.`;

  const engagementVision =
    savedProposal.engagementVision ||
    `Our mandate is to deliver an enterprise-grade, high-performance web platform built on modern Next.js 15, PostgreSQL (Supabase) with Row-Level Security, an audited direct UPI payment settlement system, and domain-isolated artificial intelligence capabilities for ${engagement.company_name}.`;

  const challenge1 =
    savedProposal.challenges?.[0] ||
    "Existing digital workflows rely on disparate tools with no unified database, leading to data synchronization bottlenecks, slow response times, and poor multi-device usability.";
  const challenge2 =
    savedProposal.challenges?.[1] ||
    "Need for strict credential-free delegated access, database-enforced Row Level Security (RLS), and zero-unauthenticated exposure of sensitive client or proprietary records.";
  const challenge3 =
    savedProposal.challenges?.[2] ||
    "Third-party payment gateways incur high transaction surcharges (2–3%), unpredictable settlement holds, and account freeze risks. A direct, bank-verified UPI settlement architecture is needed.";
  const challenge4 =
    savedProposal.challenges?.[3] ||
    `Demands for immediate, accurate answers to technical and operational queries without exposing ${engagement.company_name}'s private internal documentation to public AI training loops.`;

  const deliverables = savedProposal.deliverables || DEFAULT_DELIVERABLES;
  const phases = savedProposal.phases || DEFAULT_PHASES;

  return {
    proposalRef,
    validUntil,
    subtotalInput,
    executiveSummary,
    engagementVision,
    challenge1,
    challenge2,
    challenge3,
    challenge4,
    deliverables,
    phases,
  };
}

const emptySubscribe = () => () => {};

export function ProposalBuilderModal(props: ProposalBuilderModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!props.isOpen || !mounted) return null;

  return createPortal(
    <ProposalBuilderModalDialog key={props.engagement.id} {...props} />,
    document.body
  );
}

function ProposalBuilderModalDialog({
  onClose,
  engagement,
  onUpdated,
}: ProposalBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "challenges" | "deliverables" | "roadmap" | "commercial">("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initial = getInitialProposalValues(engagement);

  // Form Fields
  const [subtotalInput, setSubtotalInput] = useState<string>(initial.subtotalInput);
  const [proposalRef, setProposalRef] = useState<string>(initial.proposalRef);
  const [validUntil, setValidUntil] = useState<string>(initial.validUntil);
  const [executiveSummary, setExecutiveSummary] = useState<string>(initial.executiveSummary);
  const [engagementVision, setEngagementVision] = useState<string>(initial.engagementVision);

  // Challenges (4 items)
  const [challenge1, setChallenge1] = useState<string>(initial.challenge1);
  const [challenge2, setChallenge2] = useState<string>(initial.challenge2);
  const [challenge3, setChallenge3] = useState<string>(initial.challenge3);
  const [challenge4, setChallenge4] = useState<string>(initial.challenge4);

  // Deliverables (D-01 to D-06)
  const [deliverables, setDeliverables] = useState(initial.deliverables);

  // Roadmap (Phases 1-5)
  const [phases, setPhases] = useState(initial.phases);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleResetDefaults = () => {
    const fresh = getInitialProposalValues({
      ...engagement,
      metadata: {},
    });
    setProposalRef(fresh.proposalRef);
    setValidUntil(fresh.validUntil);
    setSubtotalInput(fresh.subtotalInput);
    setExecutiveSummary(fresh.executiveSummary);
    setEngagementVision(fresh.engagementVision);
    setChallenge1(fresh.challenge1);
    setChallenge2(fresh.challenge2);
    setChallenge3(fresh.challenge3);
    setChallenge4(fresh.challenge4);
    setDeliverables(fresh.deliverables);
    setPhases(fresh.phases);
  };

  const parsedSubtotal = parseFloat(subtotalInput) || 0;
  const liveFinancials = calculateEngagementFinancials(parsedSubtotal);

  const handleSave = async (releaseToClient: boolean) => {
    if (parsedSubtotal <= 0) {
      setError("Please provide a valid positive subtotal amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const proposalData = {
      proposalRef,
      validUntil,
      subtotal: parsedSubtotal,
      executiveSummary,
      engagementVision,
      challenges: [challenge1, challenge2, challenge3, challenge4],
      deliverables,
      phases,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin/engagements/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementRef: engagement.engagement_ref,
          proposalData,
          subtotal: parsedSubtotal,
          releaseToClient,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save proposal");
      }

      setSuccess(data.message || "Proposal saved successfully!");

      const updatedEngagement: ClientEngagement = {
        ...engagement,
        current_stage: releaseToClient && engagement.current_stage === "discovery" ? "proposal" : engagement.current_stage,
        metadata: {
          ...(engagement.metadata || {}),
          proposal_data: proposalData,
          proposal_released: releaseToClient,
          contract_subtotal: liveFinancials.subtotal,
          contract_value: liveFinancials.totalFormatted,
          budget_range: liveFinancials.totalFormatted,
          deposit_amount: liveFinancials.depositFormatted,
          settlement_amount: liveFinancials.settlementFormatted,
        },
      };

      onUpdated(updatedEngagement);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2 py-0.5 rounded">
                Stage 03 Builder
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Client: <strong className="text-slate-800">{engagement.company_name}</strong> ({engagement.engagement_ref})
              </span>
            </div>
            <h2 className="text-base font-black text-[#0B2545]">
              Prepare &amp; Release Client Proposal &amp; Commercial Quotation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "summary"
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            1. Executive Summary &amp; Vision
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("challenges")}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "challenges"
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            2. Client Challenges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deliverables")}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "deliverables"
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            3. Deliverables (D-01 to D-06)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            4. Delivery Plan &amp; Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commercial")}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "commercial"
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            5. Commercial Quotation &amp; Release
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B2545] text-sm">Chapter 01: Executive Summary &amp; Engagement Vision</span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs font-semibold text-[#1565C0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reset to LIT Baseline</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Proposal Reference</label>
                  <input
                    type="text"
                    value={proposalRef}
                    onChange={(e) => setProposalRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Validity Period / Expiry</label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Executive Summary Paragraph</label>
                <textarea
                  rows={4}
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-black leading-relaxed"
                  placeholder="Summarize the mandate, baseline and commitment..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Engagement Vision &amp; Architecture Mandate</label>
                <textarea
                  rows={3}
                  value={engagementVision}
                  onChange={(e) => setEngagementVision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-black leading-relaxed"
                  placeholder="Explain the technical goals and target state..."
                />
              </div>
            </div>
          )}

          {activeTab === "challenges" && (
            <div className="space-y-4">
              <span className="font-bold text-[#0B2545] text-sm block">Chapter 02: Client Challenge &amp; Operational Bottlenecks</span>
              <p className="text-slate-500 text-[11px]">
                Specify the 4 key business and technical challenges {engagement.company_name} is solving through this engagement:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#0B2545] block">1. Legacy Fragmentation &amp; Latency</span>
                  <textarea
                    rows={2}
                    value={challenge1}
                    onChange={(e) => setChallenge1(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-black"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#0B2545] block">2. Security &amp; Compliance Deficits</span>
                  <textarea
                    rows={2}
                    value={challenge2}
                    onChange={(e) => setChallenge2(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-black"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#0B2545] block">3. Payment Intermediaries &amp; Settlement Friction</span>
                  <textarea
                    rows={2}
                    value={challenge3}
                    onChange={(e) => setChallenge3(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-black"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#0B2545] block">4. Demand for AI-Driven Intelligent Support</span>
                  <textarea
                    rows={2}
                    value={challenge4}
                    onChange={(e) => setChallenge4(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="space-y-4">
              <span className="font-bold text-[#0B2545] text-sm block">Chapter 06: Agreed Contractual Deliverables (D-01 to D-06)</span>
              <div className="space-y-3">
                {deliverables.map((d: any, idx: number) => (
                  <div key={d.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1565C0] text-xs">{d.id}</span>
                      <input
                        type="text"
                        value={d.title}
                        onChange={(e) => {
                          const updated = [...deliverables];
                          updated[idx].title = e.target.value;
                          setDeliverables(updated);
                        }}
                        className="flex-1 ml-3 px-2.5 py-1 border border-slate-300 rounded text-xs font-bold text-slate-800"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={d.description}
                      onChange={(e) => {
                        const updated = [...deliverables];
                        updated[idx].description = e.target.value;
                        setDeliverables(updated);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-black"
                      placeholder="Deliverable description..."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Format / Artifact:</span>
                        <input
                          type="text"
                          value={d.format}
                          onChange={(e) => {
                            const updated = [...deliverables];
                            updated[idx].format = e.target.value;
                            setDeliverables(updated);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-black"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Acceptance Criteria:</span>
                        <input
                          type="text"
                          value={d.acceptance}
                          onChange={(e) => {
                            const updated = [...deliverables];
                            updated[idx].acceptance = e.target.value;
                            setDeliverables(updated);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <span className="font-bold text-[#0B2545] text-sm block">Chapter 08 &amp; 09: Implementation Plan &amp; 10-Week Roadmap</span>
              <div className="space-y-3">
                {phases.map((p: any, idx: number) => (
                  <div key={idx} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1565C0] text-xs">{p.phase}</span>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const updated = [...phases];
                          updated[idx].title = e.target.value;
                          setPhases(updated);
                        }}
                        className="flex-1 ml-3 px-2.5 py-1 border border-slate-300 rounded text-xs font-bold text-slate-800"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={p.desc}
                      onChange={(e) => {
                        const updated = [...phases];
                        updated[idx].desc = e.target.value;
                        setPhases(updated);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-black"
                      placeholder="Phase description..."
                    />
                    <div>
                      <span className="text-slate-500 block mb-0.5 text-[11px]">Prerequisite Gate:</span>
                      <input
                        type="text"
                        value={p.gate}
                        onChange={(e) => {
                          const updated = [...phases];
                          updated[idx].gate = e.target.value;
                          setPhases(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "commercial" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="font-bold text-[#0B2545] text-sm block">Chapter 10 &amp; 11: Commercial Quotation &amp; Milestones</span>
                <p className="text-slate-500 text-[11px]">
                  Enter the contract subtotal. 18% statutory GST (9% CGST + 9% SGST) and the two 50/50 payment milestones are automatically calculated:
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Contract Subtotal Amount (Excluding GST)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={subtotalInput}
                    onChange={(e) => setSubtotalInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-base font-mono font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                    placeholder="900000"
                  />
                </div>
              </div>

              {/* Real-time Calculation Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Subtotal</span>
                  <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                    {liveFinancials.subtotalFormatted}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">18% GST</span>
                  <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                    {liveFinancials.gstFormatted}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl col-span-2 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Total Contract Commitment (Incl. GST)
                  </span>
                  <span className="text-base font-mono font-black text-emerald-700 mt-1 block">
                    {liveFinancials.totalFormatted}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    Two 50% Milestones of {liveFinancials.depositFormatted} each
                  </span>
                </div>
              </div>

              {/* Ready to Release Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Release Proposal to Client (Stage 03)</span>
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Releasing will unlock Stage 03 for {engagement.company_name}. The client will see the complete vertical proposal and can proceed to Stage 04 Formal Acceptance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Draft</span>
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto px-5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Save &amp; Release Proposal to Client (Unlock Stage 3)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
