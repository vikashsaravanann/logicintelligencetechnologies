'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EngagementStage, CANONICAL_13_STAGES, StageKey, StageStatus } from '@/lib/engagements/types';

interface VisitAllFilterClientProps {
  engagementRef: string;
  stages: EngagementStage[];
}

export default function VisitAllFilterClient({ engagementRef, stages }: VisitAllFilterClientProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map database stages into keyed map
  const stagesByKey: Record<string, EngagementStage> = {};
  for (const s of stages) {
    stagesByKey[s.stage_key] = s;
  }

  const allStageKeys = Object.keys(CANONICAL_13_STAGES) as StageKey[];

  const filteredStages = allStageKeys.filter((key) => {
    const def = CANONICAL_13_STAGES[key];
    const stage = stagesByKey[key];
    const status: StageStatus = stage?.status || (def.ordinal === 1 ? 'available' : 'locked');

    // Filter tab criteria
    if (filter === 'completed') {
      const isCompleted = ['completed', 'signed', 'verified', 'paid', 'accepted'].includes(status);
      if (!isCompleted) return false;
    } else if (filter === 'active') {
      const isActive = ['available', 'in_progress', 'submitted', 'under_review', 'payment_requested', 'verification_pending'].includes(status);
      if (!isActive) return false;
    } else if (filter === 'locked') {
      if (status !== 'locked') return false;
    }

    // Search query criteria
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = def.title.toLowerCase().includes(q);
      const matchDesc = def.description.toLowerCase().includes(q);
      const matchKey = def.key.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchKey;
    }

    return true;
  });

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'completed':
      case 'accepted':
      case 'paid':
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]" />
            Completed
          </span>
        );
      case 'signed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]" />
            Signed & Executed
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Approved
          </span>
        );
      case 'in_progress':
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0] animate-pulse" />
            Available Now
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Under Review
          </span>
        );
      case 'payment_requested':
      case 'verification_pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Bank Credit Audit Pending
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#DFE7EF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#0B2545] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stages (13)
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === 'active'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active & Available
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-[#065F46] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === 'locked'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Locked (Gated)
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stages, documents..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 13 Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStages.map((key) => {
          const def = CANONICAL_13_STAGES[key];
          const stage = stagesByKey[key];
          const status: StageStatus = stage?.status || (def.ordinal === 1 ? 'available' : 'locked');
          const isLocked = status === 'locked';

          return (
            <div
              key={key}
              className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 p-6 ${
                isLocked
                  ? 'bg-slate-50/80 border-slate-200 opacity-90'
                  : 'bg-white border-[#DFE7EF] shadow-xs hover:shadow-md hover:border-[#1565C0]/40'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Ordinal & Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                      {String(def.ordinal).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-[#52677C] uppercase tracking-wider">
                      Stage {def.ordinal}
                    </span>
                  </div>
                  {getStatusBadge(status)}
                </div>

                {/* Stage Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-[#0B2545] tracking-tight mb-1.5">
                    {def.title}
                  </h3>
                  <p className="text-xs text-[#52677C] leading-relaxed">
                    {def.description}
                  </p>
                </div>

                {/* Document Master Reference if linked */}
                {def.documentMasterRef && (
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700">
                    <svg className="w-3.5 h-3.5 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>{def.documentMasterRef}</span>
                  </div>
                )}

                {/* Safe Locked Status Rationale */}
                {isLocked && def.prerequisiteDesc && (
                  <div className="bg-slate-100/90 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Prerequisite Required
                    </div>
                    <p className="leading-normal">{def.prerequisiteDesc}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link
                  href={`/engagement/${engagementRef}/${def.key}`}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                    isLocked
                      ? 'bg-slate-200/70 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-[#0B2545] hover:bg-[#1565C0] text-white shadow-xs'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Safe Status & Prerequisites</span>
                    </>
                  ) : (
                    <>
                      <span>Open Stage & Action</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStages.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <p className="font-semibold text-slate-700 text-sm">No stages match your filter or search query.</p>
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#1565C0] hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
