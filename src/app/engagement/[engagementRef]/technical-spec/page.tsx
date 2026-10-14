import React from 'react';
import { notFound } from 'next/navigation';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
} from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import TechnicalSpecStageClient from './TechnicalSpecStageClient';

interface TechnicalSpecPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function TechnicalSpecStagePage({ params }: TechnicalSpecPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'technical-spec');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="technical-spec" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="technical-spec" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'technical-spec');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="technical-spec"
        status={stage?.status || 'available'}
      />

      <TechnicalSpecStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
        document={docs[0]}
      />
    </div>
  );
}
