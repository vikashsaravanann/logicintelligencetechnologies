import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import DiscoveryStageClient from './DiscoveryStageClient';

interface DiscoveryPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function DiscoveryStagePage({ params }: DiscoveryPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'discovery');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="discovery" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="discovery" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="discovery"
        status={stage?.status || 'available'}
      />

      <DiscoveryStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
      />
    </div>
  );
}
