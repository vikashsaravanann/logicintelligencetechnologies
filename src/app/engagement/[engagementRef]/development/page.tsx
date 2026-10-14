import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import DevelopmentStageClient from './DevelopmentStageClient';

interface DevelopmentPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function DevelopmentStagePage({ params }: DevelopmentPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'development');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="development"
        status={stage?.status || 'available'}
      />

      <DevelopmentStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
      />
    </div>
  );
}
