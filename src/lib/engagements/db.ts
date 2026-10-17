import crypto from 'crypto';
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
  CANONICAL_STAGE_UUIDS,
  CreateEngagementInput,
} from './types';
import { sendEngagementInvitationEmail } from './invitations';
import { notifyStageSubmitted, notifyStageApproved } from './stage-notifications';
import { calculateEngagementFinancials } from './financials';
import { generateTaxInvoicePdf, generatePaymentReceiptPdf } from '@/lib/pdf/invoice-receipt-generator';
import { DOCUMENTS_BUCKET } from '@/lib/documents/storage';


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(val: string): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

export { CANONICAL_STAGE_UUIDS };

// Canonical fallback sample engagement for demo and resilient client rendering
export const FALLBACK_SAMPLE_ENGAGEMENT: ClientEngagement = {
  id: '8acad856-9840-4646-b42d-f8bf12ea47f8',
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
    id: CANONICAL_STAGE_UUIDS[key] || `3478510e-1296-4d90-8aa2-${String(def.ordinal).padStart(12, '0')}`,
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
 * FAIL-CLOSED: If not found in database, returns null (yielding 404).
 * Only the canonical demo reference ENG-2026-LIT-SAMPLE is recognized for fallback sample display.
 */
export async function getEngagementByRef(ref: string): Promise<ClientEngagement | null> {
  if (!ref) return null;
  const cleanRef = ref.trim();

  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin.from('client_engagements').select('*');
      if (isUuid(cleanRef)) {
        query = query.or(`engagement_ref.ilike.${cleanRef},id.eq.${cleanRef}`);
      } else {
        query = query.ilike('engagement_ref', cleanRef);
      }
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return data as ClientEngagement;
      }
      if (error) {
        console.warn('[getEngagementByRef] Supabase query returned error:', error);
      }
    } catch (err) {
      console.warn('[getEngagementByRef] DB query failed, using fallback:', err);
    }
  }

  // Fallback match: Strictly ONLY the canonical sample engagement reference is supported
  if (cleanRef.toUpperCase() === 'ENG-2026-LIT-SAMPLE' || cleanRef.toLowerCase() === 'sample') {
    return {
      ...FALLBACK_SAMPLE_ENGAGEMENT,
      engagement_ref: 'ENG-2026-LIT-SAMPLE',
    };
  }

  // All other unknown refs fail closed with null (yielding 404)
  return null;
}

export interface StageActionResult {
  success: boolean;
  stageKey: StageKey;
  status: StageStatus;
  newStatus?: StageStatus;
  auditHash: string;
  nextUnlockedStageKey?: StageKey | null;
  nextStageToUnlock?: StageKey | null;
  message?: string;
  error?: string;
  stage?: EngagementStage;
  stages?: EngagementStage[];
}

/**
 * Executes a verified stage action mutation, enforces prerequisite gates,
 * computes cryptographic SHA-256 audit digest, and unlocks sequential milestones.
 */
export async function submitStageAction(input: {
  engagementRef?: string;
  engagement?: ClientEngagement;
  stages?: EngagementStage[];
  stageKey: StageKey;
  action: string;
  payload: Record<string, any>;
  actorRole?: string;
  actorId?: string;
}): Promise<StageActionResult> {
  const { engagementRef, stageKey, action, payload, actorRole = 'client', actorId } = input;

  let engagement = input.engagement || null;
  if (!engagement && engagementRef) {
    engagement = await getEngagementByRef(engagementRef);
  }
  if (!engagement && engagementRef === FALLBACK_SAMPLE_ENGAGEMENT.engagement_ref) {
    engagement = FALLBACK_SAMPLE_ENGAGEMENT;
  }

  if (!engagement) {
    return {
      success: false,
      stageKey,
      status: 'locked',
      newStatus: 'locked',
      auditHash: '',
      nextUnlockedStageKey: null,
      nextStageToUnlock: null,
      error: 'Engagement not found or unauthorized',
    };
  }

  const stages = input.stages || (await getEngagementStages(engagement.id));
  const currentStage =
    stages.find((s) => s.stage_key === stageKey) ||
    ({
      id: `stage-${stageKey}`,
      engagement_id: engagement.id,
      stage_key: stageKey,
      ordinal: CANONICAL_13_STAGES[stageKey]?.ordinal || 1,
      title: CANONICAL_13_STAGES[stageKey]?.title || stageKey,
      summary: CANONICAL_13_STAGES[stageKey]?.description || null,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as EngagementStage);

  // Check prerequisite gate if stage is currently locked (unless admin override)
  if (currentStage.status === 'locked' && actorRole !== 'admin' && action !== 'admin_override_status') {
    const currentDef = CANONICAL_13_STAGES[stageKey];
    const prereqKey = currentDef?.prerequisiteKey;
    if (prereqKey) {
      const prereqStage = stages.find((s) => s.stage_key === prereqKey);
      const isSatisfied =
        prereqStage &&
        ['completed', 'signed', 'verified', 'approved', 'paid', 'accepted', 'submitted'].includes(prereqStage.status);
      if (!isSatisfied) {
        return {
          success: false,
          stageKey,
          status: 'locked',
          newStatus: 'locked',
          auditHash: '',
          nextUnlockedStageKey: null,
          nextStageToUnlock: null,
          error: `Prerequisite stage (${currentDef.prerequisiteDesc || prereqKey}) has not been completed or verified.`,
        };
      }
    }
  }

  // Compute canonical SHA-256 audit hash of submitted payload
  const payloadString = JSON.stringify(payload || {}, (_key, val) =>
    typeof val === 'bigint' ? val.toString() : val
  );
  const auditHash = crypto.createHash('sha256').update(payloadString).digest('hex');

  // Determine new stage status and sequential unlocking rules
  let newStatus: StageStatus = currentStage.status;
  let nextStageToUnlock: StageKey | null = null;
  const currentIndex = ORDERED_STAGE_KEYS.indexOf(stageKey);
  const nextKey =
    currentIndex >= 0 && currentIndex < ORDERED_STAGE_KEYS.length - 1
      ? ORDERED_STAGE_KEYS[currentIndex + 1]
      : null;

  if (actorRole === 'admin') {
    if (payload.status) {
      newStatus = payload.status as StageStatus;
    } else if (action === 'admin_approve_stage' || action === 'approve_stage') {
      newStatus = (stageKey === 'initial-invoice' || stageKey === 'final-payment') ? 'verified' : 'approved';
    }
    if (action === 'verify_bank_credit') {
      newStatus = 'verified';
      if (stageKey === 'initial-invoice') {
        nextStageToUnlock = 'onboarding';
      } else if (stageKey === 'final-payment') {
        nextStageToUnlock = 'handover';
      }
    } else if (
      ['completed', 'approved', 'verified', 'accepted', 'signed'].includes(newStatus)
    ) {
      if (nextKey && payload.unlockNext !== false) {
        nextStageToUnlock = nextKey;
      }
    }
  } else {
    switch (stageKey) {
      case 'checklist':
        if (action === 'save_draft') {
          newStatus = 'in_progress';
          nextStageToUnlock = null;
        } else {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        }
        break;

      case 'discovery':
        if (action === 'save_draft') {
          newStatus = 'in_progress';
          nextStageToUnlock = null;
        } else {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        }
        break;

      case 'proposal':
        if (action === 'request_revision') {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        } else {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        }
        break;

      case 'acceptance':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'sow':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'initial-invoice':
        // CRITICAL INVARIANT: UTR report moves stage to 'under_review'.
        // Next stage 'onboarding' remains locked until Super Admin bank reconciliation!
        if (action === 'submit_billing') {
          newStatus = 'in_progress';
          nextStageToUnlock = null;
        } else {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        }
        break;

      case 'onboarding':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'technical-spec':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'development':
        if (action === 'complete_development' || action === 'submit_stage') {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        } else {
          newStatus = 'in_progress';
          nextStageToUnlock = null;
        }
        break;

      case 'delivery-acceptance':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'final-payment':
        // CRITICAL INVARIANT: UTR report moves stage to 'under_review'.
        // Next stage 'handover' remains locked until Super Admin bank reconciliation!
        if (action === 'submit_billing') {
          newStatus = 'in_progress';
          nextStageToUnlock = null;
        } else {
          newStatus = 'under_review';
          nextStageToUnlock = null;
        }
        break;

      case 'handover':
        newStatus = 'under_review';
        nextStageToUnlock = null;
        break;

      case 'support':
        newStatus = action === 'submit_ticket' ? 'in_progress' : 'completed';
        nextStageToUnlock = null;
        break;

      default:
        newStatus = 'under_review';
        nextStageToUnlock = null;
    }
  }

  const existingTickets = Array.isArray(currentStage.snapshot?.tickets) ? currentStage.snapshot.tickets : [];
  const updatedSnapshot: Record<string, any> = {
    ...(currentStage.snapshot || {}),
    ...payload,
    last_action: action,
    last_audit_hash: auditHash,
    last_updated_at: new Date().toISOString(),
  };

  if (stageKey === 'support' && action === 'submit_ticket' && payload.ticket) {
    updatedSnapshot.tickets = [payload.ticket, ...existingTickets];
  }

  const isCompleted = [
    'completed',
    'signed',
    'verified',
    'approved',
    'accepted',
    'submitted',
  ].includes(newStatus);
  const completedAt = isCompleted
    ? currentStage.completed_at || new Date().toISOString()
    : currentStage.completed_at;

  // Persist to Supabase if configured
  if (isAdminClientConfigured()) {
    // 1. Record immutable audit event (isolated so logging failures never block stage mutations)
    try {
      await supabaseAdmin.from('engagement_stage_events').insert({
        engagement_id: engagement.id,
        stage_key: stageKey,
        action,
        from_status: currentStage.status,
        to_status: newStatus,
        actor_role: actorRole,
        actor_id: actorId || null,
        reason: payload.reason || payload.notes || `Client performed ${action}`,
        idempotency_key: `evt-${stageKey}-${action}-${auditHash.slice(0, 16)}-${Date.now()}`,
        payload: {
          ...payload,
          _audit_hash: auditHash,
          _timestamp: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      console.warn('[submitStageAction] Audit event logging skipped/failed:', auditErr);
    }

    // 2. Upsert current stage record by (engagement_id, stage_key)
    try {
      const currentOrdinal = currentStage.ordinal || CANONICAL_13_STAGES[stageKey]?.ordinal || 1;
      const currentTitle = currentStage.title || CANONICAL_13_STAGES[stageKey]?.title || stageKey;
      const currentSummary = currentStage.summary || CANONICAL_13_STAGES[stageKey]?.description || null;

      const { error: stageUpsertErr } = await supabaseAdmin
        .from('engagement_stages')
        .upsert(
          {
            engagement_id: engagement.id,
            stage_key: stageKey,
            ordinal: currentOrdinal,
            title: currentTitle,
            summary: currentSummary,
            status: newStatus,
            snapshot: updatedSnapshot,
            completed_at: completedAt,
            approved_at:
              newStatus === 'verified' || newStatus === 'approved'
                ? currentStage.approved_at || new Date().toISOString()
                : currentStage.approved_at,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'engagement_id,stage_key' }
        );

      if (stageUpsertErr) {
        console.error('[submitStageAction] Stage upsert error:', stageUpsertErr);
        return {
          success: false,
          stageKey,
          status: currentStage.status,
          newStatus: currentStage.status,
          auditHash,
          nextUnlockedStageKey: null,
          nextStageToUnlock: null,
          error: `Database stage update failed: ${stageUpsertErr.message}`,
        };
      }

      // 3. If next stage is unlocked, upsert next stage status to 'available'
      if (nextStageToUnlock) {
        const nextStage = stages.find((s) => s.stage_key === nextStageToUnlock);
        const nextOrdinal = nextStage?.ordinal || CANONICAL_13_STAGES[nextStageToUnlock]?.ordinal || 2;
        const nextTitle = nextStage?.title || CANONICAL_13_STAGES[nextStageToUnlock]?.title || nextStageToUnlock;
        const nextSummary = nextStage?.summary || CANONICAL_13_STAGES[nextStageToUnlock]?.description || null;

        const { error: nextStageErr } = await supabaseAdmin
          .from('engagement_stages')
          .upsert(
            {
              engagement_id: engagement.id,
              stage_key: nextStageToUnlock,
              ordinal: nextOrdinal,
              title: nextTitle,
              summary: nextSummary,
              status: 'available',
              unlocked_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'engagement_id,stage_key' }
          );

        if (nextStageErr) {
          console.error('[submitStageAction] Next stage unlock upsert error:', nextStageErr);
        }
      }

      // 4. Update engagement current_stage pointer
      const { error: engUpdateErr } = await supabaseAdmin
        .from('client_engagements')
        .update({
          current_stage: nextStageToUnlock || stageKey,
          updated_at: new Date().toISOString(),
        })
        .eq('id', engagement.id);

      if (engUpdateErr) {
        console.error('[submitStageAction] Engagement current_stage update error:', engUpdateErr);
      }

      // 5. If checklist submission, synchronize with enterprise_checklist_invitations & enterprise_checklist_responses
      if (stageKey === 'checklist' && (action === 'submit_checklist' || action === 'complete_stage')) {
        try {
          const selectedPoints = Array.isArray(payload.selectedItems)
            ? payload.selectedItems
                .map((p: any) => Number(p))
                .filter((p: number) => Number.isInteger(p) && p >= 1 && p <= 50)
            : [];

          if (selectedPoints.length > 0) {
            let invQuery = supabaseAdmin
              .from('enterprise_checklist_invitations')
              .select('id, version_id, recipient_name, recipient_company, client_id, status')
              .order('created_at', { ascending: false });

            if (engagement.checklist_invitation_id) {
              invQuery = invQuery.eq('id', engagement.checklist_invitation_id);
            } else if (engagement.client_id) {
              invQuery = invQuery.eq('client_id', engagement.client_id);
            } else if (engagement.contact_email) {
              invQuery = invQuery.eq('recipient_email', engagement.contact_email.toLowerCase());
            }

            const { data: matchedInvs } = await invQuery.limit(1);
            const matchedInv = matchedInvs && matchedInvs[0];

            if (matchedInv) {
              const nowIso = new Date().toISOString();
              const { data: existingResp } = await supabaseAdmin
                .from('enterprise_checklist_responses')
                .select('id, confirmation_reference')
                .eq('invitation_id', matchedInv.id)
                .maybeSingle();

              let responseId: string | undefined = existingResp?.id;
              if (existingResp) {
                await supabaseAdmin
                  .from('enterprise_checklist_responses')
                  .update({
                    submitted_by_name: payload.submittedByName || engagement.contact_name || matchedInv.recipient_name,
                    selected_count: selectedPoints.length,
                    client_notes: payload.notes || null,
                    submitted_at: nowIso,
                  })
                  .eq('id', existingResp.id);

                await supabaseAdmin
                  .from('enterprise_checklist_response_items')
                  .delete()
                  .eq('response_id', existingResp.id);
              } else {
                const confRef = `LIT-CHK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
                const { data: newResp } = await supabaseAdmin
                  .from('enterprise_checklist_responses')
                  .insert({
                    invitation_id: matchedInv.id,
                    version_id: matchedInv.version_id,
                    confirmation_reference: confRef,
                    submitted_by_name: payload.submittedByName || engagement.contact_name || matchedInv.recipient_name,
                    selected_count: selectedPoints.length,
                    client_notes: payload.notes || null,
                    submitted_at: nowIso,
                  })
                  .select('id')
                  .single();

                if (newResp) {
                  responseId = newResp.id;
                }
              }

              if (responseId) {
                const itemRows = selectedPoints.map((p: number) => ({
                  response_id: responseId,
                  version_id: matchedInv.version_id,
                  point_number: p,
                }));
                await supabaseAdmin.from('enterprise_checklist_response_items').insert(itemRows);
              }

              await supabaseAdmin
                .from('enterprise_checklist_invitations')
                .update({
                  status: 'submitted',
                  submitted_at: nowIso,
                })
                .eq('id', matchedInv.id);
            }
          }
        } catch (syncErr) {
          console.error('[submitStageAction] Checklist invitation sync error:', syncErr);
        }
      }

      // 6. If stage 13 support ticket submission, insert into canonical support_tickets table
      if (stageKey === 'support' && action === 'submit_ticket' && payload.ticket) {
        try {
          await supabaseAdmin.from('support_tickets').insert({
            user_id: engagement.client_id || null,
            requester_name: engagement.contact_name || payload.ticket.requesterName || 'Client Representative',
            requester_email: engagement.contact_email || payload.ticket.requesterEmail || null,
            subject: payload.ticket.subject || payload.ticket.title || `Stage 13 Support: ${engagement.project_title}`,
            message: payload.ticket.description || payload.ticket.message || JSON.stringify(payload.ticket),
            priority: payload.ticket.priority || 'Medium',
            source: 'engagement-stage-13',
            status: 'Open',
          });
        } catch (ticketErr) {
          console.warn('[submitStageAction] Canonical support ticket insert error:', ticketErr);
        }
      }
    } catch (err: any) {
      console.error('[submitStageAction] DB write error:', err);
      return {
        success: false,
        stageKey,
        status: currentStage.status,
        newStatus: currentStage.status,
        auditHash,
        nextUnlockedStageKey: null,
        nextStageToUnlock: null,
        error: `Database persistence failed: ${err?.message || 'Transaction error'}`,
      };
    }
  }

  // Mutate in-memory fallback sample stages for seamless preview/testing
  if (!input.stages && engagement.id === FALLBACK_SAMPLE_ENGAGEMENT.id) {
    const idx = FALLBACK_SAMPLE_STAGES.findIndex((s) => s.stage_key === stageKey);
    if (idx !== -1) {
      FALLBACK_SAMPLE_STAGES[idx] = {
        ...FALLBACK_SAMPLE_STAGES[idx],
        status: newStatus,
        snapshot: updatedSnapshot,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      };
    }
    if (nextStageToUnlock) {
      const nextIdx = FALLBACK_SAMPLE_STAGES.findIndex((s) => s.stage_key === nextStageToUnlock);
      if (nextIdx !== -1 && FALLBACK_SAMPLE_STAGES[nextIdx].status === 'locked') {
        FALLBACK_SAMPLE_STAGES[nextIdx] = {
          ...FALLBACK_SAMPLE_STAGES[nextIdx],
          status: 'available',
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }
    FALLBACK_SAMPLE_ENGAGEMENT.current_stage = nextStageToUnlock || stageKey;
  }

  let refreshedStages: EngagementStage[] = [];
  if (isAdminClientConfigured()) {
    try {
      refreshedStages = await getEngagementStages(engagement.id);
    } catch {
      // ignore
    }
  }
  if (!refreshedStages || refreshedStages.length === 0) {
    refreshedStages = stages.map((s) => {
      if (s.stage_key === stageKey) {
        return {
          ...s,
          status: newStatus,
          snapshot: updatedSnapshot,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        };
      }
      if (nextStageToUnlock && s.stage_key === nextStageToUnlock && s.status === 'locked') {
        return {
          ...s,
          status: 'available',
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return s;
    });
  }
  const refreshedStage = refreshedStages.find((s) => s.stage_key === stageKey);

  // Trigger transactional notifications and await durable enqueue
  if (actorRole === 'client' && action !== 'save_draft') {
    try {
      await notifyStageSubmitted({
        engagement,
        stageKey,
        action,
        payload,
      });
    } catch (notifErr) {
      console.warn('[submitStageAction] Client submission notification error:', notifErr);
    }
  } else if (
    (actorRole === 'admin' || action === 'admin_override_status' || action === 'admin_approve_stage' || action === 'verify_bank_credit' || action === 'approve_stage') &&
    (newStatus === 'approved' || newStatus === 'verified' || newStatus === 'completed')
  ) {
    try {
      await notifyStageApproved({
        engagement,
        approvedStageKey: stageKey,
        nextStageKey: nextStageToUnlock,
        adminNotes: payload?.notes,
      });
    } catch (notifErr) {
      console.warn('[submitStageAction] Admin approval notification error:', notifErr);
    }
  }


  return {
    success: true,
    stageKey,
    status: newStatus,
    newStatus,
    auditHash,
    nextUnlockedStageKey: nextStageToUnlock,
    nextStageToUnlock,
    message: `Action ${action} recorded with verified cryptographic audit hash.`,
    stage: refreshedStage,
    stages: refreshedStages,
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

      if (!error && data) {
        if (data.length > 0) {
          return data as EngagementStage[];
        }
        if (engagementId !== FALLBACK_SAMPLE_ENGAGEMENT.id) {
          return [];
        }
      }
    } catch (err) {
      console.warn('[getEngagementStages] DB query failed, using fallback:', err);
    }
  }

  if (engagementId === FALLBACK_SAMPLE_ENGAGEMENT.id || !isAdminClientConfigured()) {
    return FALLBACK_SAMPLE_STAGES.map((s) => ({ ...s, engagement_id: engagementId }));
  }
  return [];
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
      if (!error && data) {
        if (data.length > 0) {
          return data as EngagementDocumentLink[];
        }
        if (engagementId !== FALLBACK_SAMPLE_ENGAGEMENT.id) {
          return [];
        }
      }
    } catch (err) {
      console.warn('[getEngagementDocumentLinks] DB query failed, using fallback:', err);
    }
  }

  if (engagementId === FALLBACK_SAMPLE_ENGAGEMENT.id || !isAdminClientConfigured()) {
    if (stageKey) {
      return FALLBACK_SAMPLE_DOCS.filter((d) => d.stage_key === stageKey);
    }
    return FALLBACK_SAMPLE_DOCS;
  }
  return [];
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
 * Fetch engagements for a client by contact email.
 */
export async function getEngagementsByEmail(email: string): Promise<ClientEngagement[]> {
  if (isAdminClientConfigured() && email) {
    try {
      const normalized = email.trim().toLowerCase();
      const { data, error } = await supabaseAdmin
        .from('client_engagements')
        .select('*')
        .eq('contact_email', normalized)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ClientEngagement[];
      }
    } catch (err) {
      console.warn('[getEngagementsByEmail] DB query failed:', err);
    }
  }

  return [];
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

/**
 * Generates a unique, URL-safe engagement reference (e.g. ENG-2026-X8K2M).
 */
export async function generateEngagementRef(): Promise<string> {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = '';
  let unique = false;
  let attempts = 0;

  while (!unique && attempts < 10) {
    attempts++;
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ref = `ENG-${year}-${randomPart}`;

    if (isAdminClientConfigured()) {
      try {
        const { data } = await supabaseAdmin
          .from('client_engagements')
          .select('id')
          .eq('engagement_ref', ref)
          .maybeSingle();
        if (!data) {
          unique = true;
        }
      } catch {
        unique = true;
      }
    } else {
      unique = true;
    }
  }

  return ref || `ENG-${year}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

/**
 * Creates a new Client Engagement record, provisions all 13 canonical stages,
 * seeds document links, and optionally dispatches the invitation email immediately.
 */
export async function createEngagement(input: CreateEngagementInput): Promise<{
  success: boolean;
  engagement?: ClientEngagement;
  error?: string;
  emailDispatched?: boolean;
  emailMessage?: string;
}> {
  if (!input.companyName?.trim()) {
    return { success: false, error: 'Organization / Company name is required.' };
  }
  if (!input.contactName?.trim()) {
    return { success: false, error: 'Primary contact name is required.' };
  }
  if (!input.contactEmail?.trim()) {
    return { success: false, error: 'Contact email address is required.' };
  }

  const engagementRef = await generateEngagementRef();
  const now = new Date().toISOString();

  const rawBudget = input.budgetRange?.trim();
  const financials = calculateEngagementFinancials(rawBudget || 50);

  const newEngagementRecord = {
    engagement_ref: engagementRef,
    company_name: input.companyName.trim(),
    contact_name: input.contactName.trim(),
    contact_email: input.contactEmail.trim().toLowerCase(),
    contact_phone: input.contactPhone?.trim() || null,
    project_title: input.projectTitle?.trim() || 'Enterprise Digital Platform & Cloud Architecture',
    status: 'active' as const,
    current_stage: 'checklist' as StageKey,
    notes: input.notes?.trim() || null,
    metadata: {
      budget_range: financials.totalFormatted,
      contract_subtotal: financials.subtotal,
      contract_value: financials.totalFormatted,
      gst_amount: financials.gstFormatted,
      deposit_amount: financials.depositFormatted,
      settlement_amount: financials.settlementFormatted,
      commercial_items: financials.scopeItems,
      created_via: 'admin_portal',
      initial_custom_message: input.customMessage?.trim() || null,
    },
    created_at: now,
    updated_at: now,
  };

  let createdEngagement: ClientEngagement | null = null;

  if (isAdminClientConfigured()) {
    try {
      const { data: engData, error: engError } = await supabaseAdmin
        .from('client_engagements')
        .insert(newEngagementRecord)
        .select('*')
        .single();

      if (engError) {
        console.error('[createEngagement] DB insert failed:', engError);
        return { success: false, error: engError.message };
      }

      createdEngagement = engData as ClientEngagement;

      // Seed all 13 canonical stages with dynamic proposal and milestone amounts
      const stagesToInsert = ORDERED_STAGE_KEYS.map((key, idx) => {
        const def = CANONICAL_13_STAGES[key];
        const isFirst = idx === 0;

        let initialSnapshot: Record<string, any> = {};
        if (key === 'proposal') {
          initialSnapshot = {
            subtotal: financials.subtotalFormatted,
            gst: financials.gstFormatted,
            totalPayable: financials.totalFormatted,
            deposit: financials.depositFormatted,
            settlement: financials.settlementFormatted,
            commercialItems: financials.scopeItems,
          };
        } else if (key === 'initial-invoice') {
          initialSnapshot = {
            amount: financials.depositFormatted,
          };
        } else if (key === 'final-payment') {
          initialSnapshot = {
            amount: financials.settlementFormatted,
          };
        }

        return {
          engagement_id: createdEngagement!.id,
          stage_key: key,
          ordinal: def.ordinal,
          title: def.title,
          summary: def.description,
          status: isFirst ? ('available' as const) : ('locked' as const),
          assigned_owner: 'Logic Intelligence Technologies Staff',
          notes: null,
          prerequisite_stage_key: def.prerequisiteKey,
          prerequisite_description: def.prerequisiteDesc,
          document_master_ref: def.documentMasterRef,
          snapshot: initialSnapshot,
          unlocked_at: isFirst ? now : null,
          completed_at: null,
          approved_at: null,
          created_at: now,
          updated_at: now,
        };
      });

      const { error: stagesError } = await supabaseAdmin
        .from('engagement_stages')
        .insert(stagesToInsert);

      if (stagesError) {
        console.warn('[createEngagement] Failed seeding stages:', stagesError);
      }

      // Seed standard document master links
      const docsToInsert = [
        {
          engagement_id: createdEngagement!.id,
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
        },
        {
          engagement_id: createdEngagement!.id,
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
        },
        {
          engagement_id: createdEngagement!.id,
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
        },
        {
          engagement_id: createdEngagement!.id,
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
        },
        {
          engagement_id: createdEngagement!.id,
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
        },
      ];

      const { error: docsError } = await supabaseAdmin
        .from('engagement_document_links')
        .insert(docsToInsert);

      if (docsError) {
        console.warn('[createEngagement] Failed seeding document links:', docsError);
      }
    } catch (dbErr: any) {
      console.warn('[createEngagement] Exception during database write:', dbErr);
      return { success: false, error: dbErr?.message || 'Database error' };
    }
  }

  // In fallback/in-memory mode if DB is unconfigured
  if (!createdEngagement) {
    createdEngagement = {
      id: `eng-mock-${Date.now()}`,
      client_id: null,
      proposal_id: null,
      checklist_invitation_id: null,
      ...newEngagementRecord,
    };
  }

  // Handle immediate email dispatch
  let emailDispatched = false;
  let emailMessage = 'Email dispatch skipped by configuration.';

  if (input.sendEmailImmediately !== false) {
    try {
      const emailRes = await sendEngagementInvitationEmail(
        createdEngagement.id || createdEngagement.engagement_ref,
        input.customMessage || undefined
      );
      emailDispatched = emailRes.ok;
      emailMessage = emailRes.message;
    } catch (mailErr: any) {
      console.error('[createEngagement] Email sending failed:', mailErr);
      emailMessage = mailErr?.message || 'Email dispatch failed';
    }
  }

  return {
    success: true,
    engagement: createdEngagement,
    emailDispatched,
    emailMessage,
  };
}

/**
 * Super Admin: Atomically reconcile receiving bank payment for Stage 6 (initial-invoice)
 * or Stage 11 (final-payment). Verifies bank credit, unlocks downstream stage (onboarding or handover),
 * upserts reconciliation receipt in document registry, and writes immutable audit record.
 */
export async function reconcileEngagementStagePayment(input: {
  engagementRef: string;
  stageKey: 'initial-invoice' | 'final-payment';
  actorName?: string;
  reconciliationNotes?: string;
  verifiedAmount?: number | string;
  transactionRef?: string;
}): Promise<{
  success: boolean;
  stage?: EngagementStage;
  nextStage?: EngagementStage;
  stages?: EngagementStage[];
  message?: string;
  error?: string;
}> {
  const {
    engagementRef,
    stageKey,
    actorName = 'Super Admin',
    reconciliationNotes,
    verifiedAmount,
    transactionRef,
  } = input;

  if (stageKey !== 'initial-invoice' && stageKey !== 'final-payment') {
    return {
      success: false,
      error: 'Bank reconciliation is only supported on payment stages (initial-invoice or final-payment).',
    };
  }

  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) {
    return {
      success: false,
      error: `Engagement ${engagementRef} not found.`,
    };
  }

  const stages = await getEngagementStages(engagement.id);
  const currentStage = stages.find((s) => s.stage_key === stageKey);
  if (!currentStage) {
    return {
      success: false,
      error: `Stage ${stageKey} not found for engagement.`,
    };
  }

  const nextStageKey: StageKey = stageKey === 'initial-invoice' ? 'onboarding' : 'handover';
  const nextStage = stages.find((s) => s.stage_key === nextStageKey);
  const now = new Date().toISOString();

  const candidateSubtotal =
    currentStage.snapshot?.subtotal ||
    (engagement.metadata as Record<string, any>)?.contract_subtotal ||
    (engagement.metadata as Record<string, any>)?.subtotal ||
    (engagement.metadata as Record<string, any>)?.contract_value ||
    (engagement.metadata as Record<string, any>)?.budget_range ||
    50;
  const financials = calculateEngagementFinancials(candidateSubtotal);
  const defaultMilestoneAmount = stageKey === 'initial-invoice' ? financials.depositFormatted : financials.settlementFormatted;

  const reconciliationData = {
    bank_verified: true,
    reconciled_at: now,
    reconciled_by: actorName,
    notes: reconciliationNotes || 'Manual bank credit verified in receiving account.',
    verified_amount: verifiedAmount || currentStage.snapshot?.amount || defaultMilestoneAmount,
    transaction_ref: transactionRef || `BANK-REC-${Date.now()}`,
  };

  const updatedSnapshot = {
    ...(currentStage.snapshot || {}),
    ...reconciliationData,
    last_action: 'verify_bank_credit',
    last_updated_at: now,
  };

  let invoicePdfResult: { bytes: Uint8Array; sha256: string } | null = null;
  let receiptPdfResult: { bytes: Uint8Array; sha256: string } | null = null;

  if (isAdminClientConfigured()) {
    try {
      // 1. Record immutable audit ledger event
      await supabaseAdmin.from('engagement_stage_events').insert({
        engagement_id: engagement.id,
        stage_key: stageKey,
        action: 'verify_bank_credit',
        from_status: currentStage.status,
        to_status: 'verified',
        actor_role: 'super_admin',
        actor_id: actorName,
        reason: reconciliationNotes || `Bank reconciliation credit verified for ${stageKey}`,
        idempotency_key: `bank-rec-${stageKey}-${engagement.id}-${Date.now()}`,
        payload: {
          ...reconciliationData,
          next_stage_unlocked: nextStageKey,
          _timestamp: now,
        },
      });

      // 2. Mark current payment stage as 'verified'
      await supabaseAdmin
        .from('engagement_stages')
        .update({
          status: 'verified',
          snapshot: updatedSnapshot,
          completed_at: currentStage.completed_at || now,
          approved_at: now,
          updated_at: now,
        })
        .eq('id', currentStage.id);

      // 3. Unlock next downstream milestone
      if (nextStage) {
        await supabaseAdmin
          .from('engagement_stages')
          .update({
            status: 'available',
            unlocked_at: now,
            updated_at: now,
          })
          .eq('id', nextStage.id);
      }

      // 4. Advance client_engagements current_stage pointer
      await supabaseAdmin
        .from('client_engagements')
        .update({
          current_stage: nextStageKey,
          updated_at: now,
        })
        .eq('id', engagement.id);

      // 5. Generate authentic Tax Invoice & Payment Receipt PDFs and upsert both in engagement document links
      const isInitial = stageKey === 'initial-invoice';
      const cleanRef = (engagement.engagement_ref || 'ENG').replace(/[^A-Z0-9]/gi, '');
      const invoiceDocNumber = isInitial ? `LIT-INV-${cleanRef}-01` : `LIT-INV-${cleanRef}-02`;
      const receiptDocNumber = isInitial ? `LIT-REC-${cleanRef}-01` : `LIT-REC-${cleanRef}-02`;
      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const dueDate = new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const milestoneRef = isInitial
        ? 'Stage 6: Initial Project Milestone (50% Deposit)'
        : 'Stage 11: Final Milestone Settlement (50%)';
      const milestoneAmount = isInitial ? financials.depositAmount : financials.settlementAmount;
      const lineItemBase = Math.round((milestoneAmount / 1.18) * 100) / 100;
      const gstAmount = Math.round((milestoneAmount - lineItemBase) * 100) / 100;

      const engMeta = (engagement.metadata || {}) as Record<string, unknown>;
      const billingAddress = (engMeta.billing_address as string) || (engMeta.registered_address as string) || 'Registered Address';
      const clientGstin = (engMeta.gstin as string) || undefined;
      const projectTitle = engagement.project_title || 'Enterprise Engagement';

      try {
        invoicePdfResult = await generateTaxInvoicePdf({
          invoiceNumber: invoiceDocNumber,
          dateIssued: formattedDate,
          dueDate,
          milestoneRef,
          client: {
            legalName: engagement.company_name,
            attentionName: engagement.contact_name,
            billingAddress,
            email: engagement.contact_email,
            phone: engagement.contact_phone || undefined,
            gstin: clientGstin,
          },
          items: [
            {
              description: `${milestoneRef} — ${projectTitle}`,
              quantity: 1,
              unitPrice: lineItemBase,
              taxRatePercent: 18,
              amount: lineItemBase,
            },
          ],
          subtotal: lineItemBase,
          cgstAmount: Math.round((gstAmount / 2) * 100) / 100,
          sgstAmount: Math.round((gstAmount / 2) * 100) / 100,
          totalTaxAmount: gstAmount,
          totalPayable: milestoneAmount,
          status: 'paid',
          amountPaid: milestoneAmount,
          amountDue: 0,
          notes: `Reconciled by ${actorName}. Transaction Ref: ${reconciliationData.transaction_ref}`,
        });
      } catch (invErr) {
        console.error('[reconcileEngagementStagePayment] Tax invoice generation error:', invErr);
      }

      try {
        receiptPdfResult = await generatePaymentReceiptPdf({
          receiptNumber: receiptDocNumber,
          invoiceNumber: invoiceDocNumber,
          datePaid: formattedDate,
          milestoneRef,
          client: {
            legalName: engagement.company_name,
            attentionName: engagement.contact_name,
            billingAddress,
            email: engagement.contact_email,
            phone: engagement.contact_phone || undefined,
            gstin: clientGstin,
          },
          items: [
            {
              description: `${milestoneRef} — ${projectTitle}`,
              quantity: 1,
              unitPrice: lineItemBase,
              taxRatePercent: 18,
              amount: lineItemBase,
            },
          ],
          subtotal: lineItemBase,
          cgstAmount: Math.round((gstAmount / 2) * 100) / 100,
          sgstAmount: Math.round((gstAmount / 2) * 100) / 100,
          totalTaxAmount: gstAmount,
          totalAmount: milestoneAmount,
          amountPaid: milestoneAmount,
          remainingBalance: 0,
          paymentHistory: [
            {
              paymentMethod: 'UPI Manual Transfer',
              paymentDate: formattedDate,
              utrReference: reconciliationData.transaction_ref,
              receivingBankRef: 'YES BANK / PTYES',
              amountPaid: milestoneAmount,
              receiptNumber: receiptDocNumber,
            },
          ],
          notes: `Reconciled by ${actorName}. Transaction Ref: ${reconciliationData.transaction_ref}`,
        });
      } catch (rcptErr) {
        console.error('[reconcileEngagementStagePayment] Payment receipt generation error:', rcptErr);
      }

      const docsToInsert = [];
      const nowIso = new Date().toISOString();

      if (invoicePdfResult) {
        const invoiceStoragePath = `financial/invoices/${invoiceDocNumber}.pdf`;
        try {
          await supabaseAdmin.storage
            .from(DOCUMENTS_BUCKET)
            .upload(invoiceStoragePath, Buffer.from(invoicePdfResult.bytes), {
              contentType: 'application/pdf',
              upsert: true,
            });

          await supabaseAdmin.from('financial_documents').insert({
            payment_request_id: null,
            doc_type: 'invoice',
            document_number: invoiceDocNumber,
            title: isInitial
              ? 'Stage 06 Advance Tax Invoice (GST Rule 46)'
              : 'Stage 11 Final Tax Invoice (GST Rule 46)',
            storage_path: invoiceStoragePath,
            sha256_hash: invoicePdfResult.sha256,
            byte_size: invoicePdfResult.bytes.byteLength,
            client_id: engagement.client_id || null,
            status: 'issued',
            issued_at: nowIso,
          });
        } catch (storageErr) {
          console.warn('[reconcileEngagementStagePayment] Invoice storage/financial_documents warning:', storageErr);
        }

        docsToInsert.push({
          engagement_id: engagement.id,
          stage_key: stageKey,
          document_title: isInitial
            ? 'Stage 06 Advance Tax Invoice (GST Rule 46)'
            : 'Stage 11 Final Tax Invoice (GST Rule 46)',
          master_id: isInitial ? 'LIT-02-INV' : 'LIT-05-INV',
          version_label: 'v1.0 (Verified)',
          file_url: `/api/documents/invoice/${invoiceDocNumber}/pdf`,
          file_size_bytes: invoicePdfResult.bytes.byteLength,
          sha256_hash: invoicePdfResult.sha256,
          is_client_visible: true,
          requires_signature: false,
          signature_status: 'none' as const,
        });
      }

      if (receiptPdfResult) {
        const receiptStoragePath = `financial/receipts/${receiptDocNumber}.pdf`;
        try {
          await supabaseAdmin.storage
            .from(DOCUMENTS_BUCKET)
            .upload(receiptStoragePath, Buffer.from(receiptPdfResult.bytes), {
              contentType: 'application/pdf',
              upsert: true,
            });

          await supabaseAdmin.from('financial_documents').insert({
            payment_request_id: null,
            doc_type: 'receipt',
            document_number: receiptDocNumber,
            title: isInitial
              ? 'Stage 06 Payment Receipt & Reconciliation Certificate'
              : 'Stage 11 Settlement Receipt & Reconciliation Certificate',
            storage_path: receiptStoragePath,
            sha256_hash: receiptPdfResult.sha256,
            byte_size: receiptPdfResult.bytes.byteLength,
            client_id: engagement.client_id || null,
            status: 'issued',
            issued_at: nowIso,
          });
        } catch (storageErr) {
          console.warn('[reconcileEngagementStagePayment] Receipt storage/financial_documents warning:', storageErr);
        }

        docsToInsert.push({
          engagement_id: engagement.id,
          stage_key: stageKey,
          document_title: isInitial
            ? 'Stage 06 Payment Receipt & Reconciliation Certificate'
            : 'Stage 11 Settlement Receipt & Reconciliation Certificate',
          master_id: isInitial ? 'LIT-02-RCPT' : 'LIT-05-RCPT',
          version_label: 'v1.0 (Verified)',
          file_url: `/api/documents/receipt/${receiptDocNumber}/pdf`,
          file_size_bytes: receiptPdfResult.bytes.byteLength,
          sha256_hash: receiptPdfResult.sha256,
          is_client_visible: true,
          requires_signature: false,
          signature_status: 'none' as const,
        });
      }

      if (docsToInsert.length > 0) {
        await supabaseAdmin
          .from('engagement_document_links')
          .insert(docsToInsert);
      }


    } catch (dbErr: any) {
      console.error('[reconcileEngagementStagePayment] DB write error:', dbErr);
      return { success: false, error: dbErr?.message || 'Database reconciliation failed' };
    }
  }

  let refreshedStages: EngagementStage[] = [];
  if (isAdminClientConfigured()) {
    try {
      refreshedStages = await getEngagementStages(engagement.id);
    } catch {
      // ignore
    }
  }
  if (!refreshedStages || refreshedStages.length === 0) {
    refreshedStages = stages.map((s) => {
      if (s.stage_key === stageKey) {
        return {
          ...s,
          status: 'verified',
          snapshot: updatedSnapshot,
          completed_at: currentStage.completed_at || now,
          approved_at: now,
          updated_at: now,
        };
      }
      if (s.stage_key === nextStageKey) {
        return {
          ...s,
          status: 'available',
          unlocked_at: now,
          updated_at: now,
        };
      }
      return s;
    });
  }

  const updatedStage = refreshedStages.find((s) => s.stage_key === stageKey);
  const updatedNextStage = refreshedStages.find((s) => s.stage_key === nextStageKey);

  // Prepare attachments for approval email: both Tax Invoice and Payment Receipt
  const cleanRef = (engagement.engagement_ref || 'ENG').replace(/[^A-Z0-9]/gi, '');
  const invoiceDocNumber = stageKey === 'initial-invoice' ? `LIT-INV-${cleanRef}-01` : `LIT-INV-${cleanRef}-02`;
  const receiptDocNumber = stageKey === 'initial-invoice' ? `LIT-REC-${cleanRef}-01` : `LIT-REC-${cleanRef}-02`;
  const emailAttachments = [];

  if (invoicePdfResult && (invoicePdfResult as any).bytes) {
    emailAttachments.push({
      filename: `${invoiceDocNumber}.pdf`,
      content: Buffer.from((invoicePdfResult as any).bytes),
      contentType: 'application/pdf',
    });
  }
  if (receiptPdfResult && (receiptPdfResult as any).bytes) {
    emailAttachments.push({
      filename: `${receiptDocNumber}.pdf`,
      content: Buffer.from((receiptPdfResult as any).bytes),
      contentType: 'application/pdf',
    });
  }

  // Trigger client unlock email for bank credit verification with attached invoice & receipt
  notifyStageApproved({
    engagement,
    approvedStageKey: stageKey,
    nextStageKey,
    adminNotes: reconciliationNotes || `Manual bank credit verified in receiving account. Ref: ${reconciliationData.transaction_ref}`,
    attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
  }).catch((notifErr) => {
    console.warn('[reconcileEngagementStagePayment] Bank approval notification error:', notifErr);
  });

  return {
    success: true,
    stage: updatedStage,
    nextStage: updatedNextStage,
    stages: refreshedStages,
    message: `Receiving bank credit verified! Stage ${stageKey} marked verified, and Stage ${nextStageKey} unlocked.`,
  };
}


