import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import InitialInvoiceStageClient from './InitialInvoiceStageClient';

interface InitialInvoicePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function InitialInvoiceStagePage({ params }: InitialInvoicePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'initial-invoice');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="initial-invoice"
        status={stage?.status || 'available'}
      />

      <InitialInvoiceStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Signatory'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
