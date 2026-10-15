import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import { CANONICAL_13_STAGES, ORDERED_STAGE_KEYS, StageKey, StageStatus } from '@/lib/engagements/types';
import EngagementVisitAllClient from './EngagementVisitAllClient';

interface EngagementPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function EngagementVisitAllPage({ params }: EngagementPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);

  if (!engagement) {
    notFound();
  }

  const stages = await getEngagementStages(engagement.id);

  // Map database stages into keyed map
  const stagesByKey: Record<string, (typeof stages)[0]> = {};
  for (const s of stages) {
    stagesByKey[s.stage_key] = s;
  }

  const completedCount = stages.filter((s) => ['completed', 'signed', 'verified', 'paid', 'accepted'].includes(s.status)).length;
  const activeCount = stages.filter((s) => ['available', 'in_progress', 'submitted', 'under_review', 'payment_requested', 'verification_pending'].includes(s.status)).length;
  const lockedCount = stages.filter((s) => s.status === 'locked').length;
  const progressPercent = Math.round((completedCount / 13) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="rounded-2xl border border-[#DFE7EF] bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#52677C]">
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

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <div className="bg-[#F7F9FC] border border-[#DFE7EF] p-4 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-[#52677C] uppercase tracking-wider block mb-1">
                Portfolio Reference
              </span>
              <span className="font-mono text-sm font-bold text-[#0B2545] block">
                {engagement?.engagement_ref || engagementRef}
              </span>
              <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Engagement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#DFE7EF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52677C] uppercase tracking-wider">Total Stages</span>
            <span className="p-2 rounded-xl bg-[#E7F3FF] text-[#1565C0]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B2545]">13</span>
            <span className="text-xs font-medium text-[#52677C]">Canonical</span>
          </div>
          <p className="mt-1 text-xs text-[#52677C]">A-Z end-to-end lifecycle</p>
        </div>

        <div className="rounded-2xl border border-[#DFE7EF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52677C] uppercase tracking-wider">Completed</span>
            <span className="p-2 rounded-xl bg-[#ECFDF5] text-[#065F46]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#065F46]">{completedCount}</span>
            <span className="text-xs font-semibold text-emerald-600">({progressPercent}%)</span>
          </div>
          <p className="mt-1 text-xs text-[#52677C]">Verified & signed off</p>
        </div>

        <div className="rounded-2xl border border-[#DFE7EF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52677C] uppercase tracking-wider">Active & Actionable</span>
            <span className="p-2 rounded-xl bg-[#E7F3FF] text-[#1565C0]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1565C0]">{activeCount}</span>
            <span className="text-xs font-medium text-[#52677C]">Stages</span>
          </div>
          <p className="mt-1 text-xs text-[#52677C]">In-progress / awaiting action</p>
        </div>

        <div className="rounded-2xl border border-[#DFE7EF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52677C] uppercase tracking-wider">Gated / Locked</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{lockedCount}</span>
            <span className="text-xs font-medium text-slate-500">Prerequisites</span>
          </div>
          <p className="mt-1 text-xs text-[#52677C]">Protected stage gates</p>
        </div>
      </div>

      {/* Architectural Distinction & Separation Callout */}
      <div className="rounded-2xl border border-[#B9DCFF] bg-[#E7F3FF]/60 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-[#0B2545] text-sm">
              Architectural Separation & Proposal Integration Model
            </p>
            <p className="text-[#52677C] leading-relaxed">
              Scope of Work, legal deliverables, and SLA terms are unified in the <strong>Proposal & SOW (Stages 3 & 4)</strong>. 
              Crucially, the <strong>50-Point Checklist (Stage 1)</strong>, <strong>Initial 50% Invoice (Stage 6)</strong>, <strong>Infrastructure Onboarding (Stage 7)</strong>, and <strong>Final Settlement (Stage 11)</strong> remain strictly separate operational gates requiring isolated security sign-offs.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Link
            href={`/engagement/${engagementRef}/checklist`}
            className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-[#DFE7EF] text-[#0B2545] font-semibold text-xs px-3 py-2 rounded-xl shadow-2xs transition-colors"
          >
            Checklist (Stg 1)
          </Link>
          <Link
            href={`/engagement/${engagementRef}/initial-invoice`}
            className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-[#DFE7EF] text-[#1565C0] font-semibold text-xs px-3 py-2 rounded-xl shadow-2xs transition-colors"
          >
            Invoice (Stg 6)
          </Link>
        </div>
      </div>

      {/* Interactive 13-Stage Grid with Filter Component */}
      <EngagementVisitAllClient
        engagementRef={engagementRef}
        stages={stages}
      />
    </div>
  );
}
