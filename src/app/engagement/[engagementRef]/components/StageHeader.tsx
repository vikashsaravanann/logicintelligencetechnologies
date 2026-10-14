import React from 'react';
import Link from 'next/link';
import { StageKey, CANONICAL_13_STAGES, ORDERED_STAGE_KEYS, StageStatus } from '@/lib/engagements/types';

interface StageHeaderProps {
  engagementRef: string;
  stageKey: StageKey;
  status: StageStatus;
}

export default function StageHeader({ engagementRef, stageKey, status }: StageHeaderProps) {
  const currentDef = CANONICAL_13_STAGES[stageKey];
  const currentIndex = ORDERED_STAGE_KEYS.indexOf(stageKey);

  const prevKey = currentIndex > 0 ? ORDERED_STAGE_KEYS[currentIndex - 1] : null;
  const nextKey = currentIndex < ORDERED_STAGE_KEYS.length - 1 ? ORDERED_STAGE_KEYS[currentIndex + 1] : null;

  return (
    <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
      {/* Top Nav: Breadcrumb & Stage Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link href={`/engagement/${engagementRef}`} className="text-[#1565C0] hover:underline font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Visit All Stages
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Stage {currentDef.ordinal} of 13</span>
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-2">
          {prevKey ? (
            <Link
              href={`/engagement/${engagementRef}/${prevKey}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Prev ({String(CANONICAL_13_STAGES[prevKey].ordinal).padStart(2, '0')})
            </Link>
          ) : (
            <span className="px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
              ← First Stage
            </span>
          )}

          {nextKey ? (
            <Link
              href={`/engagement/${engagementRef}/${nextKey}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#1565C0] text-[#1565C0] hover:bg-[#E7F3FF] font-semibold transition-colors"
            >
              Next ({String(CANONICAL_13_STAGES[nextKey].ordinal).padStart(2, '0')}) →
            </Link>
          ) : (
            <span className="px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
              Final Stage →
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
              {String(currentDef.ordinal).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-[#1565C0] uppercase tracking-wider">
              {currentDef.badgeText}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
            {currentDef.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#52677C]">
            {currentDef.description}
          </p>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
            Status: <span className="capitalize">{status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Prerequisite Alert if Locked */}
      {status === 'locked' && currentDef.prerequisiteDesc && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold block">Stage Prerequisite Locked:</span>
            <p className="mt-0.5 text-amber-800">{currentDef.prerequisiteDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
