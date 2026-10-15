import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  rupeesToPaise,
  paiseToRupees,
  formatPaiseToINR,
  calculateLineTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateMilestones,
  validatePublishReadiness,
  calculateQuotation,
  projectPublicQuotation,
  DEFAULT_LIT_ISSUER,
  STANDARD_QUOTATION_TERMS,
} from "../../src/lib/quotations/pricing";

import {
  SERVICE_CATALOG_ITEMS,
  QUOTATION_CATEGORIES,
} from "../../src/lib/quotations/catalog-seed-data";

import {
  QuotationLineItem,
  QuotationRecord,
  QuotationCoupon,
} from "../../src/types/quotations";

describe("V6 Quotation & Pricing Engine - Comprehensive Unit Tests", () => {
  describe("1. Canonical Service Catalog Seed Data Invariants", () => {
    it("contains exactly 77 technical services across 8 categories (A through H)", () => {
      assert.equal(
        SERVICE_CATALOG_ITEMS.length,
        77,
        "Catalog must contain exactly 77 canonical services"
      );
      assert.equal(
        QUOTATION_CATEGORIES.length,
        8,
        "Catalog must define exactly 8 categories (A through H)"
      );

      const categoryCodes = QUOTATION_CATEGORIES.map((c) => c.code);
      assert.deepEqual(
        categoryCodes,
        ["A", "B", "C", "D", "E", "F", "G", "H"],
        "Categories must span exactly A through H"
      );
    });

    it("verifies expected service count distribution per category", () => {
      const counts: Record<string, number> = {};
      for (const item of SERVICE_CATALOG_ITEMS) {
        counts[item.category_code] = (counts[item.category_code] || 0) + 1;
      }

      assert.equal(counts["A"], 8, "Category A must have 8 services (DS-01..08)");
      assert.equal(counts["B"], 12, "Category B must have 12 services (FE-01..12)");
      assert.equal(counts["C"], 12, "Category C must have 12 services (BE-01..12)");
      assert.equal(counts["D"], 8, "Category D must have 8 services (DB-01..08)");
      assert.equal(counts["E"], 8, "Category E must have 8 services (AI-01..08)");
      assert.equal(counts["F"], 10, "Category F must have 10 services (CL-01..10)");
      assert.equal(counts["G"], 11, "Category G must have 11 services (IN-01..11)");
      assert.equal(counts["H"], 8, "Category H must have 8 services (QA-01..08)");
    });

    it("enforces uniqueness of all service codes", () => {
      const codes = SERVICE_CATALOG_ITEMS.map((item) => item.service_code);
      const uniqueCodes = new Set(codes);
      assert.equal(
        uniqueCodes.size,
        77,
        "All 77 service codes must be strictly unique"
      );
    });

    it("enforces pricing invariant: only FE-01 has default price ₹50,000 (5,000,000 paise), 76 remaining are unpriced (null)", () => {
      const fe01 = SERVICE_CATALOG_ITEMS.find((item) => item.service_code === "FE-01");
      assert.ok(fe01, "FE-01 must exist in the catalog");
      assert.equal(
        fe01.default_unit_price_paise,
        5000000,
        "FE-01 must have default_unit_price_paise = 5000000 (₹50,000.00)"
      );

      const nonFe01Items = SERVICE_CATALOG_ITEMS.filter((item) => item.service_code !== "FE-01");
      assert.equal(nonFe01Items.length, 76, "There must be exactly 76 other services");

      for (const item of nonFe01Items) {
        assert.equal(
          item.default_unit_price_paise,
          null,
          `Service ${item.service_code} (${item.title}) must have default_unit_price_paise === null`
        );
      }
    });
  });

  describe("2. Monetary Unit Conversions & INR Formatting", () => {
    it("converts Rupees to integer Paise accurately", () => {
      assert.equal(rupeesToPaise(50000), 5000000);
      assert.equal(rupeesToPaise(50000.5), 5000050);
      assert.equal(rupeesToPaise(0.01), 1);
      assert.equal(rupeesToPaise(0), 0);
      assert.equal(rupeesToPaise(null), 0);
      assert.equal(rupeesToPaise(undefined), 0);
    });

    it("converts integer Paise to Rupees accurately", () => {
      assert.equal(paiseToRupees(5000000), 50000);
      assert.equal(paiseToRupees(5000050), 50000.5);
      assert.equal(paiseToRupees(1), 0.01);
      assert.equal(paiseToRupees(0), 0);
      assert.equal(paiseToRupees(null), 0);
    });

    it("formats integer Paise to standard INR currency strings", () => {
      assert.equal(formatPaiseToINR(5000000), "₹50,000.00");
      assert.equal(formatPaiseToINR(5000000, false), "₹50,000");
      assert.equal(formatPaiseToINR(5000001), "₹50,000.01");
      assert.equal(formatPaiseToINR(12500000), "₹1,25,000.00");
      assert.equal(formatPaiseToINR(0), "₹0.00");
      assert.equal(formatPaiseToINR(null), "₹0.00");
    });
  });

  describe("3. Line Total & Subtotal Calculations", () => {
    it("calculates line total for priced line items", () => {
      assert.equal(calculateLineTotal(5000000, 1, false), 5000000);
      assert.equal(calculateLineTotal(5000000, 3, false), 15000000);
    });

    it("returns 0 if line item is included at no additional charge", () => {
      assert.equal(calculateLineTotal(5000000, 2, true), 0);
      assert.equal(calculateLineTotal(null, 1, true), 0);
    });

    it("returns 0 if unit price is null or quantity is zero/negative", () => {
      assert.equal(calculateLineTotal(null, 1, false), 0);
      assert.equal(calculateLineTotal(5000000, 0, false), 0);
      assert.equal(calculateLineTotal(5000000, -1, false), 0);
    });

    it("calculates subtotal strictly from selected lines", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Frontend Engineering",
          scope_summary: "Next.js frontend",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          quotation_id: "q1",
          service_code: "BE-01",
          title: "Backend API",
          scope_summary: "Serverless endpoints",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: null,
          quoted_unit_price_paise: 3500000,
          extended_amount_paise: 3500000,
          is_selected: false, // NOT selected
          included_at_no_additional_charge: false,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          quotation_id: "q1",
          service_code: "QA-01",
          title: "End-to-End QA",
          scope_summary: "Automated testing",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: null,
          quoted_unit_price_paise: 1500000,
          extended_amount_paise: 0,
          is_selected: true,
          included_at_no_additional_charge: true, // Complementary
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const subtotal = calculateSubtotal(lines);
      // Line 1: 50,000. Line 2: unselected (0). Line 3: included (0).
      assert.equal(subtotal, 5000000, "Subtotal must be exactly 5,000,000 paise");
    });
  });

  describe("4. Dual 50/50 Milestones Allocation & Rounding Invariant", () => {
    it("allocates exactly 50% / 50% for even total amounts", () => {
      const total = 5000000; // ₹50,000.00
      const result = calculateMilestones(total);

      assert.equal(result.milestone1Paise, 2500000, "Milestone 1 must be ₹25,000.00 (2,500,000 paise)");
      assert.equal(result.milestone2Paise, 2500000, "Milestone 2 must be ₹25,000.00 (2,500,000 paise)");
      assert.equal(result.roundingAdjustmentPaise, 0);
      assert.equal(
        result.milestone1Paise + result.milestone2Paise,
        total,
        "Sum of milestones must equal total payable"
      );
    });

    it("handles odd paise totals with strict sum conservation (no fraction or lost paise)", () => {
      const oddTotal = 5000001; // ₹50,000.01
      const result = calculateMilestones(oddTotal);

      // Floor allocation:
      // milestone1 = floor(5000001 / 2) = 2500000
      // milestone2 = 5000001 - 2500000 = 2500001
      assert.equal(result.milestone1Paise, 2500000);
      assert.equal(result.milestone2Paise, 2500001);
      assert.equal(result.roundingAdjustmentPaise, 1);
      assert.equal(
        result.milestone1Paise + result.milestone2Paise,
        oddTotal,
        "Sum of milestones must strictly conserve odd paise total"
      );
    });

    it("handles zero total payable gracefully", () => {
      const result = calculateMilestones(0);
      assert.equal(result.milestone1Paise, 0);
      assert.equal(result.milestone2Paise, 0);
      assert.equal(result.roundingAdjustmentPaise, 0);
      assert.equal(result.milestone1Paise + result.milestone2Paise, 0);
    });
  });

  describe("5. Coupon & Manual Founder Discount Calculations", () => {
    it("calculates percentage discount accurately", () => {
      const coupon: QuotationCoupon = {
        code: "WELCOME10",
        discount_type: "percentage",
        discount_percentage: 10,
        is_active: true,
      };

      const { discountPaise, label } = calculateDiscount(5000000, coupon);
      assert.equal(discountPaise, 500000, "10% of 5,000,000 paise is 500,000 paise");
      assert.equal(label, "WELCOME10 (10%)");
    });

    it("caps percentage discount at max_discount_paise", () => {
      const coupon: QuotationCoupon = {
        code: "HALFMAX",
        discount_type: "percentage",
        discount_percentage: 50,
        max_discount_paise: 1000000, // Capped at ₹10,000
        is_active: true,
      };

      const { discountPaise } = calculateDiscount(5000000, coupon);
      // 50% of 5,000,000 is 2,500,000, but capped at 1,000,000
      assert.equal(discountPaise, 1000000);
    });

    it("ignores coupon if subtotal does not meet min_subtotal_paise", () => {
      const coupon: QuotationCoupon = {
        code: "BIGSPENDER",
        discount_type: "percentage",
        discount_percentage: 20,
        min_subtotal_paise: 10000000, // Requires ₹1,00,000
        is_active: true,
      };

      const { discountPaise, label } = calculateDiscount(5000000, coupon);
      assert.equal(discountPaise, 0);
      assert.equal(label, "No Discount");
    });

    it("calculates fixed paise coupon discount", () => {
      const coupon: QuotationCoupon = {
        code: "FLAT5000",
        discount_type: "fixed_paise",
        discount_paise: 500000, // ₹5,000
        is_active: true,
      };

      const { discountPaise } = calculateDiscount(5000000, coupon);
      assert.equal(discountPaise, 500000);
    });

    it("handles stacking and non-stacking coupons with manual discount", () => {
      const nonStackingCoupon: QuotationCoupon = {
        code: "PROMO2000",
        discount_type: "fixed_paise",
        discount_paise: 200000, // ₹2,000
        can_stack: false,
        is_active: true,
      };

      // Manual discount of ₹5,000 > coupon ₹2,000 -> selects higher (₹5,000)
      const res1 = calculateDiscount(5000000, nonStackingCoupon, 500000);
      assert.equal(res1.discountPaise, 500000);

      const stackingCoupon: QuotationCoupon = {
        code: "STACK1000",
        discount_type: "fixed_paise",
        discount_paise: 100000, // ₹1,000
        can_stack: true,
        is_active: true,
      };

      // Stacking coupon: ₹1,000 coupon + ₹2,000 manual = ₹3,000
      const res2 = calculateDiscount(5000000, stackingCoupon, 200000);
      assert.equal(res2.discountPaise, 300000);
    });

    it("ensures discount never exceeds subtotal", () => {
      const coupon: QuotationCoupon = {
        code: "OVERKILL",
        discount_type: "fixed_paise",
        discount_paise: 10000000, // ₹1,00,000
        is_active: true,
      };

      const { discountPaise } = calculateDiscount(5000000, coupon);
      assert.equal(discountPaise, 5000000, "Discount must be capped at subtotal (5,000,000 paise)");
    });
  });

  describe("6. Publish Readiness Validation & Invariant Enforcement", () => {
    it("fails validation if no lines are selected", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: false,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const validation = validatePublishReadiness(lines);
      assert.equal(validation.isValid, false);
      assert.ok(
        validation.errors.includes("At least one service line must be selected.")
      );
    });

    it("strictly blocks publish when a selected line is unpriced with exact error message", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          quotation_id: "q1",
          service_code: "AI-01",
          title: "AI Website Assistant & Customer Agent",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: null,
          quoted_unit_price_paise: null, // Unpriced!
          extended_amount_paise: 0,
          is_selected: true, // Selected!
          included_at_no_additional_charge: false,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const validation = validatePublishReadiness(lines);
      assert.equal(validation.isValid, false);
      const expectedError =
        "Line [AI Website Assistant & Customer Agent] is selected but unpriced. Enter an approved price or remove.";
      assert.ok(
        validation.errors.includes(expectedError),
        `Expected error "${expectedError}" in errors: ${JSON.stringify(validation.errors)}`
      );
    });

    it("permits publish when an unpriced line is unselected", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          quotation_id: "q1",
          service_code: "AI-01",
          title: "AI Website Assistant & Customer Agent",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: null,
          quoted_unit_price_paise: null, // Unpriced
          extended_amount_paise: 0,
          is_selected: false, // NOT selected, so it should NOT block
          included_at_no_additional_charge: false,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const validation = validatePublishReadiness(lines);
      assert.equal(validation.isValid, true);
      assert.equal(validation.errors.length, 0);
    });

    it("permits publish when an unpriced line is marked as included at no additional charge", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          quotation_id: "q1",
          service_code: "QA-01",
          title: "Comprehensive Cross-Browser QA",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: null,
          quoted_unit_price_paise: null,
          extended_amount_paise: 0,
          is_selected: true,
          included_at_no_additional_charge: true, // Marked as complementary
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const validation = validatePublishReadiness(lines);
      assert.equal(validation.isValid, true);
      assert.equal(validation.errors.length, 0);
    });

    it("validates quotation header fields when provided", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const invalidQuote: Partial<QuotationRecord> = {
        project_title: "",
        recipient_email: "",
        recipient_name: "",
        company_name: "",
      };

      const res = validatePublishReadiness(lines, invalidQuote);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.includes("Project title is required."));
      assert.ok(res.errors.includes("Recipient email is required."));
      assert.ok(res.errors.includes("Recipient name or company name is required."));
    });
  });

  describe("7. Public Projection Isolation & Sanitization", () => {
    const mockQuote: QuotationRecord = {
      id: "quote-123",
      quotation_ref: "LIT-2026-0042",
      version_number: 1,
      project_title: "Acme Web Platform Modernization",
      project_brief: "Modern responsive web application",
      timeline_estimate: "4-6 weeks",
      currency: "INR",
      company_name: "Acme Corp",
      recipient_name: "Jane Doe",
      recipient_email: "jane@acme.example",
      recipient_phone: "+91 9876543210",
      billing_address: "123 Tech Park",
      city_state_pin: "Bangalore, KA 560001",
      status: "published",
      subtotal_paise: 5000000,
      discount_paise: 0,
      tax_paise: 0,
      total_payable_paise: 5000000,
      milestone_1_paise: 2500000,
      milestone_2_paise: 2500000,
      issued_at: "2026-10-15",
      valid_until: "2026-11-14",
      created_at: "2026-10-15T00:00:00Z",
      updated_at: "2026-10-15T00:00:00Z",
      created_by: "founder@lit.in",
    };

    const mockLines: QuotationLineItem[] = [
      {
        id: "l1",
        quotation_id: "quote-123",
        service_code: "FE-01",
        category_name: "Frontend & Interactive Web Application Engineering",
        title: "Enterprise Frontend Engineering",
        scope_summary: "Production Next.js frontend with Tailwind CSS",
        deliverables: ["Clean TS codebase", "Responsive layouts"],
        unit: "project",
        quantity: 1,
        default_unit_price_paise: 5000000,
        quoted_unit_price_paise: 5000000,
        extended_amount_paise: 5000000,
        is_selected: true,
        included_at_no_additional_charge: false,
        internal_notes: "CONFIDENTIAL: 40 hrs estimated",
        sort_order: 1,
        created_at: "2026-10-15T00:00:00Z",
        updated_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "l2",
        quotation_id: "quote-123",
        service_code: "BE-01",
        title: "Serverless Backend APIs",
        unit: "project",
        quantity: 1,
        default_unit_price_paise: null,
        quoted_unit_price_paise: 3000000,
        extended_amount_paise: 3000000,
        is_selected: false, // Unselected line
        included_at_no_additional_charge: false,
        internal_notes: "CONFIDENTIAL: Client declined backend scope",
        sort_order: 2,
        created_at: "2026-10-15T00:00:00Z",
        updated_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "l3",
        quotation_id: "quote-123",
        service_code: "AI-01",
        title: "Custom AI Chatbot",
        unit: "project",
        quantity: 1,
        default_unit_price_paise: null,
        quoted_unit_price_paise: null, // Unpriced selected line
        extended_amount_paise: 0,
        is_selected: true,
        included_at_no_additional_charge: false,
        internal_notes: "CONFIDENTIAL: Awaiting vendor pricing",
        sort_order: 3,
        created_at: "2026-10-15T00:00:00Z",
        updated_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "l4",
        quotation_id: "quote-123",
        service_code: "QA-01",
        category_name: "Engineering Quality, Launch & Aftercare",
        title: "Cross-browser Quality Assurance",
        unit: "project",
        quantity: 1,
        default_unit_price_paise: null,
        quoted_unit_price_paise: null,
        extended_amount_paise: 0,
        is_selected: true,
        included_at_no_additional_charge: true, // Included complementary
        inclusion_rationale: "Included as standard launch quality guarantee",
        sort_order: 4,
        created_at: "2026-10-15T00:00:00Z",
        updated_at: "2026-10-15T00:00:00Z",
      },
    ];

    it("strictly isolates public projection: excludes unselected and unpriced lines", () => {
      const projection = projectPublicQuotation(mockQuote, mockLines);

      // Should only include FE-01 (priced & selected) and QA-01 (included at no charge & selected)
      assert.equal(
        projection.items.length,
        2,
        "Only selected priced and selected complementary items may appear in public projection"
      );

      const itemCodes = projection.items.map((i) => i.service_code);
      assert.deepEqual(itemCodes, ["FE-01", "QA-01"]);
    });

    it("verifies items are correctly numbered sequentially (1-based)", () => {
      const projection = projectPublicQuotation(mockQuote, mockLines);
      assert.equal(projection.items[0].item_number, 1);
      assert.equal(projection.items[1].item_number, 2);
    });

    it("ensures internal notes are stripped from public projection", () => {
      const projection = projectPublicQuotation(mockQuote, mockLines);
      for (const item of projection.items) {
        // Assert property doesn't exist on public line items
        assert.equal(
          (item as unknown as { internal_notes?: string }).internal_notes,
          undefined,
          "Internal notes must never be exposed on public line items"
        );
      }
    });

    it("embeds default LIT issuer details and legal MSME information", () => {
      const projection = projectPublicQuotation(mockQuote, mockLines);
      assert.equal(projection.issuer.legal_name, DEFAULT_LIT_ISSUER.legal_name);
      assert.equal(projection.issuer.msme_udyam, DEFAULT_LIT_ISSUER.msme_udyam);
      assert.equal(projection.issuer.official_email, DEFAULT_LIT_ISSUER.official_email);
      assert.equal(projection.issuer.founder_signatory, DEFAULT_LIT_ISSUER.founder_signatory);
      assert.ok(projection.terms.length >= 6);
    });
  });

  describe("8. Full Quotation Calculation Workflow", () => {
    it("computes end-to-end pricing result for standard single-service quotation (FE-01)", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 1,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 5000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const result = calculateQuotation(lines);

      assert.equal(result.subtotalPaise, 5000000, "Subtotal must be ₹50,000.00");
      assert.equal(result.discountPaise, 0);
      assert.equal(result.taxPaise, 0);
      assert.equal(result.totalPayablePaise, 5000000, "Total must be ₹50,000.00");
      assert.equal(result.milestone1Paise, 2500000, "Milestone 1 must be ₹25,000.00");
      assert.equal(result.milestone2Paise, 2500000, "Milestone 2 must be ₹25,000.00");
      assert.equal(result.roundingAdjustmentPaise, 0);
      assert.equal(result.isValidForPublish, true);
      assert.equal(result.validationErrors.length, 0);
    });

    it("computes pricing with coupon discount and dual milestones", () => {
      const lines: QuotationLineItem[] = [
        {
          id: "1",
          quotation_id: "q1",
          service_code: "FE-01",
          title: "Enterprise Frontend Engineering",
          unit: "project",
          quantity: 2,
          default_unit_price_paise: 5000000,
          quoted_unit_price_paise: 5000000,
          extended_amount_paise: 10000000,
          is_selected: true,
          included_at_no_additional_charge: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const coupon: QuotationCoupon = {
        code: "SPECIAL15",
        discount_type: "percentage",
        discount_percentage: 15,
        is_active: true,
      };

      const result = calculateQuotation(lines, coupon);

      // Subtotal: ₹1,00,000 (10,000,000 paise)
      // Discount: 15% = ₹15,000 (1,500,000 paise)
      // Total payable: ₹85,000 (8,500,000 paise)
      // Milestone 1: ₹42,500 (4,250,000 paise)
      // Milestone 2: ₹42,500 (4,250,000 paise)
      assert.equal(result.subtotalPaise, 10000000);
      assert.equal(result.discountPaise, 1500000);
      assert.equal(result.totalPayablePaise, 8500000);
      assert.equal(result.milestone1Paise, 4250000);
      assert.equal(result.milestone2Paise, 4250000);
      assert.equal(result.isValidForPublish, true);
    });
  });
});
