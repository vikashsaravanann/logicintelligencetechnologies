import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import ChecklistStageClient from './ChecklistStageClient';

interface ChecklistPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function ChecklistStagePage({ params }: ChecklistPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'checklist');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="checklist"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title="Official 50-Point Enterprise Deployment Checklist"
        filename="LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
        versionLabel="v2.4"
        fileUrl="/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
        fileSizeBytes={700198}
        sha256="9a8d29b0f4c3...canonical-enterprise"
      />

      <ChecklistStageClient engagementRef={engagementRef} />
    </div>
  );
}
