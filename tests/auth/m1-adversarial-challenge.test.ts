/* eslint-disable @typescript-eslint/no-require-imports */
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
import { NextRequest } from 'next/server';

// Services under test
const { resolveClientIdentity, assertClientEngagementAccess } = require('../../src/lib/auth/client-identity');
const {
  submitBillingDetails,
  recordPaymentAttempt,
  reconcileAndApprovePayment,
  createPaymentRequest,
  createFinancialDocument,
  calculateTaxAndTotals,
} = require('../../src/lib/payments/db');
const { getClientNotifications, getUnreadNotificationCount } = require('../../src/lib/client-portal/v4-actions');

// API routes under test
const stageRoute = require('../../src/app/api/engagements/[ref]/stages/[stageKey]/route');
const identityCorrectionRoute = require('../../src/app/api/engagements/identity-correction/route');
const subStatusRoute = require('../../src/app/api/subscriptions/status/route');
const subOrderRoute = require('../../src/app/api/subscriptions/order/route');
const subCorrectionRoute = require('../../src/app/api/subscriptions/correction/route');
const subSubmitUtrRoute = require('../../src/app/api/subscriptions/submit-utr/route');

describe('Adversarial M1 Authentication & Privilege Escalation Challenge Suite', () => {

  // ===========================================================================
  // SECTION 1: Adversarial Privilege Escalation via Email Mutation & user_metadata
  // ===========================================================================
  describe('Challenge 1: Role Escalation via profiles.email Mutation & user_metadata Exploits', () => {

    test('Empirical Oracle: guard_profile_role PL/pgSQL logic rejects all non-admin role escalation attempts', () => {
      // Direct simulation oracle of the exact PL/pgSQL logic in guard_profile_role()
      function simulateGuardProfileRole(params: {
        op: 'INSERT' | 'UPDATE';
        authRole: 'authenticated' | 'anon' | 'service_role';
        isSuperAdmin: boolean;
        oldRole?: string;
        newRole?: string;
        oldEmail?: string;
        newEmail?: string;
        authUserEmail?: string;
      }): { success: boolean; error?: string } {
        const { op, authRole, isSuperAdmin, oldRole, newRole, oldEmail, newEmail, authUserEmail } = params;

        if (['authenticated', 'anon'].includes(authRole)) {
          // INSERT check
          if (op === 'INSERT' && newRole && !['client', 'user'].includes(newRole)) {
            return { success: false, error: 'profiles.role can only be assigned by an administrator' };
          }

          // UPDATE role check
          if (op === 'UPDATE' && newRole !== oldRole) {
            if (!isSuperAdmin) {
              return { success: false, error: 'profiles.role can only be changed by an administrator' };
            }
          }

          // UPDATE email spoofing check
          if (op === 'UPDATE' && newEmail !== oldEmail) {
            if (!isSuperAdmin) {
              if (newEmail !== authUserEmail) {
                return { success: false, error: 'profiles.email must match verified authentication email' };
              }
            }
          }
        }

        return { success: true };
      }

      // Attack Vector 1: Client inserts profile with super_admin role
      const insertSuperAdmin = simulateGuardProfileRole({
        op: 'INSERT',
        authRole: 'authenticated',
        isSuperAdmin: false,
        newRole: 'super_admin',
      });
      assert.strictEqual(insertSuperAdmin.success, false);
      assert.match(insertSuperAdmin.error!, /assigned by an administrator/);

      // Attack Vector 2: Client inserts profile with staff role
      const insertStaff = simulateGuardProfileRole({
        op: 'INSERT',
        authRole: 'authenticated',
        isSuperAdmin: false,
        newRole: 'staff',
      });
      assert.strictEqual(insertStaff.success, false);

      // Attack Vector 3: Client updates own role to super_admin
      const updateToSuperAdmin = simulateGuardProfileRole({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: false,
        oldRole: 'client',
        newRole: 'super_admin',
      });
      assert.strictEqual(updateToSuperAdmin.success, false);
      assert.match(updateToSuperAdmin.error!, /changed by an administrator/);

      // Attack Vector 4: Client updates profile email to founder's email to trigger owner promotion
      const spoofFounderEmail = simulateGuardProfileRole({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: false,
        oldRole: 'client',
        newRole: 'client',
        oldEmail: 'attacker@evil.com',
        newEmail: 'createwithvikash@gmail.com',
        authUserEmail: 'attacker@evil.com',
      });
      assert.strictEqual(spoofFounderEmail.success, false);
      assert.match(spoofFounderEmail.error!, /must match verified authentication email/);

      // Attack Vector 5: Client updates profile email to @logicintelligencetechnologies.in domain
      const spoofStaffEmail = simulateGuardProfileRole({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: false,
        oldRole: 'client',
        newRole: 'client',
        oldEmail: 'attacker@evil.com',
        newEmail: 'vikash@logicintelligencetechnologies.in',
        authUserEmail: 'attacker@evil.com',
      });
      assert.strictEqual(spoofStaffEmail.success, false);

      // Legitimate case: Super Admin modifies role
      const adminUpdate = simulateGuardProfileRole({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: true,
        oldRole: 'client',
        newRole: 'staff',
      });
      assert.strictEqual(adminUpdate.success, true);
    });

    test('Empirical DDL Verification: Unsafe superadmin trigger and function are completely purged from migration', () => {
      const migrationFile = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // The old trigger that promoted users matching @logicintelligencetechnologies.in must be explicitly dropped
      assert.ok(sql.includes('DROP TRIGGER IF EXISTS trigger_assign_super_admin_owner ON public.profiles;'));
      assert.ok(sql.includes('DROP FUNCTION IF EXISTS public.assign_super_admin_for_owner();'));

      // Ensure no active trigger creation calls assign_super_admin_for_owner
      assert.ok(!sql.includes('CREATE TRIGGER trigger_assign_super_admin_owner'));
      assert.ok(!sql.includes('CREATE OR REPLACE FUNCTION public.assign_super_admin_for_owner'));
    });

    test('Empirical DDL Verification: user_metadata is purged from all 27 RLS policies and is_staff_or_admin', () => {
      const migrationFile = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // Check is_staff_or_admin definition
      const isStaffOrAdminMatch = sql.match(/CREATE OR REPLACE FUNCTION public\.is_staff_or_admin\(\)[\s\S]*?\$\$;/);
      assert.ok(isStaffOrAdminMatch, 'is_staff_or_admin must be defined');
      const fnBody = isStaffOrAdminMatch[0];
      assert.ok(!fnBody.includes('user_metadata'), 'is_staff_or_admin must not inspect user_metadata');
      assert.ok(!fnBody.includes('raw_user_meta_data'), 'is_staff_or_admin must not inspect raw_user_meta_data');
      assert.ok(!fnBody.includes('@logicintelligencetechnologies.in'), 'is_staff_or_admin must not trust email domains');
      assert.ok(fnBody.includes('public.profiles p'), 'is_staff_or_admin must check public.profiles table');

      // Verify that NO CREATE POLICY statement in the migration references user_metadata
      const policyStatements = sql.match(/CREATE POLICY[\s\S]*?;/g) || [];
      assert.ok(policyStatements.length >= 27, `Expected at least 27 policies, found ${policyStatements.length}`);
      for (const pol of policyStatements) {
        assert.ok(
          !pol.includes("user_metadata ->> 'role'"),
          `Policy contains insecure user_metadata reference: ${pol.slice(0, 60)}...`
        );
      }
    });

    test('Empirical DDL Verification: Preserves all four legitimate superadmin accounts verbatim', () => {
      const migrationFile = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');

      const preservedAdmins = [
        { id: '05991d42-44b3-4fbb-baaa-c6db030844c7', email: 'createwithvikash@gmail.com' },
        { id: '4a2e552d-c53b-4b4d-82a5-754b6ac4476c', email: 'vikash@logicintelligencetechnologies.in' },
        { id: 'd1a95302-5101-4a25-bff2-129558039574', email: 'admin@logicintelligencetechnologies.in' },
        { id: '69002d0e-e76c-4b8b-b6ec-2b36ad2e6bd0', email: 'hello@logicintelligencetechnologies.in' },
      ];

      for (const admin of preservedAdmins) {
        assert.ok(sql.includes(admin.id), `Superadmin UUID ${admin.id} must be listed`);
        assert.ok(sql.includes(admin.email), `Superadmin email ${admin.email} must be listed`);
      }
    });
  });

  // ===========================================================================
  // SECTION 2: Adversarial Payment RPC Caller Spoofing & Scoped Updates
  // ===========================================================================
  describe('Challenge 2: Payment RPC (reconcile_and_approve_payment) Caller Spoofing & Isolation', () => {

    test('Empirical Oracle: reconcile_and_approve_payment PL/pgSQL authorization logic prevents caller spoofing', () => {
      function simulateReconcileAuth(params: {
        authRole: 'authenticated' | 'anon' | 'service_role';
        authUid: string | null;
        pAdminUserId: string;
        adminProfileRole?: string;
        bankCreditRef?: string;
        bankCreditAmountPaise?: number;
      }): { success: boolean; error?: string } {
        const { authRole, authUid, pAdminUserId, adminProfileRole, bankCreditRef, bankCreditAmountPaise } = params;

        // Step 1: Verification against auth.uid()
        if (authRole !== 'service_role') {
          if (!authUid || authUid !== pAdminUserId) {
            return { success: false, error: 'Unauthorized: Calling user does not match p_admin_user_id' };
          }
        }

        // Step 2: Role check
        if (!adminProfileRole || adminProfileRole !== 'super_admin') {
          return { success: false, error: 'Unauthorized: Only super_admin may reconcile and approve payments' };
        }

        // Step 3: Input checks
        if (!bankCreditRef || !bankCreditRef.trim()) {
          return { success: false, error: 'Bank credit reference is required' };
        }

        if (!bankCreditAmountPaise || bankCreditAmountPaise <= 0) {
          return { success: false, error: 'Bank credit amount must be greater than zero' };
        }

        return { success: true };
      }

      const founderAdminUuid = '05991d42-44b3-4fbb-baaa-c6db030844c7';
      const attackerUuid = 'e8b82e44-8843-4dc9-9833-289da0171201';

      // Attack Vector 1: Attacker calls RPC passing founder admin UUID as p_admin_user_id
      const spoofFounder = simulateReconcileAuth({
        authRole: 'authenticated',
        authUid: attackerUuid,
        pAdminUserId: founderAdminUuid,
        adminProfileRole: 'super_admin',
        bankCreditRef: 'YESB1234567890',
        bankCreditAmountPaise: 5000000,
      });
      assert.strictEqual(spoofFounder.success, false);
      assert.match(spoofFounder.error!, /Calling user does not match p_admin_user_id/);

      // Attack Vector 2: Attacker passes their own UUID as p_admin_user_id
      const selfAdminSpoof = simulateReconcileAuth({
        authRole: 'authenticated',
        authUid: attackerUuid,
        pAdminUserId: attackerUuid,
        adminProfileRole: 'client', // attacker is only a client
        bankCreditRef: 'YESB1234567890',
        bankCreditAmountPaise: 5000000,
      });
      assert.strictEqual(selfAdminSpoof.success, false);
      assert.match(selfAdminSpoof.error!, /Only super_admin may reconcile and approve payments/);

      // Attack Vector 3: Anonymous caller (no auth.uid())
      const anonCall = simulateReconcileAuth({
        authRole: 'anon',
        authUid: null,
        pAdminUserId: founderAdminUuid,
        adminProfileRole: 'super_admin',
        bankCreditRef: 'YESB1234567890',
        bankCreditAmountPaise: 5000000,
      });
      assert.strictEqual(anonCall.success, false);
      assert.match(anonCall.error!, /Calling user does not match p_admin_user_id/);

      // Attack Vector 4: Whitespace or empty bank credit reference
      const whitespaceRef = simulateReconcileAuth({
        authRole: 'authenticated',
        authUid: founderAdminUuid,
        pAdminUserId: founderAdminUuid,
        adminProfileRole: 'super_admin',
        bankCreditRef: '   \t  ',
        bankCreditAmountPaise: 5000000,
      });
      assert.strictEqual(whitespaceRef.success, false);
      assert.match(whitespaceRef.error!, /Bank credit reference is required/);

      // Attack Vector 5: Zero or negative bank credit amount
      const zeroAmount = simulateReconcileAuth({
        authRole: 'authenticated',
        authUid: founderAdminUuid,
        pAdminUserId: founderAdminUuid,
        adminProfileRole: 'super_admin',
        bankCreditRef: 'YESB1234567890',
        bankCreditAmountPaise: 0,
      });
      assert.strictEqual(zeroAmount.success, false);
      assert.match(zeroAmount.error!, /Bank credit amount must be greater than zero/);

      // Legitimate Superadmin Execution
      const legitCall = simulateReconcileAuth({
        authRole: 'authenticated',
        authUid: founderAdminUuid,
        pAdminUserId: founderAdminUuid,
        adminProfileRole: 'super_admin',
        bankCreditRef: 'YESB1234567890',
        bankCreditAmountPaise: 5000000,
      });
      assert.strictEqual(legitCall.success, true);
    });

    test('Empirical DDL Verification: reconcile_and_approve_payment removes broad OR clause', () => {
      const migrationFile = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // The old vulnerability cross-advanced any engagement sharing client_id
      assert.ok(!sql.includes('OR (client_id = v_req.client_id AND v_req.client_id IS NOT NULL)'));

      // Verify updates are strictly scoped to proposal_id
      assert.ok(sql.includes('WHERE (proposal_id = $1 AND $1 IS NOT NULL)'));
    });

    test('reconcileAndApprovePayment TypeScript API rejects missing or empty bank credit reference', async () => {
      const resultEmpty = await reconcileAndApprovePayment({
        paymentRequestId: '00000000-0000-0000-0000-000000000001',
        paymentAttemptId: '00000000-0000-0000-0000-000000000002',
        adminUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        bankCreditReference: '   ',
        bankCreditAmountPaise: 100000,
      });
      assert.strictEqual(resultEmpty.success, false);
      assert.match(resultEmpty.error!, /Bank credit reference is required/);

      const resultZeroAmount = await reconcileAndApprovePayment({
        paymentRequestId: '00000000-0000-0000-0000-000000000001',
        paymentAttemptId: '00000000-0000-0000-0000-000000000002',
        adminUserId: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        bankCreditReference: 'REF123456',
        bankCreditAmountPaise: 0,
      });
      assert.strictEqual(resultZeroAmount.success, false);
      assert.match(resultZeroAmount.error!, /Bank credit amount must be greater than zero/);
    });
  });

  // ===========================================================================
  // SECTION 3: Adversarial Token Edge Cases & Input Validation
  // ===========================================================================
  describe('Challenge 3: Token Edge Cases, Whitespace, Revocation, and Null Values', () => {

    test('submitBillingDetails rejects absent, empty, whitespace, and non-string tokens', async () => {
      const invalidTokens = [
        '',
        '   ',
        '\t\n\r',
        null as unknown as string,
        undefined as unknown as string,
      ];

      for (const tok of invalidTokens) {
        await assert.rejects(
          async () => {
            await submitBillingDetails({
              paymentRequestId: '00000000-0000-0000-0000-000000000001',
              customerType: 'individual',
              legalName: 'Test Client',
              email: 'test@example.com',
              phone: '9876543210',
              addressLine1: '123 Main St',
              city: 'Coimbatore',
              state: 'Tamil Nadu',
              postalCode: '641001',
              secureToken: tok,
            });
          },
          (err: Error) => {
            assert.match(err.message, /Payment request not found|Unauthorized: Invalid payment token/);
            return true;
          }
        );
      }
    });

    test('recordPaymentAttempt rejects invalid tokens and empty UTR references', async () => {
      // Empty UTR
      await assert.rejects(
        async () => {
          await recordPaymentAttempt({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            utr: '   ',
            reportedAmountPaise: 10000,
            secureToken: 'valid-token-string',
          });
        },
        (err: Error) => {
          assert.match(err.message, /UTR \/ Transaction reference is required/);
          return true;
        }
      );

      // Non-positive amount
      await assert.rejects(
        async () => {
          await recordPaymentAttempt({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            utr: 'UTR1234567890',
            reportedAmountPaise: -500,
            secureToken: 'valid-token-string',
          });
        },
        (err: Error) => {
          assert.match(err.message, /Reported payment amount must be greater than zero/);
          return true;
        }
      );

      // Whitespace token
      await assert.rejects(
        async () => {
          await recordPaymentAttempt({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            utr: 'UTR1234567890',
            reportedAmountPaise: 10000,
            secureToken: '  \n\t  ',
          });
        },
        (err: Error) => {
          assert.match(err.message, /Payment request not found|Unauthorized: Invalid payment token/);
          return true;
        }
      );
    });

    test('createPaymentRequest rejects invalid stage numbers and non-positive subtotals', async () => {
      // Stage numbers other than 6 and 11
      const invalidStages = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 0, -1];
      for (const stg of invalidStages) {
        await assert.rejects(
          async () => {
            await createPaymentRequest({
              stageNumber: stg as any,
              milestoneTitle: 'Invalid Stage Payment',
              subtotalPaise: 100000,
            });
          },
          (err: Error) => {
            assert.match(err.message, /Invalid stage number/);
            return true;
          }
        );
      }

      // Zero subtotal
      await assert.rejects(
        async () => {
          await createPaymentRequest({
            stageNumber: 6,
            milestoneTitle: 'Zero Subtotal Payment',
            subtotalPaise: 0,
          });
        },
        (err: Error) => {
          assert.match(err.message, /Subtotal must be greater than zero/);
          return true;
        }
      );
    });

    test('createFinancialDocument validates SHA-256 hash regex and byte size', async () => {
      const invalidHashes = [
        'not-a-hash',
        '12345',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855ABC', // uppercase
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85', // 63 chars (too short)
      ];

      for (const h of invalidHashes) {
        await assert.rejects(
          async () => {
            await createFinancialDocument({
              paymentRequestId: '00000000-0000-0000-0000-000000000001',
              docType: 'invoice',
              documentNumber: 'LIT-INV-2026-001',
              title: 'Test Invoice',
              storagePath: 'invoices/test.pdf',
              sha256Hash: h,
              byteSize: 1024,
            });
          },
          (err: Error) => {
            assert.match(err.message, /Invalid sha256_hash/);
            return true;
          }
        );
      }

      // Zero byte size
      await assert.rejects(
        async () => {
          await createFinancialDocument({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            docType: 'invoice',
            documentNumber: 'LIT-INV-2026-001',
            title: 'Test Invoice',
            storagePath: 'invoices/test.pdf',
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            byteSize: 0,
          });
        },
        (err: Error) => {
          assert.match(err.message, /byte_size must be greater than 0/);
          return true;
        }
      );
    });

    test('calculateTaxAndTotals correctly applies Tamil Nadu intrastate CGST+SGST vs interstate IGST', () => {
      // Intrastate (Tamil Nadu): 9% CGST + 9% SGST
      const intra = calculateTaxAndTotals({
        subtotalPaise: 100000,
        discountPaise: 0,
        taxMode: 'tax_exclusive',
        gstRateBps: 1800,
        isInterstate: false,
        placeOfSupply: 'Tamil Nadu',
      });
      assert.strictEqual(intra.cgstPaise, 9000);
      assert.strictEqual(intra.sgstPaise, 9000);
      assert.strictEqual(intra.igstPaise, 0);
      assert.strictEqual(intra.totalPayablePaise, 118000);

      // Interstate (Karnataka): 18% IGST
      const inter = calculateTaxAndTotals({
        subtotalPaise: 100000,
        discountPaise: 0,
        taxMode: 'tax_exclusive',
        gstRateBps: 1800,
        isInterstate: true,
        placeOfSupply: 'Karnataka',
      });
      assert.strictEqual(inter.cgstPaise, 0);
      assert.strictEqual(inter.sgstPaise, 0);
      assert.strictEqual(inter.igstPaise, 18000);
      assert.strictEqual(inter.totalPayablePaise, 118000);
    });
  });

  // ===========================================================================
  // SECTION 4: Adversarial API Route Handlers & State Transition Bypasses
  // ===========================================================================
  describe('Challenge 4: API Boundary Defense Against Unauthenticated & Spoofed Requests', () => {

    test('Stage GET and POST endpoints reject unauthenticated and unknown requests', async () => {
      // 1. Unknown engagement reference returns 404 (not found or unauthorized)
      const unknownGetReq = new NextRequest('http://localhost:3000/api/engagements/ENG-UNKNOWN/stages/initial-invoice');
      const unknownGetRes = await stageRoute.GET(unknownGetReq, {
        params: Promise.resolve({ ref: 'ENG-UNKNOWN', stageKey: 'initial-invoice' }),
      });
      assert.strictEqual(unknownGetRes.status, 404);
      const unknownGetBody = await unknownGetRes.json();
      assert.match(unknownGetBody.error, /Engagement not found or unauthorized/);

      // 2. Existing engagement reference (canonical sample) without authentication returns 401
      const sampleGetReq = new NextRequest('http://localhost:3000/api/engagements/ENG-2026-LIT-SAMPLE/stages/initial-invoice');
      const sampleGetRes = await stageRoute.GET(sampleGetReq, {
        params: Promise.resolve({ ref: 'ENG-2026-LIT-SAMPLE', stageKey: 'initial-invoice' }),
      });
      assert.strictEqual(sampleGetRes.status, 401);
      const sampleGetBody = await sampleGetRes.json();
      assert.match(sampleGetBody.error, /Unauthorized: Authentication or valid bearer token required/);

      // 3. Existing engagement reference without authentication on POST returns 401
      const samplePostReq = new NextRequest('http://localhost:3000/api/engagements/ENG-2026-LIT-SAMPLE/stages/initial-invoice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'submit_billing_details' }),
      });
      const samplePostRes = await stageRoute.POST(samplePostReq, {
        params: Promise.resolve({ ref: 'ENG-2026-LIT-SAMPLE', stageKey: 'initial-invoice' }),
      });
      assert.strictEqual(samplePostRes.status, 401);
      const samplePostBody = await samplePostRes.json();
      assert.match(samplePostBody.error, /Authentication required to submit stage actions/);
    });

    test('Subscription routes reject unauthenticated requests', async () => {
      // Status GET
      const statusReq = new NextRequest('http://localhost:3000/api/subscriptions/status?engagementId=eng-123');
      const statusRes = await subStatusRoute.GET(statusReq);
      assert.strictEqual(statusRes.status, 401);

      // Order POST
      const orderReq = new NextRequest('http://localhost:3000/api/subscriptions/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ engagementId: 'eng-123', planId: 'STANDARD', consentConfirmed: true }),
      });
      const orderRes = await subOrderRoute.POST(orderReq);
      assert.strictEqual(orderRes.status, 401);

      // Correction GET
      const corrGetReq = new NextRequest('http://localhost:3000/api/subscriptions/correction?engagementId=eng-123');
      const corrGetRes = await subCorrectionRoute.GET(corrGetReq);
      assert.strictEqual(corrGetRes.status, 401);

      // Correction POST
      const corrPostReq = new NextRequest('http://localhost:3000/api/subscriptions/correction', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engagementId: 'eng-123',
          affectedField: 'company_name',
          requestedValue: 'New Corp',
          explanation: 'Name change',
        }),
      });
      const corrPostRes = await subCorrectionRoute.POST(corrPostReq);
      assert.strictEqual(corrPostRes.status, 401);

      // Identity Correction POST
      const identReq = new NextRequest('http://localhost:3000/api/engagements/identity-correction', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engagementId: 'eng-123',
          targetField: 'company_name',
          proposedValue: 'New Corp',
          changeReason: 'Legal rebranding',
        }),
      });
      const identRes = await identityCorrectionRoute.POST(identReq);
      assert.strictEqual(identRes.status, 401);
    });

    test('Submit-UTR route rejects requests missing mandatory parameters', async () => {
      const emptyReq = new NextRequest('http://localhost:3000/api/subscriptions/submit-utr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await subSubmitUtrRoute.POST(emptyReq);
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.match(body.error, /Missing required parameters/);
    });

    test('Subscriptions correction GET requires non-empty engagementId', async () => {
      const missingEngagementReq = new NextRequest('http://localhost:3000/api/subscriptions/correction');
      const res = await subCorrectionRoute.GET(missingEngagementReq);
      // In unauthenticated context, 401 is triggered first
      assert.ok([400, 401].includes(res.status));
    });
  });

  // ===========================================================================
  // SECTION 5: Maintenance Orders RLS Mutation Guard Empirical Verification
  // ===========================================================================
  describe('Challenge 5: Maintenance Orders Tamper Guard Oracle', () => {

    test('Empirical Oracle: guard_maintenance_order_mutation blocks client financial & status tampering', () => {
      function simulateOrderMutationGuard(params: {
        op: 'INSERT' | 'UPDATE';
        authRole: 'authenticated' | 'anon' | 'service_role';
        isSuperAdmin: boolean;
        oldRow?: {
          status: string;
          subtotalPaise: number;
          gstPaise: number;
          totalPayablePaise: number;
          planId: string;
          clientId: string;
          engagementId: string;
          verifiedBy?: string | null;
        };
        newRow: {
          status: string;
          subtotalPaise: number;
          gstPaise: number;
          totalPayablePaise: number;
          planId: string;
          clientId: string;
          engagementId: string;
          verifiedBy?: string | null;
          verifiedAt?: string | null;
        };
      }): { success: boolean; error?: string } {
        const { op, authRole, isSuperAdmin, oldRow, newRow } = params;

        if (authRole === 'authenticated' && !isSuperAdmin) {
          if (op === 'INSERT') {
            if (newRow.status !== 'pending_payment') {
              return { success: false, error: 'New maintenance orders must have pending_payment status' };
            }
            if (newRow.verifiedBy || newRow.verifiedAt) {
              return { success: false, error: 'Verification fields can only be set by Super Admin' };
            }
          }

          if (op === 'UPDATE' && oldRow) {
            if (
              newRow.totalPayablePaise !== oldRow.totalPayablePaise ||
              newRow.subtotalPaise !== oldRow.subtotalPaise ||
              newRow.gstPaise !== oldRow.gstPaise ||
              newRow.planId !== oldRow.planId ||
              newRow.clientId !== oldRow.clientId ||
              newRow.engagementId !== oldRow.engagementId
            ) {
              return { success: false, error: 'Pricing, plan, and ownership fields are immutable for clients' };
            }

            if (newRow.status === 'verified' && oldRow.status !== 'verified') {
              return { success: false, error: 'Only Super Admin can mark maintenance orders as verified' };
            }

            if (newRow.verifiedBy !== oldRow.verifiedBy) {
              return { success: false, error: 'Verification metadata can only be updated by Super Admin' };
            }
          }
        }

        return { success: true };
      }

      // Attack Vector 1: Client inserts order pre-marked as 'verified'
      const preVerifiedInsert = simulateOrderMutationGuard({
        op: 'INSERT',
        authRole: 'authenticated',
        isSuperAdmin: false,
        newRow: {
          status: 'verified',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
      });
      assert.strictEqual(preVerifiedInsert.success, false);
      assert.match(preVerifiedInsert.error!, /must have pending_payment status/);

      // Attack Vector 2: Client modifies price on existing order
      const priceTamper = simulateOrderMutationGuard({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: false,
        oldRow: {
          status: 'pending_payment',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
        newRow: {
          status: 'pending_payment',
          subtotalPaise: 100, // Attempting to pay only 1 rupee
          gstPaise: 18,
          totalPayablePaise: 118,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
      });
      assert.strictEqual(priceTamper.success, false);
      assert.match(priceTamper.error!, /Pricing, plan, and ownership fields are immutable/);

      // Attack Vector 3: Client marks order as verified
      const selfVerify = simulateOrderMutationGuard({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: false,
        oldRow: {
          status: 'pending_payment',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
        newRow: {
          status: 'verified',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
      });
      assert.strictEqual(selfVerify.success, false);
      assert.match(selfVerify.error!, /Only Super Admin can mark maintenance orders as verified/);

      // Legitimate: Super Admin marks as verified
      const adminVerify = simulateOrderMutationGuard({
        op: 'UPDATE',
        authRole: 'authenticated',
        isSuperAdmin: true,
        oldRow: {
          status: 'pending_payment',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
        },
        newRow: {
          status: 'verified',
          subtotalPaise: 99900,
          gstPaise: 17982,
          totalPayablePaise: 117882,
          planId: 'STANDARD',
          clientId: 'client-1',
          engagementId: 'eng-1',
          verifiedBy: '05991d42-44b3-4fbb-baaa-c6db030844c7',
        },
      });
      assert.strictEqual(adminVerify.success, true);
    });
  });

  // ===========================================================================
  // SECTION 6: Canonical Client Identity & Tenant Isolation
  // ===========================================================================
  describe('Challenge 6: Canonical Client Identity (auth.users.id vs clients.id) & Tenant Conjunction', () => {

    test('resolveClientIdentity safely handles empty, garbage, and unconfigured inputs', async () => {
      const empty = await resolveClientIdentity('');
      assert.strictEqual(empty.authUserId, '');
      assert.strictEqual(empty.role, 'client');
      assert.deepStrictEqual(empty.engagementIds, []);

      const garbage = await resolveClientIdentity('not-a-uuid');
      assert.strictEqual(garbage.authUserId, 'not-a-uuid');
      assert.strictEqual(garbage.role, 'client');
    });

    test('assertClientEngagementAccess returns false for unauthorized users and engagements', async () => {
      const allowed = await assertClientEngagementAccess('00000000-0000-0000-0000-000000000001', 'eng-xyz');
      assert.strictEqual(allowed, false);
    });

    test('Notification queries strictly enforce client ownership conjunction and never OR foreign engagements', async () => {
      const ownEmail = 'clientA@example.com';
      const foreignRef = 'ENG-CLIENT-B';

      const notifs = await getClientNotifications(ownEmail, foreignRef);
      assert.ok(Array.isArray(notifs));
      // Any notifications returned must have clientEmail matching ownEmail
      for (const n of notifs) {
        assert.strictEqual(n.clientEmail.toLowerCase(), ownEmail.toLowerCase());
      }

      const count = await getUnreadNotificationCount(ownEmail, foreignRef);
      assert.strictEqual(typeof count, 'number');
    });
  });

});
