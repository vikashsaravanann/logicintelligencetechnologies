import React from 'react';
import { notFound } from 'next/navigation';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
} from '@/lib/engagements/db';
import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import HandoverStageClient from './HandoverStageClient';

interface HandoverPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function HandoverStagePage({ params }: HandoverPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const stage = await getStageByKey(engagement.id, 'handover');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="handover" status="locked" isSuperAdmin={isSuperAdmin} />
        <LockedStageCard engagementRef={engagementRef} stageKey="handover" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'handover');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="handover"
        status={stage?.status || 'available'}
        isSuperAdmin={isSuperAdmin}
      />

      <HandoverStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
        document={docs[0]}
      />
    </div>
  );
}
