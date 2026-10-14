import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import SowStageClient from './SowStageClient';

interface SowPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function SowStagePage({ params }: SowPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'sow');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="sow"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title="Statement of Work & Master Service Agreement"
        filename="LIT-01-SOW-Service-Agreement.pdf"
        versionLabel="v1.0"
        fileUrl="/assets/docs/masters/LIT-01-SOW-Service-Agreement.pdf"
        fileSizeBytes={620485}
        sha256="c8d9e0f1...sow-binding-master"
        requiresSignature={true}
      />

      <SowStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Signatory'}
      />
    </div>
  );
}
