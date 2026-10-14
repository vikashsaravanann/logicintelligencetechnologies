import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey, getEngagementDocumentLinks } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import LockedStageCard from '../components/LockedStageCard';
import AcceptanceStageClient from './AcceptanceStageClient';

interface AcceptancePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function AcceptanceStagePage({ params }: AcceptancePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'acceptance');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="acceptance" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="acceptance" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'proposal');
  const proposalDoc = docs[0];

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="acceptance"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title={proposalDoc?.document_title || "Commercial Quotation & Proposal Master"}
        filename={proposalDoc?.master_id ? `${proposalDoc.master_id}-Proposal.pdf` : "LIT-02-Proposal-Commercial-Quotation.pdf"}
        versionLabel={proposalDoc?.version_label || "v1.0"}
        fileUrl={proposalDoc?.file_url || "/assets/docs/masters/LIT-02-Proposal-Commercial-Quotation.pdf"}
        fileSizeBytes={proposalDoc?.file_size_bytes || 602897}
        sha256={proposalDoc?.sha256_hash || "b4c5d6e7...quotation-master"}
      />

      <AcceptanceStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        contactEmail={engagement.contact_email}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
      />
    </div>
  );
}
