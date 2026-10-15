import { QuotationRecord, QuotationLineItem } from "@/types/quotations";
import { STANDARD_QUOTATION_TERMS } from "@/lib/quotations/pricing";

export const CANONICAL_SEED_QUOTATIONS: QuotationRecord[] = [
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
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
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
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
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
    id: "42ad4591-439a-4655-8d40-e9b4d66f36da",
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
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
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

export const CANONICAL_SEED_LINES: Record<string, QuotationLineItem[]> = {
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
  "e1c6f44d-e500-47b5-bc17-6b01888978a6": [
    {
      id: "line-001",
      quotation_id: "e1c6f44d-e500-47b5-bc17-6b01888978a6",
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
      quotation_id: "e1c6f44d-e500-47b5-bc17-6b01888978a6",
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
  "73246eff-4346-4e93-a491-3e1724707c0b": [
    {
      id: "line-003",
      quotation_id: "73246eff-4346-4e93-a491-3e1724707c0b",
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
      quotation_id: "73246eff-4346-4e93-a491-3e1724707c0b",
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
  "42ad4591-439a-4655-8d40-e9b4d66f36da": [
    {
      id: "line-005",
      quotation_id: "42ad4591-439a-4655-8d40-e9b4d66f36da",
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
      quotation_id: "42ad4591-439a-4655-8d40-e9b4d66f36da",
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

export function findSeedQuotation(tokenOrId: string): QuotationRecord | null {
  if (!tokenOrId) return null;
  const clean = tokenOrId.trim();

  // Exact token match
  const byToken = CANONICAL_SEED_QUOTATIONS.find((q) => q.secure_token === clean);
  if (byToken) return byToken;

  // Exact ID or Ref match
  const byIdOrRef = CANONICAL_SEED_QUOTATIONS.find(
    (q) => q.id === clean || q.quotation_ref === clean
  );
  if (byIdOrRef) return byIdOrRef;

  // Aliases for Kovai Agro Mills
  if (
    clean === "qt-kovai-tok-77c3" ||
    clean === "kovai" ||
    clean === "qt-sample-003" ||
    clean === "LIT-QT-2026-0003"
  ) {
    return (
      CANONICAL_SEED_QUOTATIONS.find((q) => q.secure_token === "qt-kovai-tok-77c3") || null
    );
  }

  // Aliases for Apex Global Health
  if (
    clean === "qt-apex-tok-99a1" ||
    clean === "apex" ||
    clean === "qt-sample-001" ||
    clean === "LIT-QT-2026-0001" ||
    clean === "sample" ||
    clean === "test"
  ) {
    return (
      CANONICAL_SEED_QUOTATIONS.find((q) => q.secure_token === "qt-apex-tok-99a1") || null
    );
  }

  // Aliases for FinPulse
  if (
    clean === "qt-finpulse-tok-88b2" ||
    clean === "finpulse" ||
    clean === "qt-sample-002" ||
    clean === "LIT-QT-2026-0002"
  ) {
    return (
      CANONICAL_SEED_QUOTATIONS.find((q) => q.secure_token === "qt-finpulse-tok-88b2") || null
    );
  }

  return null;
}

export function findSeedLineItems(quotationIdOrToken: string): QuotationLineItem[] {
  if (!quotationIdOrToken) return [];
  const clean = quotationIdOrToken.trim();

  if (CANONICAL_SEED_LINES[clean]) {
    return CANONICAL_SEED_LINES[clean];
  }

  const quote = findSeedQuotation(clean);
  if (quote) {
    if (CANONICAL_SEED_LINES[quote.id]) {
      return CANONICAL_SEED_LINES[quote.id];
    }
    if (quote.secure_token && CANONICAL_SEED_LINES[quote.secure_token]) {
      return CANONICAL_SEED_LINES[quote.secure_token];
    }
  }

  return [];
}
