import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey, getEngagementDocumentLinks } from '@/lib/engagements/db';
import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
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

  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const stage = await getStageByKey(engagement.id, 'checklist');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="checklist" status="locked" isSuperAdmin={isSuperAdmin} />
        <LockedStageCard engagementRef={engagementRef} stageKey="checklist" />
      </div>
    );
  }

  const docs = await getEngagementDocumentLinks(engagement.id, 'checklist');
  const mainDoc = docs[0];

  const snapshot = (stage?.snapshot as Record<string, any>) || {};
  let initialSelectedItems: number[] =
    snapshot.selectedItems ||
    snapshot.selected_items ||
    snapshot.selectedPoints ||
    snapshot.selected_points ||
    [];
  let initialNotes: string = snapshot.notes || snapshot.client_notes || '';

  if (initialSelectedItems.length === 0 && (engagement.checklist_invitation_id || engagement.client_id || engagement.contact_email)) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin');
      let invQuery = supabaseAdmin
        .from('enterprise_checklist_invitations')
        .select('id')
        .limit(1);

      if (engagement.checklist_invitation_id) {
        invQuery = invQuery.eq('id', engagement.checklist_invitation_id);
      } else if (engagement.client_id) {
        invQuery = invQuery.eq('client_id', engagement.client_id);
      } else if (engagement.contact_email) {
        invQuery = invQuery.eq('recipient_email', engagement.contact_email.toLowerCase());
      }

      const { data: invData } = await invQuery;
      if (invData && invData[0]) {
        const { data: respData } = await supabaseAdmin
          .from('enterprise_checklist_responses')
          .select('id, client_notes')
          .eq('invitation_id', invData[0].id)
          .maybeSingle();

        if (respData) {
          if (!initialNotes && respData.client_notes) {
            initialNotes = respData.client_notes;
          }
          const { data: itemRows } = await supabaseAdmin
            .from('enterprise_checklist_response_items')
            .select('point_number')
            .eq('response_id', respData.id);

          if (itemRows && itemRows.length > 0) {
            initialSelectedItems = itemRows.map((r: { point_number: number }) => r.point_number);
          }
        }
      }
    } catch {
      // clean fallback
    }
  }

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="checklist"
        status={stage?.status || 'available'}
        isSuperAdmin={isSuperAdmin}
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
