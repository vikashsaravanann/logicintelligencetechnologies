import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import ProposalStageClient from './ProposalStageClient';

interface ProposalPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function ProposalStagePage({ params }: ProposalPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'proposal');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="proposal"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title="Commercial Quotation & Proposal Master"
        filename="LIT-02-Proposal-Commercial-Quotation.pdf"
        versionLabel="v1.0"
        fileUrl="/assets/docs/masters/LIT-02-Proposal-Commercial-Quotation.pdf"
        fileSizeBytes={602897}
        sha256="b4c5d6e7...quotation-master"
      />

      <ProposalStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client'}
        contactName={engagement?.contact_name || 'Authorized Signatory'}
      />
    </div>
  );
}
