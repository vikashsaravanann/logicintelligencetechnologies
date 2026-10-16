import { createClient } from '@supabase/supabase-js';
import { hasCapability, type StaffRole } from '@/config/roles';
import { verifyStaffClientAssignment } from '@/lib/support/staff-support';
import { recordAdminAction } from '@/lib/admin/audit';

export type TechnicalDraftStatus =
  | 'technical_draft'
  | 'submitted_for_commercial_review'
  | 'changes_requested'
  | 'approved_by_super_admin'
  | 'rejected'
  | 'converted_to_quotation';

export interface TechnicalLineItemDraft {
  service_code: string | null;
  category: string;
  title: string;
  description: string;
  deliverables: string[];
  unit: string;
  quantity: number;
  sort_order: number;
}

export interface TechnicalChecklistSelection {
  point_number: number;
  title: string;
  selected: boolean;
  technical_notes?: string;
}

export interface QuotationTechnicalDraft {
  id: string;
  quotation_id: string | null;
  engagement_id: string | null;
  client_id: string | null;
  draft_number: string;
  status: TechnicalDraftStatus;
  client_snapshot: {
    company_name: string;
    contact_name: string;
    contact_email: string;
    project_title: string;
  };
  scope_summary: string;
  architecture_notes: string;
  timeline_notes: string;
  assumptions: string;
  exclusions: string;
  technical_line_items: TechnicalLineItemDraft[];
  checklist_selection: TechnicalChecklistSelection[];
  prepared_by: string;
  prepared_by_email: string | null;
  prepared_by_role: StaffRole;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationCommercialApprovalRecord {
  id: string;
  quotation_id: string;
  technical_draft_id: string | null;
  version_number: number;
  priced_line_items: Array<
    TechnicalLineItemDraft & {
      unit_price_paise: number;
      line_subtotal_paise: number;
    }
  >;
  subtotal_paise: number;
  discount_paise: number;
  coupon_code: string | null;
  taxable_paise: number;
  gst_applicable: boolean;
  gst_rate_bps: number;
  gst_paise: number;
  total_paise: number;
  advance_percent: 50;
  final_percent: 50;
  advance_paise: number;
  final_paise: number;
  commercial_notes: string | null;
  approved_by: string;
  approved_at: string;
  published_at: string | null;
}

const FORBIDDEN_COMMERCIAL_INPUT_KEYS = [
  'unit_price',
  'unitprice',
  'unit_price_paise',
  'unitpricepaise',
  'base_price_paise',
  'basepricepaise',
  'price',
  'subtotal',
  'subtotal_paise',
  'subtotalpaise',
  'discount',
  'discount_paise',
  'discountpaise',
  'discount_bps',
  'coupon',
  'coupon_code',
  'couponcode',
  'coupon_id',
  'gst_rate',
  'gst_rate_bps',
  'gstratebps',
  'gst_paise',
  'tax_paise',
  'total',
  'total_paise',
  'totalpaise',
  'advance_paise',
  'final_paise',
] as const;

const inMemoryTechnicalDrafts = new Map<string, QuotationTechnicalDraft>();
const inMemoryCommercialApprovals = new Map<string, QuotationCommercialApprovalRecord>();
let draftCounter = 100;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Policy 1 Guard: Scans any staff payload (including nested line items) and rejects
 * if any commercial/pricing/discount/coupon/tax field is present.
 */
export function detectForbiddenCommercialFields(payload: unknown): string[] {
  const found = new Set<string>();
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if (
        (FORBIDDEN_COMMERCIAL_INPUT_KEYS as readonly string[]).includes(lower) ||
        lower.includes('price') ||
        lower.includes('paise') ||
        lower.includes('discount') ||
        lower.includes('coupon')
      ) {
        if (val !== undefined && val !== null) {
          found.add(key);
        }
      }
      visit(val);
    }
  };
  visit(payload);
  return Array.from(found);
}

export async function createQuotationTechnicalDraft(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  rawPayload: Record<string, unknown>;
}): Promise<
  | { ok: true; draft: QuotationTechnicalDraft }
  | { ok: false; status: 400 | 403; message: string; forbiddenFields?: string[] }
> {
  if (!hasCapability(params.actorRole, 'quotation.technical_draft.create')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing quotation.technical_draft.create capability.',
    };
  }

  // Enforce Policy 1: Non-Super Admin staff must NEVER submit commercial fields
  if (params.actorRole !== 'super_admin') {
    const forbidden = detectForbiddenCommercialFields(params.rawPayload);
    if (forbidden.length > 0) {
      return {
        ok: false,
        status: 403,
        message:
          'Policy 1 violation: Staff technical drafts cannot contain unit prices, totals, discounts, coupons, or tax parameters.',
        forbiddenFields: forbidden,
      };
    }
  }

  const engagementId =
    typeof params.rawPayload.engagementId === 'string'
      ? params.rawPayload.engagementId
      : typeof params.rawPayload.engagement_id === 'string'
        ? params.rawPayload.engagement_id
        : null;
  const clientId =
    typeof params.rawPayload.clientId === 'string'
      ? params.rawPayload.clientId
      : typeof params.rawPayload.client_id === 'string'
        ? params.rawPayload.client_id
        : null;

  if (!engagementId && !clientId) {
    return {
      ok: false,
      status: 400,
      message: 'Either engagementId or clientId is required to prepare a technical draft.',
    };
  }

  // Verify assignment for non-Super Admin
  if (params.actorRole !== 'super_admin') {
    const assignmentCheck = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId,
      engagementId,
      requireTechnicalQuotationPrep: true,
    });
    if (!assignmentCheck.allowed) {
      return {
        ok: false,
        status: 403,
        message: assignmentCheck.reason,
      };
    }
  }

  const rawItems = Array.isArray(params.rawPayload.technicalLineItems)
    ? params.rawPayload.technicalLineItems
    : Array.isArray(params.rawPayload.technical_line_items)
      ? params.rawPayload.technical_line_items
      : [];

  const technicalLineItems: TechnicalLineItemDraft[] = rawItems.map(
    (item: Record<string, unknown>, idx: number) => ({
      service_code: typeof item.service_code === 'string' ? item.service_code : typeof item.serviceCode === 'string' ? item.serviceCode : null,
      category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'Engineering',
      title: typeof item.title === 'string' ? item.title.trim() : `Technical Scope Item ${idx + 1}`,
      description: typeof item.description === 'string' ? item.description.trim() : '',
      deliverables: Array.isArray(item.deliverables)
        ? item.deliverables.map((d) => String(d))
        : [],
      unit: typeof item.unit === 'string' && item.unit.trim() ? item.unit.trim() : 'project',
      quantity: Math.max(1, Number(item.quantity) || 1),
      sort_order: idx + 1,
    })
  );

  const rawChecklist = Array.isArray(params.rawPayload.checklistSelection)
    ? params.rawPayload.checklistSelection
    : Array.isArray(params.rawPayload.checklist_selection)
      ? params.rawPayload.checklist_selection
      : [];

  const checklistSelection: TechnicalChecklistSelection[] = rawChecklist.map(
    (c: Record<string, unknown>, idx: number) => ({
      point_number: Number(c.point_number ?? c.pointNumber) || idx + 1,
      title: typeof c.title === 'string' ? c.title : `Point ${idx + 1}`,
      selected: Boolean(c.selected ?? true),
      technical_notes: typeof c.technical_notes === 'string' ? c.technical_notes : undefined,
    })
  );

  const snapshotRaw =
    (params.rawPayload.clientSnapshot as Record<string, unknown>) ??
    (params.rawPayload.client_snapshot as Record<string, unknown>) ??
    {};

  draftCounter += 1;
  const now = new Date().toISOString();
  const draft: QuotationTechnicalDraft = {
    id: crypto.randomUUID(),
    quotation_id: null,
    engagement_id: engagementId,
    client_id: clientId,
    draft_number: `LIT-TECH-DRAFT-2026-${String(draftCounter).padStart(4, '0')}`,
    status: 'technical_draft',
    client_snapshot: {
      company_name: String(snapshotRaw.company_name ?? snapshotRaw.companyName ?? ''),
      contact_name: String(snapshotRaw.contact_name ?? snapshotRaw.contactName ?? ''),
      contact_email: String(snapshotRaw.contact_email ?? snapshotRaw.contactEmail ?? ''),
      project_title: String(snapshotRaw.project_title ?? snapshotRaw.projectTitle ?? ''),
    },
    scope_summary: String(params.rawPayload.scopeSummary ?? params.rawPayload.scope_summary ?? ''),
    architecture_notes: String(
      params.rawPayload.architectureNotes ?? params.rawPayload.architecture_notes ?? ''
    ),
    timeline_notes: String(
      params.rawPayload.timelineNotes ?? params.rawPayload.timeline_notes ?? ''
    ),
    assumptions: String(params.rawPayload.assumptions ?? ''),
    exclusions: String(params.rawPayload.exclusions ?? ''),
    technical_line_items: technicalLineItems,
    checklist_selection: checklistSelection,
    prepared_by: params.actorUserId,
    prepared_by_email: params.actorEmail,
    prepared_by_role: params.actorRole,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    created_at: now,
    updated_at: now,
  };

  inMemoryTechnicalDrafts.set(draft.id, draft);

  const supabase = getServiceClient();
  if (supabase) {
    await supabase
      .from('quotation_technical_drafts')
      .insert({
        id: draft.id,
        engagement_id: draft.engagement_id,
        client_id: draft.client_id,
        draft_number: draft.draft_number,
        status: draft.status,
        client_snapshot: draft.client_snapshot,
        scope_summary: draft.scope_summary,
        architecture_notes: draft.architecture_notes,
        timeline_notes: draft.timeline_notes,
        assumptions: draft.assumptions,
        exclusions: draft.exclusions,
        technical_line_items: draft.technical_line_items,
        checklist_selection: draft.checklist_selection,
        prepared_by: draft.prepared_by,
        prepared_by_email: draft.prepared_by_email,
        prepared_by_role: draft.prepared_by_role,
      })
      .then(
        () => undefined,
        () => undefined
      );
  }

  await recordAdminAction({
    actor: {
      userId: params.actorUserId,
      email: params.actorEmail,
      role: params.actorRole,
    },
    action: 'quotation.technical_draft.create',
    capability: 'quotation.technical_draft.create',
    outcome: 'succeeded',
    target: {
      type: 'quotation_technical_draft',
      id: draft.id,
    },
    metadata: {
      draft_number: draft.draft_number,
      engagement_id: draft.engagement_id,
      client_id: draft.client_id,
      line_item_count: draft.technical_line_items.length,
    },
  });

  return { ok: true, draft };
}

export async function getQuotationTechnicalDraftById(params: {
  actorUserId: string;
  actorRole: StaffRole;
  draftId: string;
}): Promise<
  | { ok: true; draft: QuotationTechnicalDraft }
  | { ok: false; status: 403 | 404; message: string }
> {
  if (!hasCapability(params.actorRole, 'quotation.technical_draft.read')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing quotation.technical_draft.read capability.',
    };
  }

  let draft = inMemoryTechnicalDrafts.get(params.draftId) ?? null;
  if (!draft) {
    const supabase = getServiceClient();
    if (supabase) {
      const { data } = await supabase
        .from('quotation_technical_drafts')
        .select('*')
        .eq('id', params.draftId)
        .maybeSingle();
      if (data) {
        draft = data as QuotationTechnicalDraft;
        inMemoryTechnicalDrafts.set(draft.id, draft);
      }
    }
  }

  if (!draft) {
    return { ok: false, status: 404, message: 'Technical quotation draft not found.' };
  }

  if (params.actorRole !== 'super_admin' && draft.prepared_by !== params.actorUserId) {
    const check = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId: draft.client_id,
      engagementId: draft.engagement_id,
    });
    if (!check.allowed) {
      return { ok: false, status: 403, message: check.reason };
    }
  }

  return { ok: true, draft };
}

export async function listQuotationTechnicalDrafts(params: {
  actorUserId: string;
  actorRole: StaffRole;
  engagementId?: string;
  status?: TechnicalDraftStatus;
}): Promise<
  | { ok: true; drafts: QuotationTechnicalDraft[] }
  | { ok: false; status: 403; message: string }
> {
  if (!hasCapability(params.actorRole, 'quotation.technical_draft.read')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing quotation.technical_draft.read capability.',
    };
  }

  const all = Array.from(inMemoryTechnicalDrafts.values());
  const filtered: QuotationTechnicalDraft[] = [];

  for (const d of all) {
    if (params.engagementId && d.engagement_id !== params.engagementId) continue;
    if (params.status && d.status !== params.status) continue;
    if (params.actorRole === 'super_admin' || d.prepared_by === params.actorUserId) {
      filtered.push(d);
      continue;
    }
    const check = await verifyStaffClientAssignment({
      staffUserId: params.actorUserId,
      staffRole: params.actorRole,
      clientId: d.client_id,
      engagementId: d.engagement_id,
    });
    if (check.allowed) filtered.push(d);
  }

  return { ok: true, drafts: filtered };
}

export async function updateQuotationTechnicalDraft(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  draftId: string;
  rawPayload: Record<string, unknown>;
}): Promise<
  | { ok: true; draft: QuotationTechnicalDraft }
  | { ok: false; status: 400 | 403 | 404 | 409; message: string; forbiddenFields?: string[] }
> {
  if (!hasCapability(params.actorRole, 'quotation.technical_draft.update')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: Missing quotation.technical_draft.update capability.',
    };
  }

  if (params.actorRole !== 'super_admin') {
    const forbidden = detectForbiddenCommercialFields(params.rawPayload);
    if (forbidden.length > 0) {
      return {
        ok: false,
        status: 403,
        message:
          'Policy 1 violation: Staff technical drafts cannot contain unit prices, totals, discounts, coupons, or tax parameters.',
        forbiddenFields: forbidden,
      };
    }
  }

  const found = await getQuotationTechnicalDraftById({
    actorUserId: params.actorUserId,
    actorRole: params.actorRole,
    draftId: params.draftId,
  });
  if (!found.ok) return found;

  const draft = found.draft;
  if (
    params.actorRole !== 'super_admin' &&
    draft.status !== 'technical_draft' &&
    draft.status !== 'changes_requested'
  ) {
    return {
      ok: false,
      status: 409,
      message: `Technical draft in status '${draft.status}' is locked pending Super Admin review.`,
    };
  }

  if (typeof params.rawPayload.scopeSummary === 'string') {
    draft.scope_summary = params.rawPayload.scopeSummary;
  } else if (typeof params.rawPayload.scope_summary === 'string') {
    draft.scope_summary = params.rawPayload.scope_summary;
  }

  if (typeof params.rawPayload.architectureNotes === 'string') {
    draft.architecture_notes = params.rawPayload.architectureNotes;
  }
  if (typeof params.rawPayload.timelineNotes === 'string') {
    draft.timeline_notes = params.rawPayload.timelineNotes;
  }
  if (typeof params.rawPayload.assumptions === 'string') {
    draft.assumptions = params.rawPayload.assumptions;
  }
  if (typeof params.rawPayload.exclusions === 'string') {
    draft.exclusions = params.rawPayload.exclusions;
  }

  const rawItems = Array.isArray(params.rawPayload.technicalLineItems)
    ? params.rawPayload.technicalLineItems
    : Array.isArray(params.rawPayload.technical_line_items)
      ? params.rawPayload.technical_line_items
      : null;

  if (rawItems) {
    draft.technical_line_items = rawItems.map(
      (item: Record<string, unknown>, idx: number) => ({
        service_code:
          typeof item.service_code === 'string'
            ? item.service_code
            : typeof item.serviceCode === 'string'
              ? item.serviceCode
              : null,
        category:
          typeof item.category === 'string' && item.category.trim()
            ? item.category.trim()
            : 'Engineering',
        title:
          typeof item.title === 'string'
            ? item.title.trim()
            : `Technical Scope Item ${idx + 1}`,
        description:
          typeof item.description === 'string' ? item.description.trim() : '',
        deliverables: Array.isArray(item.deliverables)
          ? item.deliverables.map((d) => String(d))
          : [],
        unit:
          typeof item.unit === 'string' && item.unit.trim()
            ? item.unit.trim()
            : 'project',
        quantity: Math.max(1, Number(item.quantity) || 1),
        sort_order: idx + 1,
      })
    );
  }

  draft.updated_at = new Date().toISOString();
  inMemoryTechnicalDrafts.set(draft.id, draft);

  return { ok: true, draft };
}

export async function submitQuotationTechnicalDraftForApproval(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  draftId: string;
}): Promise<
  | { ok: true; draft: QuotationTechnicalDraft }
  | { ok: false; status: 400 | 403 | 404 | 409; message: string }
> {
  if (!hasCapability(params.actorRole, 'quotation.technical_draft.submit_for_approval')) {
    return {
      ok: false,
      status: 403,
      message:
        'Forbidden: Missing quotation.technical_draft.submit_for_approval capability.',
    };
  }

  const found = await getQuotationTechnicalDraftById({
    actorUserId: params.actorUserId,
    actorRole: params.actorRole,
    draftId: params.draftId,
  });
  if (!found.ok) return found;

  const draft = found.draft;
  if (draft.technical_line_items.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'Cannot submit an empty technical draft; add at least one technical scope item.',
    };
  }

  const now = new Date().toISOString();
  draft.status = 'submitted_for_commercial_review';
  draft.submitted_at = now;
  draft.updated_at = now;
  inMemoryTechnicalDrafts.set(draft.id, draft);

  const supabase = getServiceClient();
  if (supabase) {
    await supabase
      .from('quotation_technical_drafts')
      .update({
        status: draft.status,
        submitted_at: draft.submitted_at,
        updated_at: draft.updated_at,
      })
      .eq('id', draft.id)
      .then(
        () => undefined,
        () => undefined
      );

    await supabase
      .from('commercial_approval_events')
      .insert({
        entity_type: 'quotation_technical_draft',
        entity_id: draft.id,
        engagement_id: draft.engagement_id,
        actor_user_id: params.actorUserId,
        actor_email: params.actorEmail,
        actor_role: params.actorRole,
        decision: 'submitted',
        notes: 'Technical quotation draft submitted for Super Admin commercial pricing & approval.',
      })
      .then(
        () => undefined,
        () => undefined
      );
  }

  return { ok: true, draft };
}

export async function approveAndPriceQuotationBySuperAdmin(params: {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: StaffRole;
  quotationId: string;
  technicalDraftId?: string | null;
  decision: 'approved' | 'changes_requested' | 'rejected';
  pricedLineItems?: Array<{
    service_code?: string | null;
    category?: string;
    title: string;
    description?: string;
    deliverables?: string[];
    unit?: string;
    quantity: number;
    unit_price_paise: number;
  }>;
  discountPaise?: number;
  couponCode?: string | null;
  gstApplicable?: boolean;
  gstRateBps?: number;
  commercialNotes?: string | null;
}): Promise<
  | {
      ok: true;
      decision: 'approved' | 'changes_requested' | 'rejected';
      approval?: QuotationCommercialApprovalRecord;
      draft?: QuotationTechnicalDraft | null;
    }
  | { ok: false; status: 400 | 403 | 404; message: string }
> {
  if (
    params.actorRole !== 'super_admin' ||
    !hasCapability(params.actorRole, 'quotation.commercial.approve')
  ) {
    return {
      ok: false,
      status: 403,
      message:
        'Policy 1 violation: Only Super Admin may enter commercial prices or approve quotations.',
    };
  }

  let draft: QuotationTechnicalDraft | null = null;
  if (params.technicalDraftId) {
    draft = inMemoryTechnicalDrafts.get(params.technicalDraftId) ?? null;
  }

  const now = new Date().toISOString();

  if (params.decision !== 'approved') {
    if (draft) {
      draft.status =
        params.decision === 'changes_requested' ? 'changes_requested' : 'rejected';
      draft.reviewed_by = params.actorUserId;
      draft.reviewed_at = now;
      draft.review_notes = params.commercialNotes ?? null;
      draft.updated_at = now;
      inMemoryTechnicalDrafts.set(draft.id, draft);
    }
    return { ok: true, decision: params.decision, draft };
  }

  const items = params.pricedLineItems ?? [];
  if (items.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'At least one priced line item is required for Super Admin commercial approval.',
    };
  }

  for (const item of items) {
    if (!Number.isFinite(item.unit_price_paise) || item.unit_price_paise <= 0) {
      return {
        ok: false,
        status: 400,
        message: `Line item '${item.title}' must have a positive unit_price_paise entered by Super Admin.`,
      };
    }
  }

  const priced = items.map((item, idx) => {
    const qty = Math.max(1, Math.round(Number(item.quantity) || 1));
    const unitPrice = Math.round(Number(item.unit_price_paise));
    return {
      service_code: item.service_code ?? null,
      category: item.category ?? 'Engineering',
      title: item.title,
      description: item.description ?? '',
      deliverables: item.deliverables ?? [],
      unit: item.unit ?? 'project',
      quantity: qty,
      sort_order: idx + 1,
      unit_price_paise: unitPrice,
      line_subtotal_paise: qty * unitPrice,
    };
  });

  const subtotalPaise = priced.reduce((acc, i) => acc + i.line_subtotal_paise, 0);
  const discountPaise = Math.min(
    subtotalPaise,
    Math.max(0, Math.round(Number(params.discountPaise) || 0))
  );
  const taxablePaise = Math.max(0, subtotalPaise - discountPaise);
  const gstApplicable = Boolean(params.gstApplicable);
  const gstRateBps = gstApplicable
    ? Math.max(0, Math.min(2800, Math.round(Number(params.gstRateBps ?? 1800))))
    : 0;
  const gstPaise = gstApplicable
    ? Math.round((taxablePaise * gstRateBps) / 10000)
    : 0;
  const totalPaise = taxablePaise + gstPaise;

  // Exact two-milestone 50% / 50% split with remainder-safe math
  const advancePaise = Math.floor(totalPaise / 2);
  const finalPaise = totalPaise - advancePaise;

  const approval: QuotationCommercialApprovalRecord = {
    id: crypto.randomUUID(),
    quotation_id: params.quotationId,
    technical_draft_id: draft?.id ?? params.technicalDraftId ?? null,
    version_number: 1,
    priced_line_items: priced,
    subtotal_paise: subtotalPaise,
    discount_paise: discountPaise,
    coupon_code: params.couponCode ?? null,
    taxable_paise: taxablePaise,
    gst_applicable: gstApplicable,
    gst_rate_bps: gstRateBps,
    gst_paise: gstPaise,
    total_paise: totalPaise,
    advance_percent: 50,
    final_percent: 50,
    advance_paise: advancePaise,
    final_paise: finalPaise,
    commercial_notes: params.commercialNotes ?? null,
    approved_by: params.actorUserId,
    approved_at: now,
    published_at: null,
  };

  inMemoryCommercialApprovals.set(approval.quotation_id, approval);

  if (draft) {
    draft.quotation_id = params.quotationId;
    draft.status = 'approved_by_super_admin';
    draft.reviewed_by = params.actorUserId;
    draft.reviewed_at = now;
    draft.review_notes = params.commercialNotes ?? null;
    draft.updated_at = now;
    inMemoryTechnicalDrafts.set(draft.id, draft);
  }

  await recordAdminAction({
    actor: {
      userId: params.actorUserId,
      email: params.actorEmail,
      role: params.actorRole,
    },
    action: 'quotation.commercial.approve',
    capability: 'quotation.commercial.approve',
    outcome: 'succeeded',
    target: {
      type: 'quotation',
      id: params.quotationId,
    },
    metadata: {
      subtotal_paise: subtotalPaise,
      discount_paise: discountPaise,
      gst_paise: gstPaise,
      total_paise: totalPaise,
      advance_paise: advancePaise,
      final_paise: finalPaise,
    },
  });

  return {
    ok: true,
    decision: 'approved',
    approval,
    draft,
  };
}
