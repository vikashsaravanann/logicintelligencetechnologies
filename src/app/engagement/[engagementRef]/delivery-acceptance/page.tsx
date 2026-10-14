import React from 'react';
import { notFound } from 'next/navigation';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
} from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import DeliveryAcceptanceStageClient from './DeliveryAcceptanceStageClient';

interface DeliveryAcceptancePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function DeliveryAcceptanceStagePage({ params }: DeliveryAcceptancePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'delivery-acceptance');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="delivery-acceptance" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="delivery-acceptance" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'delivery-acceptance');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="delivery-acceptance"
        status={stage?.status || 'available'}
      />

      <DeliveryAcceptanceStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        contactEmail={engagement.contact_email}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
        document={docs[0]}
      />
    </div>
  );
}
