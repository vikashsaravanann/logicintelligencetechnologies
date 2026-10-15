import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey, getEngagementDocumentLinks } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import StageDocumentCard from '../components/StageDocumentCard';
import LockedStageCard from '../components/LockedStageCard';
import ChecklistStageClient from './ChecklistStageClient';

interface ChecklistPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function ChecklistStagePage({ params }: ChecklistPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'checklist');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="checklist" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="checklist" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'checklist');
  const mainDoc = docs[0];

  const snapshot = (stage?.snapshot as Record<string, any>) || {};
  const initialSelectedItems: number[] =
    snapshot.selectedItems ||
    snapshot.selected_items ||
    snapshot.selectedPoints ||
    snapshot.selected_points ||
    [];
  const initialNotes: string = snapshot.notes || snapshot.client_notes || '';

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="checklist"
        status={stage?.status || 'available'}
      />

      <StageDocumentCard
        title={mainDoc?.document_title || "Official 50-Point Enterprise Deployment Checklist"}
        filename={mainDoc?.master_id ? `${mainDoc.master_id}-Checklist.pdf` : "LIT_50_Point_Enterprise_Deployment_Checklist.pdf"}
        versionLabel={mainDoc?.version_label || "v2.4"}
        fileUrl={mainDoc?.file_url || "/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf"}
        fileSizeBytes={mainDoc?.file_size_bytes || 700198}
        sha256={mainDoc?.sha256_hash || "9a8d29b0f4c3...canonical-enterprise"}
      />

      <ChecklistStageClient
        engagementRef={engagementRef}
        initialSelectedItems={initialSelectedItems}
        initialNotes={initialNotes}
        initialStatus={stage?.status}
      />
    </div>
  );
}
