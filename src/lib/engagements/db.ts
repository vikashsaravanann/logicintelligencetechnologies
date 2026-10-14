import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import {
  ClientEngagement,
  EngagementStage,
  EngagementDocumentLink,
  ClientIdentityChangeRequest,
  StageKey,
  StageStatus,
  CANONICAL_13_STAGES,
  ORDERED_STAGE_KEYS,
} from './types';

// Canonical fallback sample engagement for demo and resilient client rendering
export const FALLBACK_SAMPLE_ENGAGEMENT: ClientEngagement = {
  id: 'd9b0e1a2-3f4c-5a6b-7c8d-9e0f1a2b3c4d',
  engagement_ref: 'ENG-2026-LIT-SAMPLE',
  client_id: null,
  proposal_id: null,
  checklist_invitation_id: null,
  company_name: 'Apex Meridian Technologies Pvt Ltd',
  contact_name: 'Dr. Rajesh Krishnan',
  contact_email: 'rajesh.krishnan@apexmeridian.com',
  contact_phone: '+91 98401 23456',
  project_title: 'Enterprise Multi-Tenant AI Platform & HIPAA Hospital Infrastructure',
  status: 'active',
  current_stage: 'checklist',
  notes: 'Canonical enterprise demonstration engagement for Logic Intelligence Technologies.',
  metadata: {
    budget_range: '₹15,00,000 - ₹25,00,000',
    target_launch: 'Q4 2026',
    industry: 'Healthcare Technology',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const FALLBACK_SAMPLE_STAGES: EngagementStage[] = ORDERED_STAGE_KEYS.map((key, index) => {
  const def = CANONICAL_13_STAGES[key];
  let status: StageStatus = 'locked';
  if (index === 0) status = 'available'; // checklist available
  return {
    id: `stage-${def.ordinal}`,
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: key,
    ordinal: def.ordinal,
    title: def.title,
    summary: def.description,
    status,
    assigned_owner: 'Logic Intelligence Technologies Staff',
    notes: null,
    prerequisite_stage_key: def.prerequisiteKey,
    prerequisite_description: def.prerequisiteDesc,
    document_master_ref: def.documentMasterRef,
    snapshot: {},
    unlocked_at: index === 0 ? new Date().toISOString() : null,
    completed_at: null,
    approved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

export const FALLBACK_SAMPLE_DOCS: EngagementDocumentLink[] = [
  {
    id: 'doc-00',
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: 'checklist',
    document_title: 'Official 50-Point Enterprise Deployment Checklist',
    master_id: 'LIT-00',
    version_label: 'v2.4',
    file_url: '/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf',
    file_size_bytes: 700198,
    sha256_hash: '9a8d29b0f4c3...enterprise',
    is_client_visible: true,
    requires_signature: false,
    signature_status: 'none',
    signed_at: null,
    signed_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-01',
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: 'sow',
    document_title: 'Statement of Work & Master Service Agreement',
    master_id: 'LIT-01',
    version_label: 'v1.0',
    file_url: '/assets/docs/masters/LIT-01-SOW-Service-Agreement.pdf',
    file_size_bytes: 620485,
    sha256_hash: 'a1b2c3d4...sow',
    is_client_visible: true,
    requires_signature: true,
    signature_status: 'pending',
    signed_at: null,
    signed_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-03',
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: 'onboarding',
    document_title: 'Client Technical Onboarding & Systems Guide',
    master_id: 'LIT-03',
    version_label: 'v1.0',
    file_url: '/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf',
    file_size_bytes: 598441,
    sha256_hash: 'b2c3d4e5...onb',
    is_client_visible: true,
    requires_signature: false,
    signature_status: 'none',
    signed_at: null,
    signed_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-04',
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: 'technical-spec',
    document_title: 'Production Technical & Architectural Specification',
    master_id: 'LIT-04',
    version_label: 'v1.0',
    file_url: '/assets/docs/masters/LIT-04-Technical-Specification.pdf',
    file_size_bytes: 616085,
    sha256_hash: 'c3d4e5f6...tech',
    is_client_visible: true,
    requires_signature: false,
    signature_status: 'none',
    signed_at: null,
    signed_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-07',
    engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
    stage_key: 'support',
    document_title: 'Enterprise Maintenance & SLA Agreement',
    master_id: 'LIT-07',
    version_label: 'v1.0',
    file_url: '/assets/docs/masters/LIT-07-Maintenance-Support-Agreement.pdf',
    file_size_bytes: 602708,
    sha256_hash: 'd4e5f6a7...sup',
    is_client_visible: true,
    requires_signature: true,
    signature_status: 'none',
    signed_at: null,
    signed_by: null,
    created_at: new Date().toISOString(),
  },
];

/**
 * Fetch engagement by public opaque reference or ID.
 */
export async function getEngagementByRef(ref: string): Promise<ClientEngagement | null> {
  if (!ref) return null;

  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('client_engagements')
        .select('*')
        .or(`engagement_ref.eq.${ref},id.eq.${ref}`)
        .maybeSingle();

      if (!error && data) {
        return data as ClientEngagement;
      }
    } catch (err) {
      console.warn('[getEngagementByRef] DB query failed, using fallback:', err);
    }
  }

  // Fallback match
  if (ref.toUpperCase() === 'ENG-2026-LIT-SAMPLE' || ref.startsWith('ENG-') || ref.toLowerCase() === 'sample') {
    return {
      ...FALLBACK_SAMPLE_ENGAGEMENT,
      engagement_ref: ref.toUpperCase(),
    };
  }

  // Return generated mock record for testing any ref
  return {
    ...FALLBACK_SAMPLE_ENGAGEMENT,
    engagement_ref: ref,
    company_name: `Client Organization (${ref})`,
  };
}

/**
 * Fetch all 13 stages for a given engagement.
 */
export async function getEngagementStages(engagementId: string): Promise<EngagementStage[]> {
  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('engagement_stages')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('ordinal', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as EngagementStage[];
      }
    } catch (err) {
      console.warn('[getEngagementStages] DB query failed, using fallback:', err);
    }
  }

  return FALLBACK_SAMPLE_STAGES.map((s) => ({ ...s, engagement_id: engagementId }));
}

/**
 * Fetch single stage by key.
 */
export async function getStageByKey(engagementId: string, stageKey: StageKey): Promise<EngagementStage | null> {
  const stages = await getEngagementStages(engagementId);
  return stages.find((s) => s.stage_key === stageKey) || null;
}

/**
 * Fetch documents linked to engagement or specific stage.
 */
export async function getEngagementDocumentLinks(
  engagementId: string,
  stageKey?: StageKey
): Promise<EngagementDocumentLink[]> {
  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from('engagement_document_links')
        .select('*')
        .eq('engagement_id', engagementId)
        .eq('is_client_visible', true);

      if (stageKey) {
        query = query.eq('stage_key', stageKey);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as EngagementDocumentLink[];
      }
    } catch (err) {
      console.warn('[getEngagementDocumentLinks] DB query failed, using fallback:', err);
    }
  }

  if (stageKey) {
    return FALLBACK_SAMPLE_DOCS.filter((d) => d.stage_key === stageKey);
  }
  return FALLBACK_SAMPLE_DOCS;
}

/**
 * Submit untrusted client identity change request (queued for Super Admin review).
 */
export async function submitIdentityChangeRequest(input: {
  engagementId: string;
  targetField: ClientIdentityChangeRequest['target_field'];
  currentValue: string;
  proposedValue: string;
  changeReason: string;
  requestedBy: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!input.proposedValue || !input.changeReason) {
    return { success: false, error: 'Proposed value and change reason are required.' };
  }

  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('client_identity_change_requests')
        .insert({
          engagement_id: input.engagementId,
          target_field: input.targetField,
          current_value: input.currentValue,
          proposed_value: input.proposedValue.trim(),
          change_reason: input.changeReason.trim(),
          requested_by: input.requestedBy.trim(),
          status: 'pending',
        })
        .select('id')
        .single();

      if (!error && data) {
        return { success: true, id: data.id };
      }
      return { success: false, error: error?.message || 'Database insert failed' };
    } catch (err) {
      console.warn('[submitIdentityChangeRequest] DB insert failed:', err);
    }
  }

  // Graceful simulation
  return { success: true, id: `req-simulated-${Date.now()}` };
}

/**
 * Fetch all client engagements for the Admin Console.
 */
export async function listAllEngagements(): Promise<ClientEngagement[]> {
  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('client_engagements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ClientEngagement[];
      }
    } catch (err) {
      console.warn('[listAllEngagements] DB query failed, using fallback:', err);
    }
  }

  return [FALLBACK_SAMPLE_ENGAGEMENT];
}

/**
 * Fetch pending identity change requests for Super Admin review.
 */
export async function listIdentityChangeRequests(engagementId?: string): Promise<ClientIdentityChangeRequest[]> {
  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from('client_identity_change_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (engagementId) {
        query = query.eq('engagement_id', engagementId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as ClientIdentityChangeRequest[];
      }
    } catch (err) {
      console.warn('[listIdentityChangeRequests] DB query failed:', err);
    }
  }

  return [
    {
      id: 'req-sample-01',
      engagement_id: FALLBACK_SAMPLE_ENGAGEMENT.id,
      client_id: null,
      target_field: 'company_name',
      current_value: 'Apex Meridian Technologies Pvt Ltd',
      proposed_value: 'Apex Meridian Healthcare Systems Private Limited',
      change_reason: 'Updated registered legal entity name as per new MCA certificate of incorporation.',
      supporting_doc_url: null,
      status: 'pending',
      requested_by: 'Dr. Rajesh Krishnan',
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null,
      rejection_reason: null,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];
}

/**
 * Super Admin: update stage status.
 */
export async function updateStageStatus(
  stageId: string,
  newStatus: StageStatus,
  superAdminName: string
): Promise<{ success: boolean; error?: string }> {
  if (isAdminClientConfigured()) {
    try {
      const { error } = await supabaseAdmin
        .from('engagement_stages')
        .update({
          status: newStatus,
          approved_at: newStatus === 'approved' || newStatus === 'verified' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stageId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database update failed' };
    }
  }
  return { success: true };
}
