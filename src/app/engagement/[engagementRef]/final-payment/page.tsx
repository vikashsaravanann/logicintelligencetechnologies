import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import FinalPaymentStageClient from './FinalPaymentStageClient';

interface FinalPaymentPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function FinalPaymentStagePage({ params }: FinalPaymentPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'final-payment');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="final-payment"
        status={stage?.status || 'available'}
      />

      <FinalPaymentStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Signatory'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
