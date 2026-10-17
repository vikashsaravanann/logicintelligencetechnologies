// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Import configurations and services under test
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  calculatePlanPricing,
  formatPaiseToInr,
  MAINTENANCE_PLANS,
  MAINTENANCE_FEATURES_MATRIX,
} = require('../../src/config/maintenance-plans');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createOrGetMaintenanceOrder,
  submitMaintenanceUtr,
  verifyMaintenanceOrderAndActivate,
  processSubscriptionRefund,
  getClientActiveSubscription,
} = require('../../src/lib/subscriptions/service');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createInvoicePreparationRequest,
  approveAndIssueInvoiceFromPreparation,
} = require('../../src/lib/invoices/preparation');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabaseAdmin } = require('../../src/lib/supabase/admin');

describe('Adversarial Challenger Deep Stress Harness: Milestones 2 & 3', () => {
  const originalFrom = supabaseAdmin.from;

  let db: {
    maintenance_orders: any[];
    maintenance_subscriptions: any[];
    profiles: any[];
    email_outbox: any[];
    invoices: any[];
    invoice_preparation_requests: any[];
    staff_client_assignments: any[];
    client_engagements: any[];
    clients: any[];
  };

  const SUPERADMIN_ID = '05991d42-44b3-4fbb-baaa-c6db030844c7';
  const STAFF_ID = '11111111-1111-1111-1111-111111111111';
  const CLIENT_ID = '22222222-2222-2222-2222-222222222222';
  const ENGAGEMENT_ID = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    db = {
      maintenance_orders: [],
      maintenance_subscriptions: [],
      profiles: [
        { id: SUPERADMIN_ID, email: 'createwithvikash@gmail.com', role: 'super_admin' },
        { id: STAFF_ID, email: 'staff@lit.in', role: 'operations' },
        { id: CLIENT_ID, email: 'client@example.com', role: 'client' },
      ],
      email_outbox: [],
      invoices: [],
      invoice_preparation_requests: [],
      staff_client_assignments: [
        {
          id: 'assign-1',
          staff_user_id: STAFF_ID,
          client_id: CLIENT_ID,
          engagement_id: ENGAGEMENT_ID,
          can_prepare_invoices: true,
          status: 'active',
          is_active: true,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
      client_engagements: [
        {
          id: ENGAGEMENT_ID,
          client_id: CLIENT_ID,
          company_name: 'Test Corp',
          contact_email: 'client@example.com',
        },
      ],
      clients: [
        {
          id: CLIENT_ID,
          user_id: CLIENT_ID,
        },
      ],
    };

    // Configure chainable mock for Supabase PostgREST builder
    supabaseAdmin.from = (table: string) => {
      const store = (db as any)[table] || [];
      const filters: { [key: string]: any } = {};
      const neqFilters: { [key: string]: any } = {};
      const inFilters: { [key: string]: any[] } = {};
      let orClause: string | null = null;
      let limitCount: number | null = null;

      const builder: any = {
        select: (_fields?: string) => builder,
        eq: (col: string, val: any) => {
          filters[col] = val;
          return builder;
        },
        neq: (col: string, val: any) => {
          neqFilters[col] = val;
          return builder;
        },
        in: (col: string, vals: any[]) => {
          inFilters[col] = vals;
          return builder;
        },
        or: (clause: string) => {
          orClause = clause;
          return builder;
        },
        order: (_col: string, _opts?: any) => builder,
        limit: (n: number) => {
          limitCount = n;
          return builder;
        },
        then: (resolve: any, reject: any) => {
          return builder.execute().then(resolve, reject);
        },
        execute: async () => {
          let rows = store.filter((item: any) => {
            for (const [k, v] of Object.entries(filters)) {
              if (item[k] !== v) return false;
            }
            for (const [k, v] of Object.entries(neqFilters)) {
              if (item[k] === v) return false;
            }
            for (const [k, vals] of Object.entries(inFilters)) {
              if (!vals.includes(item[k])) return false;
            }
            if (orClause) {
              const parts = orClause.split(',');
              const matched = parts.some((p) => {
                const [f, op, val] = p.split('.');
                if (op === 'eq') {
                  return item[f] === val;
                }
                return false;
              });
              if (!matched) return false;
            }
            return true;
          });

          if (limitCount !== null) {
            rows = rows.slice(0, limitCount);
          }
          return { data: rows, error: null };
        },
        single: async () => {
          const res = await builder.execute();
          if (res.data.length === 0) {
            return { data: null, error: { message: `No rows found in ${table}` } };
          }
          return { data: res.data[0], error: null };
        },
        maybeSingle: async () => {
          const res = await builder.execute();
          return { data: res.data[0] || null, error: null };
        },
        insert: (record: any) => {
          const records = Array.isArray(record) ? record : [record];
          const inserted: any[] = [];
          for (const r of records) {
            const newRow = {
              id: r.id || `gen-${table}-${Date.now()}-${Math.random()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...r,
            };
            store.push(newRow);
            inserted.push(newRow);
          }

          const insertResult: any = {
            data: inserted,
            error: null,
            select: (_sel?: string) => ({
              single: async () => ({ data: inserted[0], error: null }),
              maybeSingle: async () => ({ data: inserted[0] || null, error: null }),
              then: (resolve: any, reject: any) => Promise.resolve({ data: inserted, error: null }).then(resolve, reject),
            }),
            then: (resolve: any, reject: any) => Promise.resolve({ data: inserted, error: null }).then(resolve, reject),
          };
          return insertResult;
        },
        update: (updates: any) => {
          const updateBuilder: any = {
            eq: (col: string, val: any) => {
              const rows = store.filter((item: any) => item[col] === val);
              for (const r of rows) {
                Object.assign(r, updates);
              }
              return {
                data: rows,
                error: null,
                select: (_sel?: string) => ({
                  single: async () => ({ data: rows[0] || null, error: rows.length ? null : { message: 'Not found' } }),
                  maybeSingle: async () => ({ data: rows[0] || null, error: null }),
                  then: (resolve: any, reject: any) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
                }),
                then: (resolve: any, reject: any) => {
                  Promise.resolve({ data: rows, error: null }).then(resolve, reject);
                },
              };
            },
          };
          return updateBuilder;
        },
      };

      return builder;
    };
  });

  afterEach(() => {
    supabaseAdmin.from = originalFrom;
  });

  // ===========================================================================
  // 1. PRICING TAMPERING & INTEGER ARITHMETIC ATTACKS
  // ===========================================================================
  describe('Vector 1: Pricing Tampering & Exact Paise Reconciliation', () => {
    test('ATTACK: Tampered order total in database is detected and rejected during verification', async () => {
      const tamperedOrderId = 'ord-tampered-001';
      db.maintenance_orders.push({
        id: tamperedOrderId,
        order_ref: 'LIT-MNT-HACK-001',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        total_amount_paise: 2000, // TAMPERED! Standard should be 117882 paise
        status: 'verification_pending',
        declared_utr: 'AXIS12345678',
        secure_token: 'sec_tok_valid123',
      });

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: tamperedOrderId,
            adminUserId: SUPERADMIN_ID,
            bankReference: 'AXIS-RECON-123456',
            creditedPaise: 2000,
          });
        },
        /Invalid payment amount: expected 117882 paise for plan STANDARD, found 2000 paise/
      );

      assert.strictEqual(db.maintenance_subscriptions.length, 0);
    });

    test('ATTACK: Partial payment (short by 1 paisa) is flagged and rejects activation', async () => {
      const orderId = 'ord-partial-001';
      db.maintenance_orders.push({
        id: orderId,
        order_ref: 'LIT-MNT-PARTIAL-001',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        total_amount_paise: 117882,
        status: 'verification_pending',
        declared_utr: 'HDFC99998888',
        secure_token: 'sec_tok_valid123',
      });

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId,
            adminUserId: SUPERADMIN_ID,
            bankReference: 'HDFC-RECON-000001',
            creditedPaise: 117881,
          });
        },
        /Partial payment detected\. Credited amount of 117881 paise is less than canonical order total of 117882 paise \(shortfall: 1 paise\)/
      );

      const order = db.maintenance_orders.find((o) => o.id === orderId);
      assert.strictEqual(order.metadata.payment_discrepancy, 'partial_payment');
      assert.strictEqual(order.metadata.shortfall_paise, 1);
      assert.strictEqual(db.maintenance_subscriptions.length, 0);
    });

    test('ATTACK: Zero or negative credited paise rejected with validation error', async () => {
      const orderId = 'ord-zero-001';
      db.maintenance_orders.push({
        id: orderId,
        order_ref: 'LIT-MNT-ZERO-001',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        total_amount_paise: 117882,
        status: 'verification_pending',
      });

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId,
            adminUserId: SUPERADMIN_ID,
            bankReference: 'AXIS-12345678',
            creditedPaise: 0,
          });
        },
        /Credited amount in paise must be a positive integer/
      );

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId,
            adminUserId: SUPERADMIN_ID,
            bankReference: 'AXIS-12345678',
            creditedPaise: -500,
          });
        },
        /Credited amount in paise must be a positive integer/
      );
    });

    test('ATTACK: Malformed or SQL-injected plan identifier throws unknown plan error', () => {
      const attackPayloads = [
        "STANDARD'; DROP TABLE maintenance_orders; --",
        '<script>alert(1)</script>',
        'free_trial',
        'standard',
        'ENTERPRISE_VIP',
        '',
        'null',
      ];

      for (const payload of attackPayloads) {
        assert.throws(
          () => calculatePlanPricing(payload as any),
          /Unknown maintenance plan/
        );
      }
    });
  });

  // ===========================================================================
  // 2. DUPLICATE UTR SUBMISSION & BANK RECONCILIATION RACE CONDITIONS
  // ===========================================================================
  describe('Vector 2: Duplicate UTR & Bank Reconciliation Defense', () => {
    test('ATTACK: Duplicate UTR across different orders is rejected (case-insensitive & trimmed)', async () => {
      const order1Id = 'ord-utr-001';
      const order2Id = 'ord-utr-002';

      db.maintenance_orders.push(
        {
          id: order1Id,
          order_ref: 'LIT-MNT-ORD-001',
          client_id: CLIENT_ID,
          engagement_id: ENGAGEMENT_ID,
          plan_id: 'STANDARD',
          secure_token: 'tok_alpha123',
          declared_utr: 'AXIS88776655',
          status: 'verification_pending',
        },
        {
          id: order2Id,
          order_ref: 'LIT-MNT-ORD-002',
          client_id: CLIENT_ID,
          engagement_id: ENGAGEMENT_ID,
          plan_id: 'BASIC',
          secure_token: 'tok_beta456',
          declared_utr: null,
          status: 'pending_payment',
        }
      );

      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-ORD-002',
            secureToken: 'tok_beta456',
            declaredUtr: '   axis88776655   ',
            declaredPayeeName: 'Sneaky Client',
          });
        },
        /UTR AXIS88776655 has already been submitted for another order \(LIT-MNT-ORD-001\)/
      );
    });

    test('ATTACK: Tampered secureToken rejects UTR submission', async () => {
      db.maintenance_orders.push({
        id: 'ord-token-001',
        order_ref: 'LIT-MNT-TOK-001',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        secure_token: 'genuine_cryptographic_token_xyz',
        status: 'pending_payment',
      });

      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-TOK-001',
            secureToken: 'guessed_or_forged_token',
            declaredUtr: 'AXIS12345678',
            declaredPayeeName: 'Test Client',
          });
        },
        /Unauthorized: Invalid cryptographic security token for this payment order/
      );
    });

    test('ATTACK: Re-submitting UTR on an already verified and settled order is blocked', async () => {
      db.maintenance_orders.push({
        id: 'ord-verified-001',
        order_ref: 'LIT-MNT-VER-001',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        secure_token: 'token_verified_123',
        declared_utr: 'HDFC11223344',
        status: 'verified',
      });

      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-VER-001',
            secureToken: 'token_verified_123',
            declaredUtr: 'NEWUTR998877',
            declaredPayeeName: 'Test Client',
          });
        },
        /This order has already been verified and settled by Super Admin/
      );
    });

    test('ATTACK: Reusing bank reconciliation reference across multiple orders is blocked', async () => {
      const order1Id = 'ord-bank-001';
      const order2Id = 'ord-bank-002';

      db.maintenance_orders.push(
        {
          id: order1Id,
          order_ref: 'LIT-MNT-BNK-001',
          client_id: CLIENT_ID,
          engagement_id: ENGAGEMENT_ID,
          plan_id: 'STANDARD',
          total_amount_paise: 117882,
          bank_reconciliation_ref: 'BANK-SHARED-REF-100',
          status: 'verified',
        },
        {
          id: order2Id,
          order_ref: 'LIT-MNT-BNK-002',
          client_id: CLIENT_ID,
          engagement_id: ENGAGEMENT_ID,
          plan_id: 'STANDARD',
          total_amount_paise: 117882,
          status: 'verification_pending',
        }
      );

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: order2Id,
            adminUserId: SUPERADMIN_ID,
            bankReference: 'BANK-SHARED-REF-100',
            creditedPaise: 117882,
          });
        },
        /Bank reconciliation reference BANK-SHARED-REF-100 has already been allocated to order LIT-MNT-BNK-001/
      );
    });
  });

  // ===========================================================================
  // 3. UNAUTHORIZED REFUNDS & TERMINAL STATE MACHINE ENFORCEMENT
  // ===========================================================================
  describe('Vector 3: Unauthorized Refunds & State Machine Integrity', () => {
    test('ATTACK: Non-superadmin staff attempting refund is blocked with 403 Forbidden', async () => {
      const subId = 'sub-trial-001';
      db.maintenance_subscriptions.push({
        id: subId,
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'FREE_TRIAL',
        status: 'active',
        refund_status: 'pending',
      });

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: subId,
            adminUserId: STAFF_ID,
            refundStatus: 'completed',
            refundReference: 'AXIS-REF-998877',
          });
        },
        /Forbidden: Only Super Admin can process trial refunds/
      );
    });

    test('ATTACK: Attempting refund on paid plan (STANDARD / BASIC) is rejected', async () => {
      const paidSubId = 'sub-paid-std-001';
      db.maintenance_subscriptions.push({
        id: paidSubId,
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'STANDARD',
        status: 'active',
        refund_status: 'not_applicable',
      });

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: paidSubId,
            adminUserId: SUPERADMIN_ID,
            refundStatus: 'completed',
            refundReference: 'AXIS-REF-123456',
          });
        },
        /Only 30-Day Free Trial verification payments \(₹20\.00\) are eligible for trial refunds/
      );
    });

    test('ATTACK: Reverting completed refund back to pending or processing is blocked', async () => {
      const completedSubId = 'sub-completed-refund-001';
      db.maintenance_subscriptions.push({
        id: completedSubId,
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'FREE_TRIAL',
        status: 'active',
        refund_status: 'completed',
        refund_reference: 'GENUINE-REF-778899',
      });

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: completedSubId,
            adminUserId: SUPERADMIN_ID,
            refundStatus: 'pending',
          });
        },
        /Terminal state violation: Completed trial refunds cannot be reverted to pending or processing/
      );

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: completedSubId,
            adminUserId: SUPERADMIN_ID,
            refundStatus: 'processing',
          });
        },
        /Terminal state violation: Completed trial refunds cannot be reverted to pending or processing/
      );
    });

    test('ATTACK: Marking refund completed with fake reference (REF-FAKE-*) is rejected', async () => {
      const subId = 'sub-trial-ref-001';
      db.maintenance_subscriptions.push({
        id: subId,
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'FREE_TRIAL',
        status: 'active',
        refund_status: 'pending',
      });

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: subId,
            adminUserId: SUPERADMIN_ID,
            refundStatus: 'completed',
            refundReference: 'REF-FAKE-123456',
          });
        },
        /A valid bank or UPI transaction reference is required to mark a refund as completed\. Fabricated or placeholder references are prohibited/
      );
    });
  });

  // ===========================================================================
  // 4. TRIAL-TO-PAID BOUNDARY CONDITIONS & UPGRADE LIFECYCLE
  // ===========================================================================
  describe('Vector 4: Trial-to-Paid Boundary Conditions & Upgrade Path', () => {
    test('BOUNDARY: Client with existing Free Trial is PROHIBITED from creating second Free Trial', async () => {
      db.maintenance_subscriptions.push({
        id: 'sub-existing-trial',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'FREE_TRIAL',
        status: 'completed',
      });

      await assert.rejects(
        async () => {
          await createOrGetMaintenanceOrder({
            clientId: CLIENT_ID,
            engagementId: ENGAGEMENT_ID,
            planId: 'FREE_TRIAL',
          });
        },
        /A 30-Day Free Trial has already been evaluated or is currently active for this engagement\. Duplicate trial orders are prohibited/
      );
    });

    test('BOUNDARY: Client with expired or active Free Trial CAN seamlessly upgrade to paid STANDARD care', async () => {
      db.maintenance_subscriptions.push({
        id: 'sub-expired-trial',
        client_id: CLIENT_ID,
        engagement_id: ENGAGEMENT_ID,
        plan_id: 'FREE_TRIAL',
        status: 'expired',
      });

      const res = await createOrGetMaintenanceOrder({
        clientId: CLIENT_ID,
        engagementId: ENGAGEMENT_ID,
        planId: 'STANDARD',
      });

      assert.ok(res.order, 'Order must be created');
      assert.strictEqual(res.order.plan_id, 'STANDARD');
      assert.strictEqual(res.order.total_amount_paise, 117882);
      assert.strictEqual(res.pricing.planType, 'paid');
      assert.strictEqual(res.pricing.refundablePaise, 0);

      const activation = await verifyMaintenanceOrderAndActivate({
        orderId: res.order.id,
        adminUserId: SUPERADMIN_ID,
        bankReference: 'AXIS-UPGRADE-12345',
        creditedPaise: 117882,
      });

      assert.ok(activation.subscription);
      assert.strictEqual(activation.subscription.plan_id, 'STANDARD');
      assert.strictEqual(activation.subscription.status, 'active');
      assert.strictEqual(activation.subscription.refund_status, 'not_applicable');
    });

    test('BOUNDARY: Features matrix and plan catalog strictly separate STANDARD from FREE_TRIAL', () => {
      const trialPlan = MAINTENANCE_PLANS.FREE_TRIAL;
      const stdPlan = MAINTENANCE_PLANS.STANDARD;

      assert.strictEqual(trialPlan.planType, 'free_trial');
      assert.strictEqual(stdPlan.planType, 'paid');

      assert.strictEqual(trialPlan.refundablePaise, 2000);
      assert.strictEqual(stdPlan.refundablePaise, 0);

      assert.strictEqual(trialPlan.basePricePaise, 0);
      assert.strictEqual(stdPlan.basePricePaise, 99900);

      // Verify feature matrix separation for ticketing SLA
      const ticketingFeature = MAINTENANCE_FEATURES_MATRIX.find((f: any) => f.id === 'f-ticketing');
      assert.ok(ticketingFeature);
      assert.strictEqual(ticketingFeature.freeTrial, 'General Enquiry');
      assert.strictEqual(ticketingFeature.standard, 'Standard Queue');
    });
  });

  // ===========================================================================
  // 5. INVOICE ISSUANCE COMMERCIAL BOUNDARIES (BILL06)
  // ===========================================================================
  describe('Vector 5: Invoice Preparation Commercial Boundaries (BILL06)', () => {
    test('ATTACK: Staff attempting to include commercial fields in preparation request is rejected', async () => {
      const commercialAttacks = [
        { price: 50000 },
        { total_paise: 50000 },
        { discount: 10 },
        { tax_paise: 1800 },
        { unit_price: 25000 },
      ];

      for (const attack of commercialAttacks) {
        const res = await createInvoicePreparationRequest({
          actorUserId: STAFF_ID,
          actorEmail: 'staff@lit.in',
          actorRole: 'operations',
          rawPayload: {
            engagementId: ENGAGEMENT_ID,
            milestoneKey: 'initial_50_advance',
            deliverableSummary: 'Attempted price injection',
            ...attack,
          },
        });

        assert.strictEqual(res.ok, false);
        assert.strictEqual(res.status, 403);
        assert.match(res.message, /Policy 1 violation: Staff invoice preparation requests cannot contain/);
      }
    });

    test('ATTACK: Non-superadmin cannot approve invoice preparation or issue invoice', async () => {
      // First create a clean preparation request as Superadmin
      const prep = await createInvoicePreparationRequest({
        actorUserId: SUPERADMIN_ID,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: ENGAGEMENT_ID,
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Genuine technical work ready for commercial approval',
        },
      });

      assert.strictEqual(prep.ok, true);

      // Staff tries to approve and issue invoice
      const approveRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: STAFF_ID,
        actorEmail: 'staff@lit.in',
        actorRole: 'operations',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 500000,
      });

      assert.strictEqual(approveRes.ok, false);
      assert.strictEqual(approveRes.status, 403);
      assert.match(approveRes.message, /Policy 1 violation: Only Super Admin/);
    });

    test('INTEGRITY: Superadmin approval issues real invoice and links record idempotently', async () => {
      const prep = await createInvoicePreparationRequest({
        actorUserId: SUPERADMIN_ID,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: ENGAGEMENT_ID,
          milestoneKey: 'final_50_deployment',
          deliverableSummary: 'Final deployment verified',
        },
      });

      assert.strictEqual(prep.ok, true);

      // Superadmin approves with 100000 paise (₹1000)
      const issueRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: SUPERADMIN_ID,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 100000,
      });

      assert.strictEqual(issueRes.ok, true);
      assert.ok(issueRes.invoice);
      assert.strictEqual(issueRes.invoice.amount_paise, 100000);
      assert.strictEqual(issueRes.request.status, 'approved_and_issued');

      // Repeated approval must be idempotent and return existing invoice
      const repeatRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: SUPERADMIN_ID,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 100000,
      });

      assert.strictEqual(repeatRes.ok, true);
      assert.strictEqual(repeatRes.invoice.id, issueRes.invoice.id);
      assert.strictEqual(repeatRes.invoice.amount_paise, 100000);
    });
  });
});
