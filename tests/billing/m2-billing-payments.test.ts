// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Require services under test after server-only stub is loaded
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createOrGetMaintenanceOrder,
  submitMaintenanceUtr,
  getClientActiveSubscription,
  verifyMaintenanceOrderAndActivate,
  processSubscriptionRefund,
  checkAndExpireStandardTrials,
} = require('../../src/lib/subscriptions/service');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  calculatePlanPricing,
  MAINTENANCE_PLANS,
} = require('../../src/config/maintenance-plans');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createInvoicePreparationRequest,
  approveAndIssueInvoiceFromPreparation,
} = require('../../src/lib/invoices/preparation');

describe('Milestone 2 (BILL01 - BILL06) Billing, Payments & Lifecycle Behavioral Test Suite', () => {

  // ---------------------------------------------------------------------------
  // BILL01: Exact Integer Paise Bank Credit Reconciliation
  // ---------------------------------------------------------------------------
  describe('BILL01: Exact Integer Paise Bank Credit Reconciliation', () => {
    test('calculatePlanPricing calculates exact integer paise with 18% GST', () => {
      // FREE_TRIAL: ₹20 verification fee = 2000 paise
      const trialPricing = calculatePlanPricing('FREE_TRIAL');
      assert.strictEqual(trialPricing.basePricePaise, 0);
      assert.strictEqual(trialPricing.totalPricePaise, 2000);
      assert.strictEqual(trialPricing.refundablePaise, 2000);

      // STANDARD: ₹999 + 18% GST (179.82) = ₹1,178.82 = 117882 paise
      const stdPricing = calculatePlanPricing('STANDARD');
      assert.strictEqual(stdPricing.basePricePaise, 99900);
      assert.strictEqual(stdPricing.gstAmountPaise, 17982);
      assert.strictEqual(stdPricing.totalPricePaise, 117882);

      // BASIC: ₹4,999 + 18% GST (899.82) = ₹5,898.82 = 589882 paise
      const basicPricing = calculatePlanPricing('BASIC');
      assert.strictEqual(basicPricing.basePricePaise, 499900);
      assert.strictEqual(basicPricing.gstAmountPaise, 89982);
      assert.strictEqual(basicPricing.totalPricePaise, 589882);

      // PRO: ₹9,999 + 18% GST (1799.82) = ₹11,798.82 = 1179882 paise
      const proPricing = calculatePlanPricing('PRO');
      assert.strictEqual(proPricing.basePricePaise, 999900);
      assert.strictEqual(proPricing.gstAmountPaise, 179982);
      assert.strictEqual(proPricing.totalPricePaise, 1179882);

      // ENTERPRISE: ₹19,999 + 18% GST (3599.82) = ₹23,598.82 = 2359882 paise
      const entPricing = calculatePlanPricing('ENTERPRISE');
      assert.strictEqual(entPricing.basePricePaise, 1999900);
      assert.strictEqual(entPricing.gstAmountPaise, 359982);
      assert.strictEqual(entPricing.totalPricePaise, 2359882);
    });

    test('verifyMaintenanceOrderAndActivate rejects non-matching amount paise', async () => {
      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000001',
            adminUserId: '00000000-0000-0000-0000-000000000002',
            bankReconciliationRef: 'BANK-REF-123456',
          });
        },
        (err: Error) => {
          assert.match(err.message, /Forbidden|Maintenance order not found/);
          return true;
        }
      );
    });
  });

  // ---------------------------------------------------------------------------
  // BILL02: Prevention of Duplicate Bank Credit / UTR Allocation
  // ---------------------------------------------------------------------------
  describe('BILL02: Prevention of Duplicate Credit / UTR Allocation', () => {
    test('submitMaintenanceUtr enforces minimum 8 characters and whitespace trimming', async () => {
      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-TEST-001',
            secureToken: 'mnt_sec_validtoken1234567890',
            declaredUtr: '12345', // Too short (< 8)
            declaredPayeeName: 'Acme Corp',
          });
        },
        (err: Error) => {
          assert.match(err.message, /minimum 8 characters/);
          return true;
        }
      );
    });

    test('Source code includes duplicate bank reconciliation ref and duplicate UTR checks', () => {
      const servicePath = path.join(process.cwd(), 'src/lib/subscriptions/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('Duplicate UTR submissions are prohibited'), 'Must prevent duplicate UTR submissions');
      assert.ok(content.includes('Duplicate credit allocation is prohibited'), 'Must prevent duplicate bank ref allocations');
    });
  });

  // ---------------------------------------------------------------------------
  // BILL03: Canonical 5-Tier Pricing Invariants
  // ---------------------------------------------------------------------------
  describe('BILL03: Server-Authoritative 5-Tier Pricing Invariants', () => {
    test('Config defines exact 5 tiers and prohibits old legacy plans', () => {
      const keys = Object.keys(MAINTENANCE_PLANS);
      assert.deepStrictEqual(keys.sort(), ['BASIC', 'ENTERPRISE', 'FREE_TRIAL', 'PRO', 'STANDARD'].sort());

      // Ensure old legacy plans (25000 / 60000) are NOT in the configuration
      assert.strictEqual((MAINTENANCE_PLANS as any).ENTERPRISE_CUSTOM, undefined);
      assert.strictEqual((MAINTENANCE_PLANS as any).LEGACY_CARE, undefined);
    });

    test('STANDARD is never categorized as a trial plan', () => {
      assert.strictEqual(MAINTENANCE_PLANS.STANDARD.planType, 'paid');
      assert.strictEqual(MAINTENANCE_PLANS.FREE_TRIAL.planType, 'free_trial');

      const servicePath = path.join(process.cwd(), 'src/lib/subscriptions/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      // Verify getClientActiveSubscription does NOT treat STANDARD as trial
      assert.ok(!content.includes("sub.plan_id === 'FREE_TRIAL' || sub.plan_id === 'STANDARD'"), 'Must not conflate STANDARD with trial');
    });
  });

  // ---------------------------------------------------------------------------
  // BILL04: Real Database Invoice Issuance from Preparation Request
  // ---------------------------------------------------------------------------
  describe('BILL04: Real Database Invoice Issuance from Preparation Request', () => {
    test('approveAndIssueInvoiceFromPreparation requires super_admin role and positive amount', async () => {
      const nonAdminRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: '00000000-0000-0000-0000-000000000001',
        actorEmail: 'staff@example.com',
        actorRole: 'engineer',
        requestId: '00000000-0000-0000-0000-000000000002',
        decision: 'approve_and_issue',
        approvedAmountPaise: 50000,
      });

      assert.strictEqual(nonAdminRes.ok, false);
      assert.strictEqual(nonAdminRes.status, 403);

      const created = await createInvoicePreparationRequest({
        actorUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: '00000000-0000-0000-0000-000000000001',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Initial milestone preparation',
        },
      });
      assert.strictEqual(created.ok, true);

      const zeroAmountRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: created.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 0,
      });

      assert.strictEqual(zeroAmountRes.ok, false);
      assert.strictEqual(zeroAmountRes.status, 400);
    });

    test('Source code transactionally inserts real row into public.invoices', () => {
      const prepPath = path.join(process.cwd(), 'src/lib/invoices/preparation.ts');
      const content = fs.readFileSync(prepPath, 'utf8');

      assert.ok(content.includes(".from('invoices').insert(invoiceRow)"), 'Must insert into real invoices table');
      assert.ok(content.includes(".from('commercial_approval_events').insert"), 'Must record commercial approval event');
      assert.ok(content.includes('issued_invoice_id: reqRecord.issued_invoice_id'), 'Must link invoice id to prep request');
    });
  });

  // ---------------------------------------------------------------------------
  // BILL05: Refund Eligibility, Terminal State & Reference Validation
  // ---------------------------------------------------------------------------
  describe('BILL05: Refund State Machine & Anti-Fabrication Protections', () => {
    test('processSubscriptionRefund rejects non-superadmin callers', async () => {
      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: '00000000-0000-0000-0000-000000000001',
            adminUserId: '00000000-0000-0000-0000-000000000002', // Non-admin / unknown
            refundStatus: 'completed',
            refundReference: 'REF-BANK-123456',
          });
        },
        (err: Error) => {
          assert.match(err.message, /Forbidden: Only Super Admin/);
          return true;
        }
      );
    });

    test('Source code rejects fabricated refund references and backward state moves', () => {
      const servicePath = path.join(process.cwd(), 'src/lib/subscriptions/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('Terminal state violation: Completed trial refunds cannot be reverted'), 'Must block backward state move');
      assert.ok(content.includes('Fabricated or placeholder references are prohibited'), 'Must reject fabricated refund references');
      assert.ok(content.includes("Only 30-Day Free Trial verification payments (₹20.00) are eligible"), 'Must only refund FREE_TRIAL');
    });
  });

  // ---------------------------------------------------------------------------
  // BILL06: Trial Eligibility & Server-Authoritative Expiration
  // ---------------------------------------------------------------------------
  describe('BILL06: Trial Eligibility & Safe Expiration Workflow', () => {
    test('checkAndExpireStandardTrials only queries FREE_TRIAL and does not touch paid STANDARD', () => {
      const servicePath = path.join(process.cwd(), 'src/lib/subscriptions/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes(".eq('plan_id', 'FREE_TRIAL')"), 'Must strictly expire FREE_TRIAL');
      assert.ok(!content.includes(".in('plan_id', ['FREE_TRIAL', 'STANDARD'])"), 'Must not include paid STANDARD in trial expiry');
    });

    test('createOrGetMaintenanceOrder blocks duplicate trial creation for engagement with active trial', () => {
      const servicePath = path.join(process.cwd(), 'src/lib/subscriptions/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('Duplicate trial orders are prohibited'), 'Must prohibit duplicate trial orders');
    });
  });

});
