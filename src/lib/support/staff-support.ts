import { createClient } from '@supabase/supabase-js';
import { hasCapability, type StaffRole } from '@/config/roles';
import { recordAdminAction } from '@/lib/admin/audit';

export type AssignmentRole =
  | 'technical_support'
  | 'project_coordinator'
  | 'operations_prep'
  | 'delivery_engineer';

export type AssignmentStatus = 'active' | 'expired' | 'revoked';

export interface StaffClientAssignment {
  id: string;
  staff_user_id: string;
  staff_email?: string | null;
  client_id: string | null;
  engagement_id: string | null;
  assignment_role: AssignmentRole;
  status: AssignmentStatus;
  can_view_technical_stages: boolean;
  can_prepare_technical_quotation: boolean;
  can_prepare_invoice_request: boolean;
  can_invite_collaborators?: boolean;
  assigned_by: string;
  assignment_reason: string;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffSupportAccessEvent {
  id: string;
  staff_user_id: string;
  staff_email: string | null;
  staff_role: StaffRole;
  client_id: string | null;
  engagement_id: string | null;
  assignment_id: string | null;
  action: string;
  route: string;
  reason: string | null;
  redacted_fields: string[];
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StaffSupportTechnicalStageSummary {
  stage_number: number;
  stage_key: string;
  display_name: string;
  status: string;
  is_financial_stage_redacted: boolean;
  technical_data: Record<string, unknown>;
  updated_at: string | null;
}

export interface RedactedStaffSupportClientContext {
  banner: string;
  actor: {
    staff_user_id: string;
    staff_email: string | null;
    staff_role: StaffRole;
    impersonating_client: false;
    client_session_established: false;
  };
  assignment: {
    id: string;
    assignment_role: AssignmentRole;
    status: AssignmentStatus;
    can_view_technical_stages: boolean;
    can_prepare_technical_quotation: boolean;
    can_prepare_invoice_request: boolean;
    expires_at: string | null;
  };
  client: {
    client_id: string;
    company_name: string;
    contact_name: string;
    contact_email: string;
    project_title: string;
    engagement_ref: string | null;
    engagement_id: string | null;
    current_stage: number | null;
    engagement_status: string | null;
  };
  financial_redaction: {
    redacted: true;
    policy: 'POLICY_2_AUDITED_STAFF_SUPPORT_VIEW';
    omitted_fields: readonly string[];
    commercial_summary: 'REDACTED — Commercial pricing, discounts, GST/PAN, invoices, and payment records are restricted to Super Admin.';
  };
  technical_stages: StaffSupportTechnicalStageSummary[];
  support_notes: Array<{
    id: string;
    author_user_id: string;
    author_email: string | null;
    author_role: StaffRole;
    note: string;
    stage_key: string | null;
    created_at: string;
  }>;
  action_requests: Array<{
    id: string;
    requested_by: string;
    requested_by_email: string | null;
    requested_by_role: StaffRole;
    request_type: 'stage_review' | 'identity_correction_escalation' | 'technical_clarification' | 'commercial_escalation';
    stage_key: string | null;
    summary: string;
    status: 'pending_super_admin' | 'resolved';
    created_at: string;
  }>;
  support_tickets?: CanonicalSupportTicket[];
}

export interface CanonicalSupportTicket {
  id: string;
  ticket_ref: string;
  client_id: string | null;
  engagement_id: string | null;
  assigned_staff_id: string | null;
  customer_email: string;
  subject: string;
  original_message: string;
  component: string | null;
  severity: string;
  status: string;
  sla_target_hours: number;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export const FORBIDDEN_FINANCIAL_KEYS = [
  'unit_price',
  'unit_price_paise',
  'base_price_paise',
  'line_total_paise',
  'line_subtotal_paise',
  'line_discount_paise',
  'line_taxable_paise',
  'line_gst_paise',
  'price',
  'subtotal',
  'subtotal_paise',
  'tax',
  'tax_paise',
  'taxable_paise',
  'gst',
  'gst_paise',
  'gst_rate',
  'gst_rate_bps',
  'discount',
  'discount_paise',
  'discount_bps',
  'discount_value',
  'coupon',
  'coupon_code',
  'coupon_id',
  'coupon_snapshot',
  'total',
  'total_paise',
  'total_value',
  'milestone_amount',
  'advance_paise',
  'final_paise',
  'advance_amount',
  'final_amount',
  'invoice_total',
  'amount_due',
  'amount_paid',
  'payment_reference',
  'utr',
  'bank_details',
  'account_number',
  'ifsc',
  'upi_vpa',
  'gstin',
  'pan',
  'commercial_versions',
  'priced_line_items',
  'proposal_Commercial',
] as const;

const FORBIDDEN_KEY_SET = new Set<string>(
  FORBIDDEN_FINANCIAL_KEYS.map((k) => k.toLowerCase())
);

const FINANCIAL_STAGE_KEYS = new Set<string>([
  'proposal',
  'initial_invoice',
  'final_payment',
]);

// In-memory stores for deterministic testing & fallback when DB tables are not yet migrated
const inMemoryAssignments = new Map<string, StaffClientAssignment>();
const inMemoryAccessEvents: StaffSupportAccessEvent[] = [];
const inMemorySupportNotes = new Map<
  string,
  RedactedStaffSupportClientContext['support_notes']
>();
const inMemoryActionRequests = new Map<
  string,
  RedactedStaffSupportClientContext['action_requests']
>();
const inMemoryCanonicalTickets = new Map<string, CanonicalSupportTicket>();

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function buildStaffSupportBanner(staffEmailOrId: string, staffRole: StaffRole): string {
  return `Staff Support View — acting as ${staffEmailOrId} (${staffRole}), read-only client context; not signed in as client`;
}

/**
 * Recursively strips all forbidden commercial, pricing, tax, coupon, invoice,
 * bank, UTR, and tax-identifier keys from any object before returning to staff.
 */
export function redactFinancialFieldsForStaffSupport<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map((item) => redactFinancialFieldsForStaffSupport(item)) as unknown as T;
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const normalized = key.toLowerCase();
      if (
        FORBIDDEN_KEY_SET.has(normalized) ||
        normalized.includes('price') ||
        normalized.includes('paise') ||
        normalized.includes('subtotal') ||
        normalized.includes('discount') ||
        normalized.includes('coupon') ||
        normalized.includes('invoice') ||
        normalized.includes('utr') ||
        normalized.includes('gstin') ||
        normalized.includes('upi_vpa') ||
        normalized.includes('bank_account')
      ) {
        continue;
      }
      out[key] = redactFinancialFieldsForStaffSupport(value);
    }
    return out as T;
  }
  return input;
}

/**
 * Policy 2 Guard: Staff must NEVER impersonate a client or execute client-only mutations
 * pretending to be a client user.
 */
export function assertNeverClientImpersonation(params: {
  actorUserId: string;
  actorRole: StaffRole | 'client' | 'user';
  requestedActorRole?: string | null;
  impersonateClientId?: string | null;
}): { ok: true } | { ok: false; status: 403; message: string } {
  if (params.impersonateClientId) {
    return {
      ok: false,
      status: 403,
      message:
        'Policy 2 violation: Client impersonation and session takeover are strictly prohibited.',
    };
  }
  if (
    params.actorRole !== 'client' &&
    params.requestedActorRole &&
    params.requestedActorRole.toLowerCase() === 'client'
  ) {
    return {
      ok: false,
      status: 403,
      message:
        'Policy 2 violation: Staff members must act under their own staff identity and cannot submit actions as a client.',
    };
  }
  return { ok: true };
}

export async function createStaffClientAssignment(input: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  staffUserId: string;
  staffEmail?: string | null;
  clientId?: string | null;
  engagementId?: string | null;
  assignmentRole: AssignmentRole;
  canViewTechnicalStages?: boolean;
  canPrepareTechnicalQuotation?: boolean;
  canPrepareInvoiceRequest?: boolean;
  canInviteCollaborators?: boolean;
  assignmentReason: string;
  expiresAt?: string | null;
}): Promise<StaffClientAssignment> {
  if (!hasCapability(input.actorRole, 'support.assignment.manage')) {
    throw new Error('Forbidden: Only Super Admin may create staff-client assignments.');
  }
  if (!input.clientId && !input.engagementId) {
    throw new Error('Either clientId or engagementId is required for a staff assignment.');
  }
  if (!input.assignmentReason || input.assignmentReason.trim().length < 5) {
    throw new Error('A clear assignment reason (minimum 5 characters) is required.');
  }

  // Reject known demo / non-persistent engagement IDs
  const DEMO_ENGAGEMENT_ID = '8acad856-9840-4646-b42d-f8bf12ea47f8';
  if (input.engagementId === DEMO_ENGAGEMENT_ID) {
    throw new Error(
      'This engagement is a demonstration record and cannot be assigned. Create a real client engagement first.'
    );
  }

  const admin = getServiceClient();
  if (input.engagementId && admin) {
    const { data: eng, error: engErr } = await admin
      .from('client_engagements')
      .select('id, client_id, company_name, project_title, status')
      .eq('id', input.engagementId)
      .maybeSingle();
    if (engErr) {
      throw new Error('Unable to verify the selected engagement. Please try again.');
    }
    if (!eng) {
      throw new Error(
        'The selected project does not exist in client engagements. Create or select a real engagement before assigning staff.'
      );
    }
    if (!input.clientId && eng.client_id) {
      input.clientId = eng.client_id;
    }
  }

  if (admin) {
    const { data: staffEmp } = await admin
      .from('staff_employees')
      .select('auth_user_id, employment_status')
      .eq('auth_user_id', input.staffUserId)
      .maybeSingle();
    if (
      staffEmp &&
      (staffEmp.employment_status === 'suspended' || staffEmp.employment_status === 'offboarded')
    ) {
      throw new Error('This staff member is not eligible for project assignment (employment inactive).');
    }
    const { data: ws } = await admin
      .from('staff_workspaces')
      .select('id, status')
      .eq('owner_user_id', input.staffUserId)
      .maybeSingle();
    if (ws && (ws.status === 'suspended' || ws.status === 'revoked' || ws.status === 'archived')) {
      throw new Error('Staff workspace is not active. Reactivate the workspace before assigning projects.');
    }
  }

  const now = new Date().toISOString();
  const assignment: StaffClientAssignment = {
    id: crypto.randomUUID(),
    staff_user_id: input.staffUserId,
    staff_email: input.staffEmail ?? null,
    client_id: input.clientId ?? null,
    engagement_id: input.engagementId ?? null,
    assignment_role: input.assignmentRole,
    status: 'active',
    can_view_technical_stages: input.canViewTechnicalStages ?? true,
    can_prepare_technical_quotation: input.canPrepareTechnicalQuotation ?? false,
    can_prepare_invoice_request: input.canPrepareInvoiceRequest ?? false,
    can_invite_collaborators: input.canInviteCollaborators ?? false,
    assigned_by: input.actorUserId,
    assignment_reason: input.assignmentReason.trim(),
    starts_at: now,
    expires_at: input.expiresAt ?? null,
    revoked_at: null,
    revoked_by: null,
    created_at: now,
    updated_at: now,
  };

  const supabase = getServiceClient();
  if (supabase && assignment.engagement_id) {
    // Atomic upsert: respects unique (staff_user_id, engagement_id); reactivates revoked rows
    const { data: rpcRows, error: rpcError } = await supabase.rpc('staff_upsert_project_assignment', {
      p_staff_user_id: assignment.staff_user_id,
      p_engagement_id: assignment.engagement_id,
      p_client_id: assignment.client_id,
      p_assignment_role: assignment.assignment_role,
      p_can_view_technical_stages: assignment.can_view_technical_stages,
      p_can_prepare_technical_quotation: assignment.can_prepare_technical_quotation,
      p_can_prepare_invoice_request: assignment.can_prepare_invoice_request,
      p_can_invite_collaborators: assignment.can_invite_collaborators ?? false,
      p_assignment_reason: assignment.assignment_reason,
      p_expires_at: assignment.expires_at,
      p_actor_user_id: input.actorUserId,
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (/does not exist|demonstration|Engagement does not exist/i.test(msg)) {
        throw new Error(
          msg.includes('demonstration')
            ? 'Demonstration engagement cannot be assigned. Create a real client engagement first.'
            : 'The selected project is not a valid client engagement. Create a real engagement before assigning staff.'
        );
      }
      throw new Error(`Failed to persist staff assignment: ${msg}`);
    }

    const data = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
    if (data) {
      Object.assign(assignment, data);
    }
    inMemoryAssignments.set(assignment.id, assignment);
  } else if (supabase) {
    // clientId-only assignment path (no engagement) — insert without unique engagement pair
    const { data, error } = await supabase
      .from('staff_client_assignments')
      .insert({
        id: assignment.id,
        staff_user_id: assignment.staff_user_id,
        client_id: assignment.client_id,
        engagement_id: assignment.engagement_id,
        assignment_role: assignment.assignment_role,
        status: assignment.status,
        can_view_technical_stages: assignment.can_view_technical_stages,
        can_prepare_technical_quotation: assignment.can_prepare_technical_quotation,
        can_prepare_invoice_request: assignment.can_prepare_invoice_request,
        can_invite_collaborators: assignment.can_invite_collaborators,
        assigned_by: assignment.assigned_by,
        assignment_reason: assignment.assignment_reason,
        starts_at: assignment.starts_at,
        expires_at: assignment.expires_at,
      })
      .select('*')
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to persist staff assignment: ${error.message}`);
    }
    if (data) Object.assign(assignment, data);
    inMemoryAssignments.set(assignment.id, assignment);
  } else {
    // Fallback for unconfigured DB runtime (unit tests)
    if (assignment.engagement_id) {
      for (const [id, a] of inMemoryAssignments.entries()) {
        if (
          a.staff_user_id === assignment.staff_user_id &&
          a.engagement_id === assignment.engagement_id &&
          a.status === 'active'
        ) {
          a.status = 'revoked';
          a.revoked_at = now;
          a.revoked_by = input.actorUserId;
          a.updated_at = now;
          inMemoryAssignments.set(id, a);
        }
      }
    }
    inMemoryAssignments.set(assignment.id, assignment);
  }

  await recordAdminAction({
    actor: { userId: input.actorUserId, email: input.actorEmail, role: input.actorRole },
    action: 'staff_client_assignment.create',
    capability: 'support.assignment.manage',
    outcome: 'succeeded',
    target: {
      type: 'staff_client_assignment',
      id: assignment.id,
    },
    metadata: {
      staff_user_id: assignment.staff_user_id,
      client_id: assignment.client_id,
      engagement_id: assignment.engagement_id,
      assignment_role: assignment.assignment_role,
    },
  });

  return assignment;
}

export async function updateStaffClientAssignment(input: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  assignmentId: string;
  status?: AssignmentStatus;
  expiresAt?: string | null;
  canViewTechnicalStages?: boolean;
  canPrepareTechnicalQuotation?: boolean;
  canPrepareInvoiceRequest?: boolean;
  canInviteCollaborators?: boolean;
}): Promise<StaffClientAssignment> {
  if (!hasCapability(input.actorRole, 'support.assignment.manage')) {
    throw new Error('Forbidden: Only Super Admin may modify or revoke staff-client assignments.');
  }

  const now = new Date().toISOString();
  const supabase = getServiceClient();

  if (supabase) {
    const patch: Record<string, unknown> = { updated_at: now };
    if (input.status) patch.status = input.status;
    if (input.status === 'revoked') {
      patch.revoked_at = now;
      patch.revoked_by = input.actorUserId;
    }
    if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt;
    if (input.canViewTechnicalStages !== undefined) {
      patch.can_view_technical_stages = input.canViewTechnicalStages;
    }
    if (input.canPrepareTechnicalQuotation !== undefined) {
      patch.can_prepare_technical_quotation = input.canPrepareTechnicalQuotation;
    }
    if (input.canPrepareInvoiceRequest !== undefined) {
      patch.can_prepare_invoice_request = input.canPrepareInvoiceRequest;
    }
    if (input.canInviteCollaborators !== undefined) {
      patch.can_invite_collaborators = input.canInviteCollaborators;
    }

    const { data, error } = await supabase
      .from('staff_client_assignments')
      .update(patch)
      .eq('id', input.assignmentId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update staff assignment: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Assignment ${input.assignmentId} not found in database.`);
    }

    const updated = data as StaffClientAssignment;
    inMemoryAssignments.set(updated.id, updated);

    try {
      const { notifyStaff } = await import('@/lib/staff/notifications');
      if (updated.status === 'revoked') {
        await notifyStaff({
          recipientUserId: updated.staff_user_id,
          engagementId: updated.engagement_id,
          eventType: 'project.revoked',
          title: 'Project assignment revoked',
          summary: updated.assignment_reason || 'Assignment revoked',
          sourceId: updated.id,
          actionUrl: '/staff/projects',
          idempotencyKey: `assignment:revoke:${updated.id}:${updated.updated_at}`,
        });
      } else if (input.status === 'active' || input.assignmentRole || input.canPrepareTechnicalQuotation !== undefined) {
        await notifyStaff({
          recipientUserId: updated.staff_user_id,
          engagementId: updated.engagement_id,
          eventType: 'project.reassigned',
          title: 'Project assignment updated',
          summary: updated.assignment_role,
          sourceId: updated.id,
          actionUrl: updated.engagement_id
            ? `/staff/projects/${updated.engagement_id}`
            : '/staff/projects',
          idempotencyKey: `assignment:update:${updated.id}:${updated.updated_at}`,
        });
      }
    } catch (e) {
      console.warn('[assignment] staff notification failed', e);
    }

    return updated;
  }

  // Fallback for unconfigured DB runtime (unit tests)
  const existing = inMemoryAssignments.get(input.assignmentId);
  if (!existing) {
    throw new Error(`Assignment ${input.assignmentId} not found.`);
  }

  if (input.status) existing.status = input.status;
  if (input.status === 'revoked') {
    existing.revoked_at = now;
    existing.revoked_by = input.actorUserId;
  }
  if (input.expiresAt !== undefined) existing.expires_at = input.expiresAt;
  if (input.canViewTechnicalStages !== undefined) {
    existing.can_view_technical_stages = input.canViewTechnicalStages;
  }
  if (input.canPrepareTechnicalQuotation !== undefined) {
    existing.can_prepare_technical_quotation = input.canPrepareTechnicalQuotation;
  }
  if (input.canPrepareInvoiceRequest !== undefined) {
    existing.can_prepare_invoice_request = input.canPrepareInvoiceRequest;
  }
  if (input.canInviteCollaborators !== undefined) {
    existing.can_invite_collaborators = input.canInviteCollaborators;
  }
  existing.updated_at = now;
  inMemoryAssignments.set(existing.id, existing);
  return existing;
}

export async function listStaffClientAssignments(filter?: {
  staffUserId?: string;
  clientId?: string;
  engagementId?: string;
  onlyActive?: boolean;
}): Promise<StaffClientAssignment[]> {
  const supabase = getServiceClient();
  if (supabase) {
    let query = supabase
      .from('staff_client_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.staffUserId) query = query.eq('staff_user_id', filter.staffUserId);
    if (filter?.clientId) query = query.eq('client_id', filter.clientId);
    if (filter?.engagementId) query = query.eq('engagement_id', filter.engagementId);
    if (filter?.onlyActive) query = query.eq('status', 'active');

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list staff assignments: ${error.message}`);
    }
    if (Array.isArray(data)) {
      return data as StaffClientAssignment[];
    }
  }

  const nowMs = Date.now();
  return Array.from(inMemoryAssignments.values()).filter((a) => {
    if (filter?.staffUserId && a.staff_user_id !== filter.staffUserId) return false;
    if (filter?.clientId && a.client_id !== filter.clientId) return false;
    if (filter?.engagementId && a.engagement_id !== filter.engagementId) return false;
    if (filter?.onlyActive) {
      if (a.status !== 'active') return false;
      if (a.expires_at && new Date(a.expires_at).getTime() <= nowMs) return false;
    }
    return true;
  });
}

export async function verifyStaffClientAssignment(params: {
  staffUserId: string;
  staffRole: StaffRole;
  clientId?: string | null;
  engagementId?: string | null;
  requireTechnicalQuotationPrep?: boolean;
  requireInvoicePrep?: boolean;
}): Promise<
  | { allowed: true; assignment: StaffClientAssignment }
  | { allowed: false; status: 403; reason: string }
> {
  if (!hasCapability(params.staffRole, 'support.assigned_client.read')) {
    return {
      allowed: false,
      status: 403,
      reason: `Role '${params.staffRole}' does not hold support.assigned_client.read capability.`,
    };
  }

  // Super Admin holds global oversight
  if (params.staffRole === 'super_admin') {
    const now = new Date().toISOString();
    return {
      allowed: true,
      assignment: {
        id: 'super-admin-global-oversight',
        staff_user_id: params.staffUserId,
        client_id: params.clientId ?? null,
        engagement_id: params.engagementId ?? null,
        assignment_role: 'technical_support',
        status: 'active',
        can_view_technical_stages: true,
        can_prepare_technical_quotation: true,
        can_prepare_invoice_request: true,
        assigned_by: params.staffUserId,
        assignment_reason: 'Super Admin sovereign oversight',
        starts_at: now,
        expires_at: null,
        revoked_at: null,
        revoked_by: null,
        created_at: now,
        updated_at: now,
      },
    };
  }

  const activeAssignments = await listStaffClientAssignments({
    staffUserId: params.staffUserId,
    onlyActive: true,
  });

  const nowMs = Date.now();
  const matched = activeAssignments.find((a) => {
    if (a.status !== 'active') return false;
    if (a.expires_at && new Date(a.expires_at).getTime() <= nowMs) return false;
    // Strict conjunction when both are supplied to prevent split-identifier authorization bypass
    if (params.clientId && params.engagementId) {
      return a.client_id === params.clientId && (!a.engagement_id || a.engagement_id === params.engagementId);
    }
    if (params.clientId) {
      return a.client_id === params.clientId;
    }
    if (params.engagementId) {
      return a.engagement_id === params.engagementId;
    }
    return false;
  });

  if (!matched) {
    return {
      allowed: false,
      status: 403,
      reason:
        'Forbidden: Staff member does not have an active, non-expired assignment for this client or engagement.',
    };
  }

  if (params.requireTechnicalQuotationPrep && !matched.can_prepare_technical_quotation) {
    return {
      allowed: false,
      status: 403,
      reason:
        'Forbidden: Assignment does not grant technical quotation preparation permission for this client.',
    };
  }

  if (params.requireInvoicePrep && !matched.can_prepare_invoice_request) {
    return {
      allowed: false,
      status: 403,
      reason:
        'Forbidden: Assignment does not grant invoice preparation permission for this client.',
    };
  }

  return { allowed: true, assignment: matched };
}

export async function recordStaffSupportAccessEvent(input: {
  staffUserId: string;
  staffEmail: string | null;
  staffRole: StaffRole;
  clientId?: string | null;
  engagementId?: string | null;
  assignmentId?: string | null;
  action: string;
  route: string;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<StaffSupportAccessEvent> {
  const event: StaffSupportAccessEvent = {
    id: crypto.randomUUID(),
    staff_user_id: input.staffUserId,
    staff_email: input.staffEmail,
    staff_role: input.staffRole,
    client_id: input.clientId ?? null,
    engagement_id: input.engagementId ?? null,
    assignment_id:
      input.assignmentId && input.assignmentId !== 'super-admin-global-oversight'
        ? input.assignmentId
        : null,
    action: input.action,
    route: input.route,
    reason: input.reason ?? null,
    redacted_fields: [...FORBIDDEN_FINANCIAL_KEYS],
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
    created_at: new Date().toISOString(),
  };

  inMemoryAccessEvents.unshift(event);

  const supabase = getServiceClient();
  if (supabase) {
    await supabase
      .from('staff_support_access_events')
      .insert({
        id: event.id,
        staff_user_id: event.staff_user_id,
        staff_email: event.staff_email,
        staff_role: event.staff_role,
        client_id: event.client_id,
        engagement_id: event.engagement_id,
        assignment_id: event.assignment_id,
        action: event.action,
        route: event.route,
        reason: event.reason,
        redacted_fields: event.redacted_fields,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        metadata: event.metadata,
      })
      .then(
        () => undefined,
        () => undefined
      );
  }

  return event;
}

export async function getRedactedStaffSupportContext(params: {
  staffUserId: string;
  staffEmail: string | null;
  staffRole: StaffRole;
  clientId: string;
  engagementId?: string | null;
  reason?: string | null;
  route: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<
  | { ok: true; data: RedactedStaffSupportClientContext }
  | { ok: false; status: 403 | 404; message: string }
> {
  const check = await verifyStaffClientAssignment({
    staffUserId: params.staffUserId,
    staffRole: params.staffRole,
    clientId: params.clientId,
    engagementId: params.engagementId ?? null,
  });

  if (!check.allowed) {
    await recordStaffSupportAccessEvent({
      staffUserId: params.staffUserId,
      staffEmail: params.staffEmail,
      staffRole: params.staffRole,
      clientId: params.clientId,
      engagementId: params.engagementId ?? null,
      action: 'support_view.access_denied',
      route: params.route,
      reason: check.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    return { ok: false, status: 403, message: check.reason };
  }

  // Load client / engagement metadata from Supabase if available
  let companyName = 'Assigned Enterprise Client';
  let contactName = 'Authorized Client Contact';
  let contactEmail = '';
  let projectTitle = 'Enterprise Architecture Engagement';
  let engagementRef: string | null = null;
  let engagementId: string | null = params.engagementId ?? null;
  let currentStage: number | null = 1;
  let engagementStatus: string | null = 'active';
  const technicalStages: StaffSupportTechnicalStageSummary[] = [];

  const supabase = getServiceClient();
  if (supabase) {
    const { data: engagement, error: engErr } = await supabase
      .from('client_engagements')
      .select(
        'id, engagement_ref, client_id, company_name, contact_name, contact_email, project_title, current_stage, status'
      )
      .or(`client_id.eq.${params.clientId},id.eq.${params.clientId}`)
      .maybeSingle();

    if (engErr) {
      console.warn('[staff-support] Failed to fetch client engagement:', engErr.message);
    }

    if (engagement) {
      engagementId = engagement.id;
      engagementRef = engagement.engagement_ref;
      companyName = engagement.company_name || companyName;
      contactName = engagement.contact_name || contactName;
      contactEmail = engagement.contact_email || contactEmail;
      projectTitle = engagement.project_title || projectTitle;
      currentStage = typeof engagement.current_stage === 'number' ? engagement.current_stage : 1;
      engagementStatus = engagement.status ?? 'active';

      // Query client row for authoritative legal_name and contact details (WS05)
      if (engagement.client_id) {
        const { data: clientRow } = await supabase
          .from('clients')
          .select('id, legal_name, display_name, contact_name, contact_email')
          .eq('id', engagement.client_id)
          .maybeSingle();

        if (clientRow) {
          companyName = clientRow.legal_name || clientRow.display_name || companyName;
          contactName = clientRow.contact_name || contactName;
          contactEmail = clientRow.contact_email || contactEmail;
        }
      }

      // Query stages using live schema columns: ordinal, title, stage_key, status, snapshot (WS05)
      const { data: stages, error: stageErr } = await supabase
        .from('engagement_stages')
        .select('ordinal, title, stage_key, status, snapshot, updated_at')
        .eq('engagement_id', engagement.id)
        .order('ordinal', { ascending: true });

      if (stageErr) {
        console.warn('[staff-support] Failed to fetch engagement stages:', stageErr.message);
      }

      if (Array.isArray(stages)) {
        for (const s of stages) {
          const isFinancialStage = FINANCIAL_STAGE_KEYS.has(s.stage_key);
          technicalStages.push({
            stage_number: s.ordinal ?? 1,
            stage_key: s.stage_key,
            display_name: s.title || s.stage_key,
            status: s.status,
            is_financial_stage_redacted: isFinancialStage,
            technical_data: isFinancialStage
              ? {
                  redacted: true,
                  notice:
                    'Commercial pricing, invoice amounts, GST/PAN, and payment references are redacted in Staff Support View.',
                }
              : redactFinancialFieldsForStaffSupport(
                  (s.snapshot as Record<string, unknown>) ?? {}
                ),
            updated_at: s.updated_at ?? null,
          });
        }
      }
    } else {
      // Direct client-only lookup (null engagement_id / client-only assignment WS04)
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id, legal_name, display_name, contact_name, contact_email')
        .eq('id', params.clientId)
        .maybeSingle();

      if (clientRow) {
        companyName = clientRow.legal_name || clientRow.display_name || companyName;
        contactName = clientRow.contact_name || contactName;
        contactEmail = clientRow.contact_email || contactEmail;
      }
    }
  }

  await recordStaffSupportAccessEvent({
    staffUserId: params.staffUserId,
    staffEmail: params.staffEmail,
    staffRole: params.staffRole,
    clientId: params.clientId,
    engagementId,
    assignmentId: check.assignment.id,
    action: 'support_view.read',
    route: params.route,
    reason: params.reason ?? check.assignment.assignment_reason,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  const notes: RedactedStaffSupportClientContext['support_notes'] = [
    ...(inMemorySupportNotes.get(params.clientId) ?? []),
  ];
  const requests: RedactedStaffSupportClientContext['action_requests'] = [
    ...(inMemoryActionRequests.get(params.clientId) ?? []),
  ];
  const supportTickets: CanonicalSupportTicket[] = [];

  if (supabase) {
    // 1. Fetch DB-persisted staff support notes (FORMS05)
    let noteQuery = supabase
      .from('staff_support_notes')
      .select('id, author_user_id, author_email, author_role, stage_key, note, created_at')
      .order('created_at', { ascending: false });

    if (engagementId) {
      noteQuery = noteQuery.or(`client_id.eq.${params.clientId},engagement_id.eq.${engagementId}`);
    } else {
      noteQuery = noteQuery.eq('client_id', params.clientId);
    }

    const { data: dbNotes } = await noteQuery;
    if (Array.isArray(dbNotes) && dbNotes.length > 0) {
      for (const n of dbNotes) {
        if (!notes.some((existing) => existing.id === n.id)) {
          notes.push({
            id: n.id,
            author_user_id: n.author_user_id,
            author_email: n.author_email,
            author_role: n.author_role as StaffRole,
            note: n.note,
            stage_key: n.stage_key,
            created_at: n.created_at,
          });
        }
      }
    }

    // 2. Fetch DB-persisted staff escalations (FORMS05)
    let escQuery = supabase
      .from('staff_escalations')
      .select('id, requested_by, requested_by_email, requested_by_role, request_type, stage_key, summary, status, created_at')
      .order('created_at', { ascending: false });

    if (engagementId) {
      escQuery = escQuery.or(`client_id.eq.${params.clientId},engagement_id.eq.${engagementId}`);
    } else {
      escQuery = escQuery.eq('client_id', params.clientId);
    }

    const { data: dbEsc } = await escQuery;
    if (Array.isArray(dbEsc) && dbEsc.length > 0) {
      for (const e of dbEsc) {
        if (!requests.some((existing) => existing.id === e.id)) {
          requests.push({
            id: e.id,
            requested_by: e.requested_by,
            requested_by_email: e.requested_by_email,
            requested_by_role: e.requested_by_role as StaffRole,
            request_type: e.request_type as any,
            stage_key: e.stage_key,
            summary: e.summary,
            status: e.status as any,
            created_at: e.created_at,
          });
        }
      }
    }

    // 3. Fetch canonical support tickets linked to this client/engagement (FORMS03)
    let ticketQuery = supabase
      .from('support_tickets')
      .select('id, ticket_ref, client_id, engagement_id, assigned_staff_id, customer_email, subject, original_message, component, severity, status, sla_target_hours, resolution_notes, resolved_at, created_at')
      .order('created_at', { ascending: false });

    if (engagementId) {
      ticketQuery = ticketQuery.or(`client_id.eq.${params.clientId},engagement_id.eq.${engagementId}`);
    } else {
      ticketQuery = ticketQuery.eq('client_id', params.clientId);
    }

    const { data: dbTickets } = await ticketQuery;
    if (Array.isArray(dbTickets)) {
      for (const t of dbTickets) {
        supportTickets.push({
          id: t.id,
          ticket_ref: t.ticket_ref || `TKT-${t.id.slice(0, 8).toUpperCase()}`,
          client_id: t.client_id,
          engagement_id: t.engagement_id,
          assigned_staff_id: t.assigned_staff_id,
          customer_email: t.customer_email || '',
          subject: t.subject || 'Support Ticket',
          original_message: t.original_message || (t as any).message || '',
          component: t.component || null,
          severity: t.severity || 'S3',
          status: t.status || 'open',
          sla_target_hours: t.sla_target_hours || 24,
          resolution_notes: t.resolution_notes || null,
          resolved_at: t.resolved_at || null,
          created_at: t.created_at || new Date().toISOString(),
        });
      }
    }
  }

  const context: RedactedStaffSupportClientContext = {
    banner: buildStaffSupportBanner(
      params.staffEmail ?? params.staffUserId,
      params.staffRole
    ),
    actor: {
      staff_user_id: params.staffUserId,
      staff_email: params.staffEmail,
      staff_role: params.staffRole,
      impersonating_client: false,
      client_session_established: false,
    },
    assignment: {
      id: check.assignment.id,
      assignment_role: check.assignment.assignment_role,
      status: check.assignment.status,
      can_view_technical_stages: check.assignment.can_view_technical_stages,
      can_prepare_technical_quotation: check.assignment.can_prepare_technical_quotation,
      can_prepare_invoice_request: check.assignment.can_prepare_invoice_request,
      expires_at: check.assignment.expires_at,
    },
    client: {
      client_id: params.clientId,
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      project_title: projectTitle,
      engagement_ref: engagementRef,
      engagement_id: engagementId,
      current_stage: currentStage,
      engagement_status: engagementStatus,
    },
    financial_redaction: {
      redacted: true,
      policy: 'POLICY_2_AUDITED_STAFF_SUPPORT_VIEW',
      omitted_fields: FORBIDDEN_FINANCIAL_KEYS,
      commercial_summary:
        'REDACTED — Commercial pricing, discounts, GST/PAN, invoices, and payment records are restricted to Super Admin.',
    },
    technical_stages: technicalStages,
    support_notes: notes,
    action_requests: requests,
    support_tickets: supportTickets,
  };

  return { ok: true, data: context };
}

export async function addStaffSupportNote(params: {
  staffUserId?: string;
  actorUserId?: string;
  staffEmail?: string | null;
  actorEmail?: string | null;
  staffRole?: StaffRole;
  actorRole?: StaffRole;
  clientId: string;
  engagementId?: string | null;
  stageKey?: string | null;
  note: string;
  route?: string;
}): Promise<
  | {
      ok: true;
      note: RedactedStaffSupportClientContext['support_notes'][number];
      id: string;
      author_user_id: string;
      author_email: string | null;
      author_role: StaffRole;
      stage_key: string | null;
      created_at: string;
      client_id: string;
      engagement_id: string | null;
    }
  | { ok: false; status: 400 | 403 | 500; message: string }
> {
  const staffUserId = params.staffUserId || params.actorUserId || '';
  const staffEmail = params.staffEmail ?? params.actorEmail ?? null;
  const staffRole: StaffRole = (params.staffRole || params.actorRole || 'operations') as StaffRole;
  const route = params.route || '/admin/support';

  if (!hasCapability(staffRole, 'support.assigned_client.assist')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing support.assigned_client.assist capability.',
    };
  }
  if (!params.note || params.note.trim().length < 3) {
    return {
      ok: false,
      status: 400,
      message: 'Support note must be at least 3 characters.',
    };
  }

  const check = await verifyStaffClientAssignment({
    staffUserId,
    staffRole,
    clientId: params.clientId,
  });
  if (!check.allowed) {
    return { ok: false, status: 403, message: check.reason };
  }

  const created = {
    id: crypto.randomUUID(),
    author_user_id: staffUserId,
    author_email: staffEmail,
    author_role: staffRole,
    note: params.note.trim(),
    stage_key: params.stageKey ?? null,
    created_at: new Date().toISOString(),
  };

  const supabase = getServiceClient();
  if (supabase) {
    const { error: dbErr } = await supabase
      .from('staff_support_notes')
      .insert({
        id: created.id,
        client_id: params.clientId,
        engagement_id: check.assignment.engagement_id ?? params.engagementId ?? null,
        assignment_id: check.assignment.id,
        author_user_id: staffUserId,
        author_email: staffEmail,
        author_role: staffRole,
        stage_key: params.stageKey ?? null,
        note: created.note,
      });

    if (dbErr) {
      return {
        ok: false,
        status: 500,
        message: `Failed to persist staff support note: ${dbErr.message}`,
      };
    }
  }

  const list = inMemorySupportNotes.get(params.clientId) ?? [];
  list.unshift(created);
  inMemorySupportNotes.set(params.clientId, list);

  await recordStaffSupportAccessEvent({
    staffUserId,
    staffEmail,
    staffRole,
    clientId: params.clientId,
    assignmentId: check.assignment.id,
    action: 'support_view.add_note',
    route,
    reason: `Added staff support note (${params.stageKey ?? 'general'})`,
    metadata: { note_id: created.id, stage_key: created.stage_key, note: created.note },
  });

  return {
    ok: true as const,
    note: created,
    id: created.id,
    author_user_id: created.author_user_id,
    author_email: created.author_email,
    author_role: created.author_role,
    stage_key: created.stage_key,
    created_at: created.created_at,
    client_id: params.clientId,
    engagement_id: check.assignment.engagement_id ?? params.engagementId ?? null,
  };
}

export async function createStaffSupportActionRequest(params: {
  staffUserId?: string;
  actorUserId?: string;
  staffEmail?: string | null;
  actorEmail?: string | null;
  staffRole?: StaffRole;
  actorRole?: StaffRole;
  clientId: string;
  engagementId?: string | null;
  requestType:
    | 'stage_review'
    | 'identity_correction_escalation'
    | 'technical_clarification'
    | 'commercial_escalation';
  stageKey?: string | null;
  summary: string;
  route?: string;
}): Promise<
  | {
      ok: true;
      request: RedactedStaffSupportClientContext['action_requests'][number];
      id: string;
      requested_by: string;
      requested_by_email: string | null;
      requested_by_role: StaffRole;
      request_type:
        | 'stage_review'
        | 'identity_correction_escalation'
        | 'technical_clarification'
        | 'commercial_escalation';
      stage_key: string | null;
      summary: string;
      status: 'pending_super_admin' | 'resolved';
      created_at: string;
      client_id: string;
      engagement_id: string | null;
    }
  | { ok: false; status: 400 | 403 | 500; message: string }
> {
  const staffUserId = params.staffUserId || params.actorUserId || '';
  const staffEmail = params.staffEmail ?? params.actorEmail ?? null;
  const staffRole: StaffRole = (params.staffRole || params.actorRole || 'operations') as StaffRole;
  const route = params.route || '/admin/support';

  if (!hasCapability(staffRole, 'support.assigned_client.assist')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing support.assigned_client.assist capability.',
    };
  }
  if (!params.summary || params.summary.trim().length < 5) {
    return {
      ok: false,
      status: 400,
      message: 'Action request summary must be at least 5 characters.',
    };
  }

  const check = await verifyStaffClientAssignment({
    staffUserId,
    staffRole,
    clientId: params.clientId,
  });
  if (!check.allowed) {
    return { ok: false, status: 403, message: check.reason };
  }

  const created = {
    id: crypto.randomUUID(),
    requested_by: staffUserId,
    requested_by_email: staffEmail,
    requested_by_role: staffRole,
    request_type: params.requestType,
    stage_key: params.stageKey ?? null,
    summary: params.summary.trim(),
    status: 'pending_super_admin' as const,
    created_at: new Date().toISOString(),
  };

  const supabase = getServiceClient();
  if (supabase) {
    const { error: dbErr } = await supabase
      .from('staff_escalations')
      .insert({
        id: created.id,
        client_id: params.clientId,
        engagement_id: check.assignment.engagement_id ?? params.engagementId ?? null,
        assignment_id: check.assignment.id,
        requested_by: staffUserId,
        requested_by_email: staffEmail,
        requested_by_role: staffRole,
        request_type: params.requestType,
        stage_key: params.stageKey ?? null,
        summary: created.summary,
        status: created.status,
      });

    if (dbErr) {
      return {
        ok: false,
        status: 500,
        message: `Failed to persist staff escalation: ${dbErr.message}`,
      };
    }
  }

  const list = inMemoryActionRequests.get(params.clientId) ?? [];
  list.unshift(created);
  inMemoryActionRequests.set(params.clientId, list);

  await recordStaffSupportAccessEvent({
    staffUserId,
    staffEmail,
    staffRole,
    clientId: params.clientId,
    assignmentId: check.assignment.id,
    action: 'support_view.request_action',
    route,
    reason: `Escalated ${params.requestType} to Super Admin`,
    metadata: { request_id: created.id, request_type: created.request_type, summary: created.summary },
  });

  return {
    ok: true as const,
    request: created,
    id: created.id,
    requested_by: created.requested_by,
    requested_by_email: created.requested_by_email,
    requested_by_role: created.requested_by_role,
    request_type: created.request_type,
    stage_key: created.stage_key,
    summary: created.summary,
    status: created.status,
    created_at: created.created_at,
    client_id: params.clientId,
    engagement_id: check.assignment.engagement_id ?? params.engagementId ?? null,
  };
}

/**
 * Creates a canonical support ticket linked to client, project, and staff. (FORMS03)
 */
export async function createCanonicalSupportTicket(input: {
  clientId?: string | null;
  engagementId?: string | null;
  assignedStaffId?: string | null;
  customerEmail: string;
  subject: string;
  message: string;
  component?: string | null;
  severity?: 'S1' | 'S2' | 'S3' | 'S4' | string;
  slaTargetHours?: number;
}): Promise<
  | { ok: true; ticket: CanonicalSupportTicket }
  | { ok: false; status: number; message: string }
> {
  if (!input.customerEmail || !input.subject || !input.message) {
    return { ok: false, status: 400, message: 'Customer email, subject, and message are required.' };
  }

  const severity = input.severity || 'S3';
  const slaTargetHours =
    input.slaTargetHours ??
    (severity === 'S1' || severity.toLowerCase() === 'high'
      ? 4
      : severity === 'S2'
        ? 8
        : severity === 'S3'
          ? 12
          : 24);
  const year = new Date().getFullYear();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const ticketRef = `TKT-${year}-${randNum}`;
  const now = new Date().toISOString();

  const ticket: CanonicalSupportTicket = {
    id: crypto.randomUUID(),
    ticket_ref: ticketRef,
    client_id: input.clientId ?? null,
    engagement_id: input.engagementId ?? null,
    assigned_staff_id: input.assignedStaffId ?? null,
    customer_email: input.customerEmail.trim().toLowerCase(),
    subject: input.subject.trim(),
    original_message: input.message.trim(),
    component: input.component ?? 'General',
    severity,
    status: 'open',
    sla_target_hours: slaTargetHours,
    resolution_notes: null,
    resolved_at: null,
    created_at: now,
  };

  const supabase = getServiceClient();
  if (supabase) {
    const { error } = await supabase.from('support_tickets').insert({
      id: ticket.id,
      ticket_ref: ticket.ticket_ref,
      client_id: ticket.client_id,
      engagement_id: ticket.engagement_id,
      assigned_staff_id: ticket.assigned_staff_id,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      original_message: ticket.original_message,
      component: ticket.component,
      severity: ticket.severity,
      status: ticket.status,
      sla_target_hours: ticket.sla_target_hours,
      created_at: ticket.created_at,
    });

    if (error) {
      return { ok: false, status: 500, message: `Failed to persist support ticket: ${error.message}` };
    }
  }

  inMemoryCanonicalTickets.set(ticket.id, ticket);
  return { ok: true, ticket };
}

/**
 * Lists canonical support tickets linked to client or project. (FORMS03)
 */
export async function listCanonicalSupportTickets(filter?: {
  clientId?: string;
  engagementId?: string;
  assignedStaffId?: string;
  customerEmail?: string;
}): Promise<CanonicalSupportTicket[]> {
  const supabase = getServiceClient();
  if (supabase) {
    let query = supabase
      .from('support_tickets')
      .select('id, ticket_ref, client_id, engagement_id, assigned_staff_id, customer_email, subject, original_message, component, severity, status, sla_target_hours, resolution_notes, resolved_at, created_at')
      .order('created_at', { ascending: false });

    if (filter?.clientId) query = query.eq('client_id', filter.clientId);
    if (filter?.engagementId) query = query.eq('engagement_id', filter.engagementId);
    if (filter?.assignedStaffId) query = query.eq('assigned_staff_id', filter.assignedStaffId);
    if (filter?.customerEmail) query = query.eq('customer_email', filter.customerEmail.trim().toLowerCase());

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list support tickets: ${error.message}`);
    }

    if (Array.isArray(data)) {
      return data.map((t: any) => ({
        id: t.id,
        ticket_ref: t.ticket_ref || `TKT-${t.id.slice(0, 8).toUpperCase()}`,
        client_id: t.client_id || null,
        engagement_id: t.engagement_id || null,
        assigned_staff_id: t.assigned_staff_id || null,
        customer_email: t.customer_email || '',
        subject: t.subject || 'Support Ticket',
        original_message: t.original_message || t.message || '',
        component: t.component || null,
        severity: t.severity || 'S3',
        status: t.status || 'open',
        sla_target_hours: t.sla_target_hours || 24,
        resolution_notes: t.resolution_notes || null,
        resolved_at: t.resolved_at || null,
        created_at: t.created_at,
      }));
    }
  }

  const allTickets = Array.from(inMemoryCanonicalTickets.values());
  return allTickets.filter((t) => {
    if (filter?.clientId && t.client_id !== filter.clientId) return false;
    if (filter?.engagementId && t.engagement_id !== filter.engagementId) return false;
    if (filter?.assignedStaffId && t.assigned_staff_id !== filter.assignedStaffId) return false;
    if (
      filter?.customerEmail &&
      t.customer_email.toLowerCase() !== filter.customerEmail.trim().toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

export function listStaffSupportAccessEvents(): StaffSupportAccessEvent[] {
  return [...inMemoryAccessEvents];
}
