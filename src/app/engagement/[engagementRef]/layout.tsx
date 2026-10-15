import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import { CANONICAL_13_STAGES, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';
import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
import { SuperAdminInspectButton } from '@/components/shared/SuperAdminInspectButton';
import IdentityCorrectionButton from './components/IdentityCorrectionButton';

export const metadata = {
  title: 'Client Lifecycle Portal · Logic Intelligence Technologies',
  description: 'Confidential client lifecycle engagement portal for enterprise delivery and milestone governance.',
  robots: {
    index: false,
    follow: false,
  },
};

interface EngagementLayoutProps {
  children: React.ReactNode;
  params: Promise<{ engagementRef: string }>;
}

export default async function EngagementLayout({ children, params }: EngagementLayoutProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);

  if (!engagement) {
    notFound();
  }

  const stages = await getEngagementStages(engagement.id);
  const isSuperAdmin = await isCurrentUserSuperAdmin();

  const completedCount = stages.filter((s) => ['completed', 'signed', 'verified', 'paid', 'accepted'].includes(s.status)).length;
  const progressPercent = Math.round((completedCount / 13) * 100);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#121826] font-sans flex flex-col selection:bg-[#1565C0]/20 selection:text-[#0B2545]">
      {/* Top Authoritative Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DFE7EF] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Wordmark */}
            <div className="flex items-center gap-4">
              <Link href={`/engagement/${engagementRef}`} className="flex items-center gap-3 group">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#DFE7EF] shadow-xs transition-transform group-hover:scale-105">
                  <Image
                    src="/assets/logo-icon.jpg"
                    alt="Logic Intelligence Technologies"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <span className="block text-[13px] font-bold tracking-wider text-[#0B2545] uppercase">
                    LOGIC INTELLIGENCE TECHNOLOGIES
                  </span>
                  <span className="block text-xs font-medium text-[#52677C]">
                    Client Lifecycle Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Engagement Reference & Client Pill */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-[#E7F3FF] border border-[#B9DCFF] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1565C0]">
                Ref: {engagement?.engagement_ref || engagementRef}
              </div>
              <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 max-w-[240px] truncate">
                {engagement?.company_name || 'Client Engagement'}
              </div>
            </div>

            {/* Actions: Super Admin Inspect, Visit All & Identity Correction */}
            <div className="flex items-center gap-2.5">
              <SuperAdminInspectButton
                href={`/admin/engagements/${engagement?.id || engagementRef}`}
                initialIsSuperAdmin={isSuperAdmin}
                title="Super Admin: Inspect Engagement in Admin Lifecycle Controller"
                showBadge
              />
              <IdentityCorrectionButton
                engagementId={engagement?.id || ''}
                engagementRef={engagement?.engagement_ref || engagementRef}
                currentCompanyName={engagement?.company_name || ''}
              />
              <Link
                href={`/engagement/${engagementRef}`}
                className="inline-flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#1565C0] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Visit All Stages</span>
              </Link>
            </div>
          </div>

          {/* 13-Stage Linear Progress Indicator */}
          <div className="py-2.5 border-t border-[#DFE7EF]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0B2545]">Progress:</span>
              <span className="text-[#52677C]">{completedCount} of 13 Stages Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full sm:w-64 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-[#1565C0] to-[#1FA9A2] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 8)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Corporate Confidential Footer */}
      <footer className="bg-white border-t border-[#DFE7EF] py-8 text-xs text-[#52677C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-[#DFE7EF]">
              <Image src="/assets/logo-icon.jpg" alt="LIT" fill className="object-cover" />
            </div>
            <p className="font-medium text-[#0B2545]">
              Logic Intelligence Technologies · Confidential Client Workspace
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Udyam: UDYAM-TN-03-0345274</span>
            <span>·</span>
            <span>Manual UPI Clearance</span>
            <span>·</span>
            <a
              href="mailto:hello@logicintelligencetechnologies.in"
              className="text-[#1565C0] hover:underline font-medium"
            >
              hello@logicintelligencetechnologies.in
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
