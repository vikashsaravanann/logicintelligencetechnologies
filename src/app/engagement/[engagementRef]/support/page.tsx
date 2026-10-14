import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import SupportStageClient from './SupportStageClient';

interface SupportPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function SupportStagePage({ params }: SupportPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'support');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="support"
        status={stage?.status || 'available'}
      />

      <SupportStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Lead'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
