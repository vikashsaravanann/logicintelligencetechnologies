'use client';

import React, { useState } from 'react';
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_CHECKLIST_PHASES } from '@/data/enterpriseDeploymentChecklist';

interface ChecklistStageClientProps {
  engagementRef: string;
}

export default function ChecklistStageClient({ engagementRef }: ChecklistStageClientProps) {
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (num: number) => {
    setSelectedItems((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num]
    );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Scope Selection Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0B2545]">Interactive Scope Selection</h2>
          <p className="text-xs text-[#52677C] mt-0.5">
            Select the checkpoints required for your enterprise architecture and audit baseline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#E7F3FF] border border-[#B9DCFF] px-4 py-2 rounded-xl text-center">
            <span className="block text-lg font-mono font-bold text-[#1565C0]">
              {selectedItems.length} / 50
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Points Selected</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Select All 50
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#DFE7EF] p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Phase selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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

      {/* Checkpoints List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isSelected = selectedItems.includes(item.number);
          return (
            <div
              key={item.number}
              onClick={() => toggleItem(item.number)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex items-start gap-4 ${
                isSelected
                  ? 'bg-blue-50/40 border-[#1565C0] shadow-xs'
                  : 'bg-white border-[#DFE7EF] hover:border-slate-300'
              }`}
            >
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

                <div className="bg-white/80 border border-slate-200/80 rounded-lg p-2 mt-2 text-[11px] text-slate-600">
                  <strong className="text-slate-700">Acceptance Criteria: </strong>
                  {item.acceptance_criteria}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs">
        {submitted ? (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 text-xs text-[#065F46] space-y-2">
            <h4 className="text-sm font-bold">✓ Checklist Scope Baseline Submitted</h4>
            <p>
              Your selection of <strong>{selectedItems.length} points</strong> has been logged to engagement reference{' '}
              <strong className="font-mono">{engagementRef}</strong>. LIT Engineering Lead has been notified to generate your Discovery & Scoping Review.
            </p>
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

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Selected points will form the basis of Stage 2 Technical Discovery.
              </span>
              <button
                type="submit"
                disabled={isSubmitting || selectedItems.length === 0}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting Scope...' : `Submit Scope (${selectedItems.length} Points) →`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
