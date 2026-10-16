import "server-only";
import crypto from "crypto";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import {
  QuotationRecord,
  QuotationLineItem,
  QuotationVersion,
  QuotationCoupon,
  PublicQuotationProjection,
  QuotationStatus,
  DeliveryState,
} from "@/types/quotations";
import {
  calculateQuotation,
  calculateMilestones,
  calculateLineTotal,
  calculateDiscount,
  projectPublicQuotation,
  DEFAULT_LIT_ISSUER,
  STANDARD_QUOTATION_TERMS,
  formatPaiseToINR,
} from "./pricing";
import {
  CANONICAL_SERVICES_CATALOG,
  QUOTATION_CATEGORIES,
} from "./catalog-seed-data";
import { sendQuotationEmail } from "@/lib/email/send-quotation-email";

export interface CreateQuotationInput {
  clientId?: string | null;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  billingAddress?: string | null;
  cityStatePin?: string | null;
  projectTitle: string;
  projectBrief?: string | null;
  timelineEstimate?: string | null;
  validityDays?: number; // default 14
  lines: Array<{
    serviceCode: string;
    title?: string;
    scopeSummary?: string;
    deliverables?: string[];
    unit?: string;
    quantity: number;
    unitPriceRupees?: number | null; // in Rupees from UI
    unitPricePaise?: number | null; // in Paise
    isIncludedNoCharge?: boolean;
    chargeWaiverReason?: string | null;
    isSelected: boolean;
  }>;
  manualDiscountRupees?: number;
  manualDiscountPaise?: number;
  appliedCouponCode?: string | null;
  internalNotes?: string | null;
  publishImmediately?: boolean;
}

export interface QuotationDetailsResponse {
  quotation: QuotationRecord;
  lines: QuotationLineItem[];
  versions: QuotationVersion[];
  auditLogs: Array<{
    id: string;
    quotation_id: string;
    action: string;
    actor_email?: string | null;
    details: Record<string, unknown>;
    created_at: string;
  }>;
  acceptance?: {
    id: string;
    signer_name: string;
    signer_email: string;
    signer_title?: string | null;
    created_at: string;
  } | null;
}

// In-memory fallback cache to ensure zero-downtime and flawless local demo/testing
const inMemoryQuotations: QuotationRecord[] = [
  {
    id: "qt-sample-001",
    quotation_ref: "LIT-QT-2026-0001",
    company_name: "Apex Global Health",
    recipient_name: "Dr. Arvind Swaminathan",
    recipient_email: "arvind@apexhealth.in",
    recipient_phone: "+91 98401 22345",
    billing_address: "12 Healthcare Avenue, Anna Nagar",
    city_state_pin: "Chennai, Tamil Nadu 600040",
    project_title: "Enterprise Clinical Portal & Next.js Interface",
    project_brief: "Modernizing core patient web experience with enterprise grade Next.js 16 frontend and Vercel cloud deployment.",
    timeline_estimate: "3 to 5 weeks",
    currency: "INR",
    status: "published",
    delivery_state: "link_shared",
    subtotal_paise: 5000000,
    discount_paise: 0,
    discount_label: null,
    tax_paise: 0,
    tax_label: "GST Exempt / Composition",
    total_payable_paise: 5000000,
    milestone_1_paise: 2500000,
    milestone_2_paise: 2500000,
    terms: STANDARD_QUOTATION_TERMS,
    internal_notes: "Initial launch proposal for Q4. Approved by Founder.",
    secure_token: "qt-apex-tok-99a1",
    secure_token_hash: "hash-001",
    valid_until: new Date(Date.now() + 14 * 86400000).toISOString(),
    issued_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    accepted_at: null,
    version_number: 1,
    latest_version_id: "ver-001",
    created_by: null,
    approved_by: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "qt-sample-002",
    quotation_ref: "LIT-QT-2026-0002",
    company_name: "FinPulse Logistics",
    recipient_name: "Kavitha Ranganathan",
    recipient_email: "kavitha@finpulse.co",
    recipient_phone: "+91 97910 88765",
    billing_address: "45 Peelamedu Industrial Estate",
    city_state_pin: "Coimbatore, Tamil Nadu 641004",
    project_title: "Freight Telemetry Dashboard & Webhook Engine",
    project_brief: "Custom high-throughput telemetry UI with real-time API integrations and cloud hosting.",
    timeline_estimate: "4 to 6 weeks",
    currency: "INR",
    status: "draft",
    delivery_state: "not_sent",
    subtotal_paise: 8500000,
    discount_paise: 500000,
    discount_label: "Manual Founder Goodwill (₹5,000.00)",
    tax_paise: 0,
    tax_label: "GST Exempt / Composition",
    total_payable_paise: 8000000,
    milestone_1_paise: 4000000,
    milestone_2_paise: 4000000,
    terms: STANDARD_QUOTATION_TERMS,
    internal_notes: "Awaiting final scope confirmation for Category G webhook integration.",
    secure_token: "qt-finpulse-tok-88b2",
    secure_token_hash: "hash-002",
    valid_until: new Date(Date.now() + 12 * 86400000).toISOString(),
    issued_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    accepted_at: null,
    version_number: 1,
    latest_version_id: "ver-002",
    created_by: null,
    approved_by: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "qt-sample-003",
    quotation_ref: "LIT-QT-2026-0003",
    company_name: "Kovai Agro Mills",
    recipient_name: "Muthu Kumar",
    recipient_email: "muthu@kovaimills.com",
    recipient_phone: "+91 94432 11009",
    billing_address: "Trichy Road, Singanallur",
    city_state_pin: "Coimbatore, Tamil Nadu 641005",
    project_title: "Corporate B2B Catalog & Customer Enquiry Interface",
    project_brief: "Full responsive corporate frontend and digital product strategy.",
    timeline_estimate: "2 to 3 weeks",
    currency: "INR",
    status: "accepted",
    delivery_state: "email_sent",
    subtotal_paise: 6500000,
    discount_paise: 0,
    discount_label: null,
    tax_paise: 0,
    tax_label: "GST Exempt / Composition",
    total_payable_paise: 6500000,
    milestone_1_paise: 3250000,
    milestone_2_paise: 3250000,
    terms: STANDARD_QUOTATION_TERMS,
    internal_notes: "Accepted digitally on Oct 14. Proceeding to SOW execution.",
    secure_token: "qt-kovai-tok-77c3",
    secure_token_hash: "hash-003",
    valid_until: new Date(Date.now() + 25 * 86400000).toISOString(),
    issued_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    accepted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    version_number: 1,
    latest_version_id: "ver-003",
    created_by: null,
    approved_by: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const inMemoryLines: Record<string, QuotationLineItem[]> = {
  "qt-sample-001": [
    {
      id: "line-001",
      quotation_id: "qt-sample-001",
      service_code: "FE-01",
      category_code: "B",
      category_name: "Frontend & Interactive Web Application Engineering",
      title: "Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript",
      scope_summary: "Client-approved frontend interface implementation; default quoted starting value ₹50,000 for the specifically scoped project; does NOT imply bespoke backend, database, admin portal, AI, hosting or domain services",
      deliverables: ["Next.js 16 & React 19 Application Architecture", "Responsive Interface Components", "Production Build & Asset Optimization"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 5000000,
      extended_amount_paise: 5000000,
      included_at_no_additional_charge: false,
      is_selected: true,
      sort_order: 1,
    },
    {
      id: "line-002",
      quotation_id: "qt-sample-001",
      service_code: "CL-02",
      category_code: "F",
      category_name: "Cloud, Hosting, DevOps & Web Infrastructure",
      title: "Vercel Frontend Deployment & Configuration",
      scope_summary: "Existing/new authorized Vercel project integration, build settings and release validation",
      deliverables: ["Vercel Project Setup & Build Configuration", "Continuous Deployment Pipeline Integration"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 0,
      extended_amount_paise: 0,
      included_at_no_additional_charge: true,
      inclusion_rationale: "Complimentary launch deployment configuration",
      is_selected: true,
      sort_order: 2,
    },
  ],
  "qt-sample-002": [
    {
      id: "line-003",
      quotation_id: "qt-sample-002",
      service_code: "FE-01",
      category_code: "B",
      category_name: "Frontend & Interactive Web Application Engineering",
      title: "Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript",
      scope_summary: "Client-approved frontend interface implementation; default quoted starting value ₹50,000",
      deliverables: ["Next.js 16 Application Shell", "Responsive Component Architecture"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 5000000,
      extended_amount_paise: 5000000,
      included_at_no_additional_charge: false,
      is_selected: true,
      sort_order: 1,
    },
    {
      id: "line-004",
      quotation_id: "qt-sample-002",
      service_code: "FE-05",
      category_code: "B",
      category_name: "Frontend & Interactive Web Application Engineering",
      title: "Business Operations Dashboard Interface Development",
      scope_summary: "Operational KPI visualization UI; actual data connectors separately scoped",
      deliverables: ["Interactive Metric Visualizations", "Filter Controls & Responsive Viewports"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 3500000,
      extended_amount_paise: 3500000,
      included_at_no_additional_charge: false,
      is_selected: true,
      sort_order: 2,
    },
  ],
  "qt-sample-003": [
    {
      id: "line-005",
      quotation_id: "qt-sample-003",
      service_code: "DS-02",
      category_code: "A",
      category_name: "Discovery, Website Strategy & Experience Design",
      title: "Website Strategy & Information Architecture",
      scope_summary: "Sitemap, content hierarchy, user journeys and page-level scope",
      deliverables: ["Visual Sitemap & Content Hierarchy", "User Journey Flowcharts"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 1500000,
      extended_amount_paise: 1500000,
      included_at_no_additional_charge: false,
      is_selected: true,
      sort_order: 1,
    },
    {
      id: "line-006",
      quotation_id: "qt-sample-003",
      service_code: "FE-01",
      category_code: "B",
      category_name: "Frontend & Interactive Web Application Engineering",
      title: "Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript",
      scope_summary: "Client-approved frontend interface implementation",
      deliverables: ["Next.js 16 Multi-Page Website", "Responsive Layouts & Speed Optimization"],
      unit: "project",
      quantity: 1,
      quoted_unit_price_paise: 5000000,
      extended_amount_paise: 5000000,
      included_at_no_additional_charge: false,
      is_selected: true,
      sort_order: 2,
    },
  ],
};

const inMemoryCoupons: QuotationCoupon[] = [
  {
    id: "coupon-001",
    code: "WAKEUPINDIA",
    campaign_name: "Support Wake Up India — Initial Launch",
    description: "Founder-controlled promotional discount for qualifying initial launch initiatives. Inactive by default per policy until Super Admin configures discount type/value and activates.",
    discount_type: null,
    discount_paise: null,
    discount_percentage: null,
    min_subtotal_paise: 5000000,
    max_discount_paise: null,
    is_active: false, // strictly disabled by default
    can_stack: false,
    max_redemptions: 100,
    current_redemptions: 0,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "coupon-002",
    code: "FOUNDER10",
    campaign_name: "Founder Direct 10% Commercial Courtesy",
    description: "Selective commercial courtesy discount applied directly by founder approval.",
    discount_type: "percentage",
    discount_percentage: 10,
    discount_paise: null,
    min_subtotal_paise: 5000000,
    max_discount_paise: 2500000, // max ₹25,000
    is_active: false, // inactive until Super Admin explicitly activates
    can_stack: false,
    max_redemptions: 50,
    current_redemptions: 0,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const inMemoryAuditLogs: Record<string, Array<{
  id: string;
  quotation_id: string;
  action: string;
  actor_email?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}>> = {
  "qt-sample-001": [
    {
      id: "log-001",
      quotation_id: "qt-sample-001",
      action: "quotation_created",
      actor_email: "vikash@logicintelligencetechnologies.in",
      details: { ref: "LIT-QT-2026-0001", lines_count: 2 },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "log-002",
      quotation_id: "qt-sample-001",
      action: "quotation_published",
      actor_email: "vikash@logicintelligencetechnologies.in",
      details: { version: 1, total_payable_paise: 5000000 },
      created_at: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    },
    {
      id: "log-003",
      quotation_id: "qt-sample-001",
      action: "secure_link_generated",
      actor_email: "vikash@logicintelligencetechnologies.in",
      details: { token_prefix: "qt-apex" },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
};

const inMemoryVersions: Record<string, QuotationVersion[]> = {
  "qt-sample-001": [
    {
      id: "ver-001",
      quotation_id: "qt-sample-001",
      version_number: 1,
      version_hash: "hash_qt_001_v1",
      status: "published",
      subtotal_paise: 5000000,
      discount_paise: 0,
      discount_label: null,
      tax_paise: 0,
      tax_label: "GST Exempt / Composition",
      total_payable_paise: 5000000,
      milestone_1_paise: 2500000,
      milestone_2_paise: 2500000,
      lines_snapshot: inMemoryLines["qt-sample-001"],
      terms: STANDARD_QUOTATION_TERMS,
      created_at: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    },
  ],
};

function generateQuotationRef(): string {
  const year = new Date().getFullYear();
  const count = inMemoryQuotations.length + 1;
  const seq = String(count).padStart(4, "0");
  return `LIT-QT-${year}-${seq}`;
}

function generateSecureToken(): string {
  return "qt_" + crypto.randomBytes(16).toString("hex");
}

/**
 * Lists quotations with optional search query and status filter
 */
export async function listQuotations(options?: {
  status?: string;
  search?: string;
}): Promise<QuotationRecord[]> {
  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }
      if (options?.search && options.search.trim()) {
        const s = `%${options.search.trim()}%`;
        query = query.or(
          `quotation_ref.ilike.${s},company_name.ilike.${s},project_title.ilike.${s},contact_name.ilike.${s}`
        );
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as QuotationRecord[];
      }
    } catch (e) {
      console.warn("[quotations-service] Supabase query fallback to in-memory:", e);
    }
  }

  // Fallback to in-memory
  let result = [...inMemoryQuotations];
  if (options?.status && options.status !== "all") {
    result = result.filter((q) => q.status === options.status);
  }
  if (options?.search && options.search.trim()) {
    const qLower = options.search.trim().toLowerCase();
    result = result.filter(
      (q) =>
        q.quotation_ref.toLowerCase().includes(qLower) ||
        q.company_name.toLowerCase().includes(qLower) ||
        q.project_title.toLowerCase().includes(qLower) ||
        q.recipient_name.toLowerCase().includes(qLower)
    );
  }
  return result;
}

/**
 * Gets quotation details by ID including line items, version snapshots, and audit log
 */
export async function getQuotationById(id: string): Promise<QuotationDetailsResponse | null> {
  let quote: QuotationRecord | null = null;
  let lines: QuotationLineItem[] = [];
  let versions: QuotationVersion[] = [];
  let auditLogs: any[] = [];
  let acceptance: any = null;

  if (isAdminClientConfigured()) {
    try {
      const { data: qData, error: qErr } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!qErr && qData) {
        quote = qData as QuotationRecord;

        const { data: lData } = await supabaseAdmin
          .from("quotation_line_items")
          .select("*")
          .eq("quotation_id", id)
          .order("sort_order", { ascending: true });
        if (lData) lines = lData as QuotationLineItem[];

        const { data: vData } = await supabaseAdmin
          .from("quotation_versions")
          .select("*")
          .eq("quotation_id", id)
          .order("version_number", { ascending: false });
        if (vData) versions = vData as QuotationVersion[];

        const { data: aData } = await supabaseAdmin
          .from("quotation_audit_logs")
          .select("*")
          .eq("quotation_id", id)
          .order("created_at", { ascending: false });
        if (aData) auditLogs = aData;

        const { data: accData } = await supabaseAdmin
          .from("quotation_acceptances")
          .select("*")
          .eq("quotation_id", id)
          .maybeSingle();
        if (accData) acceptance = accData;
      }
    } catch (e) {
      console.warn("[quotations-service] Supabase lookup error:", e);
    }
  }

  if (!quote) {
    quote = inMemoryQuotations.find((q) => q.id === id) || null;
    if (quote) {
      lines = inMemoryLines[id] || [];
      versions = inMemoryVersions[id] || [];
      auditLogs = inMemoryAuditLogs[id] || [];
    }
  }

  if (!quote) return null;

  return {
    quotation: quote,
    lines,
    versions,
    auditLogs,
    acceptance,
  };
}

/**
 * Gets client-safe projection of quotation by secure token.
 * Rejects draft, technical_draft, pending_commercial_approval, revoked, expired, or superseded tokens.
 */
export async function getQuotationByToken(secureToken: string): Promise<PublicQuotationProjection | null> {
  let quote: QuotationRecord | null = null;
  let lines: QuotationLineItem[] = [];

  if (isAdminClientConfigured()) {
    try {
      const { data: qData } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("secure_token", secureToken)
        .maybeSingle();

      if (qData) {
        quote = qData as QuotationRecord;
        const { data: lData } = await supabaseAdmin
          .from("quotation_line_items")
          .select("*")
          .eq("quotation_id", quote.id)
          .eq("is_selected", true)
          .order("sort_order", { ascending: true });
        if (lData) lines = lData as QuotationLineItem[];
      }
    } catch (e) {
      console.warn("[quotations-service] Token lookup error:", e);
    }
  }

  if (!quote) {
    quote = inMemoryQuotations.find((q) => q.secure_token === secureToken) || null;
    if (quote) {
      lines = (inMemoryLines[quote.id] || []).filter((l) => l.is_selected);
    }
  }

  if (!quote) return null;

  // Reject unpublished, revoked, expired, or superseded tokens
  const allowedPublicStatuses: QuotationStatus[] = [
    "published",
    "accepted",
    "changes_requested",
  ];
  if (!allowedPublicStatuses.includes(quote.status)) {
    return null;
  }

  if (quote.valid_until) {
    const expiryMs = new Date(quote.valid_until).getTime();
    if (!Number.isNaN(expiryMs) && expiryMs < Date.now() && quote.status !== "accepted") {
      return null;
    }
  }

  // Strict projection: excludes unselected and unpriced lines, strips internal notes
  return projectPublicQuotation(quote, lines);
}

/**
 * Creates a new Quotation
 */
export async function createQuotation(
  input: CreateQuotationInput,
  actorEmail?: string
): Promise<{ ok: boolean; quotation?: QuotationRecord; error?: string }> {
  try {
    const quoteId = crypto.randomUUID();
    const quotationRef = generateQuotationRef();
    const secureToken = generateSecureToken();
    const tokenHash = crypto.createHash("sha256").update(secureToken).digest("hex");
    const validityDays = input.validityDays || 14;
    const validUntil = new Date(Date.now() + validityDays * 86400000).toISOString();
    const issuedAt = new Date().toISOString();

    // Map input lines to typed QuotationLineItems
    const mappedLines: QuotationLineItem[] = input.lines.map((l, idx) => {
      const catalogItem = CANONICAL_SERVICES_CATALOG.find(
        (c) => c.service_code === l.serviceCode
      );

      const unitPricePaise =
        l.unitPricePaise !== undefined && l.unitPricePaise !== null
          ? l.unitPricePaise
          : l.unitPriceRupees !== undefined && l.unitPriceRupees !== null
          ? Math.round(l.unitPriceRupees * 100)
          : null;

      const isIncluded = l.isIncludedNoCharge === true;
      const extendedAmount = calculateLineTotal(unitPricePaise, l.quantity, isIncluded);

      return {
        id: crypto.randomUUID(),
        quotation_id: quoteId,
        service_code: l.serviceCode,
        category_code: catalogItem?.category_code,
        category_name: catalogItem?.category_name,
        title: l.title || catalogItem?.title || l.serviceCode,
        scope_summary: l.scopeSummary || catalogItem?.scope_description || "",
        deliverables: l.deliverables || (catalogItem?.deliverables ? [...catalogItem.deliverables] : []),
        unit: l.unit || catalogItem?.unit || "project",
        quantity: Math.max(1, l.quantity || 1),
        quoted_unit_price_paise: unitPricePaise,
        extended_amount_paise: extendedAmount,
        included_at_no_additional_charge: isIncluded,
        inclusion_rationale: l.chargeWaiverReason || null,
        is_selected: l.isSelected,
        sort_order: idx + 1,
      };
    });

    const manualDiscount = input.manualDiscountPaise || (input.manualDiscountRupees ? Math.round(input.manualDiscountRupees * 100) : 0);

    // Calculate quotation financials
    const calc = calculateQuotation(
      mappedLines,
      null,
      manualDiscount,
      0,
      {
        project_title: input.projectTitle,
        recipient_email: input.contactEmail,
        company_name: input.companyName,
        recipient_name: input.contactName,
      }
    );

    const shouldPublish = input.publishImmediately === true || (input.publishImmediately !== false && calc.isValidForPublish);
    if (input.publishImmediately === true && !calc.isValidForPublish) {
      return {
        ok: false,
        error: `Quotation is not ready for publishing: ${calc.validationErrors.join("; ")}`,
      };
    }

    const status: QuotationStatus = shouldPublish ? "published" : "draft";

    const record: QuotationRecord = {
      id: quoteId,
      quotation_ref: quotationRef,
      client_id: input.clientId || null,
      company_name: input.companyName.trim(),
      recipient_name: input.contactName.trim(),
      recipient_email: input.contactEmail.trim().toLowerCase(),
      recipient_phone: input.contactPhone || null,
      billing_address: input.billingAddress || null,
      city_state_pin: input.cityStatePin || null,
      project_title: input.projectTitle.trim(),
      project_brief: input.projectBrief || null,
      timeline_estimate: input.timelineEstimate || "2 to 4 weeks",
      currency: "INR",
      status,
      delivery_state: "not_sent",
      subtotal_paise: calc.subtotalPaise,
      discount_paise: calc.discountPaise,
      discount_label: calc.discountPaise > 0 ? `Founder Courtesy (${formatPaiseToINR(calc.discountPaise)})` : null,
      tax_paise: calc.taxPaise,
      tax_label: "GST Exempt / Composition",
      total_payable_paise: calc.totalPayablePaise,
      milestone_1_paise: calc.milestone1Paise,
      milestone_2_paise: calc.milestone2Paise,
      terms: STANDARD_QUOTATION_TERMS,
      internal_notes: input.internalNotes || null,
      secure_token: secureToken,
      secure_token_hash: tokenHash,
      valid_until: validUntil,
      issued_at: issuedAt,
      accepted_at: null,
      version_number: 1,
      latest_version_id: crypto.randomUUID(),
      created_by: null,
      approved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt database persistence
    if (isAdminClientConfigured()) {
      try {
        const { error: quoteInsertErr } = await supabaseAdmin.from("quotations").insert({
          id: record.id,
          quotation_ref: record.quotation_ref,
          company_name: record.company_name,
          contact_name: record.recipient_name,
          contact_email: record.recipient_email,
          contact_phone: record.recipient_phone,
          project_title: record.project_title,
          project_brief: record.project_brief,
          timeline_estimate: record.timeline_estimate,
          status: record.status,
          delivery_state: record.delivery_state,
          subtotal_paise: record.subtotal_paise,
          discount_paise: record.discount_paise,
          discount_label: record.discount_label,
          total_payable_paise: record.total_payable_paise,
          milestone1_paise: record.milestone_1_paise,
          milestone2_paise: record.milestone_2_paise,
          currency: record.currency,
          secure_token: record.secure_token,
          token_hash: record.secure_token_hash,
          valid_until: record.valid_until,
          internal_notes: record.internal_notes,
          latest_version_number: 1,
        });

        if (quoteInsertErr) {
          console.error("[quotations-service] DB write error inserting quotation:", quoteInsertErr);
          return { ok: false, error: `Failed to persist quotation: ${quoteInsertErr.message}` };
        }

        // Insert lines
        for (const line of mappedLines) {
          const { error: lineInsertErr } = await supabaseAdmin.from("quotation_line_items").insert({
            id: line.id,
            quotation_id: record.id,
            service_code: line.service_code,
            category_code: line.category_code || "B",
            category_name: line.category_name || "Frontend",
            title: line.title,
            public_scope: line.scope_summary,
            deliverables: line.deliverables || [],
            unit: line.unit,
            quantity: line.quantity,
            quoted_unit_price_paise: line.quoted_unit_price_paise,
            extended_amount_paise: line.extended_amount_paise,
            included_at_no_additional_charge: line.included_at_no_additional_charge,
            charge_waiver_reason: line.inclusion_rationale,
            is_selected: line.is_selected,
            sort_order: line.sort_order,
          });
          if (lineInsertErr) {
            console.error("[quotations-service] DB line item error:", lineInsertErr);
          }
        }

        // Insert audit log
        await supabaseAdmin.from("quotation_audit_logs").insert({
          quotation_id: record.id,
          action: shouldPublish ? "quotation_created_and_published" : "quotation_created_draft",
          actor_email: actorEmail || "admin@logicintelligencetechnologies.in",
          details: {
            ref: record.quotation_ref,
            total_payable_paise: record.total_payable_paise,
            lines_count: mappedLines.length,
          },
        });
      } catch (dbErr: any) {
        console.error("[quotations-service] DB write error:", dbErr);
        return { ok: false, error: `Database error: ${dbErr?.message || "Unknown error"}` };
      }
    }

    // Persist in-memory
    inMemoryQuotations.unshift(record);
    inMemoryLines[record.id] = mappedLines;
    inMemoryAuditLogs[record.id] = [
      {
        id: "log-" + crypto.randomBytes(6).toString("hex"),
        quotation_id: record.id,
        action: shouldPublish ? "quotation_created_and_published" : "quotation_created_draft",
        actor_email: actorEmail || "admin@logicintelligencetechnologies.in",
        details: {
          ref: record.quotation_ref,
          total_payable_paise: record.total_payable_paise,
          lines_count: mappedLines.length,
        },
        created_at: new Date().toISOString(),
      },
    ];

    // Automatically send branded quotation email if published immediately
    if (shouldPublish && record.recipient_email) {
      try {
        const selectedCount = mappedLines.filter((l) => l.is_selected).length;
        const emailResult = await sendQuotationEmail({
          quotation: record,
          recipientEmail: record.recipient_email,
          selectedServicesCount: selectedCount,
        });
        if (emailResult.success) {
          record.delivery_state = "email_sent";
          if (isAdminClientConfigured()) {
            await supabaseAdmin
              .from("quotations")
              .update({ delivery_state: "email_sent" })
              .eq("id", record.id);
          }
        }
      } catch (mailErr) {
        console.warn("[quotations-service] Auto email dispatch error upon create & publish:", mailErr);
      }
    }

    return { ok: true, quotation: record };
  } catch (err: any) {
    console.error("[quotations-service] Error creating quotation:", err);
    return { ok: false, error: err.message || "Failed to create quotation" };
  }
}

/**
 * Duplicates a quotation as a new draft
 */
export async function duplicateQuotation(id: string, actorEmail?: string): Promise<{ ok: boolean; newId?: string; error?: string }> {
  const existing = await getQuotationById(id);
  if (!existing) return { ok: false, error: "Quotation not found" };

  const input: CreateQuotationInput = {
    companyName: `${existing.quotation.company_name} (Copy)`,
    contactName: existing.quotation.recipient_name,
    contactEmail: existing.quotation.recipient_email,
    contactPhone: existing.quotation.recipient_phone,
    billingAddress: existing.quotation.billing_address as string,
    cityStatePin: existing.quotation.city_state_pin,
    projectTitle: `${existing.quotation.project_title} (Copy)`,
    projectBrief: existing.quotation.project_brief,
    timelineEstimate: existing.quotation.timeline_estimate,
    lines: existing.lines.map((l) => ({
      serviceCode: l.service_code,
      title: l.title,
      scopeSummary: l.scope_summary,
      deliverables: l.deliverables,
      unit: l.unit,
      quantity: l.quantity,
      unitPricePaise: l.quoted_unit_price_paise,
      isIncludedNoCharge: l.included_at_no_additional_charge,
      chargeWaiverReason: l.inclusion_rationale,
      isSelected: l.is_selected,
    })),
    manualDiscountPaise: existing.quotation.discount_paise,
    internalNotes: `Duplicated from ${existing.quotation.quotation_ref}`,
    publishImmediately: false,
  };

  const res = await createQuotation(input, actorEmail);
  if (!res.ok || !res.quotation) return { ok: false, error: res.error };

  return { ok: true, newId: res.quotation.id };
}

/**
 * Publishes a draft quotation after invariant validation
 */
export async function publishQuotation(id: string, actorEmail?: string): Promise<{ ok: boolean; error?: string; quotation?: QuotationRecord }> {
  const existing = await getQuotationById(id);
  if (!existing) return { ok: false, error: "Quotation not found" };

  const validation = calculateQuotation(existing.lines, null, existing.quotation.discount_paise, 0, {
    project_title: existing.quotation.project_title,
    recipient_email: existing.quotation.recipient_email,
    company_name: existing.quotation.company_name,
  });

  if (!validation.isValidForPublish) {
    return {
      ok: false,
      error: `Validation failed: ${validation.validationErrors.join("; ")}`,
    };
  }

  const versionNum = (existing.quotation.version_number || 1) + (existing.quotation.status === "draft" ? 0 : 1);
  const versionHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ id, lines: existing.lines, total: validation.totalPayablePaise }))
    .digest("hex");

  existing.quotation.status = "published";
  existing.quotation.version_number = versionNum;
  existing.quotation.issued_at = new Date().toISOString();
  existing.quotation.updated_at = new Date().toISOString();

  // Version snapshot
  const snapshot: QuotationVersion = {
    id: `ver-${id}-${versionNum}`,
    quotation_id: id,
    version_number: versionNum,
    version_hash: versionHash,
    status: "published",
    subtotal_paise: validation.subtotalPaise,
    discount_paise: validation.discountPaise,
    discount_label: existing.quotation.discount_label,
    tax_paise: validation.taxPaise,
    tax_label: existing.quotation.tax_label,
    total_payable_paise: validation.totalPayablePaise,
    milestone_1_paise: validation.milestone1Paise,
    milestone_2_paise: validation.milestone2Paise,
    lines_snapshot: [...existing.lines],
    terms: STANDARD_QUOTATION_TERMS,
    created_at: new Date().toISOString(),
  };

  if (!inMemoryVersions[id]) inMemoryVersions[id] = [];
  inMemoryVersions[id].unshift(snapshot);

  const logEntry = {
    id: "log-" + crypto.randomBytes(6).toString("hex"),
    quotation_id: id,
    action: "quotation_published",
    actor_email: actorEmail || "admin@logicintelligencetechnologies.in",
    details: {
      version: versionNum,
      total_payable_paise: validation.totalPayablePaise,
      version_hash: versionHash,
    },
    created_at: new Date().toISOString(),
  };

  if (!inMemoryAuditLogs[id]) inMemoryAuditLogs[id] = [];
  inMemoryAuditLogs[id].unshift(logEntry);

  if (isAdminClientConfigured()) {
    try {
      await supabaseAdmin
        .from("quotations")
        .update({
          status: "published",
          version_number: versionNum,
          issued_at: existing.quotation.issued_at,
          updated_at: existing.quotation.updated_at,
        })
        .eq("id", id);

      await supabaseAdmin.from("quotation_audit_logs").insert({
        quotation_id: id,
        action: "quotation_published",
        actor_email: actorEmail || "admin@logicintelligencetechnologies.in",
        details: logEntry.details,
      });
    } catch (e) {
      console.warn("[quotations-service] DB publish sync error:", e);
    }
  }

  return { ok: true, quotation: existing.quotation };
}

/**
 * Accepts a quotation digitally
 */
export async function acceptQuotation(
  token: string,
  signer: {
    fullName: string;
    designation?: string;
    email: string;
    consentChecked: boolean;
    ipAddress?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!signer.consentChecked) {
    return { ok: false, error: "Legal consent and confirmation checkbox is required" };
  }
  if (!signer.fullName.trim() || !signer.email.trim()) {
    return { ok: false, error: "Signer name and email are required" };
  }

  let quote = inMemoryQuotations.find((q) => q.secure_token === token);
  if (!quote && isAdminClientConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("secure_token", token)
        .maybeSingle();
      if (data) quote = data as QuotationRecord;
    } catch (e) {
      console.warn("[quotations-service] Supabase quote lookup failed:", e);
    }
  }
  if (!quote) return { ok: false, error: "Quotation not found" };

  if (quote.status === "accepted") {
    return { ok: true }; // already accepted
  }

  quote.status = "accepted";
  quote.accepted_at = new Date().toISOString();
  quote.updated_at = new Date().toISOString();

  const auditEntry = {
    id: "log-" + crypto.randomBytes(6).toString("hex"),
    quotation_id: quote.id,
    action: "quotation_accepted_by_client",
    actor_email: signer.email,
    details: {
      signer_name: signer.fullName,
      signer_title: signer.designation,
      accepted_total_paise: quote.total_payable_paise,
      ip: signer.ipAddress || "client-web",
    },
    created_at: new Date().toISOString(),
  };

  if (!inMemoryAuditLogs[quote.id]) inMemoryAuditLogs[quote.id] = [];
  inMemoryAuditLogs[quote.id].unshift(auditEntry);

  if (isAdminClientConfigured()) {
    try {
      await supabaseAdmin
        .from("quotations")
        .update({
          status: "accepted",
          accepted_at: quote.accepted_at,
          updated_at: quote.updated_at,
        })
        .eq("id", quote.id);

      await supabaseAdmin.from("quotation_acceptances").insert({
        quotation_id: quote.id,
        signer_name: signer.fullName,
        signer_email: signer.email,
        signer_title: signer.designation || null,
        accepted_total_paise: quote.total_payable_paise,
        ip_address: signer.ipAddress || null,
      });

      await supabaseAdmin.from("quotation_audit_logs").insert({
        quotation_id: quote.id,
        action: auditEntry.action,
        actor_email: signer.email,
        details: auditEntry.details,
      });
    } catch (e) {
      console.warn("[quotations-service] DB accept sync error:", e);
    }
  }

  return { ok: true };
}

/**
 * Requests revisions from client portal
 */
export async function requestQuotationRevision(
  token: string,
  request: {
    name: string;
    email: string;
    feedbackNotes: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!request.feedbackNotes.trim()) {
    return { ok: false, error: "Revision feedback notes cannot be blank" };
  }

  let quote = inMemoryQuotations.find((q) => q.secure_token === token);
  if (!quote && isAdminClientConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from("quotations")
        .select("*")
        .eq("secure_token", token)
        .maybeSingle();
      if (data) quote = data as QuotationRecord;
    } catch (e) {
      console.warn("[quotations-service] Supabase quote lookup failed:", e);
    }
  }
  if (!quote) return { ok: false, error: "Quotation not found" };

  quote.status = "changes_requested";
  quote.updated_at = new Date().toISOString();

  const logEntry = {
    id: "log-" + crypto.randomBytes(6).toString("hex"),
    quotation_id: quote.id,
    action: "client_requested_revisions",
    actor_email: request.email,
    details: {
      requester_name: request.name,
      notes: request.feedbackNotes,
    },
    created_at: new Date().toISOString(),
  };

  if (!inMemoryAuditLogs[quote.id]) inMemoryAuditLogs[quote.id] = [];
  inMemoryAuditLogs[quote.id].unshift(logEntry);

  if (isAdminClientConfigured()) {
    try {
      await supabaseAdmin
        .from("quotations")
        .update({
          status: "changes_requested",
          updated_at: quote.updated_at,
        })
        .eq("id", quote.id);

      await supabaseAdmin.from("quotation_revision_requests").insert({
        quotation_id: quote.id,
        requester_name: request.name,
        requester_email: request.email,
        notes: request.feedbackNotes,
      });

      await supabaseAdmin.from("quotation_audit_logs").insert({
        quotation_id: quote.id,
        action: logEntry.action,
        actor_email: request.email,
        details: logEntry.details,
      });
    } catch (e) {
      console.warn("[quotations-service] DB revision sync error:", e);
    }
  }

  return { ok: true };
}

/**
 * Lists all coupons
 */
export async function listCoupons(): Promise<QuotationCoupon[]> {
  if (isAdminClientConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("quotation_coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as QuotationCoupon[];
      }
    } catch (e) {
      console.warn("[quotations-service] Coupon list DB fallback:", e);
    }
  }
  return inMemoryCoupons;
}

/**
 * Toggles coupon active status (with optional Super Admin discount configuration)
 */
export async function toggleCoupon(
  id: string,
  isActive: boolean,
  config?: {
    discount_type?: "percentage" | "fixed_paise";
    discount_value?: number;
    max_discount_paise?: number | null;
    min_subtotal_paise?: number | null;
    approved_by?: string | null;
  }
): Promise<{ ok: boolean; error?: string; coupon?: QuotationCoupon }> {
  const coupon = inMemoryCoupons.find((c) => c.id === id || c.code.toUpperCase() === id.toUpperCase());

  if (coupon && config) {
    if (config.discount_type) {
      coupon.discount_type = config.discount_type;
      if (config.discount_type === "percentage" && typeof config.discount_value === "number") {
        coupon.discount_percentage = config.discount_value;
        coupon.discount_paise = null;
      } else if (config.discount_type === "fixed_paise" && typeof config.discount_value === "number") {
        coupon.discount_paise = config.discount_value;
        coupon.discount_percentage = null;
      }
    }
    if (config.max_discount_paise !== undefined) coupon.max_discount_paise = config.max_discount_paise;
    if (config.min_subtotal_paise !== undefined) coupon.min_subtotal_paise = config.min_subtotal_paise;
    if (config.approved_by) coupon.approved_by = config.approved_by;
  }

  if (isActive && coupon) {
    const hasConfiguredDiscount =
      (coupon.discount_type === "percentage" &&
        typeof coupon.discount_percentage === "number" &&
        coupon.discount_percentage > 0) ||
      (coupon.discount_type === "fixed_paise" &&
        typeof coupon.discount_paise === "number" &&
        coupon.discount_paise > 0);
    if (!hasConfiguredDiscount) {
      return {
        ok: false,
        error: `Cannot activate coupon '${coupon.code}' until Super Admin configures discount_type and a positive discount value.`,
      };
    }
  }

  if (coupon) coupon.is_active = isActive;

  if (isAdminClientConfigured()) {
    try {
      const updatePayload: Record<string, unknown> = { is_active: isActive };
      if (config?.discount_type) {
        updatePayload.discount_type = config.discount_type;
        if (config.discount_type === "percentage" && typeof config.discount_value === "number") {
          updatePayload.discount_percentage = config.discount_value;
          updatePayload.discount_paise = null;
        } else if (config.discount_type === "fixed_paise" && typeof config.discount_value === "number") {
          updatePayload.discount_paise = config.discount_value;
          updatePayload.discount_percentage = null;
        }
      }
      if (config?.max_discount_paise !== undefined) updatePayload.max_discount_paise = config.max_discount_paise;
      if (config?.min_subtotal_paise !== undefined) updatePayload.min_subtotal_paise = config.min_subtotal_paise;
      if (config?.approved_by) updatePayload.approved_by = config.approved_by;

      await supabaseAdmin
        .from("quotation_coupons")
        .update(updatePayload)
        .eq("id", id);
    } catch (e) {
      console.warn("[quotations-service] Toggle coupon DB error:", e);
    }
  }
  return { ok: true, coupon };
}

/**
 * Creates a new coupon
 */
export async function createCoupon(couponData: {
  code: string;
  campaign_name: string;
  description?: string;
  discount_type: "percentage" | "fixed_paise";
  discount_value: number; // percentage or paise
  min_subtotal_paise?: number;
  max_discount_paise?: number;
  max_redemptions?: number;
  is_active?: boolean;
}): Promise<{ ok: boolean; coupon?: QuotationCoupon; error?: string }> {
  const code = couponData.code.trim().toUpperCase();
  if (inMemoryCoupons.some((c) => c.code === code)) {
    return { ok: false, error: `Coupon code '${code}' already exists` };
  }

  const newCoupon: QuotationCoupon = {
    id: "coupon-" + crypto.randomBytes(6).toString("hex"),
    code,
    campaign_name: couponData.campaign_name.trim(),
    description: couponData.description || null,
    discount_type: couponData.discount_type,
    discount_percentage: couponData.discount_type === "percentage" ? couponData.discount_value : null,
    discount_paise: couponData.discount_type === "fixed_paise" ? couponData.discount_value : null,
    min_subtotal_paise: couponData.min_subtotal_paise || 0,
    max_discount_paise: couponData.max_discount_paise || null,
    is_active: couponData.is_active ?? false,
    can_stack: false,
    max_redemptions: couponData.max_redemptions || 100,
    current_redemptions: 0,
    created_at: new Date().toISOString(),
  };

  inMemoryCoupons.unshift(newCoupon);

  if (isAdminClientConfigured()) {
    try {
      await supabaseAdmin.from("quotation_coupons").insert({
        code: newCoupon.code,
        campaign_name: newCoupon.campaign_name,
        description: newCoupon.description,
        discount_type: newCoupon.discount_type,
        discount_value: couponData.discount_value,
        min_subtotal_paise: newCoupon.min_subtotal_paise,
        max_discount_paise: newCoupon.max_discount_paise,
        is_active: newCoupon.is_active,
        max_redemptions: newCoupon.max_redemptions,
      });
    } catch (e) {
      console.warn("[quotations-service] DB coupon insert error:", e);
    }
  }

  return { ok: true, coupon: newCoupon };
}

/**
 * Look up coupon by code (case-insensitive)
 */
export async function getCouponByCode(code: string): Promise<QuotationCoupon | null> {
  const norm = code.trim().toUpperCase();
  if (isAdminClientConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from("quotation_coupons")
        .select("*")
        .ilike("code", norm)
        .maybeSingle();
      if (data) return data as QuotationCoupon;
    } catch (e) {
      console.warn("[quotations-service] Coupon code lookup fallback:", e);
    }
  }
  return inMemoryCoupons.find((c) => c.code.toUpperCase() === norm) || null;
}

/**
 * Validates a coupon code against a quotation, calculating discount and milestones
 */
export async function validateQuotationCoupon(
  secureToken: string,
  couponCode: string
): Promise<{
  valid: boolean;
  statusCode?: number;
  error?: string;
  discountPaise?: number;
  label?: string;
  newTotalPaise?: number;
  milestone1Paise?: number;
  milestone2Paise?: number;
}> {
  const quoteProj = await getQuotationByToken(secureToken);
  if (!quoteProj) {
    return { valid: false, statusCode: 404, error: "Quotation not found" };
  }

  const coupon = await getCouponByCode(couponCode);
  if (!coupon) {
    return { valid: false, statusCode: 400, error: `Coupon code '${couponCode}' is invalid` };
  }

  if (!coupon.is_active) {
    return {
      valid: false,
      statusCode: 422,
      error: `Coupon '${coupon.code}' is inactive or not currently available`,
    };
  }

  const hasValidDiscountConfig =
    (coupon.discount_type === "percentage" &&
      typeof coupon.discount_percentage === "number" &&
      coupon.discount_percentage > 0) ||
    (coupon.discount_type === "fixed_paise" &&
      typeof coupon.discount_paise === "number" &&
      coupon.discount_paise > 0);

  if (!hasValidDiscountConfig) {
    return {
      valid: false,
      statusCode: 422,
      error: `Coupon '${coupon.code}' has no approved discount configuration`,
    };
  }

  if (coupon.min_subtotal_paise && quoteProj.subtotal_paise < coupon.min_subtotal_paise) {
    return {
      valid: false,
      statusCode: 422,
      error: `Coupon requires minimum order value of ${formatPaiseToINR(coupon.min_subtotal_paise)}`,
    };
  }

  if (coupon.max_redemptions && coupon.current_redemptions >= coupon.max_redemptions) {
    return {
      valid: false,
      statusCode: 422,
      error: "Coupon maximum usage limit has been reached",
    };
  }

  const { discountPaise, label } = calculateDiscount(quoteProj.subtotal_paise, coupon, 0);
  const newTotal = Math.max(0, quoteProj.subtotal_paise - discountPaise);
  const { milestone1Paise, milestone2Paise } = calculateMilestones(newTotal);

  return {
    valid: true,
    statusCode: 200,
    discountPaise,
    label,
    newTotalPaise: newTotal,
    milestone1Paise,
    milestone2Paise,
  };
}

/**
 * Redacts all commercial/pricing fields from a QuotationRecord for non-super_admin staff.
 */
export function redactQuotationForStaff(quote: QuotationRecord): Omit<
  QuotationRecord,
  | "subtotal_paise"
  | "discount_paise"
  | "discount_label"
  | "tax_paise"
  | "total_payable_paise"
  | "milestone_1_paise"
  | "milestone_2_paise"
  | "secure_token"
  | "secure_token_hash"
> {
  const {
    subtotal_paise: _subtotal,
    discount_paise: _discount,
    discount_label: _discountLabel,
    tax_paise: _tax,
    total_payable_paise: _total,
    milestone_1_paise: _m1,
    milestone_2_paise: _m2,
    secure_token: _tok,
    secure_token_hash: _tokHash,
    ...technicalFields
  } = quote;
  return technicalFields;
}

/**
 * Redacts all commercial/pricing fields from a QuotationDetailsResponse for non-super_admin staff.
 */
export function redactQuotationDetailsForStaff(details: QuotationDetailsResponse) {
  return {
    quotation: redactQuotationForStaff(details.quotation),
    lines: details.lines.map((line) => {
      const {
        quoted_unit_price_paise: _unitPrice,
        extended_amount_paise: _ext,
        ...techLine
      } = line;
      return techLine;
    }),
    versions: details.versions.map((ver) => {
      const {
        subtotal_paise: _s,
        discount_paise: _d,
        discount_label: _dl,
        tax_paise: _t,
        total_payable_paise: _tot,
        milestone_1_paise: _m1,
        milestone_2_paise: _m2,
        lines_snapshot: _ls,
        ...techVer
      } = ver;
      return techVer;
    }),
    auditLogs: details.auditLogs.map((log) => {
      const safeDetails = { ...log.details };
      delete safeDetails.total_payable_paise;
      delete safeDetails.accepted_total_paise;
      delete safeDetails.subtotal_paise;
      delete safeDetails.discount_paise;
      return { ...log, details: safeDetails };
    }),
    acceptance: details.acceptance,
  };
}


