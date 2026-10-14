import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import AcceptanceStageClient from './AcceptanceStageClient';

interface AcceptancePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function AcceptanceStagePage({ params }: AcceptancePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'acceptance');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="acceptance"
        status={stage?.status || 'available'}
      />

      <AcceptanceStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Signatory'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
