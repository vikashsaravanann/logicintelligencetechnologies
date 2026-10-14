import React from 'react';
import Link from 'next/link';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import { CANONICAL_13_STAGES, ORDERED_STAGE_KEYS, StageKey, StageStatus } from '@/lib/engagements/types';
import VisitAllFilterClient from './components/VisitAllFilterClient';

interface EngagementPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function EngagementVisitAllPage({ params }: EngagementPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stages = await getEngagementStages(engagement?.id || 'sample');

  // Map database stages into keyed map
  const stagesByKey: Record<string, (typeof stages)[0]> = {};
  for (const s of stages) {
    stagesByKey[s.stage_key] = s;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#E7F3FF] border border-[#B9DCFF] px-3 py-1 rounded-full text-xs font-semibold text-[#1565C0]">
            <span className="w-2 h-2 rounded-full bg-[#1565C0] animate-pulse" />
            Universal 13-Stage Enterprise Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Client Journey & Milestone Portal
          </h1>
          <p className="text-sm text-[#52677C] leading-relaxed">
            Welcome, <strong className="text-slate-800">{engagement?.contact_name || 'Client Representative'}</strong> ({engagement?.company_name || 'Organization'}). 
            This portal tracks your complete 13-stage engineering lifecycle from the initial 50-point checklist baseline to final IP handover and post-launch SLA support.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#1FA9A2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified MSME: UDYAM-TN-03-0345274
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Super-Admin Gated Transitions
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manual Bank UPI Clearance
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 13-Stage Grid with Filter Component */}
      <VisitAllFilterClient
        engagementRef={engagementRef}
        stages={stages}
      />
    </div>
  );
}
