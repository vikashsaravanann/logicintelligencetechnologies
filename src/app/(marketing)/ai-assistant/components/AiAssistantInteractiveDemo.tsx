"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldAlert,
  Search,
} from "lucide-react";

interface QueryScenario {
  id: string;
  query: string;
  category: string;
  genericResponse: string;
  genericWarning: string;
  litResponse: string;
  citation: string;
  confidence: string;
}

const SCENARIOS: QueryScenario[] = [
  {
    id: "cancellation",
    query: "What is the penalty fee if a client cancels a reservation 24 hours before check-in?",
    category: "Hospitality & Travel",
    genericResponse:
      "Most hotels usually charge the first night fee or a 50% cancellation fee depending on the rate plan you selected, but you might be able to get a full refund if you call customer service.",
    genericWarning: "Invented vague policy from open internet training data. Risk of customer disputes.",
    litResponse:
      "Under Section 4.2 of your approved Cancellation Terms (v2026.1), cancellations received within 24 to 48 hours incur a flat 25% administrative fee. Cancellations under 24 hours forfeit the first night room charge.",
    citation: "Document: Standard_Cancellation_Policy_2026.pdf (Page 4, §4.2)",
    confidence: "99.8% Ground Truth Match",
  },
  {
    id: "tds-invoicing",
    query: "Do your enterprise contracts include GST compliance and Form 16A TDS certificates?",
    category: "Enterprise Billing",
    genericResponse:
      "Yes, we probably accept all tax certificates and provide general tax invoices according to standard corporate laws.",
    genericWarning: "Unverified assumption. Lacks legal and financial accuracy.",
    litResponse:
      "Yes. All corporate billing includes 18% GST invoicing with SAC code 998313. TDS under Section 194J (2% or 10%) is fully reconciled with quarterly Form 16A digitally verified certificates uploaded directly to your client billing portal.",
    citation: "Document: Corporate_Financial_Terms_Schedule_C.pdf (§3.1)",
    confidence: "100% Deterministic Match",
  },
  {
    id: "clinical-hours",
    query: "Can the assistant prescribe antibiotics for post-op dental infection symptoms?",
    category: "Healthcare Guardrail",
    genericResponse:
      "For dental infections, amoxicillin 500mg three times daily is commonly prescribed, but you should rinse with salt water in the meantime.",
    genericWarning: "DANGEROUS: Illegal autonomous medical prescription. High malpractice liability.",
    litResponse:
      "I cannot provide medical prescriptions or clinical diagnoses. For acute post-operative symptoms, please contact Dr. Saravanan's emergency triage desk immediately at +91 98400 12345 or visit our emergency suite.",
    citation: "Deterministic Safety Gate: Clinical_Liability_Exclusion_Rule #CL-09",
    confidence: "Strict Guardrail Triggered",
  },
];

export default function AiAssistantInteractiveDemo() {
  const [selectedId, setSelectedId] = useState<string>("cancellation");

  const activeScenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  return (
    <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Ground-Truth Evaluation</span>
          </div>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
            Generic LLM vs Private LIT RAG Engine
          </h2>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1 max-w-2xl">
            See how generic internet models hallucinate answers while LIT private architecture guarantees strictly bounded, cited truth.
          </p>
        </div>

        {/* Query Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[var(--lit-cloud,#F7F9FC)] p-1.5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)]">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedId(scenario.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-poppins font-bold transition-all ${
                selectedId === scenario.id
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
              }`}
            >
              {scenario.category}
            </button>
          ))}
        </div>
      </div>

      {/* Active User Question Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] shrink-0">
          <Search className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
        </div>
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            Incoming User Question
          </div>
          <p className="font-poppins text-sm sm:text-base font-semibold text-[var(--lit-navy,#0B2545)] mt-0.5">
            &ldquo;{activeScenario.query}&rdquo;
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Generic LLM (Hallucinating) */}
        <div className="rounded-3xl border border-[#FFCDD2] bg-[#FFF5F5] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C62828] px-2.5 py-1 rounded-full bg-[#FFEBEE] border border-[#FFCDD2]">
                Generic Open-Web LLM
              </span>
              <AlertTriangle className="w-4 h-4 text-[#C62828]" />
            </div>

            <div className="text-xs sm:text-sm text-[#374151] leading-relaxed italic bg-white/60 p-4 rounded-2xl border border-[#FFCDD2]/60">
              &ldquo;{activeScenario.genericResponse}&rdquo;
            </div>
          </div>

          <div className="pt-4 border-t border-[#FFCDD2] flex items-start gap-2.5 text-xs text-[#C62828]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight font-medium">{activeScenario.genericWarning}</span>
          </div>
        </div>

        {/* Right: LIT Private RAG (Deterministic & Cited) */}
        <div className="rounded-3xl border border-[#BBDEFB] bg-[#F0F7FF] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0] px-2.5 py-1 rounded-full bg-[#E3F2FD] border border-[#BBDEFB]">
                LIT Private RAG Engine
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#2E7D32]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeScenario.confidence}</span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] leading-relaxed font-medium bg-white p-4 rounded-2xl border border-[#BBDEFB] shadow-xs">
              &ldquo;{activeScenario.litResponse}&rdquo;
            </div>
          </div>

          <div className="pt-4 border-t border-[#BBDEFB] space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Verified Ground Truth Citation
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1565C0]">
              <FileText className="w-3.5 h-3.5" />
              <span>{activeScenario.citation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
