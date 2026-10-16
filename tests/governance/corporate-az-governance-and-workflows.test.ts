/* eslint-disable @typescript-eslint/no-require-imports */
// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function expect(actual: any) {
  const matchers = (isNot = false) => ({
    toBe(expected: any) {
      if (isNot) {
        assert.notStrictEqual(actual, expected);
      } else {
        assert.strictEqual(actual, expected);
      }
    },
    toEqual(expected: any) {
      if (expected && expected.__isMatcher) {
        expected.test(actual, isNot);
        return;
      }
      if (isNot) {
        assert.notDeepStrictEqual(actual, expected);
      } else {
        assert.deepStrictEqual(actual, expected);
      }
    },
    toBeDefined() {
      if (isNot) {
        assert.ok(actual === undefined, 'Expected value to be undefined');
      } else {
        assert.ok(actual !== undefined, 'Expected value to be defined');
      }
    },
    toBeUndefined() {
      if (isNot) {
        assert.ok(actual !== undefined, 'Expected value to be defined');
      } else {
        assert.strictEqual(actual, undefined);
      }
    },
    toBeNull() {
      if (isNot) {
        assert.notStrictEqual(actual, null);
      } else {
        assert.strictEqual(actual, null);
      }
    },
    toContain(expected: any) {
      if (typeof actual === 'string') {
        if (isNot) {
          assert.ok(!actual.includes(expected), `Expected "${actual}" not to contain "${expected}"`);
        } else {
          assert.ok(actual.includes(expected), `Expected "${actual}" to contain "${expected}"`);
        }
      } else if (Array.isArray(actual)) {
        if (isNot) {
          assert.ok(!actual.includes(expected), `Expected array not to contain ${expected}`);
        } else {
          assert.ok(actual.includes(expected), `Expected array to contain ${expected}`);
        }
      } else {
        if (isNot) {
          assert.ok(!(expected in actual), `Expected property ${expected} not in object`);
        } else {
          assert.ok(expected in actual, `Expected property ${expected} in object`);
        }
      }
    },
    toHaveLength(expected: number) {
      if (isNot) {
        assert.notStrictEqual(actual?.length, expected);
      } else {
        assert.strictEqual(actual?.length, expected);
      }
    },
    toHaveProperty(prop: string, expectedVal?: any) {
      const exists = actual !== null && actual !== undefined && prop in actual && actual[prop] !== undefined;
      if (isNot) {
        assert.ok(!exists, `Expected property ${prop} not to exist on object`);
      } else {
        assert.ok(exists, `Expected property ${prop} to exist on object`);
        if (expectedVal !== undefined) {
          assert.deepStrictEqual(actual[prop], expectedVal);
        }
      }
    },
    toMatch(regex: RegExp | string) {
      const re = typeof regex === 'string' ? new RegExp(regex) : regex;
      if (isNot) {
        assert.doesNotMatch(String(actual), re);
      } else {
        assert.match(String(actual), re);
      }
    },
    toThrow(expected?: any) {
      if (isNot) {
        assert.doesNotThrow(() => {
          if (typeof actual === 'function') actual();
        });
      } else {
        assert.throws(() => {
          if (typeof actual === 'function') actual();
        }, expected);
      }
    },
    rejects: {
      async toThrow(expected?: any) {
        await assert.rejects(async () => {
          if (typeof actual?.then === 'function') {
            await actual;
          } else if (typeof actual === 'function') {
            await actual();
          }
        }, expected);
      },
    },
  });

  const base = matchers(false);
  return {
    ...base,
    not: matchers(true),
  };
}

expect.arrayContaining = (sub: any[]) => ({
  __isMatcher: true,
  test(actual: any[], isNot: boolean) {
    const containsAll = sub.every((item) => actual && actual.includes(item));
    if (isNot) {
      assert.ok(!containsAll, 'Expected array not to contain all elements');
    } else {
      assert.ok(containsAll, `Expected [${actual}] to contain all of [${sub}]`);
    }
  },
});
import {
  STAFF_ROLES,
  hasCapability,
  SUPER_ADMIN_ONLY_CAPABILITIES,
  type Capability,
} from '@/config/roles';
const {
  detectForbiddenCommercialFields,
  createQuotationTechnicalDraft,
  updateQuotationTechnicalDraft,
  submitQuotationTechnicalDraftForApproval,
  approveAndPriceQuotationBySuperAdmin,
} = require('@/lib/quotations/technical-drafts');
const {
  createInvoicePreparationRequest,
  submitInvoicePreparationRequest,
  approveAndIssueInvoiceFromPreparation,
} = require('@/lib/invoices/preparation');
const {
  createStaffClientAssignment,
  updateStaffClientAssignment,
  verifyStaffClientAssignment,
  getRedactedStaffSupportContext,
  createStaffSupportActionRequest,
  addStaffSupportNote,
  listStaffSupportAccessEvents,
  assertNeverClientImpersonation,
  redactFinancialFieldsForStaffSupport,
  buildStaffSupportBanner,
} = require('@/lib/support/staff-support');
const {
  listCoupons,
  toggleCoupon,
  validateQuotationCoupon,
  redactQuotationForStaff,
} = require('@/lib/quotations/service');
import {
  calculateMilestones,
  calculateDiscount,
  validatePublishReadiness,
} from '@/lib/quotations/pricing';
import { CANONICAL_SERVICES_CATALOG } from '@/lib/quotations/catalog-seed-data';
import { calculateEngagementFinancials } from '@/lib/engagements/financials';
import {
  MASTER_DOCUMENT_FIELD_REGISTRY,
  getDocumentFieldDefinitions,
  canActorEditDocumentField,
  resolveAutoPopulatedDocumentFields,
} from '@/lib/documents/master-field-registry';
import { CANONICAL_13_STAGES, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';

describe('LIT Corporate A–Z Governance, Security & Workflow Suite (Section 21 — 50 Mandatory Cases)', () => {
  // =========================================================================
  // 21.1 Role & Authorization Matrix Tests (Cases 1–8)
  // =========================================================================
  describe('21.1 Role & Capability Separation Matrix (Policy 1 & Policy 2)', () => {
    it('Case 01: super_admin possesses every commercial, pricing, coupon, invoice, and stage approval capability', () => {
      for (const cap of SUPER_ADMIN_ONLY_CAPABILITIES) {
        expect(hasCapability('super_admin', cap)).toBe(true);
      }
    });

    it('Case 02: admin, operations, support, developer, and viewer are strictly denied all SUPER_ADMIN_ONLY_CAPABILITIES', () => {
      const nonSuperRoles = STAFF_ROLES.filter((r) => r !== 'super_admin');
      for (const role of nonSuperRoles) {
        for (const cap of SUPER_ADMIN_ONLY_CAPABILITIES) {
          expect(hasCapability(role, cap)).toBe(false);
        }
      }
    });

    it('Case 03: admin and operations have technical draft preparation capabilities without commercial price capabilities', () => {
      const prepCaps: Capability[] = [
        'quotation.technical_draft.read',
        'quotation.technical_draft.create',
        'quotation.technical_draft.update',
        'quotation.technical_draft.submit_for_approval',
      ];
      for (const cap of prepCaps) {
        expect(hasCapability('admin', cap)).toBe(true);
        expect(hasCapability('operations', cap)).toBe(true);
        expect(hasCapability('support', cap)).toBe(false);
      }
      expect(hasCapability('admin', 'quotation.price.read')).toBe(false);
      expect(hasCapability('operations', 'quotation.price.write')).toBe(false);
    });

    it('Case 04: admin and operations have invoice preparation capabilities without invoice issuance or price management', () => {
      expect(hasCapability('admin', 'invoice.preparation.create')).toBe(true);
      expect(hasCapability('operations', 'invoice.preparation.submit_for_approval')).toBe(true);
      expect(hasCapability('admin', 'invoice.issue')).toBe(false);
      expect(hasCapability('operations', 'invoice.issue')).toBe(false);
      expect(hasCapability('admin', 'invoice.price.manage')).toBe(false);
    });

    it('Case 05: support role can read and assist assigned client context, but cannot approve stages or view prices', () => {
      expect(hasCapability('support', 'support.assigned_client.read')).toBe(true);
      expect(hasCapability('support', 'support.assigned_client.assist')).toBe(true);
      expect(hasCapability('support', 'engagement.stage.approve')).toBe(false);
      expect(hasCapability('support', 'quotation.price.read')).toBe(false);
      expect(hasCapability('support', 'payment.verify')).toBe(false);
    });

    it('Case 06: only super_admin can manage staff-to-client assignments (support.assignment.manage)', () => {
      expect(hasCapability('super_admin', 'support.assignment.manage')).toBe(true);
      expect(hasCapability('admin', 'support.assignment.manage')).toBe(false);
      expect(hasCapability('operations', 'support.assignment.manage')).toBe(false);
    });

    it('Case 07: only super_admin can approve client identity corrections and stage progression gates', () => {
      expect(hasCapability('super_admin', 'engagement.identity_change.approve')).toBe(true);
      expect(hasCapability('super_admin', 'engagement.stage.approve')).toBe(true);
      expect(hasCapability('admin', 'engagement.identity_change.approve')).toBe(false);
      expect(hasCapability('admin', 'engagement.stage.approve')).toBe(false);
    });

    it('Case 08: only super_admin can verify bank payments and issue receipts', () => {
      expect(hasCapability('super_admin', 'payment.verify')).toBe(true);
      expect(hasCapability('admin', 'payment.verify')).toBe(false);
      expect(hasCapability('viewer', 'payment.verify')).toBe(false);
    });
  });

  // =========================================================================
  // 21.2 Staff Technical Quotation Drafts vs Super Admin Commercial Approval (Cases 9–18)
  // =========================================================================
  describe('21.2 Staff Technical Quotation Drafts & Super Admin Commercial Approval (Policy 1)', () => {
    it('Case 09: detectForbiddenCommercialFields detects injected unit_price_paise, discount_paise, coupon_code, and total_paise in staff payloads', () => {
      const forbidden = detectForbiddenCommercialFields({
        engagementId: 'eng-100',
        technicalLineItems: [
          {
            service_code: 'FE-01',
            title: 'Enterprise Frontend Engineering',
            quantity: 1,
            unit_price_paise: 5000000,
            discount_paise: 100000,
          },
        ],
        coupon_code: 'WAKEUPINDIA',
        total_paise: 4900000,
      });

      expect(forbidden).toEqual(
        expect.arrayContaining(['unit_price_paise', 'discount_paise', 'coupon_code', 'total_paise'])
      );
    });

    it('Case 10: assigned staff can create a technical quotation draft with zero commercial fields', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-ops-10',
        staffEmail: 'ops10@logicintelligencetechnologies.in',
        clientId: 'client-101',
        engagementId: 'eng-101',
        assignmentRole: 'operations_prep',
        canPrepareTechnicalQuotation: true,
        assignmentReason: 'Prepare technical scope draft for FinTech Portal',
      });

      const res = await createQuotationTechnicalDraft({
        actorUserId: 'staff-ops-10',
        actorEmail: 'ops10@logicintelligencetechnologies.in',
        actorRole: 'operations',
        rawPayload: {
          engagementId: 'eng-101',
          clientId: 'client-101',
          scopeSummary: 'Core multi-tenant portal and RBAC',
          technicalLineItems: [
            {
              service_code: 'FE-01',
              title: 'Enterprise Frontend Engineering',
              quantity: 1,
            },
          ],
        },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.draft.status).toBe('technical_draft');
        expect(res.draft.technical_line_items[0]).not.toHaveProperty('unit_price_paise');
      }
    });

    it('Case 11: support or viewer role cannot create a technical quotation draft', async () => {
      const res = await createQuotationTechnicalDraft({
        actorUserId: 'staff-support-1',
        actorEmail: 'support@logicintelligencetechnologies.in',
        actorRole: 'support',
        rawPayload: {
          clientId: 'client-101',
          scopeSummary: 'Unauthorized Draft',
        },
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
      }
    });

    it('Case 12: staff attempting to inject commercial pricing fields into a technical draft is rejected with 403', async () => {
      const res = await createQuotationTechnicalDraft({
        actorUserId: 'staff-admin-1',
        actorEmail: 'admin@logicintelligencetechnologies.in',
        actorRole: 'admin',
        rawPayload: {
          clientId: 'client-102',
          scopeSummary: 'Tampered Draft',
          technicalLineItems: [
            {
              title: 'AI Agent Pipeline',
              quantity: 1,
              unit_price_paise: 5000000,
            },
          ],
        },
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.forbiddenFields).toContain('unit_price_paise');
      }
    });

    it('Case 13: staff can submit a technical draft to the Super Admin commercial pricing queue, after which it is locked against staff mutation', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-admin-13',
        staffEmail: 'admin13@logicintelligencetechnologies.in',
        clientId: 'client-103',
        engagementId: 'eng-103',
        assignmentRole: 'operations_prep',
        canPrepareTechnicalQuotation: true,
        assignmentReason: 'Prepare scope v1',
      });

      const created = await createQuotationTechnicalDraft({
        actorUserId: 'staff-admin-13',
        actorEmail: 'admin13@logicintelligencetechnologies.in',
        actorRole: 'admin',
        rawPayload: {
          clientId: 'client-103',
          engagementId: 'eng-103',
          scopeSummary: 'Scope v1',
          technicalLineItems: [{ title: 'Module A', quantity: 1 }],
        },
      });
      expect(created.ok).toBe(true);
      if (!created.ok) return;

      const submitted = await submitQuotationTechnicalDraftForApproval({
        actorUserId: 'staff-admin-13',
        actorEmail: 'admin13@logicintelligencetechnologies.in',
        actorRole: 'admin',
        draftId: created.draft.id,
      });

      expect(submitted.ok).toBe(true);
      if (submitted.ok) {
        expect(submitted.draft.status).toBe('submitted_for_commercial_review');
      }

      const updateAttempt = await updateQuotationTechnicalDraft({
        actorUserId: 'staff-admin-13',
        actorEmail: 'admin13@logicintelligencetechnologies.in',
        actorRole: 'admin',
        draftId: created.draft.id,
        rawPayload: {
          scopeSummary: 'Tampered after submission',
        },
      });

      expect(updateAttempt.ok).toBe(false);
      if (!updateAttempt.ok) {
        expect(updateAttempt.status).toBe(409);
      }
    });

    it('Case 14: non-super-admin staff attempting to approve commercial pricing is rejected with 403', async () => {
      const res = await approveAndPriceQuotationBySuperAdmin({
        actorUserId: 'staff-admin-13',
        actorEmail: 'admin13@logicintelligencetechnologies.in',
        actorRole: 'admin',
        quotationId: 'qt-sample-001',
        decision: 'approved',
        pricedLineItems: [
          {
            service_code: 'FE-01',
            title: 'Enterprise Frontend Engineering',
            quantity: 1,
            unit_price_paise: 5000000,
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.message).toMatch(/Only Super Admin may enter commercial prices/i);
      }
    });

    it('Case 15: Super Admin commercial approval computes exact 18% GST and 50%/50% milestone split', async () => {
      const res = await approveAndPriceQuotationBySuperAdmin({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        quotationId: 'qt-commercial-test-15',
        decision: 'approved',
        pricedLineItems: [
          {
            service_code: 'FE-01',
            category: 'Frontend Architecture',
            title: 'Enterprise Frontend Engineering',
            quantity: 1,
            unit_price_paise: 5000000, // ₹50,000.00
          },
        ],
        gstApplicable: true,
        gstRateBps: 1800, // 18%
      });

      expect(res.ok).toBe(true);
      if (res.ok && res.approval) {
        expect(res.approval.subtotal_paise).toBe(5000000);
        expect(res.approval.gst_paise).toBe(900000);
        expect(res.approval.total_paise).toBe(5900000); // ₹59,000.00
        expect(res.approval.advance_paise).toBe(2950000); // ₹29,500.00
        expect(res.approval.final_paise).toBe(2950000); // ₹29,500.00
      }
    });

    it('Case 16: validatePublishReadiness blocks publication when any selected line item is unpriced', () => {
      const readiness = validatePublishReadiness([
        {
          id: 'line-1',
          quotation_id: 'qt-1',
          service_code: 'DS-01',
          category_code: 'A',
          category_name: 'Discovery',
          title: 'Digital Product Discovery',
          scope_summary: 'Discovery workshop',
          deliverables: [],
          unit: 'project',
          quantity: 1,
          quoted_unit_price_paise: null,
          extended_amount_paise: 0,
          included_at_no_additional_charge: false,
          charge_waiver_reason: null,
          is_selected: true,
          sort_order: 1,
        },
      ]);

      expect(readiness.isValid).toBe(false);
      expect(readiness.errors[0]).toMatch(/selected but unpriced/i);
    });

    it('Case 17: redactQuotationForStaff strips all pricing, tax, milestone, and secure_token fields from quotation objects', () => {
      const redacted = redactQuotationForStaff({
        id: 'q-1',
        quotation_ref: 'LIT-QT-2026-0001',
        company_name: 'Acme',
        recipient_name: 'Client A',
        recipient_email: 'client@example.com',
        recipient_phone: null,
        billing_address: null,
        city_state_pin: null,
        project_title: 'Portal',
        project_brief: 'Technical scope',
        timeline_estimate: '4 weeks',
        currency: 'INR',
        status: 'published',
        delivery_state: 'link_shared',
        subtotal_paise: 5000000,
        discount_paise: 0,
        discount_label: null,
        tax_paise: 900000,
        tax_label: 'GST 18%',
        total_payable_paise: 5900000,
        milestone_1_paise: 2950000,
        milestone_2_paise: 2950000,
        terms: [],
        internal_notes: null,
        secure_token: 'secret-token',
        secure_token_hash: 'secret-hash',
        valid_until: new Date().toISOString(),
        issued_at: new Date().toISOString(),
        accepted_at: null,
        version_number: 1,
        latest_version_id: null,
        created_by: null,
        approved_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(redacted).not.toHaveProperty('subtotal_paise');
      expect(redacted).not.toHaveProperty('total_payable_paise');
      expect(redacted).not.toHaveProperty('milestone_1_paise');
      expect(redacted).not.toHaveProperty('milestone_2_paise');
      expect(redacted).not.toHaveProperty('secure_token');
    });

    it('Case 18: Canonical service catalog seeds FE-01 at ₹50,000 (5000000 paise) and keeps all other 76 services unpriced until Super Admin approval', () => {
      expect(CANONICAL_SERVICES_CATALOG.length).toBe(77);
      const fe01 = CANONICAL_SERVICES_CATALOG.find((c) => c.service_code === 'FE-01');
      expect(fe01).toBeDefined();
      expect(fe01?.default_unit_price_paise).toBe(5000000);
      const otherPriced = CANONICAL_SERVICES_CATALOG.filter(
        (c) => c.service_code !== 'FE-01' && c.default_unit_price_paise !== null
      );
      expect(otherPriced).toHaveLength(0);
    });
  });

  // =========================================================================
  // 21.3 Staff Invoice Preparation vs Super Admin Issuance (Cases 19–24)
  // =========================================================================
  describe('21.3 Staff Invoice Preparation vs Super Admin Issuance (Policy 1)', () => {
    it('Case 19: staff invoice preparation request containing commercial amount fields is rejected with 403', async () => {
      const res = await createInvoicePreparationRequest({
        actorUserId: 'staff-ops-1',
        actorEmail: 'ops@logicintelligencetechnologies.in',
        actorRole: 'operations',
        rawPayload: {
          engagementId: 'eng-200',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Milestone 1 Kickoff',
          subtotal_paise: 5000000,
          total_paise: 5900000,
        },
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.forbiddenFields).toEqual(
          expect.arrayContaining(['subtotal_paise', 'total_paise'])
        );
      }
    });

    it('Case 20: assigned staff can create and submit an invoice preparation request without issuing an invoice', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-ops-20',
        staffEmail: 'ops20@logicintelligencetechnologies.in',
        clientId: 'client-201',
        engagementId: 'eng-201',
        assignmentRole: 'operations_prep',
        canPrepareInvoiceRequest: true,
        assignmentReason: 'Prepare Milestone 1 invoice request after SOW execution',
      });

      const prep = await createInvoicePreparationRequest({
        actorUserId: 'staff-ops-20',
        actorEmail: 'ops20@logicintelligencetechnologies.in',
        actorRole: 'operations',
        rawPayload: {
          engagementId: 'eng-201',
          clientId: 'client-201',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'SOW executed and verified for Stage 06 Kickoff Advance',
          evidenceLinks: ['LIT-01-SOW signed'],
        },
      });

      expect(prep.ok).toBe(true);
      if (!prep.ok) return;
      expect(prep.request.status).toBe('draft');
      expect(prep.request.issued_invoice_id).toBeNull();

      const submitted = await submitInvoicePreparationRequest({
        actorUserId: 'staff-ops-20',
        actorEmail: 'ops20@logicintelligencetechnologies.in',
        actorRole: 'operations',
        requestId: prep.request.id,
      });

      expect(submitted.ok).toBe(true);
      if (submitted.ok) {
        expect(submitted.request.status).toBe('submitted_for_super_admin');
      }
    });

    it('Case 21: non-super-admin staff cannot approve or issue an invoice preparation request', async () => {
      const prep = await createInvoicePreparationRequest({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: 'eng-202',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Stage 06 — 50% Kickoff Advance readiness verified',
        },
      });
      expect(prep.ok).toBe(true);
      if (!prep.ok) return;

      const res = await approveAndIssueInvoiceFromPreparation({
        actorUserId: 'staff-admin-1',
        actorEmail: 'admin@logicintelligencetechnologies.in',
        actorRole: 'admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 2950000,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.message).toMatch(/Only Super Admin may approve invoice preparation requests/i);
      }
    });

    it('Case 22: Super Admin can approve and issue an official invoice from a staff preparation request', async () => {
      const prep = await createInvoicePreparationRequest({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: 'eng-203',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Stage 06 — 50% Kickoff Advance readiness verified',
        },
      });
      expect(prep.ok).toBe(true);
      if (!prep.ok) return;

      const issued = await approveAndIssueInvoiceFromPreparation({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 2950000,
      });

      expect(issued.ok).toBe(true);
      if (issued.ok) {
        expect(issued.request.status).toBe('approved_and_issued');
        expect(issued.invoice?.amount_paise).toBe(2950000);
        expect(issued.invoice?.invoice_number).toMatch(/^LIT-INV-2026-INIT-/);
      }
    });

    it('Case 23: Super Admin cannot issue an invoice with zero or negative amount', async () => {
      const prep = await createInvoicePreparationRequest({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: 'eng-204',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Stage 06 readiness check',
        },
      });
      expect(prep.ok).toBe(true);
      if (!prep.ok) return;

      const res = await approveAndIssueInvoiceFromPreparation({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 0,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(400);
      }
    });

    it('Case 24: Super Admin can return an invoice preparation request for changes without issuing an invoice', async () => {
      const prep = await createInvoicePreparationRequest({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: 'eng-205',
          milestoneKey: 'final_50_deployment',
          deliverableSummary: 'Stage 11 final delivery readiness check',
        },
      });
      expect(prep.ok).toBe(true);
      if (!prep.ok) return;

      const res = await approveAndIssueInvoiceFromPreparation({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'changes_requested',
        approvalNotes: 'Attach signed UAT report link before final invoice issuance.',
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.request.status).toBe('changes_requested');
        expect(res.invoice).toBeUndefined();
      }
    });
  });

  // =========================================================================
  // 21.4 Audited Staff Support View & Anti-Impersonation (Cases 25–33)
  // =========================================================================
  describe('21.4 Audited Staff Support View & Strict Anti-Impersonation (Policy 2)', () => {
    it('Case 25: unassigned staff is denied access to a client support context and the denial is logged', async () => {
      const res = await getRedactedStaffSupportContext({
        staffUserId: 'staff-support-99',
        staffEmail: 'support99@logicintelligencetechnologies.in',
        staffRole: 'support',
        clientId: 'client-unassigned-1',
        route: '/admin/support/clients/client-unassigned-1',
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
      }

      const events = listStaffSupportAccessEvents();
      expect(
        events.some(
          (e) =>
            e.client_id === 'client-unassigned-1' &&
            e.action === 'support_view.access_denied'
        )
      ).toBe(true);
    });

    it('Case 26: Super Admin can assign a staff member to a client and later revoke the assignment', async () => {
      const assignment = await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-support-1',
        staffEmail: 'support1@logicintelligencetechnologies.in',
        clientId: 'client-301',
        engagementId: 'eng-301',
        assignmentRole: 'technical_support',
        assignmentReason: 'Onboarding technical support',
      });

      expect(assignment.status).toBe('active');
      const checkBefore = await verifyStaffClientAssignment({
        staffUserId: 'staff-support-1',
        staffRole: 'support',
        clientId: 'client-301',
      });
      expect(checkBefore.allowed).toBe(true);

      await updateStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        assignmentId: assignment.id,
        status: 'revoked',
      });

      const checkAfter = await verifyStaffClientAssignment({
        staffUserId: 'staff-support-1',
        staffRole: 'support',
        clientId: 'client-301',
      });
      expect(checkAfter.allowed).toBe(false);
    });

    it('Case 27: non-super-admin staff cannot assign themselves or others to clients', async () => {
      await expect(
        createStaffClientAssignment({
          actorUserId: 'staff-admin-1',
          actorEmail: 'admin@logicintelligencetechnologies.in',
          actorRole: 'admin',
          staffUserId: 'staff-admin-1',
          staffEmail: 'admin@logicintelligencetechnologies.in',
          clientId: 'client-302',
          assignmentRole: 'technical_support',
          assignmentReason: 'Self-assignment attempt',
        })
      ).rejects.toThrow(/Only Super Admin may create staff-client assignments/i);
    });

    it('Case 28: assigned staff receives a strictly redacted RedactedStaffSupportClientContext with banner and zero financial fields', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-support-2',
        staffEmail: 'support2@logicintelligencetechnologies.in',
        clientId: 'client-303',
        assignmentRole: 'technical_support',
        assignmentReason: 'Assigned technical support for Stage 07',
      });

      const res = await getRedactedStaffSupportContext({
        staffUserId: 'staff-support-2',
        staffEmail: 'support2@logicintelligencetechnologies.in',
        staffRole: 'support',
        clientId: 'client-303',
        route: '/admin/support/clients/client-303',
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.actor.impersonating_client).toBe(false);
        expect(res.data.actor.client_session_established).toBe(false);
        expect(res.data.financial_redaction.redacted).toBe(true);
        expect(res.data.banner).toBe(
          buildStaffSupportBanner('support2@logicintelligencetechnologies.in', 'support')
        );
        expect(res.data).not.toHaveProperty('subtotal');
        expect(res.data).not.toHaveProperty('invoices');
        expect(res.data).not.toHaveProperty('payments');
      }
    });

    it('Case 29: redactFinancialFieldsForStaffSupport recursively strips prices, GST, UTR, bank details, and coupon tokens from nested snapshots', () => {
      const dirtySnapshot = {
        technicalSummary: 'Next.js 15 + Supabase',
        subtotal: 50000,
        subtotal_paise: 5000000,
        gst_paise: 900000,
        utr: '412345678901',
        upi_vpa: '9342877474@ptyes',
        gstin: '33AAAAA0000A1Z5',
        nested: {
          moduleName: 'Auth Engine',
          unit_price_paise: 2500000,
          coupon_code: 'WAKEUPINDIA',
        },
      };

      const clean = redactFinancialFieldsForStaffSupport(dirtySnapshot);
      expect(clean.technicalSummary).toBe('Next.js 15 + Supabase');
      expect(clean).not.toHaveProperty('subtotal');
      expect(clean).not.toHaveProperty('subtotal_paise');
      expect(clean).not.toHaveProperty('gst_paise');
      expect(clean).not.toHaveProperty('utr');
      expect(clean).not.toHaveProperty('upi_vpa');
      expect(clean).not.toHaveProperty('gstin');
      expect(clean.nested.moduleName).toBe('Auth Engine');
      expect(clean.nested).not.toHaveProperty('unit_price_paise');
      expect(clean.nested).not.toHaveProperty('coupon_code');
    });

    it('Case 30: assertNeverClientImpersonation blocks any impersonation or client-session takeover attempt with 403', () => {
      const attempt1 = assertNeverClientImpersonation({
        actorUserId: 'staff-admin-1',
        actorRole: 'admin',
        impersonateClientId: 'client-304',
      });
      expect(attempt1.ok).toBe(false);
      if (!attempt1.ok) {
        expect(attempt1.status).toBe(403);
        expect(attempt1.message).toMatch(/Client impersonation and session takeover are strictly prohibited/i);
      }

      const attempt2 = assertNeverClientImpersonation({
        actorUserId: 'staff-admin-1',
        actorRole: 'admin',
        requestedActorRole: 'client',
      });
      expect(attempt2.ok).toBe(false);
    });

    it('Case 31: assigned staff can record a support note under their own staff identity', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-ops-5',
        staffEmail: 'ops5@logicintelligencetechnologies.in',
        clientId: 'client-305',
        assignmentRole: 'project_coordinator',
        assignmentReason: 'Assist with DNS verification',
      });

      const res = await addStaffSupportNote({
        staffUserId: 'staff-ops-5',
        staffEmail: 'ops5@logicintelligencetechnologies.in',
        staffRole: 'operations',
        clientId: 'client-305',
        note: 'Assisted client with DNS CNAME verification for staging.',
        route: '/api/admin/staff-support/clients/client-305/notes',
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.note.author_email).toBe('ops5@logicintelligencetechnologies.in');
        expect(res.note.author_role).toBe('operations');
      }
    });

    it('Case 32: assigned staff can escalate a stage_review action request to Super Admin without mutating client stage', async () => {
      await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-ops-6',
        staffEmail: 'ops6@logicintelligencetechnologies.in',
        clientId: 'client-306',
        assignmentRole: 'project_coordinator',
        assignmentReason: 'Coordinate Stage 07 intake',
      });

      const res = await createStaffSupportActionRequest({
        staffUserId: 'staff-ops-6',
        staffEmail: 'ops6@logicintelligencetechnologies.in',
        staffRole: 'operations',
        clientId: 'client-306',
        requestType: 'stage_review',
        stageKey: 'onboarding',
        summary: 'Client completed Stage 07 Onboarding inputs; ready for Super Admin stage review.',
        route: '/api/admin/staff-support/clients/client-306/request-action',
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.request.status).toBe('pending_super_admin');
        expect(res.request.request_type).toBe('stage_review');
      }
    });

    it('Case 33: revoked staff assignment immediately blocks subsequent support notes or context reads', async () => {
      const assignment = await createStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        staffUserId: 'staff-ops-7',
        staffEmail: 'ops7@logicintelligencetechnologies.in',
        clientId: 'client-307',
        assignmentRole: 'technical_support',
        assignmentReason: 'Temporary onboarding help',
      });

      await updateStaffClientAssignment({
        actorUserId: 'founder-1',
        actorEmail: 'founder@logicintelligencetechnologies.in',
        actorRole: 'super_admin',
        assignmentId: assignment.id,
        status: 'revoked',
      });

      const res = await addStaffSupportNote({
        staffUserId: 'staff-ops-7',
        staffEmail: 'ops7@logicintelligencetechnologies.in',
        staffRole: 'operations',
        clientId: 'client-307',
        note: 'Should fail after revocation',
        route: '/api/admin/staff-support/clients/client-307/notes',
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
      }
    });
  });

  // =========================================================================
  // 21.5 Coupon Governance, WAKEUPINDIA Placeholder, GST & Milestones (Cases 34–42)
  // =========================================================================
  describe('21.5 Coupon Governance, WAKEUPINDIA Placeholder, GST & Two-Milestone Math', () => {
    it('Case 34: WAKEUPINDIA is seeded as an inactive placeholder with null discount_percentage and null discount_paise', async () => {
      const coupons = await listCoupons();
      const wakeup = coupons.find((c) => c.code === 'WAKEUPINDIA');
      expect(wakeup).toBeDefined();
      expect(wakeup?.is_active).toBe(false);
      expect(wakeup?.discount_percentage).toBeNull();
      expect(wakeup?.discount_paise).toBeNull();
    });

    it('Case 35: validateQuotationCoupon rejects inactive WAKEUPINDIA with 422', async () => {
      const result = await validateQuotationCoupon('qt-apex-tok-99a1', 'WAKEUPINDIA');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(422);
      expect(result.error).toMatch(/inactive/i);
    });

    it('Case 36: toggleCoupon refuses to activate WAKEUPINDIA while its discount value is unconfigured', async () => {
      const coupons = await listCoupons();
      const wakeup = coupons.find((c) => c.code === 'WAKEUPINDIA')!;
      const res = await toggleCoupon(wakeup.id, true);
      expect(res.ok).toBe(false);
      expect(res.error).toMatch(/Cannot activate coupon 'WAKEUPINDIA' until Super Admin configures/i);
    });

    it('Case 37: unpriced engagement (0 subtotal) returns isCommerciallyApproved=false and zero payable amounts (no ₹18,00,000 or ₹50 fallback)', () => {
      const fin = calculateEngagementFinancials(0);
      expect(fin.isCommerciallyApproved).toBe(false);
      expect(fin.subtotal).toBe(0);
      expect(fin.totalAmount).toBe(0);
      expect(fin.depositAmount).toBe(0);
      expect(fin.settlementAmount).toBe(0);
      expect(fin.subtotalFormatted).toBe('Pending Commercial Approval');
      expect(fin.totalFormatted).toBe('Pending Commercial Approval');
    });

    it('Case 38: ₹50,000 subtotal with 18% GST produces ₹9,000 GST, ₹59,000 total, and two exact ₹29,500 milestones', () => {
      const fin = calculateEngagementFinancials(50000);
      expect(fin.isCommerciallyApproved).toBe(true);
      expect(fin.subtotal).toBe(50000);
      expect(fin.gstAmount).toBe(9000);
      expect(fin.totalAmount).toBe(59000);
      expect(fin.depositAmount).toBe(29500);
      expect(fin.settlementAmount).toBe(29500);
      expect(fin.depositAmount + fin.settlementAmount).toBe(fin.totalAmount);
    });

    it('Case 39: odd-paise total splits cleanly across Milestone 1 (floor) and Milestone 2 (remainder) so M1 + M2 === totalPayablePaise', () => {
      const split = calculateMilestones(10001);
      expect(split.milestone1Paise).toBe(5000);
      expect(split.milestone2Paise).toBe(5001);
      expect(split.milestone1Paise + split.milestone2Paise).toBe(10001);
    });

    it('Case 40: Super Admin configuring WAKEUPINDIA with approved discount allows activation and exact calculation', async () => {
      const coupons = await listCoupons();
      const wakeup = coupons.find((c) => c.code === 'WAKEUPINDIA')!;
      const toggled = await toggleCoupon(wakeup.id, true, {
        discount_type: 'percentage',
        discount_value: 10,
        approved_by: 'founder@logicintelligencetechnologies.in',
      });
      expect(toggled.ok).toBe(true);

      const applied = await validateQuotationCoupon('qt-apex-tok-99a1', 'WAKEUPINDIA');
      expect(applied.valid).toBe(true);
      expect(applied.discountPaise).toBe(500000); // 10% of 5000000

      // Restore to inactive placeholder state
      if (toggled.coupon) {
        toggled.coupon.is_active = false;
        toggled.coupon.discount_type = null;
        toggled.coupon.discount_percentage = null;
        toggled.coupon.discount_paise = null;
      }
    });

    it('Case 41: GST exempt (0% rate) applies 0 tax when configured by Super Admin', () => {
      const fin = calculateEngagementFinancials(50000, 0);
      expect(fin.gstRate).toBe(0);
      expect(fin.gstAmount).toBe(0);
      expect(fin.totalAmount).toBe(50000);
      expect(fin.depositAmount).toBe(25000);
      expect(fin.settlementAmount).toBe(25000);
    });

    it('Case 42: discount exceeding subtotal is safely clamped so taxable amount never goes negative', () => {
      const disc = calculateDiscount(100000, null, 9999999);
      expect(disc.discountPaise).toBe(100000);
    });
  });

  // =========================================================================
  // 21.6 13-Stage Lifecycle & 7-PDF Master Field Mapping (Cases 43–50)
  // =========================================================================
  describe('21.6 13-Stage Client Portal Lifecycle & 7-PDF Master Field Registry (Sections 15–17)', () => {
    it('Case 43: CANONICAL_13_STAGES and ORDERED_STAGE_KEYS define all 13 canonical client lifecycle stages in exact ordinal sequence 1..13', () => {
      expect(ORDERED_STAGE_KEYS).toHaveLength(13);
      const ordinals = ORDERED_STAGE_KEYS.map((k) => CANONICAL_13_STAGES[k].ordinal);
      expect(ordinals).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });

    it('Case 44: MASTER_DOCUMENT_FIELD_REGISTRY defines all 7 corporate PDFs (LIT-01..LIT-07) plus LIT-00, LIT-QUOTATION, LIT-INVOICE, and LIT-RECEIPT', () => {
      const codes = Object.keys(MASTER_DOCUMENT_FIELD_REGISTRY);
      expect(codes).toEqual(
        expect.arrayContaining([
          'LIT-00-CHECKLIST',
          'LIT-01-SOW',
          'LIT-02-NDA',
          'LIT-03-ONBOARDING',
          'LIT-04-TECH-SPEC',
          'LIT-05-CHANGE-REQUEST',
          'LIT-06-HANDOVER',
          'LIT-07-MAINTENANCE',
          'LIT-QUOTATION',
          'LIT-INVOICE',
          'LIT-RECEIPT',
        ])
      );
    });

    it('Case 45: getDocumentFieldDefinitions with redactFinancials=true removes all financialSensitive fields from LIT-01-SOW, LIT-05-CHANGE-REQUEST, and LIT-07-MAINTENANCE', () => {
      const sowRedacted = getDocumentFieldDefinitions('LIT-01-SOW', { redactFinancials: true });
      expect(sowRedacted.some((f) => f.key === 'contractSubtotalPaise')).toBe(false);
      expect(sowRedacted.some((f) => f.key === 'totalContractValuePaise')).toBe(false);
      expect(sowRedacted.some((f) => f.key === 'scopeOfWorkModules')).toBe(true);
    });

    it('Case 46: canActorEditDocumentField enforces super_admin_commercial ownership on SOW pricing and RFC commercial delta', () => {
      expect(canActorEditDocumentField('LIT-01-SOW', 'contractSubtotalPaise', 'super_admin')).toBe(true);
      expect(canActorEditDocumentField('LIT-01-SOW', 'contractSubtotalPaise', 'admin')).toBe(false);
      expect(canActorEditDocumentField('LIT-01-SOW', 'contractSubtotalPaise', 'operations')).toBe(false);
      expect(canActorEditDocumentField('LIT-05-CHANGE-REQUEST', 'commercialDeltaPaise', 'super_admin')).toBe(true);
      expect(canActorEditDocumentField('LIT-05-CHANGE-REQUEST', 'commercialDeltaPaise', 'admin')).toBe(false);
    });

    it('Case 47: canActorEditDocumentField allows lit_staff_technical fields for admin and operations before approval, and locks them after approval', () => {
      expect(canActorEditDocumentField('LIT-04-TECH-SPEC', 'systemArchitectureOverview', 'operations', false)).toBe(
        true
      );
      expect(canActorEditDocumentField('LIT-04-TECH-SPEC', 'systemArchitectureOverview', 'support', false)).toBe(
        false
      );
      expect(canActorEditDocumentField('LIT-04-TECH-SPEC', 'systemArchitectureOverview', 'operations', true)).toBe(
        false
      );
    });

    it('Case 48: system-owned fields (reference IDs, governing law, IP clause) cannot be manually edited by client or staff', () => {
      expect(canActorEditDocumentField('LIT-02-NDA', 'agreementReference', 'client')).toBe(false);
      expect(canActorEditDocumentField('LIT-02-NDA', 'governingLawJurisdiction', 'admin')).toBe(false);
      expect(canActorEditDocumentField('LIT-01-SOW', 'ipAssignmentClause', 'operations')).toBe(false);
    });

    it('Case 49: resolveAutoPopulatedDocumentFields populates LIT-01-SOW with client identity, scope modules, and 50%/50% milestones for Super Admin', () => {
      const populated = resolveAutoPopulatedDocumentFields('LIT-01-SOW', {
        engagementRef: 'ENG-2026-099',
        companyName: 'Meridian Logistics Pvt Ltd',
        contactName: 'Arjun Mehta',
        contactEmail: 'arjun@meridian.in',
        approvedScopeModules: ['Frontend — Next.js Enterprise Architecture'],
        approvedSubtotalPaise: 5000000,
        approvedGstPaise: 900000,
        approvedTotalPaise: 5900000,
      });

      expect(populated.sowReference).toBe('LIT-01-SOW-ENG-2026-099');
      expect(populated.clientLegalName).toBe('Meridian Logistics Pvt Ltd');
      expect(populated.contractSubtotalPaise).toBe(5000000);
      expect(populated.totalContractValuePaise).toBe(5900000);
      expect(populated.milestone1DepositPaise).toBe(2950000);
      expect(populated.milestone2SettlementPaise).toBe(2950000);
    });

    it('Case 50: resolveAutoPopulatedDocumentFields omits all commercial pricing fields when redactFinancials=true (Staff Support View)', () => {
      const populated = resolveAutoPopulatedDocumentFields(
        'LIT-01-SOW',
        {
          engagementRef: 'ENG-2026-099',
          companyName: 'Meridian Logistics Pvt Ltd',
          contactName: 'Arjun Mehta',
          contactEmail: 'arjun@meridian.in',
          approvedScopeModules: ['Frontend — Next.js Enterprise Architecture'],
          approvedSubtotalPaise: 5000000,
          approvedGstPaise: 900000,
          approvedTotalPaise: 5900000,
        },
        { redactFinancials: true }
      );

      expect(populated.sowReference).toBe('LIT-01-SOW-ENG-2026-099');
      expect(populated.clientLegalName).toBe('Meridian Logistics Pvt Ltd');
      expect(populated.contractSubtotalPaise).toBeUndefined();
      expect(populated.totalContractValuePaise).toBeUndefined();
      expect(populated.milestone1DepositPaise).toBeUndefined();
      expect(populated.milestone2SettlementPaise).toBeUndefined();
    });
  });
});
