/**
 * Logic Intelligence Technologies - V6 Quotation System Type Definitions
 * 
 * Supports deterministic integer-paise calculations, dual 50/50 payment milestones,
 * coupon validation, immutable version snapshots, and strict client-safe projections.
 */

export type QuotationCategoryCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface QuotationCategory {
  code: QuotationCategoryCode;
  label: string;
  description: string;
  sort_order: number;
}

export type QuotationStatus =
  | 'draft'
  | 'awaiting_founder_review'
  | 'approved'
  | 'published'
  | 'changes_requested'
  | 'accepted'
  | 'revised'
  | 'expired'
  | 'revoked'
  | 'archived';

export type DeliveryState =
  | 'not_sent'
  | 'email_queued'
  | 'email_sent'
  | 'email_failed'
  | 'link_shared';

export type PricingType = 'fixed' | 'unit_based' | 'recurring' | 'pass_through';

export interface ServiceCatalogItem {
  id: string;
  service_code: string; // e.g. "FE-01", "DS-01"
  category_code: QuotationCategoryCode;
  category_name: string;
  title: string;
  scope_description: string;
  deliverables?: string[];
  unit: string; // "project", "page", "month", etc.
  pricing_type: PricingType;
  default_unit_price_paise: number | null; // 5000000 for FE-01, null for all other 76 services
  tax_classification?: string | null;
  is_active: boolean;
  sort_order: number;
  version: number;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationLineItem {
  id?: string;
  quotation_id?: string;
  version_id?: string;
  service_id?: string | null;
  service_code: string;
  category_code?: QuotationCategoryCode;
  category_name?: string;
  title: string;
  scope_summary: string;
  deliverables?: string[];
  unit: string;
  quantity: number;
  quoted_unit_price_paise: number | null; // null if unpriced in draft
  extended_amount_paise: number;
  included_at_no_additional_charge: boolean;
  inclusion_rationale?: string | null;
  is_selected: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationRecord {
  id: string;
  quotation_ref: string; // e.g. "LIT-QT-2026-0001"
  client_id?: string | null;
  engagement_id?: string | null;
  lead_id?: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string | null;
  company_name: string;
  billing_address?: string | string[] | null;
  city_state_pin?: string | null;
  project_title: string;
  project_brief?: string | null;
  timeline_estimate?: string | null;
  currency: string; // "INR"
  status: QuotationStatus;
  delivery_state: DeliveryState;
  subtotal_paise: number;
  discount_paise: number;
  discount_label?: string | null;
  tax_paise: number;
  tax_label?: string | null;
  total_payable_paise: number;
  milestone_1_paise: number;
  milestone_2_paise: number;
  terms?: string[] | null;
  internal_notes?: string | null;
  secure_token?: string | null;
  secure_token_hash?: string | null;
  valid_until?: string | null;
  issued_at?: string | null;
  accepted_at?: string | null;
  version_number: number;
  latest_version_id?: string | null;
  created_by?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationCoupon {
  id: string;
  code: string;
  campaign_id?: string | null;
  campaign_name?: string | null;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_paise';
  discount_percentage?: number | null; // e.g. 10 for 10%
  discount_paise?: number | null; // in paise
  max_discount_paise?: number | null; // in paise
  min_subtotal_paise?: number | null; // in paise
  allowed_client_ids?: string[] | null;
  starts_at?: string | null;
  expires_at?: string | null;
  max_redemptions?: number | null;
  current_redemptions: number;
  is_active: boolean;
  can_stack: boolean;
  approved_by?: string | null;
  created_at: string;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  quotation_id: string;
  version_id?: string | null;
  client_id?: string | null;
  redeemed_by?: string | null;
  discount_applied_paise: number;
  redeemed_at: string;
}

export interface QuotationAcceptanceConsent {
  exact_version: boolean;
  scope_and_pricing: boolean;
  two_milestones: boolean;
  authority_declaration: boolean;
}

export interface QuotationAcceptance {
  id: string;
  quotation_id: string;
  version_id: string;
  signer_name: string;
  signer_email: string;
  signer_title?: string | null;
  signer_company?: string | null;
  version_number: number;
  version_hash: string;
  accepted_total_paise: number;
  accepted_milestone_1_paise: number;
  accepted_milestone_2_paise: number;
  accepted_terms_hash?: string | null;
  consent_checkboxes: QuotationAcceptanceConsent;
  ip_address?: string | null;
  user_agent?: string | null;
  acceptance_ref: string;
  created_at: string;
}

export interface QuotationVersion {
  id: string;
  quotation_id: string;
  version_number: number;
  version_hash: string;
  status: QuotationStatus;
  subtotal_paise: number;
  discount_paise: number;
  discount_label?: string | null;
  tax_paise: number;
  tax_label?: string | null;
  total_payable_paise: number;
  milestone_1_paise: number;
  milestone_2_paise: number;
  lines_snapshot: QuotationLineItem[];
  terms?: string[] | null;
  pdf_path?: string | null;
  pdf_sha256?: string | null;
  created_by?: string | null;
  approved_by?: string | null;
  created_at: string;
}

/**
 * Client-safe projected line item
 */
export interface PublicQuotationLineItem {
  item_number: number;
  service_code: string;
  category_name: string;
  title: string;
  scope_summary: string;
  deliverables?: string[];
  unit: string;
  quantity: number;
  quoted_unit_price_paise: number;
  extended_amount_paise: number;
  included_at_no_additional_charge: boolean;
  inclusion_rationale?: string | null;
}

/**
 * Strict client-safe type containing ONLY selected & priced lines, calculated subtotal,
 * discounts, tax, two 50% milestones, terms, and NO unselected/unpriced catalog lines or internal notes.
 */
export interface PublicQuotationProjection {
  quotation_ref: string;
  version_number: number;
  project_title: string;
  project_brief?: string;
  timeline_estimate?: string;
  currency: string;
  date_issued: string;
  valid_until: string;
  status: QuotationStatus;
  issuer: {
    legal_name: string;
    msme_udyam: string;
    msme_category: string;
    registered_address: string;
    official_email: string;
    official_website: string;
    founder_signatory: string;
    gstin_notice: string;
  };
  client: {
    company_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    billing_address?: string | string[];
    city_state_pin?: string;
  };
  items: PublicQuotationLineItem[];
  subtotal_paise: number;
  discount_paise: number;
  discount_label?: string;
  tax_paise: number;
  tax_label?: string;
  total_payable_paise: number;
  milestone_1_paise: number;
  milestone_2_paise: number;
  milestone_1_description: string;
  milestone_2_description: string;
  terms: string[];
  version_hash?: string;
}

export interface QuotationCalculationResult {
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPayablePaise: number;
  milestone1Paise: number;
  milestone2Paise: number;
  roundingAdjustmentPaise: number;
  isValidForPublish: boolean;
  validationErrors: string[];
}

export interface QuotationLineItemInput {
  id?: string;
  quotation_id?: string;
  version_id?: string | null;
  service_id?: string | null;
  service_catalog_id?: string | null;
  service_code: string;
  category_code?: QuotationCategoryCode;
  category_name?: string;
  title: string;
  scope_summary?: string;
  public_scope?: string;
  deliverables?: string[];
  unit?: string;
  quantity?: number;
  quoted_unit_price_paise?: number | null;
  extended_amount_paise?: number;
  included_at_no_additional_charge?: boolean;
  inclusion_rationale?: string | null;
  charge_waiver_reason?: string | null;
  is_selected?: boolean;
  sort_order?: number;
}

export interface CreateQuotationDraftInput {
  client_id?: string | null;
  engagement_id?: string | null;
  lead_id?: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string | null;
  company_name: string;
  billing_address?: string | string[] | null;
  city_state_pin?: string | null;
  project_title: string;
  project_brief?: string | null;
  timeline_estimate?: string | null;
  currency?: string;
  internal_notes?: string | null;
  valid_until?: string | null;
  created_by?: string | null;
  line_items?: QuotationLineItemInput[];
}

export interface UpdateQuotationDraftInput {
  recipient_name?: string;
  recipient_email?: string;
  recipient_phone?: string | null;
  company_name?: string;
  billing_address?: string | string[] | null;
  city_state_pin?: string | null;
  project_title?: string;
  project_brief?: string | null;
  timeline_estimate?: string | null;
  currency?: string;
  internal_notes?: string | null;
  valid_until?: string | null;
  line_items?: QuotationLineItemInput[];
  discount_paise?: number;
  discount_label?: string | null;
  applied_coupon_code?: string | null;
  tax_mode?: string;
  tax_rate_bps?: number;
  tax_paise?: number;
}

export interface CreateCouponInput {
  code: string;
  campaign_name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_paise' | 'fixed_amount';
  discount_percentage?: number | null;
  discount_paise?: number | null;
  discount_value?: number;
  min_subtotal_paise?: number | null;
  max_discount_paise?: number | null;
  applies_to_categories?: string[];
  applies_to_services?: string[];
  allowed_client_ids?: string[] | null;
  max_redemptions?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  can_stack?: boolean;
  is_stackable?: boolean;
  created_by?: string | null;
  approved_by?: string | null;
}

export interface QuotationAuditLog {
  id: string;
  quotation_id: string;
  action: string;
  actor_id?: string | null;
  actor_email?: string | null;
  details: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

