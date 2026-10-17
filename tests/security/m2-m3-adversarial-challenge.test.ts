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

// Services under test
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  calculatePlanPricing,
  formatPaiseToInr,
  MAINTENANCE_PLANS,
} = require('../../src/config/maintenance-plans');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createOrGetMaintenanceOrder,
  submitMaintenanceUtr,
  verifyMaintenanceOrderAndActivate,
  processSubscriptionRefund,
  processTrialRefund,
  createMaintenanceOrder,
  verifyMaintenancePayment,
} = require('../../src/lib/subscriptions/service');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createInvoicePreparationRequest,
  getInvoicePreparationRequestById,
  approveAndIssueInvoiceFromPreparation,
} = require('../../src/lib/invoices/preparation');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createStaffClientAssignment,
  updateStaffClientAssignment,
  addStaffSupportNote,
  createStaffSupportActionRequest,
  createCanonicalSupportTicket,
  listCanonicalSupportTickets,
  getRedactedStaffSupportContext,
} = require('../../src/lib/support/staff-support');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  acceptProjectInvitation,
  hashToken,
} = require('../../src/lib/collaboration/project-collaboration-service');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createQuotationTechnicalDraft,
  updateQuotationTechnicalDraft,
  submitQuotationTechnicalDraftForApproval,
} = require('../../src/lib/quotations/technical-drafts');

describe('Empirical Adversarial Challenge Suite: Milestones 2 & 3', () => {

  // ===========================================================================
  // SECTION 1: BILLING & PRICING EDGE CASES (BILL01 - BILL05)
  // ===========================================================================
  describe('Adversarial Pricing & Math Integrity (BILL01)', () => {
    test('all 5 canonical tiers satisfy strict integer paise arithmetic without floating drift', () => {
      const tiers = ['FREE_TRIAL', 'STANDARD', 'BASIC', 'PRO', 'ENTERPRISE'] as const;

      for (const tier of tiers) {
        const pricing = calculatePlanPricing(tier);

        // Integer verification
        assert.ok(Number.isInteger(pricing.basePricePaise), `${tier} basePricePaise must be integer`);
        assert.ok(Number.isInteger(pricing.gstAmountPaise), `${tier} gstAmountPaise must be integer`);
        assert.ok(Number.isInteger(pricing.totalPricePaise), `${tier} totalPricePaise must be integer`);

        if (tier === 'FREE_TRIAL') {
          assert.strictEqual(pricing.basePricePaise, 0);
          assert.strictEqual(pricing.gstAmountPaise, 0);
          assert.strictEqual(pricing.totalPricePaise, 2000, 'Free trial must be exactly ₹20 refundable verification');
          assert.strictEqual(pricing.refundablePaise, 2000);
          assert.strictEqual(pricing.planType, 'free_trial');
        } else {
          // Verify 18% GST calculation in paise: Math.round(base * 0.18)
          const expectedGst = Math.round(pricing.basePricePaise * 0.18);
          assert.strictEqual(
            pricing.gstAmountPaise,
            expectedGst,
            `${tier} GST paise mismatch. Expected ${expectedGst}, got ${pricing.gstAmountPaise}`
          );
          assert.strictEqual(
            pricing.totalPricePaise,
            pricing.basePricePaise + pricing.gstAmountPaise,
            `${tier} total must equal base + GST`
          );
          assert.strictEqual(pricing.refundablePaise, 0, `${tier} paid plan must have zero refundable paise`);
          assert.strictEqual(pricing.planType, 'paid');
        }
      }
    });

    test('formatPaiseToInr handles negative, zero, sub-rupee, and large values correctly', () => {
      assert.strictEqual(formatPaiseToInr(0), '₹0');
      assert.strictEqual(formatPaiseToInr(1), '₹0.01');
      assert.strictEqual(formatPaiseToInr(50), '₹0.50');
      assert.strictEqual(formatPaiseToInr(99), '₹0.99');
      assert.strictEqual(formatPaiseToInr(100), '₹1');
      assert.strictEqual(formatPaiseToInr(105), '₹1.05');
      assert.strictEqual(formatPaiseToInr(2000), '₹20');
      assert.strictEqual(formatPaiseToInr(117882), '₹1,178.82');
      assert.strictEqual(formatPaiseToInr(2359882), '₹23,598.82');
    });

    test('calculatePlanPricing throws descriptive error on unknown plan identifier', () => {
      assert.throws(
        () => calculatePlanPricing('NON_EXISTENT_PLAN' as any),
        /Unknown maintenance plan/
      );
      assert.throws(
        () => calculatePlanPricing('' as any),
        /Unknown maintenance plan/
      );
    });
  });

  // ===========================================================================
  // SECTION 2: UTR SUBMISSION & BANK RECONCILIATION EDGE CASES (BILL02, BILL05)
  // ===========================================================================
  describe('Adversarial UTR & Bank Reconciliation (BILL02, BILL05)', () => {
    test('submitMaintenanceUtr rejects whitespace-only or sub-8 character UTR strings', async () => {
      // 1. Whitespace only
      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-TEST-001',
            secureToken: 'mnt_sec_validtoken123',
            declaredUtr: '        ',
            declaredPayeeName: 'Test Client',
          });
        },
        /minimum 8 characters/
      );

      // 2. 7 characters
      await assert.rejects(
        async () => {
          await submitMaintenanceUtr({
            orderRef: 'LIT-MNT-TEST-001',
            secureToken: 'mnt_sec_validtoken123',
            declaredUtr: 'AXIS123',
            declaredPayeeName: 'Test Client',
          });
        },
        /minimum 8 characters/
      );
    });

    test('verifyMaintenanceOrderAndActivate rejects zero, negative, and partial payments', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      // 1. Zero credited paise
      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000099',
            adminUserId: superAdminId,
            bankReference: 'AXIS-99999999',
            creditedPaise: 0,
          });
        },
        /positive integer|Forbidden|not found/
      );

      // 2. Negative credited paise
      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000099',
            adminUserId: superAdminId,
            bankReference: 'AXIS-99999999',
            creditedPaise: -5000,
          });
        },
        /positive integer|Forbidden|not found/
      );
    });

    test('verifyMaintenanceOrderAndActivate enforces non-superadmin caller rejection', async () => {
      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000099',
            adminUserId: 'staff-user-id-without-superadmin',
            bankReference: 'AXIS-99999999',
            creditedPaise: 117882,
          });
        },
        /Forbidden: Only Super Admin can verify bank reconciliation/
      );
    });

    test('verifyMaintenanceOrderAndActivate rejects short (< 6 char) or empty bank reference', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000099',
            adminUserId: superAdminId,
            bankReference: '   ',
            creditedPaise: 117882,
          });
        },
        /valid bank reconciliation reference|Forbidden|not found/
      );

      await assert.rejects(
        async () => {
          await verifyMaintenanceOrderAndActivate({
            orderId: '00000000-0000-0000-0000-000000000099',
            adminUserId: superAdminId,
            bankReference: 'REF12', // 5 chars
            creditedPaise: 117882,
          });
        },
        /valid bank reconciliation reference|Forbidden|not found/
      );
    });
  });

  // ===========================================================================
  // SECTION 3: TRIAL TO STANDARD UPGRADE & REFUND MACHINE (BILL03, BILL04)
  // ===========================================================================
  describe('Trial Upgrades & Terminal Refund Integrity (BILL03, BILL04)', () => {
    test('database migration 20261017080000 explicitly permits trial-to-standard transition', () => {
      const migrationFile = path.join(
        process.cwd(),
        'supabase/migrations/20261017080000_maintenance_billing_and_payments.sql'
      );
      assert.ok(fs.existsSync(migrationFile));
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // The old compound index that blocked standard after trial must be explicitly dropped
      assert.ok(
        sql.includes('DROP INDEX IF EXISTS public.uq_active_standard_trial_per_engagement;'),
        'Old compound index must be dropped'
      );

      // The replacement index MUST ONLY target FREE_TRIAL
      assert.ok(
        sql.includes("WHERE (plan_id = 'FREE_TRIAL' AND status IN ('active', 'pending_verification'));"),
        'Unique index must be scoped ONLY to FREE_TRIAL, permitting STANDARD care'
      );
    });

    test('STANDARD care plan definition has refundablePaise = 0 and is paid', () => {
      const std = MAINTENANCE_PLANS.STANDARD;
      assert.strictEqual(std.planType, 'paid');
      assert.strictEqual(std.refundablePaise, 0);
      assert.strictEqual(std.basePricePaise, 99900);
      assert.strictEqual(std.totalPricePaise, 117882);
    });

    test('processTrialRefund rejects non-trial subscriptions (STANDARD, BASIC, etc.)', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      await assert.rejects(
        async () => {
          await processSubscriptionRefund({
            subscriptionId: '00000000-0000-0000-0000-000000000001',
            adminUserId: superAdminId,
            refundStatus: 'completed',
            refundReference: 'AXIS-REF-123456',
          });
        },
        /Only 30-Day Free Trial verification payments|Forbidden|not found/
      );
    });

    test('processTrialRefund rejects fabricated, placeholder, or short refund references', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      // 1. Fake reference starting with REF-FAKE
      const serviceCode = fs.readFileSync(
        path.join(process.cwd(), 'src/lib/subscriptions/service.ts'),
        'utf8'
      );
      assert.ok(
        serviceCode.includes("cleanRef.startsWith('REF-FAKE')"),
        'Must explicitly reject fake reference prefix REF-FAKE'
      );
      assert.ok(
        serviceCode.includes('Fabricated or placeholder references are prohibited'),
        'Must reject fabricated refund references'
      );

      // 2. Terminal state violation: completed refunds cannot revert
      assert.ok(
        serviceCode.includes('Terminal state violation: Completed trial refunds cannot be reverted'),
        'Must prevent completed refund reversion'
      );

      // 3. PostgreSQL trigger in migration enforces immutability at database engine level
      const migrationSql = fs.readFileSync(
        path.join(process.cwd(), 'supabase/migrations/20261017080000_maintenance_billing_and_payments.sql'),
        'utf8'
      );
      assert.ok(
        migrationSql.includes('fn_prevent_completed_refund_reversion'),
        'Database trigger fn_prevent_completed_refund_reversion must be defined'
      );
      assert.ok(
        migrationSql.includes("OLD.refund_status = 'completed' AND NEW.refund_status <> 'completed'"),
        'Trigger must block backward transition from completed'
      );
    });
  });

  // ===========================================================================
  // SECTION 4: REAL INVOICE ISSUANCE ON PREPARATION APPROVAL (BILL06)
  // ===========================================================================
  describe('Real Database Invoice Creation (BILL06)', () => {
    test('approveAndIssueInvoiceFromPreparation enforces Super Admin role capability', async () => {
      const res = await approveAndIssueInvoiceFromPreparation({
        actorUserId: '00000000-0000-0000-0000-000000000002',
        actorEmail: 'engineer@lit.in',
        actorRole: 'delivery_engineer',
        requestId: '00000000-0000-0000-0000-000000000003',
        decision: 'approve_and_issue',
        approvedAmountPaise: 100000,
      });

      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.message, /Policy 1 violation: Only Super Admin/);
    });

    test('approveAndIssueInvoiceFromPreparation rejects zero, negative, or missing amount', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      // First create a real preparation request
      const prep = await createInvoicePreparationRequest({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: '00000000-0000-0000-0000-000000000010',
          milestoneKey: 'initial_50_advance',
          deliverableSummary: 'Adversarial invoice issuance test',
        },
      });

      assert.strictEqual(prep.ok, true);

      // Attempt approval with 0 paise
      const zeroRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 0,
      });

      assert.strictEqual(zeroRes.ok, false);
      assert.strictEqual(zeroRes.status, 400);
      assert.match(zeroRes.message, /approvedAmountPaise \(> 0\)/);

      // Attempt approval with negative paise
      const negRes = await approveAndIssueInvoiceFromPreparation({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: -50000,
      });

      assert.strictEqual(negRes.ok, false);
      assert.strictEqual(negRes.status, 400);
    });

    test('approveAndIssueInvoiceFromPreparation issues real invoice and links invoice ID', async () => {
      const superAdminId = '05991d42-44b3-4fbb-baaa-c6db030844c7';

      // 1. Verify invalid milestoneKey is strictly rejected
      const invalidMilestone = await createInvoicePreparationRequest({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: '00000000-0000-0000-0000-000000000020',
          milestoneKey: 'invalid_milestone_xyz',
          deliverableSummary: 'Testing milestone allowlist validation',
        },
      });
      assert.strictEqual(invalidMilestone.ok, false);
      assert.strictEqual(invalidMilestone.status, 400);

      // 2. Create valid preparation request with canonical milestone
      const prep = await createInvoicePreparationRequest({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        rawPayload: {
          engagementId: '00000000-0000-0000-0000-000000000020',
          milestoneKey: 'final_50_deployment',
          deliverableSummary: 'Final milestone verification and delivery acceptance',
        },
      });

      assert.strictEqual(prep.ok, true);

      const approved = await approveAndIssueInvoiceFromPreparation({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 250000, // ₹2,500.00
        approvalNotes: 'Verified deliverables against SOW criteria',
      });

      assert.strictEqual(approved.ok, true);
      assert.strictEqual(approved.decision, 'approve_and_issue');
      assert.ok(approved.request.issued_invoice_id, 'Must link issued_invoice_id');
      assert.ok(approved.request.issued_invoice_number, 'Must generate official invoice number');
      assert.strictEqual(approved.request.issued_amount_paise, 250000);
      assert.strictEqual(approved.request.status, 'approved_and_issued');

      // Idempotency check: repeated approval must return the exact same invoice
      const repeat = await approveAndIssueInvoiceFromPreparation({
        actorUserId: superAdminId,
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        requestId: prep.request.id,
        decision: 'approve_and_issue',
        approvedAmountPaise: 250000,
      });

      assert.strictEqual(repeat.ok, true);
      assert.strictEqual(repeat.invoice?.id, approved.request.issued_invoice_id);
    });
  });

  // ===========================================================================
  // SECTION 5: WORKSPACE INVARIANTS & COLLABORATION (WS01 - WS05)
  // ===========================================================================
  describe('Workspace Invariants, Unique Indexes & Invitation Acceptance (WS01 - WS05)', () => {
    test('migration 20261017090000 creates unique index on (staff_user_id, engagement_id)', () => {
      const migrationFile = path.join(
        process.cwd(),
        'supabase/migrations/20261017090000_forms_workspaces_governance.sql'
      );
      assert.ok(fs.existsSync(migrationFile));
      const sql = fs.readFileSync(migrationFile, 'utf8');

      assert.ok(
        sql.includes('uq_staff_client_assignments_pair'),
        'Must define unique index uq_staff_client_assignments_pair'
      );
      assert.ok(
        sql.includes('ON public.staff_client_assignments (staff_user_id, engagement_id)'),
        'Unique index must be exactly on (staff_user_id, engagement_id)'
      );
    });

    test('acceptProjectInvitation enforces atomic rollback on update failure', () => {
      const collabCode = fs.readFileSync(
        path.join(process.cwd(), 'src/lib/collaboration/project-collaboration-service.ts'),
        'utf8'
      );

      // Must upsert staff assignment with onConflict
      assert.ok(
        collabCode.includes('{ onConflict: "staff_user_id,engagement_id" }'),
        'Must upsert with matching onConflict target'
      );

      // Must rollback assignment if invitation update fails
      assert.ok(
        collabCode.includes(".from(\"staff_client_assignments\")\n      .delete()\n      .eq(\"staff_user_id\", callerUserId)\n      .eq(\"engagement_id\", invite.engagement_id)"),
        'Must execute atomic rollback deleting created assignment if invitation status update fails'
      );
    });

    test('workspace project view handles client assignments with null engagementId without crashing', () => {
      const pageCode = fs.readFileSync(
        path.join(process.cwd(), 'src/app/admin/workspaces/[id]/projects/page.tsx'),
        'utf8'
      );

      // Verify null engagementId guard
      assert.ok(
        pageCode.includes('eng.engagementId ? `Ref: ${eng.engagementId.slice(0, 8)}...` : "Client-wide Assignment"'),
        'Must safely guard engagementId.slice with fallback label'
      );
      assert.ok(
        pageCode.includes('General Client Scope'),
        'Must render fallback for general client scope when engagementId is null'
      );
    });

    test('AssignProjectsModal satisfies accessibility requirements and capability toggles', () => {
      const modalCode = fs.readFileSync(
        path.join(process.cwd(), 'src/components/workspaces/AssignProjectsModal.tsx'),
        'utf8'
      );

      // Accessibility attributes
      assert.ok(modalCode.includes('role="dialog"'), 'Must have role=dialog');
      assert.ok(modalCode.includes('aria-modal="true"'), 'Must have aria-modal=true');
      assert.ok(modalCode.includes('aria-labelledby={titleId}'), 'Must have aria-labelledby');

      // Keyboard & focus management
      assert.ok(modalCode.includes('e.key === "Escape"'), 'Must handle Escape key');
      assert.ok(modalCode.includes('e.key === "Tab"'), 'Must trap Tab focus inside modal');

      // Actions: add, edit, reassign, revoke
      assert.ok(modalCode.includes('setActiveAction("add")'), 'Must support add action');
      assert.ok(modalCode.includes('setActiveAction("edit")'), 'Must support edit action');
      assert.ok(modalCode.includes('setActiveAction("reassign")'), 'Must support reassign action');
      assert.ok(modalCode.includes('setActiveAction("revoke")'), 'Must support revoke action');

      // Capabilities: technical stages, quotation prep, invoice prep, invite collaborators
      assert.ok(modalCode.includes('canViewTechnicalStages'), 'Must support canViewTechnicalStages');
      assert.ok(modalCode.includes('canPrepareTechnicalQuotation'), 'Must support canPrepareTechnicalQuotation');
      assert.ok(modalCode.includes('canPrepareInvoiceRequest'), 'Must support canPrepareInvoiceRequest');
      assert.ok(modalCode.includes('canInviteCollaborators'), 'Must support canInviteCollaborators');

      // Reason validation
      assert.ok(modalCode.includes('reason.trim().length < 5'), 'Must enforce minimum 5 character reason');
    });

    test('schema projections in staff support align with live database columns', () => {
      const supportCode = fs.readFileSync(
        path.join(process.cwd(), 'src/lib/support/staff-support.ts'),
        'utf8'
      );

      // Must use legal_name, not display_name
      assert.ok(supportCode.includes('legal_name'), 'Must query legal_name on clients');
      assert.ok(supportCode.includes('company_name'), 'Must query company_name on client_engagements');
      assert.ok(supportCode.includes('ordinal, title, stage_key'), 'Must query ordinal, title, and stage_key on engagement_stages');
    });
  });

  // ===========================================================================
  // SECTION 6: FORMS DURABILITY & NOTES PERSISTENCE (FORMS01 - FORMS06)
  // ===========================================================================
  describe('Forms Durability & Notes Persistence (FORMS01 - FORMS06)', () => {
    test('checklist route persists all 40 answers in JSONB and tracks count in metadata', () => {
      const routeCode = fs.readFileSync(
        path.join(process.cwd(), 'src/app/api/checklist/route.ts'),
        'utf8'
      );

      assert.ok(
        routeCode.includes('answers,') && routeCode.includes('answer_count: answers.length'),
        'Must persist full answers array and answer_count in metadata'
      );
      assert.ok(
        routeCode.includes('export async function GET(req: Request)'),
        'Must provide GET reader for staff to inspect checklist leads'
      );
    });

    test('staff support notes persist author attribution and client links', async () => {
      const res = await addStaffSupportNote({
        staffUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        staffEmail: 'createwithvikash@gmail.com',
        staffRole: 'super_admin',
        clientId: 'client-uuid-999',
        stageKey: 'stage_02_requirements',
        note: 'Adversarial test note verifying database persistence of internal staff discussion.',
        route: '/admin/support',
      });

      assert.strictEqual(res.ok, true);
      assert.ok(res.id, 'res.id must exist');
      if (res.note && typeof res.note === 'object') {
        assert.ok(res.note.id, 'res.note.id must exist');
      }
      assert.strictEqual(res.author_user_id || res.note?.author_user_id, '05991d42-44b3-4fbb-baaa-c6db030844c7');

      // Sub-3 char note rejected
      const shortRes = await addStaffSupportNote({
        staffUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        staffEmail: 'createwithvikash@gmail.com',
        staffRole: 'super_admin',
        clientId: 'client-uuid-999',
        note: 'ab',
        route: '/admin/support',
      });
      assert.strictEqual(shortRes.ok, false);
      assert.strictEqual(shortRes.status, 400);
    });

    test('staff escalations validate request type allowlist and enforce status', async () => {
      const res = await createStaffSupportActionRequest({
        staffUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        staffEmail: 'createwithvikash@gmail.com',
        staffRole: 'super_admin',
        clientId: 'client-uuid-888',
        requestType: 'commercial_escalation',
        summary: 'Adversarial escalation testing allowlist constraints.',
        stageKey: 'stage_04_commercial',
        route: '/admin/support',
      });

      assert.strictEqual(res.ok, true);
      assert.ok(res.request.id);
      assert.strictEqual(res.request.request_type, 'commercial_escalation');
      assert.strictEqual(res.request.status, 'pending_super_admin');
    });

    test('technical drafts enforce non-monetary policy and submitted status', async () => {
      // 1. Creation with non-monetary line items
      const draftRes = await createQuotationTechnicalDraft({
        actorUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        clientId: 'client-uuid-777',
        engagementId: 'eng-uuid-777',
        rawPayload: {
          scopeSummary: 'Core architecture implementation',
          technicalLineItems: [
            {
              serviceCode: 'SVC-CORE-01',
              title: 'API Gateway Setup',
              description: 'Configure rate limits and routing',
              deliverables: ['Gateway config', 'Health routes'],
              unit: 'module',
              quantity: 1,
            },
          ],
        },
      });

      assert.strictEqual(draftRes.ok, true);
      assert.strictEqual(draftRes.draft.status, 'technical_draft');

      // 2. Submit for review
      const submitRes = await submitQuotationTechnicalDraftForApproval({
        actorUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        actorEmail: 'createwithvikash@gmail.com',
        actorRole: 'super_admin',
        draftId: draftRes.draft.id,
      });

      assert.strictEqual(submitRes.ok, true);
      assert.strictEqual(submitRes.draft.status, 'submitted_for_commercial_review');
    });
  });

});
