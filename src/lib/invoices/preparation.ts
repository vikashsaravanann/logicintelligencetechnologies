import { createClient } from '@supabase/supabase-js';
import { hasCapability, type StaffRole } from '@/config/roles';
import { verifyStaffClientAssignment } from '@/lib/support/staff-support';
import { detectForbiddenCommercialFields } from '@/lib/quotations/technical-drafts';
import { recordAdminAction } from '@/lib/admin/audit';

export type InvoiceMilestoneKey =
  | 'initial_50_advance'
  | 'final_50_deployment'
  | 'final_50_completion';

export type InvoicePrepStatus =
  | 'draft'
  | 'submitted_for_super_admin'
  | 'changes_requested'
  | 'approved_and_issued'
  | 'rejected';

export interface InvoicePreparationRequest {
  id: string;
  request_number: string;
  engagement_id: string;
  client_id: string | null;
  quotation_id: string | null;
  milestone_key: InvoiceMilestoneKey;
  status: InvoicePrepStatus;
  deliverable_summary: string;
  evidence_links: string[];
  stage_verification_notes: string | null;
  prepared_by: string;
  prepared_by_email: string | null;
  prepared_by_role: StaffRole;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  issued_invoice_id: string | null;
  issued_invoice_number?: string | null;
  issued_amount_paise?: number | null;
  created_at: string;
  updated_at: string;
}

const inMemoryInvoicePreps = new Map<string, InvoicePreparationRequest>();
let invoicePrepCounter = 100;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function createInvoicePreparationRequest(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  rawPayload: Record<string, unknown>;
}): Promise<
  | { ok: true; request: InvoicePreparationRequest }
  | { ok: false; status: 400 | 403; message: string; forbiddenFields?: string[] }
> {
  if (!hasCapability(params.actorRole, 'invoice.preparation.create')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing invoice.preparation.create capability.',
    };
  }

  if (params.actorRole !== 'super_admin') {
    const forbidden = detectForbiddenCommercialFields(params.rawPayload);
    if (forbidden.length > 0) {
      return {
        ok: false,
        status: 403,
        message:
          'Policy 1 violation: Staff invoice preparation requests cannot contain prices, invoice amounts, discounts, taxes, or payment verification fields.',
        forbiddenFields: forbidden,
      };
    }
  }

  const engagementId =
    typeof params.rawPayload.engagementId === 'string'
      ? params.rawPayload.engagementId
      : typeof params.rawPayload.engagement_id === 'string'
        ? params.rawPayload.engagement_id
        : '';
  const clientId =
    typeof params.rawPayload.clientId === 'string'
      ? params.rawPayload.clientId
      : typeof params.rawPayload.client_id === 'string'
        ? params.rawPayload.client_id
        : null;
  const quotationId =
    typeof params.rawPayload.quotationId === 'string'
      ? params.rawPayload.quotationId
      : typeof params.rawPayload.quotation_id === 'string'
        ? params.rawPayload.quotation_id
        : null;

  if (!engagementId) {
    return {
      ok: false,
      status: 400,
      message: 'engagementId is required for an invoice preparation request.',
    };
  }

  const milestoneRaw =
    params.rawPayload.milestoneKey ?? params.rawPayload.milestone_key ?? 'initial_50_advance';
  if (
    milestoneRaw !== 'initial_50_advance' &&
    milestoneRaw !== 'final_50_deployment' &&
    milestoneRaw !== 'final_50_completion'
  ) {
    return {
      ok: false,
      status: 400,
      message:
        "milestoneKey must be either 'initial_50_advance' (50% advance), 'final_50_deployment' (50% final), or 'final_50_completion'.",
    };
  }

  // Type-safe narrowing to InvoiceMilestoneKey with database CHECK constraint normalization
  const milestoneKey: InvoiceMilestoneKey =
    milestoneRaw === 'final_50_deployment' || milestoneRaw === 'final_50_completion'
      ? 'final_50_deployment'
      : 'initial_50_advance';

  const deliverableSummary = String(
    params.rawPayload.deliverableSummary ??
      params.rawPayload.deliverable_summary ??
      ''
  ).trim();
  if (deliverableSummary.length < 5) {
    return {
      ok: false,
      status: 400,
      message: 'deliverableSummary (minimum 5 characters) is required.',
    };
  }

  if (params.actorRole !== 'super_admin') {
    const check = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId,
      engagementId,
      requireInvoicePrep: true,
    });
    if (!check.allowed) {
      return { ok: false, status: 403, message: check.reason };
    }
  }

  const evidenceLinks = Array.isArray(params.rawPayload.evidenceLinks)
    ? params.rawPayload.evidenceLinks.map((e) => String(e))
    : Array.isArray(params.rawPayload.evidence_links)
      ? params.rawPayload.evidence_links.map((e) => String(e))
      : [];

  invoicePrepCounter += 1;
  const now = new Date().toISOString();
  const reqRecord: InvoicePreparationRequest = {
    id: crypto.randomUUID(),
    request_number: `LIT-INV-PREP-2026-${String(invoicePrepCounter).padStart(4, '0')}`,
    engagement_id: engagementId,
    client_id: clientId,
    quotation_id: quotationId,
    milestone_key: milestoneKey,
    status: 'draft',
    deliverable_summary: deliverableSummary,
    evidence_links: evidenceLinks,
    stage_verification_notes:
      typeof params.rawPayload.stageVerificationNotes === 'string'
        ? params.rawPayload.stageVerificationNotes
        : typeof params.rawPayload.stage_verification_notes === 'string'
          ? params.rawPayload.stage_verification_notes
          : null,
    prepared_by: params.actorUserId,
    prepared_by_email: params.actorEmail,
    prepared_by_role: params.actorRole,
    submitted_at: null,
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    issued_invoice_id: null,
    created_at: now,
    updated_at: now,
  };

  inMemoryInvoicePreps.set(reqRecord.id, reqRecord);

  const supabase = getServiceClient();
  if (supabase) {
    const { error: insertError } = await supabase
      .from('invoice_preparation_requests')
      .insert({
        id: reqRecord.id,
        request_number: reqRecord.request_number,
        engagement_id: reqRecord.engagement_id,
        client_id: reqRecord.client_id,
        quotation_id: reqRecord.quotation_id,
        milestone_key: reqRecord.milestone_key,
        status: reqRecord.status,
        deliverable_summary: reqRecord.deliverable_summary,
        evidence_links: reqRecord.evidence_links,
        stage_verification_notes: reqRecord.stage_verification_notes,
        prepared_by: reqRecord.prepared_by,
        prepared_by_email: reqRecord.prepared_by_email,
        prepared_by_role: reqRecord.prepared_by_role,
      });
    if (insertError) {
      console.error('[invoice-prep] Supabase insert failed:', insertError.message);
    }
  }

  await recordAdminAction({
    actor: {
      userId: params.actorUserId,
      email: params.actorEmail,
      role: params.actorRole,
    },
    action: 'invoice.preparation.create',
    capability: 'invoice.preparation.create',
    outcome: 'succeeded',
    target: {
      type: 'invoice_preparation_request',
      id: reqRecord.id,
    },
    metadata: {
      request_number: reqRecord.request_number,
      engagement_id: reqRecord.engagement_id,
      milestone_key: reqRecord.milestone_key,
    },
  });

  try {
    const { notifyStaff } = await import('@/lib/staff/notifications');
    await notifyStaff({
      recipientUserId: params.actorUserId,
      engagementId: reqRecord.engagement_id,
      eventType: 'invoice.prep_saved',
      title: 'Invoice preparation saved',
      summary: reqRecord.request_number || reqRecord.id,
      sourceId: reqRecord.id,
      actionUrl: '/staff/invoices',
      idempotencyKey: `invoice:create:${reqRecord.id}`,
    });
  } catch (e) {
    console.warn('[invoice-prep] staff notification failed', e);
  }

  return { ok: true, request: reqRecord };
}

export async function getInvoicePreparationRequestById(params: {
  actorUserId: string;
  actorRole: StaffRole;
  requestId: string;
}): Promise<
  | { ok: true; request: InvoicePreparationRequest }
  | { ok: false; status: 403 | 404; message: string }
> {
  if (!hasCapability(params.actorRole, 'invoice.preparation.read')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing invoice.preparation.read capability.',
    };
  }

  let reqRecord: InvoicePreparationRequest | null = null;
  const supabase = getServiceClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('invoice_preparation_requests')
        .select('*')
        .eq('id', params.requestId)
        .maybeSingle();
      if (!error && data) {
        reqRecord = data as InvoicePreparationRequest;
        inMemoryInvoicePreps.set(reqRecord.id, reqRecord);
      }
    } catch (e) {
      console.warn('[invoice-prep] Supabase lookup error:', e);
    }
  }

  if (!reqRecord) {
    reqRecord = inMemoryInvoicePreps.get(params.requestId) ?? null;
  }

  if (!reqRecord) {
    return { ok: false, status: 404, message: 'Invoice preparation request not found.' };
  }

  if (
    params.actorRole !== 'super_admin' &&
    reqRecord.prepared_by !== params.actorUserId
  ) {
    const check = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId: reqRecord.client_id,
      engagementId: reqRecord.engagement_id,
    });
    if (!check.allowed) {
      return { ok: false, status: 403, message: check.reason };
    }
  }

  if (params.actorRole !== 'super_admin') {
    const redacted = { ...reqRecord };
    delete redacted.issued_amount_paise;
    return { ok: true, request: redacted };
  }

  return { ok: true, request: reqRecord };
}

export async function listInvoicePreparationRequests(params: {
  actorUserId: string;
  actorRole: StaffRole;
  engagementId?: string;
  status?: InvoicePrepStatus;
}): Promise<
  | { ok: true; requests: InvoicePreparationRequest[] }
  | { ok: false; status: 403; message: string }
> {
  if (!hasCapability(params.actorRole, 'invoice.preparation.read')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing invoice.preparation.read capability.',
    };
  }

  let all: InvoicePreparationRequest[] = [];
  const supabase = getServiceClient();
  if (supabase) {
    try {
      let query = supabase.from('invoice_preparation_requests').select('*');
      if (params.engagementId) {
        query = query.eq('engagement_id', params.engagementId);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        all = data as InvoicePreparationRequest[];
        for (const r of all) {
          inMemoryInvoicePreps.set(r.id, r);
        }
      }
    } catch (e) {
      console.warn('[invoice-prep] Supabase list error:', e);
    }
  }

  if (all.length === 0) {
    all = Array.from(inMemoryInvoicePreps.values());
  }

  const out: InvoicePreparationRequest[] = [];

  for (const r of all) {
    if (params.engagementId && r.engagement_id !== params.engagementId) continue;
    if (params.status && r.status !== params.status) continue;
    if (params.actorRole === 'super_admin' || r.prepared_by === params.actorUserId) {
      out.push(
        params.actorRole === 'super_admin'
          ? r
          : { ...r, issued_amount_paise: undefined }
      );
      continue;
    }
    const check = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId: r.client_id,
      engagementId: r.engagement_id,
    });
    if (check.allowed) {
      out.push({ ...r, issued_amount_paise: undefined });
    }
  }

  return { ok: true, requests: out };
}

export async function updateInvoicePreparationRequest(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  requestId: string;
  rawPayload: Record<string, unknown>;
}): Promise<
  | { ok: true; request: InvoicePreparationRequest }
  | { ok: false; status: 400 | 403 | 404 | 409; message: string; forbiddenFields?: string[] }
> {
  if (!hasCapability(params.actorRole, 'invoice.preparation.update')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing invoice.preparation.update capability.',
    };
  }

  if (params.actorRole !== 'super_admin') {
    const forbidden = detectForbiddenCommercialFields(params.rawPayload);
    if (forbidden.length > 0) {
      return {
        ok: false,
        status: 403,
        message:
          'Policy 1 violation: Staff invoice preparation requests cannot contain prices, invoice amounts, discounts, taxes, or payment verification fields.',
        forbiddenFields: forbidden,
      };
    }
  }

  const found = await getInvoicePreparationRequestById({
    actorUserId: params.actorUserId,
    actorRole: params.actorRole,
    requestId: params.requestId,
  });
  if (!found.ok) return found;

  const reqRecord = inMemoryInvoicePreps.get(params.requestId)!;
  if (
    params.actorRole !== 'super_admin' &&
    reqRecord.status !== 'draft' &&
    reqRecord.status !== 'changes_requested'
  ) {
    return {
      ok: false,
      status: 409,
      message: `Invoice preparation request in status '${reqRecord.status}' is locked pending Super Admin review.`,
    };
  }

  if (typeof params.rawPayload.deliverableSummary === 'string') {
    reqRecord.deliverable_summary = params.rawPayload.deliverableSummary.trim();
  } else if (typeof params.rawPayload.deliverable_summary === 'string') {
    reqRecord.deliverable_summary = params.rawPayload.deliverable_summary.trim();
  }

  if (Array.isArray(params.rawPayload.evidenceLinks)) {
    reqRecord.evidence_links = params.rawPayload.evidenceLinks.map((e) => String(e));
  }
  if (typeof params.rawPayload.stageVerificationNotes === 'string') {
    reqRecord.stage_verification_notes = params.rawPayload.stageVerificationNotes;
  }

  reqRecord.updated_at = new Date().toISOString();
  inMemoryInvoicePreps.set(reqRecord.id, reqRecord);

  const supabase = getServiceClient();
  if (supabase) {
    try {
      await supabase
        .from('invoice_preparation_requests')
        .update({
          deliverable_summary: reqRecord.deliverable_summary,
          evidence_links: reqRecord.evidence_links,
          stage_verification_notes: reqRecord.stage_verification_notes,
          updated_at: reqRecord.updated_at,
        })
        .eq('id', reqRecord.id);
    } catch (e) {
      console.warn('[invoice-prep] Supabase update error:', e);
    }
  }

  return {
    ok: true,
    request:
      params.actorRole === 'super_admin'
        ? reqRecord
        : { ...reqRecord, issued_amount_paise: undefined },
  };
}

export async function submitInvoicePreparationRequest(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  requestId: string;
}): Promise<
  | { ok: true; request: InvoicePreparationRequest }
  | { ok: false; status: 400 | 403 | 404 | 409; message: string }
> {
  if (!hasCapability(params.actorRole, 'invoice.preparation.submit_for_approval')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing invoice.preparation.submit_for_approval capability.',
    };
  }

  const found = await getInvoicePreparationRequestById({
    actorUserId: params.actorUserId,
    actorRole: params.actorRole,
    requestId: params.requestId,
  });
  if (!found.ok) return found;

  const reqRecord = inMemoryInvoicePreps.get(params.requestId)!;
  const now = new Date().toISOString();
  reqRecord.status = 'submitted_for_super_admin';
  reqRecord.submitted_at = now;
  reqRecord.updated_at = now;
  inMemoryInvoicePreps.set(reqRecord.id, reqRecord);

  const supabaseClient = getServiceClient();
  if (supabaseClient) {
    try {
      await supabaseClient
        .from('invoice_preparation_requests')
        .update({
          status: reqRecord.status,
          submitted_at: reqRecord.submitted_at,
          updated_at: reqRecord.updated_at,
        })
        .eq('id', reqRecord.id);
    } catch (e) {
      console.warn('[invoice-prep] Supabase submit error:', e);
    }
  }

  
  try {
    const { notifyStaff } = await import('@/lib/staff/notifications');
    await notifyStaff({
      recipientUserId: params.actorUserId,
      engagementId: reqRecord.engagement_id,
      eventType: 'invoice.prep_submitted',
      title: 'Invoice preparation submitted for review',
      summary: reqRecord.request_number || reqRecord.id,
      sourceId: reqRecord.id,
      actionUrl: '/staff/invoices',
      idempotencyKey: `invoice:submit:${reqRecord.id}`,
    });
  } catch (e) {
    console.warn('[invoice-prep] submit notification failed', e);
  }

return {
    ok: true,
    request:
      params.actorRole === 'super_admin'
        ? reqRecord
        : { ...reqRecord, issued_amount_paise: undefined },
  };
}

export async function approveAndIssueInvoiceFromPreparation(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  requestId: string;
  decision: 'approve_and_issue' | 'changes_requested' | 'rejected';
  approvedAmountPaise?: number;
  approvalNotes?: string | null;
}): Promise<
  | {
      ok: true;
      decision: 'approve_and_issue' | 'changes_requested' | 'rejected';
      request: InvoicePreparationRequest;
      invoice?: {
        id: string;
        invoice_number: string;
        milestone_key: InvoiceMilestoneKey;
        amount_paise: number;
        issued_by: string;
        issued_at: string;
      };
    }
  | { ok: false; status: 400 | 403 | 404; message: string }
> {
  if (
    params.actorRole !== 'super_admin' ||
    !hasCapability(params.actorRole, 'invoice.issue')
  ) {
    return {
      ok: false,
      status: 403,
      message:
        'Policy 1 violation: Only Super Admin may approve invoice preparation requests and issue official client invoices.',
    };
  }

  let reqRecord = inMemoryInvoicePreps.get(params.requestId) ?? null;
  const supabaseClient = getServiceClient();
  if (supabaseClient) {
    try {
      const { data: dbRecord, error: dbFetchErr } = await supabaseClient
        .from('invoice_preparation_requests')
        .select('*')
        .eq('id', params.requestId)
        .maybeSingle();

      if (!dbFetchErr && dbRecord) {
        reqRecord = dbRecord as InvoicePreparationRequest;
        inMemoryInvoicePreps.set(reqRecord.id, reqRecord);
      }
    } catch (e) {
      console.warn('[invoice-prep] Supabase load error in approve:', e);
    }
  }

  if (!reqRecord) {
    return { ok: false, status: 404, message: 'Invoice preparation request not found.' };
  }

  const now = new Date().toISOString();

  // Idempotent handling: if already approved and issued, return existing invoice
  if (reqRecord.status === 'approved_and_issued' && reqRecord.issued_invoice_id) {
    return {
      ok: true,
      decision: 'approve_and_issue',
      request: reqRecord,
      invoice: {
        id: reqRecord.issued_invoice_id,
        invoice_number: reqRecord.issued_invoice_number || `LIT-INV-${reqRecord.id.slice(0, 8)}`,
        milestone_key: reqRecord.milestone_key,
        amount_paise: reqRecord.issued_amount_paise || (params.approvedAmountPaise ? Math.round(Number(params.approvedAmountPaise)) : 0),
        issued_by: reqRecord.approved_by || params.actorUserId,
        issued_at: reqRecord.approved_at || reqRecord.updated_at,
      },
    };
  }

  if (params.decision !== 'approve_and_issue') {
    reqRecord.status =
      params.decision === 'changes_requested' ? 'changes_requested' : 'rejected';
    reqRecord.approved_by = params.actorUserId;
    reqRecord.approved_at = now;
    reqRecord.approval_notes = params.approvalNotes ?? null;
    reqRecord.updated_at = now;
    inMemoryInvoicePreps.set(reqRecord.id, reqRecord);

    if (supabaseClient) {
      try {
        await supabaseClient
          .from('invoice_preparation_requests')
          .update({
            status: reqRecord.status,
            approved_by: reqRecord.approved_by,
            approved_at: reqRecord.approved_at,
            approval_notes: reqRecord.approval_notes,
            updated_at: reqRecord.updated_at,
          })
          .eq('id', reqRecord.id);
      } catch (e) {
        console.warn('[invoice-prep] Supabase decision error:', e);
      }
    }

    return { ok: true, decision: params.decision, request: reqRecord };
  }

  const amountPaise = Math.round(Number(params.approvedAmountPaise) || 0);
  if (amountPaise <= 0) {
    return {
      ok: false,
      status: 400,
      message:
        'approvedAmountPaise (> 0) must be entered by Super Admin when issuing an invoice.',
    };
  }

  const invoiceId = crypto.randomUUID();
  const invoiceNumber =
    reqRecord.milestone_key === 'initial_50_advance'
      ? `LIT-INV-2026-INIT-${String(invoicePrepCounter).padStart(4, '0')}`
      : `LIT-INV-2026-FINAL-${String(invoicePrepCounter).padStart(4, '0')}`;

  reqRecord.status = 'approved_and_issued';
  reqRecord.approved_by = params.actorUserId;
  reqRecord.approved_at = now;
  reqRecord.approval_notes = params.approvalNotes ?? null;
  reqRecord.issued_invoice_id = invoiceId;
  reqRecord.issued_invoice_number = invoiceNumber;
  reqRecord.issued_amount_paise = amountPaise;
  reqRecord.updated_at = now;
  inMemoryInvoicePreps.set(reqRecord.id, reqRecord);

  if (supabaseClient) {
    try {
      // 1. Fetch client engagement for company name and contact email
      const { data: eng } = await supabaseClient
        .from('client_engagements')
        .select('id, client_id, company_name, contact_name, contact_email')
        .eq('id', reqRecord.engagement_id)
        .maybeSingle();

      let clientUserId: string | null = null;
      if (eng?.client_id) {
        const { data: clientRow } = await supabaseClient
          .from('clients')
          .select('user_id')
          .eq('id', eng.client_id)
          .maybeSingle();
        clientUserId = clientRow?.user_id ?? null;
      }

      // 2. Insert real database invoice record into public.invoices
      const invoiceRow = {
        id: invoiceId,
        invoice_code: invoiceNumber,
        project_id: null,
        user_id: clientUserId,
        client_name: eng?.company_name || 'Client',
        client_email: eng?.contact_email || null,
        amount: amountPaise / 100,
        status: 'Pending',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `${reqRecord.milestone_key === 'initial_50_advance' ? 'Initial 50% Advance Milestone' : 'Final 50% Deployment Milestone'} - ${reqRecord.deliverable_summary}`,
        currency: 'INR',
        created_at: now,
        updated_at: now,
      };

      const { error: invErr } = await supabaseClient.from('invoices').insert(invoiceRow);
      if (invErr) {
        console.error('[invoice-prep] Failed to create official invoice record in DB:', invErr.message);
        return {
          ok: false,
          status: 400,
          message: `Database invoice issuance failed: ${invErr.message}`,
        };
      }

      // 3. Update invoice_preparation_requests with issued invoice linkage
      const { error: updateErr } = await supabaseClient
        .from('invoice_preparation_requests')
        .update({
          status: reqRecord.status,
          approved_by: reqRecord.approved_by,
          approved_at: reqRecord.approved_at,
          approval_notes: reqRecord.approval_notes,
          issued_invoice_id: reqRecord.issued_invoice_id,
          updated_at: reqRecord.updated_at,
        })
        .eq('id', reqRecord.id);

      if (updateErr) {
        console.warn('[invoice-prep] Preparation request link update warning:', updateErr.message);
      }

      // 4. Record commercial approval event in audit log
      await supabaseClient.from('commercial_approval_events').insert({
        entity_type: 'invoice_issue',
        entity_id: invoiceId,
        actor_id: params.actorUserId,
        action: 'approve_and_issue',
        previous_state: { status: 'submitted_for_super_admin' },
        new_state: { status: 'approved_and_issued', invoice_id: invoiceId, invoice_code: invoiceNumber, amount_paise: amountPaise },
        notes: params.approvalNotes ?? null,
      });
    } catch (e: any) {
      console.error('[invoice-prep] Supabase approval error:', e);
      return {
        ok: false,
        status: 400,
        message: `Database error during invoice approval: ${e?.message || 'Unknown error'}`,
      };
    }
  }

  await recordAdminAction({
    actor: {
      userId: params.actorUserId,
      email: params.actorEmail,
      role: params.actorRole,
    },
    action: 'invoice.issue_from_preparation',
    capability: 'invoice.issue',
    outcome: 'succeeded',
    target: {
      type: 'invoice',
      id: invoiceId,
    },
    metadata: {
      preparation_request_id: reqRecord.id,
      invoice_number: invoiceNumber,
      milestone_key: reqRecord.milestone_key,
      amount_paise: amountPaise,
    },
  });

  return {
    ok: true,
    decision: 'approve_and_issue',
    request: reqRecord,
    invoice: {
      id: invoiceId,
      invoice_number: invoiceNumber,
      milestone_key: reqRecord.milestone_key,
      amount_paise: amountPaise,
      issued_by: params.actorUserId,
      issued_at: now,
    },
  };
}
