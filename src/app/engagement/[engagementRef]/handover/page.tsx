import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import HandoverStageClient from './HandoverStageClient';

interface HandoverPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function HandoverStagePage({ params }: HandoverPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'handover');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="handover"
        status={stage?.status || 'available'}
      />

      <HandoverStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Lead'}
      />
    </div>
  );
}
