import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import TechnicalSpecStageClient from './TechnicalSpecStageClient';

interface TechnicalSpecPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function TechnicalSpecStagePage({ params }: TechnicalSpecPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'technical-spec');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="technical-spec"
        status={stage?.status || 'available'}
      />

      <TechnicalSpecStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
      />
    </div>
  );
}
