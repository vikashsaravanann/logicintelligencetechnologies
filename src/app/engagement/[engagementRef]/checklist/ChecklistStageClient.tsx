'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_CHECKLIST_PHASES } from '@/data/enterpriseDeploymentChecklist';

interface ChecklistStageClientProps {
  engagementRef: string;
  initialSelectedItems?: number[];
  initialNotes?: string;
  initialStatus?: string;
}

const FAQ_ITEMS = [
  {
    q: 'What if I am unsure about certain technical checkpoints?',
    a: 'You do not need to be an expert in every technical tier. Select what aligns with your project goals or leave them unmarked. During Stage 2 (Discovery Review), our Principal Engineering Architect will walk through every item with you and make tailored recommendations.'
  },
  {
    q: 'Can I add or remove checkpoints after submitting this stage?',
    a: 'Yes. Your submission forms the initial scope baseline. During Stage 2 Discovery and Stage 3 Proposal formulation, checkpoints can be adjusted, added, or deferred to future phases before the formal Statement of Work (Stage 5) is locked.'
  },
  {
    q: 'Does selecting more checkpoints immediately increase the cost?',
    a: 'Not automatically. Many foundational checkpoints (such as TLS encryption, PostgreSQL RLS, and clean Git workflows) are standard baseline practices included across all enterprise engagements. Custom specialized modules (e.g. bespoke FHIR middleware or specialized AI models) are priced transparently in Stage 3.'
  },
  {
    q: 'How does LIT ensure compliance and architectural integrity?',
    a: 'Every selected checkpoint maps directly to concrete engineering deliverables and acceptance criteria. In Stage 8 (Technical Spec) and Stage 10 (Delivery & Acceptance), each item is validated against automated test suites and cryptographic verification ledgers.'
  },
  {
    q: 'What happens immediately after I submit this checklist?',
    a: 'Your selections are cryptographically hashed (SHA-256) and recorded to the Supabase engagement ledger. Dual notification alerts are sent to your team and our engineering queue. Once a Principal Architect reviews the baseline, Stage 2 unlocks automatically.'
  }
];

export default function ChecklistStageClient({
  engagementRef,
  initialSelectedItems = [],
  initialNotes = '',
  initialStatus = 'available',
}: ChecklistStageClientProps) {
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedItems, setSelectedItems] = useState<number[]>(initialSelectedItems);
  const [priorities, setPriorities] = useState<Record<number, 'Essential' | 'Preferred' | 'Future'>>({});
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Record<number, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const isFormSubmitted = ['submitted', 'completed', 'under_review', 'approved', 'verified', 'accepted'].includes(initialStatus || '');
  const [submitted, setSubmitted] = useState(isFormSubmitted);
  const [currentStatus, setCurrentStatus] = useState(initialStatus || 'available');
  const [auditHash, setAuditHash] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleItem = (num: number) => {
    setSelectedItems((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num]
    );
  };

  const setPriority = (num: number, priority: 'Essential' | 'Preferred' | 'Future', e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorities((prev) => ({ ...prev, [num]: priority }));
  };

  const toggleExpand = (num: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCheckpoints((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const selectAll = () => {
    setSelectedItems(ENTERPRISE_CHECKPOINTS.map((c) => c.number));
  };

  const clearAll = () => {
    setSelectedItems([]);
  };

  const filteredItems = ENTERPRISE_CHECKPOINTS.filter((item) => {
    if (selectedPhase !== 'all' && item.phase !== selectedPhase) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = String(item.number).includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchReq = item.engineering_requirement.toLowerCase().includes(q);
      return matchNum || matchTitle || matchReq;
    }
    return true;
  });

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft',
          payload: {
            selectedItems,
            priorities,
            notes,
            totalSelected: selectedItems.length,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save draft');
      }
      setAuditHash(data.auditHash);
      setFeedbackMessage('Draft saved successfully with verified cryptographic digest.');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving draft';
      setErrorMessage(msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one enterprise checkpoint before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_checklist',
          payload: {
            selectedItems,
            priorities,
            notes,
            totalSelected: selectedItems.length,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit checklist scope');
      }

      setSubmitted(true);
      setCurrentStatus('under_review');
      setAuditHash(data.auditHash);
      setFeedbackMessage('Scope baseline formally submitted. Dual receipt and alert emails dispatched.');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting checklist';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Educational Header & Introduction */}
      <div className="bg-gradient-to-br from-[#0B2545] to-[#133E68] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sky-200 border border-white/15">
            <span>Stage 01 of 13</span>
            <span>·</span>
            <span>Canonical Scoping Blueprint</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Start Your Project — 50-Point Enterprise Requirements Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Welcome to the Logic Intelligence Technologies engagement onboarding system. This 50-point checklist encompasses all critical layers of modern production engineering: foundational architecture, multi-tenant databases, strict security and Row-Level Security (RLS), custom REST/GraphQL APIs, high-performance web frontends, deterministic AI pipelines, and continuous integration.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tell us which engineering, business, and operational capabilities your project requires. You do not need to know every technical term; expand any checkpoint to read what it means and why it matters. Select only the requirements relevant to your initiative. Submitted choices form the foundational basis for Stage 2 Discovery and Stage 3 Commercial Proposal.
          </p>
        </div>

        {/* 4-Step Scoping Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="font-mono text-[10px] text-sky-300 font-bold block mb-1">STEP 01</span>
            <p className="font-semibold text-white">Select Requirements</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Filter & mark key items across 8 phases.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="font-mono text-[10px] text-sky-300 font-bold block mb-1">STEP 02</span>
            <p className="font-semibold text-white">LIT Review</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Principal architects evaluate technical fit.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="font-mono text-[10px] text-sky-300 font-bold block mb-1">STEP 03</span>
            <p className="font-semibold text-white">Discovery Clarifications</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Stage 2 resolves edge cases & roles.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="font-mono text-[10px] text-sky-300 font-bold block mb-1">STEP 04</span>
            <p className="font-semibold text-white">Locked SOW</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Contractual baseline ready in Stage 5.</p>
          </div>
        </div>
      </div>

      {/* Scope Selection Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0B2545]">Interactive Scope Selection</h2>
          <p className="text-xs text-[#52677C] mt-0.5">
            Select the checkpoints required for your enterprise architecture and audit baseline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#E7F3FF] border border-[#B9DCFF] px-4 py-2 rounded-xl text-center">
            <span className="block text-lg font-mono font-bold text-[#1565C0]">
              {selectedItems.length} / 50
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Points Selected</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={selectAll}
              type="button"
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Select All 50
            </button>
            <button
              onClick={clearAll}
              type="button"
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          {!submitted && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || isSavingDraft || selectedItems.length === 0}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : `Submit (${selectedItems.length}) →`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#DFE7EF] p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Phase selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedPhase('all')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedPhase === 'all'
                ? 'bg-[#0B2545] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All 8 Phases
          </button>
          {ENTERPRISE_CHECKLIST_PHASES.map((p) => (
            <button
              key={p.phase}
              onClick={() => setSelectedPhase(p.phase)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedPhase === p.phase
                  ? 'bg-[#1565C0] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Phase {p.phase}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full lg:w-64 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search checkpoints..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notifications */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{feedbackMessage}</span>
          {auditHash && <span className="font-mono text-[10px] text-emerald-600">SHA-256: {auditHash.slice(0, 16)}...</span>}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Checkpoints List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isSelected = selectedItems.includes(item.number);
          const currentPriority = priorities[item.number] || 'Essential';
          const isExpanded = !!expandedCheckpoints[item.number];

          return (
            <div
              key={item.number}
              onClick={() => toggleItem(item.number)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col gap-3 ${
                isSelected
                  ? 'bg-blue-50/40 border-[#1565C0] shadow-2xs'
                  : 'bg-white border-[#DFE7EF] hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div
                    className="w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                  />
                </div>

                {/* Ordinal Pill */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#0B2545]">
                  {String(item.number).padStart(2, '0')}
                </div>

                {/* Checkpoint Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#0B2545]">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Phase {item.phase}: {item.phase_title}</span>
                      <span>•</span>
                      <span>PDF Page {item.pdf_page}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-700">Engineering Requirement: </strong>
                    {item.engineering_requirement}
                  </p>

                  <div className="bg-white/80 border border-slate-200/80 rounded-lg p-2.5 mt-2 text-[11px] text-slate-600">
                    <strong className="text-slate-700">Acceptance Criteria: </strong>
                    {item.acceptance_criteria}
                  </div>
                </div>
              </div>

              {/* Priority Selection & Expand Toggle */}
              {isSelected && (
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Priority:</span>
                    {(['Essential', 'Preferred', 'Future'] as const).map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={(e) => setPriority(item.number, pri, e)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          currentPriority === pri
                            ? pri === 'Essential'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : pri === 'Preferred'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleExpand(item.number, e)}
                    className="text-[11px] font-semibold text-[#1565C0] hover:text-[#0B2545] inline-flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Architecture Rationale ▲' : 'Why would I need this? ▼'}</span>
                  </button>
                </div>
              )}

              {/* Expandable Architecture Detail */}
              {isSelected && isExpanded && (
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs space-y-2 mt-1">
                  <div>
                    <span className="font-bold text-[#0B2545] text-[11px] block">Why would I need this?</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Ensures resilient enterprise operability, preventing technical debt, security regressions, or platform downtime as user concurrency expands.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#1FA9A2] text-[11px] block">What LIT will deliver:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Formal TypeScript contracts, PostgreSQL migration scripts, automated unit tests, and documented acceptance evidence linked to Stage 10.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5-Item Scoping FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">Frequently Asked Questions</h3>
          <p className="text-xs text-[#52677C]">
            Common guidance regarding the 50-point scoping process and architectural lifecycle.
          </p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-4 py-3 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-[#0B2545] transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-mono text-sm">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs">
        {['approved', 'verified', 'completed', 'accepted'].includes(currentStatus) ? (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-6 text-xs text-[#065F46] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] uppercase tracking-wider mb-2">
                  ✓ Verified & Approved
                </span>
                <h4 className="text-base font-bold text-[#065F46]">
                  Scope Baseline Formally Approved by LIT Engineering
                </h4>
                <p className="text-xs text-[#047857] mt-1">
                  Your baseline of <strong>{selectedItems.length} checkpoints</strong> has been reviewed, ratified, and unlocked for Stage 2: Technical Discovery.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-2xl font-black text-[#065F46]">{selectedItems.length}</span>
                <span className="text-[11px] text-slate-500 block">/ 50 Approved</span>
              </div>
            </div>

            {auditHash && (
              <p className="font-mono text-[11px] text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-200">
                Cryptographic Audit Digest: {auditHash}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/engagement/${engagementRef}/discovery`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#065F46] hover:bg-[#044e39] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <span>Proceed to Stage 2: Technical Discovery →</span>
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2"
              >
                Modify Scope Selection
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-xs text-amber-900 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
                  ⏳ Under Review · Awaiting LIT Admin Approval
                </span>
                <h4 className="text-base font-bold text-amber-950">
                  Checklist Scope Formally Submitted & Queued for Review
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Your selection of <strong>{selectedItems.length} checkpoints</strong> has been recorded to engagement reference{' '}
                  <strong className="font-mono">{engagementRef}</strong>. Dual confirmation emails have been dispatched to your email and the LIT Engineering Admin Queue.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-2xl font-black text-amber-900">{selectedItems.length}</span>
                <span className="text-[11px] text-amber-700 block">/ 50 Selected</span>
              </div>
            </div>

            <div className="bg-white/80 border border-amber-200 rounded-lg p-3 text-[11px] text-slate-700 space-y-1">
              <p className="font-semibold text-amber-950">Gated Progression Policy:</p>
              <p className="text-slate-600">
                Per Section 3 of the LIT Master Delivery Standard, Stage 2 (Technical Discovery) will unlock immediately once a Principal Architect approves your scope baseline. You will receive an automated approval notification email with your direct access link upon sign-off.
              </p>
            </div>

            {auditHash && (
              <p className="font-mono text-[11px] text-slate-600 bg-white/70 p-2.5 rounded border border-amber-200">
                Cryptographic Audit Digest: {auditHash}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Modify Scope Selection
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Specific Scope Notes or Clarification Requests
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail any existing systems, EHR/EMR platforms, custom API requirements, or compliance deadlines..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Selected points will form the basis of Stage 2 Technical Discovery.
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isSavingDraft || selectedItems.length === 0}
                  className="w-full sm:w-auto bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Scope...' : `Submit Scope (${selectedItems.length} Points) →`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Sticky Bottom Floating Action Bar */}
      {!submitted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DFE7EF] py-3.5 px-4 sm:px-8 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0] animate-pulse" />
              <span className="text-xs font-semibold text-[#0B2545]">
                <strong className="font-mono text-sm text-[#1565C0]">{selectedItems.length}</strong> of 50 Checkpoints Selected
              </span>
              <span className="hidden md:inline text-xs text-slate-400">|</span>
              <span className="hidden md:inline text-xs text-slate-500">
                Phase breakdown: {ENTERPRISE_CHECKLIST_PHASES.map((p) => `${selectedItems.filter((num) => ENTERPRISE_CHECKPOINTS.find((c) => c.number === num)?.phase === p.phase).length} P${p.phase}`).join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || isSavingDraft || selectedItems.length === 0}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting Scope...' : `Submit Scope (${selectedItems.length} Points) →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
