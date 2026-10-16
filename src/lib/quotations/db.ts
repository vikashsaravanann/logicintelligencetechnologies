import crypto from "crypto";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import {
  QuotationRecord,
  QuotationLineItem,
  QuotationVersion,
  QuotationCoupon,
  CouponRedemption,
  QuotationAuditLog,
  ServiceCatalogItem,
  QuotationCategoryCode,
  QuotationStatus,
  DeliveryState,
  CreateQuotationDraftInput,
  UpdateQuotationDraftInput,
  QuotationLineItemInput,
  CreateCouponInput,
} from "@/types/quotations";
import {
  calculateQuotation,
  calculateLineTotal,
  calculateDiscount,
  validatePublishReadiness,
} from "@/lib/quotations/pricing";
import { CANONICAL_SERVICES_CATALOG } from "@/lib/quotations/catalog-seed-data";
import { findSeedQuotation, findSeedLineItems } from "@/lib/quotations/seed-records";

// ── Database Row Mappers ─────────────────────────────────────────────────────

function mapDbRowToQuotation(row: any): QuotationRecord {
  return {
    id: row.id,
    quotation_ref: row.quotation_ref,
    client_id: row.client_id ?? null,
    engagement_id: row.engagement_id ?? null,
    lead_id: row.lead_id ?? null,
    recipient_name: row.contact_name ?? row.recipient_name ?? "",
    recipient_email: row.contact_email ?? row.recipient_email ?? "",
    recipient_phone: row.contact_phone ?? row.recipient_phone ?? null,
    company_name: row.company_name ?? "",
    billing_address: row.billing_address ?? null,
    city_state_pin: row.city_state_pin ?? null,
    project_title: row.project_title ?? "",
    project_brief: row.project_brief ?? null,
    timeline_estimate: row.timeline_estimate ?? "2 to 4 weeks",
    currency: row.currency ?? "INR",
    status: row.status as QuotationStatus,
    delivery_state: (row.delivery_state as DeliveryState) ?? "not_sent",
    subtotal_paise: Number(row.subtotal_paise ?? 0),
    discount_paise: Number(row.discount_paise ?? 0),
    discount_label: row.discount_label ?? null,
    tax_paise: Number(row.tax_paise ?? 0),
    tax_label:
      row.tax_label ??
      (row.tax_mode === "tax_inclusive"
        ? "GST Included"
        : row.tax_rate_bps
        ? `GST (${row.tax_rate_bps / 100}%)`
        : null),
    total_payable_paise: Number(row.total_payable_paise ?? 0),
    milestone_1_paise: Number(row.milestone1_paise ?? row.milestone_1_paise ?? 0),
    milestone_2_paise: Number(row.milestone2_paise ?? row.milestone_2_paise ?? 0),
    terms: Array.isArray(row.terms) ? row.terms : null,
    internal_notes: row.internal_notes ?? null,
    secure_token: row.secure_token ?? null,
    secure_token_hash: row.token_hash ?? row.secure_token_hash ?? null,
    valid_until: row.valid_until ?? null,
    issued_at: row.published_at ?? row.issued_at ?? row.created_at ?? null,
    accepted_at: row.accepted_at ?? null,
    version_number: Number(row.latest_version_number ?? row.version_number ?? 1),
    latest_version_id: row.latest_version_id ?? null,
    created_by: row.created_by ?? null,
    approved_by: row.approved_by ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

function mapDbRowToLineItem(row: any): QuotationLineItem {
  return {
    id: row.id,
    quotation_id: row.quotation_id,
    version_id: row.version_id ?? undefined,
    service_id: row.service_catalog_id ?? row.service_id ?? null,
    service_code: row.service_code,
    category_code: row.category_code as QuotationCategoryCode,
    category_name: row.category_name,
    title: row.title,
    scope_summary: row.public_scope ?? row.scope_summary ?? "",
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    unit: row.unit ?? "project",
    quantity: Number(row.quantity ?? 1),
    quoted_unit_price_paise:
      row.quoted_unit_price_paise !== null && row.quoted_unit_price_paise !== undefined
        ? Number(row.quoted_unit_price_paise)
        : null,
    extended_amount_paise: Number(row.extended_amount_paise ?? 0),
    included_at_no_additional_charge: Boolean(row.included_at_no_additional_charge),
    inclusion_rationale: row.charge_waiver_reason ?? row.inclusion_rationale ?? null,
    is_selected: row.is_selected !== false,
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapDbRowToCoupon(row: any): QuotationCoupon {
  const isPercentage = row.discount_type === "percentage";
  const discountVal = Number(row.discount_value ?? 0);
  return {
    id: row.id,
    code: row.code,
    campaign_id: row.id,
    campaign_name: row.campaign_name,
    description: row.description ?? null,
    discount_type: isPercentage ? "percentage" : "fixed_paise",
    discount_percentage: isPercentage ? discountVal : null,
    discount_paise: !isPercentage ? (row.discount_paise ? Number(row.discount_paise) : discountVal) : null,
    max_discount_paise: row.max_discount_paise ? Number(row.max_discount_paise) : null,
    min_subtotal_paise: row.min_subtotal_paise ? Number(row.min_subtotal_paise) : 0,
    allowed_client_ids: Array.isArray(row.allowed_client_ids) ? row.allowed_client_ids : null,
    starts_at: row.starts_at ?? null,
    expires_at: row.expires_at ?? null,
    max_redemptions: row.max_redemptions ? Number(row.max_redemptions) : null,
    current_redemptions: Number(row.redemptions_count ?? row.current_redemptions ?? 0),
    is_active: Boolean(row.is_active),
    can_stack: Boolean(row.is_stackable ?? row.can_stack),
    approved_by: row.approved_by ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function mapDbRowToVersion(row: any): QuotationVersion {
  const fin = row.financial_snapshot || {};
  return {
    id: row.id,
    quotation_id: row.quotation_id,
    version_number: Number(row.version_number ?? 1),
    version_hash: row.content_hash ?? "",
    status: row.status as QuotationStatus,
    subtotal_paise: Number(fin.subtotal_paise ?? 0),
    discount_paise: Number(fin.discount_paise ?? 0),
    discount_label: fin.discount_label ?? null,
    tax_paise: Number(fin.tax_paise ?? 0),
    tax_label: fin.tax_label ?? null,
    total_payable_paise: Number(fin.total_payable_paise ?? 0),
    milestone_1_paise: Number(fin.milestone1_paise ?? fin.milestone_1_paise ?? 0),
    milestone_2_paise: Number(fin.milestone2_paise ?? fin.milestone_2_paise ?? 0),
    lines_snapshot: Array.isArray(row.lines_snapshot) ? row.lines_snapshot : [],
    terms: Array.isArray(row.terms) ? row.terms : null,
    pdf_path: row.pdf_storage_path ?? null,
    pdf_sha256: row.pdf_sha256 ?? null,
    created_by: row.created_by ?? null,
    approved_by: row.approved_by ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

// ── Reference Generation ─────────────────────────────────────────────────────

export async function generateQuotationRef(): Promise<string> {
  const year = new Date().getFullYear();
  if (isAdminClientConfigured()) {
    try {
      const { count, error } = await supabaseAdmin
        .from("quotations")
        .select("id", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        const seq = (count + 1).toString().padStart(4, "0");
        return `LIT-QT-${year}-${seq}`;
      }
    } catch {
      // Fall through to random generator
    }
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `LIT-QT-${year}-${randomSuffix}`;
}

export function generateSecureToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// ── 1. Service Catalog Access ────────────────────────────────────────────────

export async function getServiceCatalog(options?: {
  categoryCode?: string;
  activeOnly?: boolean;
  search?: string;
}): Promise<ServiceCatalogItem[]> {
  const activeOnly = options?.activeOnly !== false; // default true

  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin.from("quotation_services_catalog").select("*");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      if (options?.categoryCode) {
        query = query.eq("category_code", options.categoryCode.toUpperCase());
      }
      if (options?.search && options.search.trim()) {
        const term = options.search.trim();
        query = query.or(`title.ilike.%${term}%,code.ilike.%${term}%,client_scope_summary.ilike.%${term}%`);
      }

      query = query.order("sort_order", { ascending: true }).order("code", { ascending: true });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          service_code: item.code,
          category_code: item.category_code as QuotationCategoryCode,
          category_name: item.category_name,
          title: item.title,
          scope_description: item.client_scope_summary,
          deliverables: Array.isArray(item.default_deliverables) ? item.default_deliverables : [],
          unit: item.unit || "project",
          pricing_type: item.is_one_time ? "fixed" : "recurring",
          default_unit_price_paise:
            item.default_unit_price_paise !== null && item.default_unit_price_paise !== undefined
              ? Number(item.default_unit_price_paise)
              : null,
          tax_classification: null,
          is_active: item.is_active,
          sort_order: item.sort_order,
          version: 1,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn("[quotations-db] Error fetching service catalog from database, using canonical fallback:", e);
    }
  }

  // Resilient fallback from CANONICAL_SERVICES_CATALOG
  let filtered = [...CANONICAL_SERVICES_CATALOG];
  if (activeOnly) {
    filtered = filtered.filter((s) => s.is_active);
  }
  if (options?.categoryCode) {
    filtered = filtered.filter((s) => s.category_code === options.categoryCode?.toUpperCase());
  }
  if (options?.search && options.search.trim()) {
    const term = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.service_code.toLowerCase().includes(term) ||
        s.scope_description.toLowerCase().includes(term)
    );
  }
  return filtered;
}

export async function getServiceByCode(code: string): Promise<ServiceCatalogItem | null> {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;

  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("quotation_services_catalog")
        .select("*")
        .ilike("code", normalized)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          service_code: data.code,
          category_code: data.category_code as QuotationCategoryCode,
          category_name: data.category_name,
          title: data.title,
          scope_description: data.client_scope_summary,
          deliverables: Array.isArray(data.default_deliverables) ? data.default_deliverables : [],
          unit: data.unit || "project",
          pricing_type: data.is_one_time ? "fixed" : "recurring",
          default_unit_price_paise:
            data.default_unit_price_paise !== null && data.default_unit_price_paise !== undefined
              ? Number(data.default_unit_price_paise)
              : null,
          tax_classification: null,
          is_active: data.is_active,
          sort_order: data.sort_order,
          version: 1,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch (e) {
      console.warn("[quotations-db] Error fetching service by code from db, checking fallback:", e);
    }
  }

  const found = CANONICAL_SERVICES_CATALOG.find(
    (s) => s.service_code.toUpperCase() === normalized
  );
  return found || null;
}

// ── 2. Quotation Queries ─────────────────────────────────────────────────────

export async function listQuotations(options?: {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ quotations: QuotationRecord[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.min(100, Math.max(1, options?.limit || 20));
  const offset = (page - 1) * limit;

  if (!isAdminClientConfigured()) {
    return { quotations: [], total: 0, page, limit };
  }

  try {
    let query = supabaseAdmin
      .from("quotations")
      .select("*", { count: "exact" });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options?.clientId) {
      query = query.eq("client_id", options.clientId);
    }
    if (options?.search && options.search.trim()) {
      const term = options.search.trim();
      query = query.or(
        `quotation_ref.ilike.%${term}%,project_title.ilike.%${term}%,company_name.ilike.%${term}%,contact_name.ilike.%${term}%,contact_email.ilike.%${term}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("[quotations-db] listQuotations error:", error);
      return { quotations: [], total: 0, page, limit };
    }

    const quotations = (data || []).map(mapDbRowToQuotation);
    return {
      quotations,
      total: count || 0,
      page,
      limit,
    };
  } catch (err) {
    console.error("[quotations-db] listQuotations exception:", err);
    return { quotations: [], total: 0, page, limit };
  }
}

export async function getQuotationById(id: string): Promise<QuotationRecord | null> {
  const cleanId = (id || "").trim();
  if (!cleanId) return null;

  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("id", cleanId)
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToQuotation(data);
      }
    } catch (err) {
      console.error("[quotations-db] getQuotationById error:", err);
    }
  }

  return findSeedQuotation(cleanId);
}

export async function getQuotationByToken(token: string): Promise<QuotationRecord | null> {
  const safeToken = (token || "").trim();
  if (!safeToken) return null;

  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("secure_token", safeToken)
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToQuotation(data);
      }
    } catch (err) {
      console.error("[quotations-db] getQuotationByToken error:", err);
    }
  }

  return findSeedQuotation(safeToken);
}

export async function getQuotationLineItems(
  quotationId: string,
  versionId?: string
): Promise<QuotationLineItem[]> {
  const cleanId = (quotationId || "").trim();
  if (!cleanId) return [];

  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from("quotation_line_items")
        .select("*")
        .eq("quotation_id", cleanId);

      if (versionId) {
        query = query.eq("version_id", versionId);
      } else {
        // By default if versionId is not supplied, fetch all lines (or unversioned draft lines first)
        query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToLineItem);
      }
    } catch (err) {
      console.error("[quotations-db] getQuotationLineItems error:", err);
    }
  }

  return findSeedLineItems(cleanId);
}

// ── 3. Draft Lifecycle & Mutation ────────────────────────────────────────────

export async function createQuotationDraft(
  input: CreateQuotationDraftInput
): Promise<QuotationRecord> {
  if (!isAdminClientConfigured()) {
    throw new Error("Database service client is not configured.");
  }

  const quotationRef = await generateQuotationRef();
  const secureToken = generateSecureToken();
  const tokenHash = crypto.createHash("sha256").update(secureToken).digest("hex");
  const validUntil =
    input.valid_until ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Convert input line items if provided
  const rawLines = input.line_items || [];
  const domainLines: QuotationLineItem[] = rawLines.map((item, idx) => ({
    service_code: item.service_code,
    category_code: item.category_code,
    category_name: item.category_name,
    title: item.title,
    scope_summary: item.scope_summary || item.public_scope || "",
    deliverables: item.deliverables,
    unit: item.unit || "project",
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    quoted_unit_price_paise:
      item.quoted_unit_price_paise !== undefined ? item.quoted_unit_price_paise : null,
    extended_amount_paise: calculateLineTotal(
      item.quoted_unit_price_paise ?? null,
      item.quantity || 1,
      Boolean(item.included_at_no_additional_charge)
    ),
    included_at_no_additional_charge: Boolean(item.included_at_no_additional_charge),
    inclusion_rationale: item.inclusion_rationale || item.charge_waiver_reason || null,
    is_selected: item.is_selected !== false,
    sort_order: item.sort_order ?? (idx + 1) * 10,
  }));

  const calc = calculateQuotation(domainLines);

  const payload = {
    quotation_ref: quotationRef,
    client_id: input.client_id || null,
    engagement_id: input.engagement_id || null,
    lead_id: input.lead_id || null,
    company_name: input.company_name.trim(),
    contact_name: input.recipient_name.trim(),
    contact_email: input.recipient_email.trim().toLowerCase(),
    contact_phone: input.recipient_phone?.trim() || null,
    project_title: input.project_title.trim(),
    project_brief: input.project_brief?.trim() || null,
    timeline_estimate: input.timeline_estimate?.trim() || "2 to 4 weeks",
    status: "draft",
    delivery_state: "not_sent",
    subtotal_paise: calc.subtotalPaise,
    discount_paise: calc.discountPaise,
    tax_paise: calc.taxPaise,
    total_payable_paise: calc.totalPayablePaise,
    milestone1_paise: calc.milestone1Paise,
    milestone2_paise: calc.milestone2Paise,
    currency: input.currency || "INR",
    secure_token: secureToken,
    token_hash: tokenHash,
    latest_version_number: 1,
    valid_until: validUntil,
    internal_notes: input.internal_notes || null,
    created_by: input.created_by || null,
  };

  const { data, error } = await supabaseAdmin
    .from("quotations")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("[quotations-db] createQuotationDraft insert error:", error);
    throw new Error(error?.message || "Failed to create quotation draft");
  }

  const createdQuote = mapDbRowToQuotation(data);

  if (rawLines.length > 0) {
    await saveQuotationLineItems(createdQuote.id, rawLines);
  }

  await logQuotationAudit(
    createdQuote.id,
    "draft_created",
    input.created_by || undefined,
    input.recipient_email,
    { quotation_ref: quotationRef, project_title: input.project_title }
  );

  return createdQuote;
}

export async function updateQuotationDraft(
  id: string,
  input: UpdateQuotationDraftInput
): Promise<QuotationRecord> {
  const existing = await getQuotationById(id);
  if (!existing) {
    throw new Error(`Quotation with id "${id}" not found`);
  }

  if (["accepted", "revoked", "expired"].includes(existing.status)) {
    throw new Error(
      `Quotation in status "${existing.status}" cannot be modified.`
    );
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.recipient_name !== undefined) updates.contact_name = input.recipient_name.trim();
  if (input.recipient_email !== undefined) updates.contact_email = input.recipient_email.trim().toLowerCase();
  if (input.recipient_phone !== undefined) updates.contact_phone = input.recipient_phone?.trim() || null;
  if (input.company_name !== undefined) updates.company_name = input.company_name.trim();
  if (input.project_title !== undefined) updates.project_title = input.project_title.trim();
  if (input.project_brief !== undefined) updates.project_brief = input.project_brief?.trim() || null;
  if (input.timeline_estimate !== undefined) updates.timeline_estimate = input.timeline_estimate?.trim() || null;
  if (input.currency !== undefined) updates.currency = input.currency;
  if (input.internal_notes !== undefined) updates.internal_notes = input.internal_notes;
  if (input.valid_until !== undefined && input.valid_until) updates.valid_until = input.valid_until;
  if (input.discount_paise !== undefined) updates.discount_paise = Math.max(0, input.discount_paise);
  if (input.discount_label !== undefined) updates.discount_label = input.discount_label;
  if (input.applied_coupon_code !== undefined) updates.applied_coupon_code = input.applied_coupon_code;
  if (input.tax_mode !== undefined) updates.tax_mode = input.tax_mode;
  if (input.tax_rate_bps !== undefined) updates.tax_rate_bps = input.tax_rate_bps;
  if (input.tax_paise !== undefined) updates.tax_paise = input.tax_paise;

  // If line items supplied, sync them and recalculate
  if (input.line_items) {
    await saveQuotationLineItems(id, input.line_items);
  } else {
    // If no new line items supplied, recalculate using existing lines
    const currentLines = await getQuotationLineItems(id);
    const calc = calculateQuotation(
      currentLines,
      null,
      updates.discount_paise !== undefined ? updates.discount_paise : existing.discount_paise,
      updates.tax_paise !== undefined ? updates.tax_paise : existing.tax_paise
    );
    updates.subtotal_paise = calc.subtotalPaise;
    updates.discount_paise = calc.discountPaise;
    updates.tax_paise = calc.taxPaise;
    updates.total_payable_paise = calc.totalPayablePaise;
    updates.milestone1_paise = calc.milestone1Paise;
    updates.milestone2_paise = calc.milestone2Paise;
  }

  const { data, error } = await supabaseAdmin
    .from("quotations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[quotations-db] updateQuotationDraft error:", error);
    throw new Error(error?.message || "Failed to update quotation draft");
  }

  const updated = mapDbRowToQuotation(data);

  await logQuotationAudit(id, "draft_updated", undefined, undefined, {
    fieldsUpdated: Object.keys(updates),
  });

  return updated;
}

export async function saveQuotationLineItems(
  quotationId: string,
  lineItems: QuotationLineItemInput[]
): Promise<QuotationLineItem[]> {
  if (!quotationId || !isAdminClientConfigured()) return [];

  // 1. Fetch quotation
  const quotation = await getQuotationById(quotationId);
  if (!quotation) {
    throw new Error(`Quotation with id "${quotationId}" not found`);
  }

  // 2. Delete existing unversioned line items for this draft
  const { error: deleteError } = await supabaseAdmin
    .from("quotation_line_items")
    .delete()
    .eq("quotation_id", quotationId)
    .is("version_id", null);

  if (deleteError) {
    console.error("[quotations-db] saveQuotationLineItems delete error:", deleteError);
  }

  // 3. Prepare fresh records
  const domainLines: QuotationLineItem[] = [];
  const rowsToInsert = lineItems.map((item, idx) => {
    const unitPrice =
      item.quoted_unit_price_paise !== undefined && item.quoted_unit_price_paise !== null
        ? Number(item.quoted_unit_price_paise)
        : null;
    const qty = item.quantity && item.quantity > 0 ? Number(item.quantity) : 1;
    const isIncludedNoCharge = Boolean(item.included_at_no_additional_charge);
    const extendedAmount = calculateLineTotal(unitPrice, qty, isIncludedNoCharge);

    const domainLine: QuotationLineItem = {
      quotation_id: quotationId,
      service_code: item.service_code,
      category_code: item.category_code,
      category_name: item.category_name,
      title: item.title,
      scope_summary: item.scope_summary || item.public_scope || "",
      deliverables: item.deliverables || [],
      unit: item.unit || "project",
      quantity: qty,
      quoted_unit_price_paise: unitPrice,
      extended_amount_paise: extendedAmount,
      included_at_no_additional_charge: isIncludedNoCharge,
      inclusion_rationale: item.inclusion_rationale || item.charge_waiver_reason || null,
      is_selected: item.is_selected !== false,
      sort_order: item.sort_order ?? (idx + 1) * 10,
    };
    domainLines.push(domainLine);

    return {
      quotation_id: quotationId,
      version_id: null,
      service_catalog_id: item.service_catalog_id || item.service_id || null,
      service_code: item.service_code,
      category_code: item.category_code || "A",
      category_name: item.category_name || "General Services",
      title: item.title,
      public_scope: item.scope_summary || item.public_scope || "",
      deliverables: JSON.stringify(item.deliverables || []),
      unit: item.unit || "project",
      quantity: qty,
      quoted_unit_price_paise: unitPrice,
      extended_amount_paise: extendedAmount,
      included_at_no_additional_charge: isIncludedNoCharge,
      charge_waiver_reason: item.inclusion_rationale || item.charge_waiver_reason || null,
      is_selected: item.is_selected !== false,
      sort_order: item.sort_order ?? (idx + 1) * 10,
    };
  });

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("quotation_line_items")
      .insert(rowsToInsert);

    if (insertError) {
      console.error("[quotations-db] saveQuotationLineItems insert error:", insertError);
      throw new Error(insertError.message);
    }
  }

  // 4. Recalculate quotation financials and update quotation header
  const calc = calculateQuotation(
    domainLines,
    null,
    quotation.discount_paise,
    quotation.tax_paise
  );

  await supabaseAdmin
    .from("quotations")
    .update({
      subtotal_paise: calc.subtotalPaise,
      discount_paise: calc.discountPaise,
      tax_paise: calc.taxPaise,
      total_payable_paise: calc.totalPayablePaise,
      milestone1_paise: calc.milestone1Paise,
      milestone2_paise: calc.milestone2Paise,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quotationId);

  return getQuotationLineItems(quotationId);
}

// ── 4. Publish, Duplicate & Revoke ───────────────────────────────────────────

export async function publishQuotation(
  id: string,
  adminUserId: string
): Promise<QuotationRecord> {
  const quotation = await getQuotationById(id);
  if (!quotation) {
    throw new Error(`Quotation with id "${id}" not found`);
  }

  const lines = await getQuotationLineItems(id);

  // CRITICAL: Validate publish readiness (zero unpriced leakage)
  const readiness = validatePublishReadiness(lines, quotation);
  if (!readiness.isValid) {
    throw new Error(
      `Quotation cannot be published: ${readiness.errors.join("; ")}`
    );
  }

  const secureToken = quotation.secure_token || generateSecureToken();
  const tokenHash = crypto.createHash("sha256").update(secureToken).digest("hex");
  const nextVersionNumber = quotation.version_number || 1;

  // Build immutable version snapshot
  const clientSnapshot = {
    company_name: quotation.company_name,
    contact_name: quotation.recipient_name,
    contact_email: quotation.recipient_email,
    contact_phone: quotation.recipient_phone,
    billing_address: quotation.billing_address,
    city_state_pin: quotation.city_state_pin,
  };

  // Only selected lines are captured in the version snapshot
  const selectedLines = lines.filter((l) => l.is_selected);

  const financialSnapshot = {
    subtotal_paise: quotation.subtotal_paise,
    discount_paise: quotation.discount_paise,
    discount_label: quotation.discount_label,
    tax_paise: quotation.tax_paise,
    tax_label: quotation.tax_label,
    total_payable_paise: quotation.total_payable_paise,
    milestone1_paise: quotation.milestone_1_paise,
    milestone2_paise: quotation.milestone_2_paise,
  };

  const contentHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        id: quotation.id,
        ref: quotation.quotation_ref,
        version: nextVersionNumber,
        client: clientSnapshot,
        financial: financialSnapshot,
        lines: selectedLines,
        timestamp: new Date().toISOString(),
      })
    )
    .digest("hex");

  // 1. Insert immutable version record
  const { data: versionData, error: versionError } = await supabaseAdmin
    .from("quotation_versions")
    .insert({
      quotation_id: quotation.id,
      version_number: nextVersionNumber,
      secure_token: secureToken,
      client_snapshot: clientSnapshot,
      deliverables_snapshot: selectedLines.flatMap((l) => l.deliverables || []),
      lines_snapshot: selectedLines,
      financial_snapshot: financialSnapshot,
      content_hash: contentHash,
      status: "published",
      approved_by: adminUserId,
      published_at: new Date().toISOString(),
      valid_until: quotation.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (versionError || !versionData) {
    console.error("[quotations-db] publishQuotation version error:", versionError);
    throw new Error(versionError?.message || "Failed to create immutable version snapshot");
  }

  // 2. Link draft line items to the new version
  await supabaseAdmin
    .from("quotation_line_items")
    .update({ version_id: versionData.id })
    .eq("quotation_id", quotation.id)
    .is("version_id", null);

  // 3. Update quotation status to 'published'
  const { data: updatedQuoteData, error: updateError } = await supabaseAdmin
    .from("quotations")
    .update({
      status: "published",
      secure_token: secureToken,
      token_hash: tokenHash,
      latest_version_number: nextVersionNumber,
      approved_by: adminUserId,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quotation.id)
    .select()
    .single();

  if (updateError || !updatedQuoteData) {
    console.error("[quotations-db] publishQuotation update error:", updateError);
    throw new Error(updateError?.message || "Failed to update quotation to published");
  }

  await logQuotationAudit(
    quotation.id,
    "quotation_published",
    adminUserId,
    undefined,
    {
      version_id: versionData.id,
      version_number: nextVersionNumber,
      total_payable_paise: quotation.total_payable_paise,
    }
  );

  return mapDbRowToQuotation(updatedQuoteData);
}

export async function duplicateQuotation(
  id: string,
  adminUserId: string
): Promise<QuotationRecord> {
  const source = await getQuotationById(id);
  if (!source) {
    throw new Error(`Quotation with id "${id}" not found`);
  }

  const sourceLines = await getQuotationLineItems(id);
  const newRef = await generateQuotationRef();
  const secureToken = generateSecureToken();
  const tokenHash = crypto.createHash("sha256").update(secureToken).digest("hex");

  const payload = {
    quotation_ref: newRef,
    client_id: source.client_id,
    engagement_id: source.engagement_id,
    lead_id: source.lead_id,
    company_name: source.company_name,
    contact_name: source.recipient_name,
    contact_email: source.recipient_email,
    contact_phone: source.recipient_phone,
    project_title: `${source.project_title} (Copy)`,
    project_brief: source.project_brief,
    timeline_estimate: source.timeline_estimate,
    status: "draft",
    delivery_state: "not_sent",
    subtotal_paise: source.subtotal_paise,
    discount_paise: source.discount_paise,
    discount_label: source.discount_label,
    tax_paise: source.tax_paise,
    total_payable_paise: source.total_payable_paise,
    milestone1_paise: source.milestone_1_paise,
    milestone2_paise: source.milestone_2_paise,
    currency: source.currency,
    secure_token: secureToken,
    token_hash: tokenHash,
    latest_version_number: 1,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: `Cloned from ${source.quotation_ref}`,
    created_by: adminUserId,
  };

  const { data, error } = await supabaseAdmin
    .from("quotations")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("[quotations-db] duplicateQuotation error:", error);
    throw new Error(error?.message || "Failed to clone quotation draft");
  }

  const newQuote = mapDbRowToQuotation(data);

  if (sourceLines.length > 0) {
    const linesToClone: QuotationLineItemInput[] = sourceLines.map((l) => ({
      service_code: l.service_code,
      category_code: l.category_code,
      category_name: l.category_name,
      title: l.title,
      scope_summary: l.scope_summary,
      deliverables: l.deliverables,
      unit: l.unit,
      quantity: l.quantity,
      quoted_unit_price_paise: l.quoted_unit_price_paise,
      extended_amount_paise: l.extended_amount_paise,
      included_at_no_additional_charge: l.included_at_no_additional_charge,
      inclusion_rationale: l.inclusion_rationale,
      is_selected: l.is_selected,
      sort_order: l.sort_order,
    }));
    await saveQuotationLineItems(newQuote.id, linesToClone);
  }

  await logQuotationAudit(
    newQuote.id,
    "quotation_duplicated",
    adminUserId,
    undefined,
    { source_quotation_id: source.id, source_quotation_ref: source.quotation_ref }
  );

  return newQuote;
}

export async function revokeQuotation(
  id: string,
  adminUserId: string,
  reason?: string
): Promise<QuotationRecord> {
  const quotation = await getQuotationById(id);
  if (!quotation) {
    throw new Error(`Quotation with id "${id}" not found`);
  }

  const { data, error } = await supabaseAdmin
    .from("quotations")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to revoke quotation");
  }

  await logQuotationAudit(id, "quotation_revoked", adminUserId, undefined, {
    reason: reason || "Revoked by staff",
  });

  return mapDbRowToQuotation(data);
}

// ── 5. Coupon Engine & Validation ───────────────────────────────────────────

export async function validateCouponCode(
  code: string,
  subtotalPaise: number,
  clientId?: string
): Promise<{
  isValid: boolean;
  coupon?: QuotationCoupon;
  discountPaise: number;
  label: string;
  error?: string;
}> {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, discountPaise: 0, label: "", error: "Coupon code is required" };
  }

  if (!isAdminClientConfigured()) {
    return { isValid: false, discountPaise: 0, label: "", error: "Database not configured" };
  }

  try {
    const { data: couponRow, error } = await supabaseAdmin
      .from("quotation_coupons")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (error || !couponRow) {
      return { isValid: false, discountPaise: 0, label: "", error: `Invalid coupon code "${cleanCode}"` };
    }

    const coupon = mapDbRowToCoupon(couponRow);

    if (!coupon.is_active) {
      return { isValid: false, discountPaise: 0, label: "", error: "This coupon is currently inactive" };
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { isValid: false, discountPaise: 0, label: "", error: "This coupon campaign has not yet started" };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { isValid: false, discountPaise: 0, label: "", error: "This coupon has expired" };
    }

    if (coupon.max_redemptions && coupon.current_redemptions >= coupon.max_redemptions) {
      return { isValid: false, discountPaise: 0, label: "", error: "Coupon redemption limit reached" };
    }

    if (coupon.min_subtotal_paise && subtotalPaise < coupon.min_subtotal_paise) {
      return {
        isValid: false,
        discountPaise: 0,
        label: "",
        error: `Quotation subtotal must be at least ₹${coupon.min_subtotal_paise / 100} to use this coupon`,
      };
    }

    if (coupon.allowed_client_ids && coupon.allowed_client_ids.length > 0) {
      if (!clientId || !coupon.allowed_client_ids.includes(clientId)) {
        return { isValid: false, discountPaise: 0, label: "", error: "This coupon is restricted to specific accounts" };
      }
    }

    const { discountPaise, label } = calculateDiscount(subtotalPaise, coupon, 0);

    return {
      isValid: true,
      coupon,
      discountPaise,
      label,
    };
  } catch (err: any) {
    return {
      isValid: false,
      discountPaise: 0,
      label: "",
      error: err.message || "Failed to validate coupon",
    };
  }
}

export async function recordCouponRedemption(
  quotationId: string,
  couponId: string,
  discountPaise: number,
  clientIdentifier?: string
): Promise<CouponRedemption | null> {
  if (!isAdminClientConfigured()) return null;

  try {
    const { data: redemption, error } = await supabaseAdmin
      .from("quotation_coupon_redemptions")
      .insert({
        coupon_id: couponId,
        quotation_id: quotationId,
        discount_paise: discountPaise,
        signer_email: (clientIdentifier || "client@unknown.com").toLowerCase(),
      })
      .select()
      .single();

    if (!error) {
      // Increment redemption count on coupon
      const { data: currentCoupon } = await supabaseAdmin
        .from("quotation_coupons")
        .select("redemptions_count")
        .eq("id", couponId)
        .single();

      if (currentCoupon) {
        await supabaseAdmin
          .from("quotation_coupons")
          .update({
            redemptions_count: (currentCoupon.redemptions_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", couponId);
      }
    }

    return redemption || null;
  } catch (err) {
    console.error("[quotations-db] recordCouponRedemption error:", err);
    return null;
  }
}

export async function listCoupons(activeOnly?: boolean): Promise<QuotationCoupon[]> {
  if (!isAdminClientConfigured()) return [];

  try {
    let query = supabaseAdmin.from("quotation_coupons").select("*").order("created_at", { ascending: false });
    if (activeOnly) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbRowToCoupon);
  } catch (err) {
    console.error("[quotations-db] listCoupons error:", err);
    return [];
  }
}

export async function createCoupon(input: CreateCouponInput): Promise<QuotationCoupon> {
  if (!isAdminClientConfigured()) {
    throw new Error("Database service client is not configured.");
  }

  const isPercentage = input.discount_type === "percentage";
  const discountVal = isPercentage
    ? (input.discount_percentage ?? input.discount_value ?? 0)
    : (input.discount_paise ?? input.discount_value ?? 0);

  const payload = {
    code: input.code.trim().toUpperCase(),
    campaign_name: input.campaign_name.trim(),
    description: input.description || null,
    discount_type: isPercentage ? "percentage" : "fixed_amount",
    discount_value: discountVal,
    min_subtotal_paise: input.min_subtotal_paise ?? 0,
    max_discount_paise: input.max_discount_paise || null,
    applies_to_categories: input.applies_to_categories || [],
    applies_to_services: input.applies_to_services || [],
    allowed_client_ids: input.allowed_client_ids || [],
    max_redemptions: input.max_redemptions ?? 100,
    redemptions_count: 0,
    is_active: input.is_active !== false,
    is_stackable: Boolean(input.can_stack ?? input.is_stackable),
    starts_at: input.starts_at || new Date().toISOString(),
    expires_at: input.expires_at || null,
    created_by: input.created_by || null,
    approved_by: input.approved_by || null,
  };

  const { data, error } = await supabaseAdmin
    .from("quotation_coupons")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("[quotations-db] createCoupon error:", error);
    throw new Error(error?.message || "Failed to create promotional coupon");
  }

  return mapDbRowToCoupon(data);
}

export async function toggleCouponStatus(id: string, isActive: boolean): Promise<QuotationCoupon> {
  const { data, error } = await supabaseAdmin
    .from("quotation_coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update coupon status");
  }

  return mapDbRowToCoupon(data);
}

// ── 6. Client Revisions & Formal Acceptance ──────────────────────────────────

export async function submitQuotationRevisionRequest(
  quotationId: string,
  requester: { name: string; email: string; notes: string }
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  if (!isAdminClientConfigured()) {
    return { success: false, error: "Database client unavailable" };
  }

  const quotation = await getQuotationById(quotationId);
  if (!quotation) {
    return { success: false, error: "Quotation not found" };
  }

  // Try RPC request_quotation_revision_v6 first
  try {
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc(
      "request_quotation_revision_v6",
      {
        p_secure_token: quotation.secure_token || "",
        p_requester_name: requester.name,
        p_requester_email: requester.email,
        p_notes: requester.notes,
      }
    );

    if (!rpcErr && rpcRes && rpcRes.success) {
      return { success: true, requestId: rpcRes.request_id };
    }
  } catch {
    // Fall through to atomic fallback
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("quotation_revision_requests")
      .insert({
        quotation_id: quotation.id,
        requester_name: requester.name.trim(),
        requester_email: requester.email.trim().toLowerCase(),
        notes: requester.notes.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await supabaseAdmin
      .from("quotations")
      .update({ status: "changes_requested", updated_at: new Date().toISOString() })
      .eq("id", quotation.id);

    await logQuotationAudit(
      quotation.id,
      "revision_requested",
      undefined,
      requester.email,
      { notes: requester.notes, name: requester.name }
    );

    return { success: true, requestId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function acceptQuotation(input: {
  quotationId: string;
  secureToken: string;
  clientName: string;
  clientEmail: string;
  clientDesignation?: string;
  clientCompany?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  quotationId?: string;
  quotationRef?: string;
  acceptanceId?: string;
  message?: string;
  error?: string;
}> {
  if (!isAdminClientConfigured()) {
    return { success: false, error: "Database client unavailable" };
  }

  // 1. First invoke atomic RPC function accept_quotation_v6
  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "accept_quotation_v6",
      {
        p_secure_token: input.secureToken,
        p_signer_name: input.clientName,
        p_signer_email: input.clientEmail,
        p_signer_title: input.clientDesignation || "Authorized Signatory",
        p_signer_company: input.clientCompany || "",
        p_client_ip: input.ipAddress || null,
        p_user_agent: input.userAgent || null,
      }
    );

    if (!rpcError && rpcResult) {
      if (rpcResult.success) {
        return {
          success: true,
          quotationId: rpcResult.quotation_id,
          quotationRef: rpcResult.quotation_ref,
          acceptanceId: rpcResult.acceptance_id,
          message: rpcResult.message || "Quotation accepted successfully",
        };
      } else {
        return {
          success: false,
          error: rpcResult.message || rpcResult.error || "Quotation acceptance rejected",
        };
      }
    }
  } catch (e) {
    console.warn("[quotations-db] accept_quotation_v6 RPC error, running transactional fallback:", e);
  }

  // 2. Transactional fallback if RPC is not loaded yet in environment
  const quotation = await getQuotationByToken(input.secureToken);
  if (!quotation) {
    return { success: false, error: "Quotation not found for provided token" };
  }

  if (quotation.status === "accepted") {
    return {
      success: true,
      quotationId: quotation.id,
      quotationRef: quotation.quotation_ref,
      message: "Quotation has already been accepted",
    };
  }

  if (quotation.status !== "published") {
    return {
      success: false,
      error: `Quotation cannot be accepted because status is ${quotation.status}`,
    };
  }

  if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
    return { success: false, error: "Quotation validity period has expired" };
  }

  // Locate or create version
  const version = (await getQuotationVersions(quotation.id))[0];
  let versionId = version?.id;

  if (!versionId) {
    const published = await publishQuotation(quotation.id, "system-acceptance-auto");
    versionId = published.latest_version_id || quotation.id;
  }

  // Insert acceptance record
  const { data: acceptanceData, error: acceptanceError } = await supabaseAdmin
    .from("quotation_acceptances")
    .upsert(
      {
        quotation_id: quotation.id,
        version_id: versionId,
        signer_name: input.clientName.trim(),
        signer_email: input.clientEmail.trim().toLowerCase(),
        signer_title: input.clientDesignation?.trim() || "Authorized Signatory",
        signer_company: input.clientCompany?.trim() || quotation.company_name,
        accepted_total_paise: quotation.total_payable_paise,
        terms_hash: crypto.createHash("sha256").update(quotation.id + versionId).digest("hex"),
        client_ip: input.ipAddress || null,
        user_agent: input.userAgent || null,
      },
      { onConflict: "quotation_id,version_id" }
    )
    .select()
    .single();

  if (acceptanceError) {
    console.error("[quotations-db] quotation_acceptances fallback error:", acceptanceError);
  }

  // Update status to accepted
  await supabaseAdmin
    .from("quotations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quotation.id);

  // Advance linked client engagement stage if connected
  if (quotation.engagement_id) {
    try {
      await supabaseAdmin
        .from("client_engagements")
        .update({
          current_stage: "acceptance",
          updated_at: new Date().toISOString(),
        })
        .eq("id", quotation.engagement_id);

      await supabaseAdmin
        .from("engagement_stages")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("engagement_id", quotation.engagement_id)
        .in("stage_key", ["proposal", "acceptance"]);

      await supabaseAdmin
        .from("engagement_stages")
        .update({
          status: "available",
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("engagement_id", quotation.engagement_id)
        .eq("stage_key", "sow")
        .eq("status", "locked");
    } catch (e) {
      console.warn("[quotations-db] Error advancing engagement stages:", e);
    }
  }

  await logQuotationAudit(
    quotation.id,
    "quotation_accepted",
    undefined,
    input.clientEmail,
    {
      signer_name: input.clientName,
      signer_email: input.clientEmail,
      accepted_total_paise: quotation.total_payable_paise,
    },
    input.ipAddress
  );

  return {
    success: true,
    quotationId: quotation.id,
    quotationRef: quotation.quotation_ref,
    acceptanceId: acceptanceData?.id,
    message: "Quotation accepted successfully",
  };
}

// ── 7. Audit & Version Logs ──────────────────────────────────────────────────

export async function logQuotationAudit(
  quotationId: string,
  action: string,
  actorId?: string,
  actorEmail?: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  if (!quotationId || !isAdminClientConfigured()) return;

  try {
    await supabaseAdmin.from("quotation_audit_logs").insert({
      quotation_id: quotationId,
      action,
      actor_id: actorId || null,
      actor_email: actorEmail || null,
      details: details || {},
      ip_address: ipAddress || null,
    });
  } catch (err) {
    // Non-throwing audit logger
    console.warn("[quotations-db] logQuotationAudit error:", err);
  }
}

export async function getQuotationAuditLogs(
  quotationId: string
): Promise<QuotationAuditLog[]> {
  if (!quotationId || !isAdminClientConfigured()) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from("quotation_audit_logs")
      .select("*")
      .eq("quotation_id", quotationId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      quotation_id: row.quotation_id,
      action: row.action,
      actor_id: row.actor_id ?? null,
      actor_email: row.actor_email ?? null,
      details: row.details || {},
      ip_address: row.ip_address ?? null,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("[quotations-db] getQuotationAuditLogs error:", err);
    return [];
  }
}

export async function getQuotationVersions(
  quotationId: string
): Promise<QuotationVersion[]> {
  if (!quotationId || !isAdminClientConfigured()) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from("quotation_versions")
      .select("*")
      .eq("quotation_id", quotationId)
      .order("version_number", { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbRowToVersion);
  } catch (err) {
    console.error("[quotations-db] getQuotationVersions error:", err);
    return [];
  }
}
