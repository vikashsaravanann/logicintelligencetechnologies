import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey, getEngagementDocumentLinks } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import LockedStageCard from '../components/LockedStageCard';
import ProposalStageClient from './ProposalStageClient';

interface ProposalPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function ProposalStagePage({ params }: ProposalPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'proposal');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="proposal" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="proposal" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'proposal');
  const mainDoc = docs[0];

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="proposal"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title={mainDoc?.document_title || "Commercial Quotation & Proposal Master"}
        filename={mainDoc?.master_id ? `${mainDoc.master_id}-Proposal.pdf` : "LIT-02-Proposal-Commercial-Quotation.pdf"}
        versionLabel={mainDoc?.version_label || "v1.0"}
        fileUrl={mainDoc?.file_url || "/assets/docs/masters/LIT-02-Proposal-Commercial-Quotation.pdf"}
        fileSizeBytes={mainDoc?.file_size_bytes || 602897}
        sha256={mainDoc?.sha256_hash || "b4c5d6e7...quotation-master"}
      />

      <ProposalStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        initialStatus={stage?.status}
      />
    </div>
  );
}
