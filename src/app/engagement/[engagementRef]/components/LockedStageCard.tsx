import React from 'react';
import Link from 'next/link';
import { StageKey, CANONICAL_13_STAGES, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';

interface LockedStageCardProps {
  engagementRef: string;
  stageKey: StageKey;
}

export default function LockedStageCard({ engagementRef, stageKey }: LockedStageCardProps) {
  const currentDef = CANONICAL_13_STAGES[stageKey];
  const prereqKey = currentDef.prerequisiteKey;
  const prereqDef = prereqKey ? CANONICAL_13_STAGES[prereqKey] : null;

  return (
    <div className="bg-white rounded-2xl border border-[#DFE7EF] p-8 sm:p-12 shadow-xs text-center max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Lock Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Stage Number & Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Stage {String(currentDef.ordinal).padStart(2, '0')} · Locked by Governance</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
          {currentDef.title}
        </h2>
        <p className="text-sm text-[#52677C] max-w-xl mx-auto leading-relaxed">
          {currentDef.description}
        </p>
      </div>

      {/* Prerequisite Gate Explanation */}
      <div className="bg-[#F7F9FC] border border-[#DFE7EF] rounded-xl p-5 text-left space-y-2 max-w-xl mx-auto text-xs text-[#0B2545]">
        <div className="flex items-center gap-2 font-bold text-[#0B2545]">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Required Prerequisite Milestone</span>
        </div>
        <p className="text-[#52677C] leading-relaxed">
          {currentDef.prerequisiteDesc || 'Previous project lifecycle milestone must be completed and reviewed.'}
        </p>
        <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
          In accordance with LIT engineering and commercial governance, interactive forms, financial QR codes, and confidential documents remain locked until the prerequisite stage is formally submitted and verified.
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {prereqKey && prereqDef && (
          <Link
            href={`/engagement/${engagementRef}/${prereqKey}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#1565C0] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Complete Stage {prereqDef.ordinal}: {prereqDef.title}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}

        <Link
          href={`/engagement/${engagementRef}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#DFE7EF] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>Return to All Stages</span>
        </Link>
      </div>
    </div>
  );
}
