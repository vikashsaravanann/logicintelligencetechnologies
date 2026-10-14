import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import DiscoveryStageClient from './DiscoveryStageClient';

interface DiscoveryPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function DiscoveryStagePage({ params }: DiscoveryPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'discovery');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="discovery"
        status={stage?.status || 'available'}
      />

      <DiscoveryStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client'}
      />
    </div>
  );
}
