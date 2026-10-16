import React from 'react';
import { Metadata } from 'next';
import { listAllEngagements, getEngagementStages } from '@/lib/engagements/db';
import EngagementHubClient, { EngagementWithStages } from './EngagementHubClient';

import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Client Lifecycle & Engagement Registry | Logic Intelligence Technologies',
  description:
    'Universal 13-stage client lifecycle portal, technical requirements intake, proposal governance, and verified manual bank payment reconciliation.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{ status?: string; q?: string }>;
};

export default async function EngagementHubPage({ searchParams }: PageProps) {
  const isSuperAdmin = await isCurrentUserSuperAdmin();
  if (!isSuperAdmin) {
    redirect('/login?next=/admin/engagements');
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status?.trim() || '';
  const query = resolvedParams.q?.trim().toLowerCase() || '';

  const rawEngagements = await listAllEngagements();

  // Populate stage telemetry for each engagement
  const engagementsWithStages: EngagementWithStages[] = await Promise.all(
    rawEngagements.map(async (eng) => {
      const stages = await getEngagementStages(eng.id);
      const completedCount = stages.filter((s) =>
        ['completed', 'signed', 'verified', 'paid', 'accepted'].includes(s.status)
      ).length;
      return {
        ...eng,
        stages,
        completedCount,
        progressPercent: Math.round((completedCount / 13) * 100),
      };
    })
  );

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] font-sans text-[var(--lit-ink,#121826)] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[var(--lit-blue,#1565C0)]/15 selection:text-[var(--lit-navy,#0B2545)]">
      <EngagementHubClient
        initialEngagements={engagementsWithStages}
        initialStatusFilter={statusFilter}
        initialQuery={query}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
