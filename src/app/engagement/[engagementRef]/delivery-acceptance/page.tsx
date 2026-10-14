import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import DeliveryAcceptanceStageClient from './DeliveryAcceptanceStageClient';

interface DeliveryAcceptancePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function DeliveryAcceptanceStagePage({ params }: DeliveryAcceptancePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'delivery-acceptance');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="delivery-acceptance"
        status={stage?.status || 'available'}
      />

      <DeliveryAcceptanceStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Lead'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
