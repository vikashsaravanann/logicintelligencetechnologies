import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey, getEngagementDocumentLinks } from '@/lib/engagements/db';
import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import LockedStageCard from '../components/LockedStageCard';
import SowStageClient from './SowStageClient';

interface SowPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function SowStagePage({ params }: SowPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const stage = await getStageByKey(engagement.id, 'sow');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="sow" status="locked" isSuperAdmin={isSuperAdmin} />
        <LockedStageCard engagementRef={engagementRef} stageKey="sow" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'sow');
  const sowDoc = docs[0];

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="sow"
        status={stage?.status || 'available'}
        isSuperAdmin={isSuperAdmin}
      />

      <StageDocumentCard
        title={sowDoc?.document_title || "Statement of Work & Master Service Agreement"}
        filename={sowDoc?.master_id ? `${sowDoc.master_id}-SOW.pdf` : "LIT-01-SOW-Service-Agreement.pdf"}
        versionLabel={sowDoc?.version_label || "v1.0"}
        fileUrl={sowDoc?.file_url || "/assets/docs/masters/LIT-01-SOW-Service-Agreement.pdf"}
        fileSizeBytes={sowDoc?.file_size_bytes || 620485}
        sha256={sowDoc?.sha256_hash || "c8d9e0f1...sow-binding-master"}
        requiresSignature={true}
      />

      <SowStageClient
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
