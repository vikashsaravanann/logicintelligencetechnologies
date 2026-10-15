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
import SupportStageClient from './SupportStageClient';

interface SupportPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function SupportStagePage({ params }: SupportPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const stage = await getStageByKey(engagement.id, 'support');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="support" status="locked" isSuperAdmin={isSuperAdmin} />
        <LockedStageCard engagementRef={engagementRef} stageKey="support" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'support');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="support"
        status={stage?.status || 'available'}
        isSuperAdmin={isSuperAdmin}
      />

      <SupportStageClient
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
