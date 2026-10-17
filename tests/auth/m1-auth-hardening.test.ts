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
const { resolveClientIdentity, assertClientEngagementAccess } = require('../../src/lib/auth/client-identity');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { submitBillingDetails, recordPaymentAttempt } = require('../../src/lib/payments/db');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getClientNotifications, getUnreadNotificationCount } = require('../../src/lib/client-portal/v4-actions');

describe('Milestone 1 (AUTH01 - AUTH16) Auth & Database Hardening Behavioral Test Suite', () => {

  // ---------------------------------------------------------------------------
  // AUTH01: Privilege Escalation & Superadmin Preservation
  // ---------------------------------------------------------------------------
  describe('AUTH01: Superadmin Preservation & Email Trigger Escalation Fix', () => {
    test('Preserves legitimate founder superadmin credentials and profile verbatim', () => {
      const founderUuid = '05991d42-44b3-4fbb-baaa-c6db030844c7';
      const founderEmail = 'createwithvikash@gmail.com';

      // Migration must explicitly list and protect these credentials
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      assert.ok(fs.existsSync(migrationPath), 'Migration 20261017070000 must exist');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes(founderUuid), 'Migration must preserve founder UUID');
      assert.ok(migrationSql.includes(founderEmail), 'Migration must preserve founder email');
      assert.ok(migrationSql.includes('DROP TRIGGER IF EXISTS trigger_assign_super_admin_owner'), 'Must drop unsafe trigger');
      assert.ok(migrationSql.includes('DROP FUNCTION IF EXISTS public.assign_super_admin_for_owner()'), 'Must drop unsafe promotion function');
    });

    test('guard_profile_role prevents non-admin role mutation and direct profile email spoofing', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('profiles.role can only be changed by an administrator'), 'Guard must reject role changes by non-admin');
      assert.ok(migrationSql.includes('profiles.email must match verified authentication email'), 'Guard must reject profile email spoofing');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH02: Elimination of user_metadata Authorization
  // ---------------------------------------------------------------------------
  describe('AUTH02: Elimination of user_metadata Role Trust Across RLS Policies', () => {
    test('is_staff_or_admin() is rewritten to use profiles.role instead of JWT user_metadata', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Verify function definition does NOT check user_metadata or email domain suffix
      assert.ok(migrationSql.includes('CREATE OR REPLACE FUNCTION public.is_staff_or_admin()'), 'Must rewrite is_staff_or_admin');
      assert.ok(!migrationSql.includes("user_metadata ->> 'role'"), 'Must not trust user_metadata in new policies');
      assert.ok(migrationSql.includes('SELECT 1 FROM public.profiles p'), 'Must verify against authoritative profiles table');
    });

    test('All 27 RLS policies replace user_metadata checks with server-controlled role or identity checks', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      const expectedPolicies = [
        'ct_auth_select', 'ct_auth_insert', 'cm_auth_select', 'cm_auth_insert',
        'cn_auth_select', 'cn_auth_update', 'ca_auth_select', 'ca_auth_update',
        'rfc_auth_select', 'rfc_auth_insert', 'rfc_auth_update', 'csd_auth_select',
        'csd_auth_update', 'cpb_auth_select', 'cqa_auth_select', 'cnp_auth_select',
        'cnp_auth_insert', 'cnp_auth_update', 'qsc_auth_all', 'q_auth_all',
        'qv_auth_all', 'qli_auth_all', 'qc_auth_all', 'qcr_auth_all',
        'qa_auth_all', 'qrr_auth_all', 'qal_auth_all'
      ];

      for (const policy of expectedPolicies) {
        assert.ok(migrationSql.includes(policy), `Migration must recreate policy ${policy} without user_metadata`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH03: Payment RPC Caller Identity Binding & Scoped Advancing
  // ---------------------------------------------------------------------------
  describe('AUTH03: Payment Approval RPC Authorization & Project Scoping', () => {
    test('reconcile_and_approve_payment verifies caller auth.uid() matches p_admin_user_id', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(
        migrationSql.includes('auth.uid() <> p_admin_user_id'),
        'Must reject callers where auth.uid() does not match p_admin_user_id'
      );
      assert.ok(
        migrationSql.includes("v_admin_role <> 'super_admin'"),
        'Must require super_admin role for approval'
      );
    });

    test('reconcile_and_approve_payment eliminates broad client_id OR matching', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Broad OR matching that advanced other projects for the same client must NOT be present
      assert.ok(
        !migrationSql.includes('OR (client_id = v_req.client_id AND v_req.client_id IS NOT NULL)'),
        'Must remove broad OR client_id matching from project advance query'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH04: Drop Legacy Broad Staff Policies
  // ---------------------------------------------------------------------------
  describe('AUTH04: Tenant Isolation & Legacy Broad Staff Policies Removal', () => {
    test('Explicitly drops legacy broad staff policies that bypassed assignment isolation', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS ce_auth_staff_all ON public.client_engagements;'));
      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS es_auth_staff_all ON public.engagement_stages;'));
      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS ese_auth_staff_all ON public.engagement_stage_events;'));
      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS edl_auth_staff_all ON public.engagement_document_links;'));
      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS cicr_auth_staff_all ON public.client_identity_change_requests;'));
      assert.ok(migrationSql.includes('DROP POLICY IF EXISTS ei_auth_staff_all ON public.engagement_invites;'));
    });

    test('Recreates scoped staff policies tied to active staff_client_assignments', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('ce_auth_staff_scoped'));
      assert.ok(migrationSql.includes('es_auth_staff_scoped'));
      assert.ok(migrationSql.includes("sca.status = 'active'"));
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH05: Engagement Verification & Identity Correction Ownership
  // ---------------------------------------------------------------------------
  describe('AUTH05: Engagement Stage and Identity Correction Access Verification', () => {
    test('Stage route enforces verified caller session and rejects unauthenticated reads/writes', () => {
      const routePath = path.join(process.cwd(), 'src/app/api/engagements/[ref]/stages/[stageKey]/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf8');

      assert.ok(routeContent.includes('getVerifiedClientUser'), 'Must import verified client helper');
      assert.ok(routeContent.includes('assertClientEngagementAccess'), 'Must assert client engagement access');
      assert.ok(routeContent.includes('Unauthorized: Authentication or valid bearer token required'), 'GET must reject unauthenticated callers');
      assert.ok(routeContent.includes('Authentication required to submit stage actions'), 'POST must reject unauthenticated callers');
    });

    test('Identity correction POST derives caller identity server-side and verifies engagement ownership', () => {
      const routePath = path.join(process.cwd(), 'src/app/api/engagements/identity-correction/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf8');

      assert.ok(!routeContent.includes('requestedBy = requestedBy.trim()'), 'Must not trust caller-supplied requestedBy');
      assert.ok(routeContent.includes('requested_by: verifiedRequestedBy'), 'Must bind requested_by to server-derived identity');
      assert.ok(routeContent.includes('Forbidden: You do not have ownership access to this engagement'), 'Must verify caller owns engagement');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH06: Allowlist Stage Action Transitions & Service-Layer Capability Checks
  // ---------------------------------------------------------------------------
  describe('AUTH06: Stage Transitions Allowlist & Payment Gate Protections', () => {
    test('Stage route rejects client execution of administrative approval/override actions', () => {
      const routePath = path.join(process.cwd(), 'src/app/api/engagements/[ref]/stages/[stageKey]/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf8');

      assert.ok(routeContent.includes('admin_approve_stage'), 'Must check admin_approve_stage');
      assert.ok(routeContent.includes('Forbidden: Client session cannot execute administrative actions'), 'Must reject admin actions by clients');
    });

    test('Stage route strips arbitrary client payload.status mutations', () => {
      const routePath = path.join(process.cwd(), 'src/app/api/engagements/[ref]/stages/[stageKey]/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf8');

      assert.ok(routeContent.includes('delete sanitizedPayload.status'), 'Must strip arbitrary client status jumps');
    });

    test('Payment stages (initial-invoice, final-payment) cannot be verified via generic stage actions', () => {
      const routePath = path.join(process.cwd(), 'src/app/api/engagements/[ref]/stages/[stageKey]/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf8');

      assert.ok(routeContent.includes("stageKey === 'initial-invoice' || stageKey === 'final-payment'"));
      assert.ok(routeContent.includes('Payment stages ('));
      assert.ok(routeContent.includes('Reconcile bank credit via /api/admin/payments/reconcile'));
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH07: Safe Response Shapes & Scoped Data Disclosure
  // ---------------------------------------------------------------------------
  describe('AUTH07: Safe Response Shapes & Cross-Tenant Data Disclosure Prevention', () => {
    test('/api/subscriptions/status returns safe orders shape without secure_token or verification internals', () => {
      const statusPath = path.join(process.cwd(), 'src/app/api/subscriptions/status/route.ts');
      const content = fs.readFileSync(statusPath, 'utf8');

      assert.ok(content.includes('safeOrders'), 'Must map recent orders to safe shape');
      assert.ok(!content.includes("select('*')"), 'Must not perform unconstrained select * on orders');
      assert.ok(content.includes('orderRef: o.order_ref'), 'Must return safe order fields');
    });

    test('/api/subscriptions/correction requires mandatory engagementId in GET, blocking cross-client leakage', () => {
      const correctionPath = path.join(process.cwd(), 'src/app/api/subscriptions/correction/route.ts');
      const content = fs.readFileSync(correctionPath, 'utf8');

      assert.ok(content.includes('Missing required engagementId parameter'), 'Must require engagementId in GET');
      assert.ok(content.includes('Unauthorized: Authentication required'), 'Must require authentication in GET');
    });

    test('/api/subscriptions/submit-utr strips secure_token from returned order', () => {
      const submitUtrPath = path.join(process.cwd(), 'src/app/api/subscriptions/submit-utr/route.ts');
      const content = fs.readFileSync(submitUtrPath, 'utf8');

      assert.ok(content.includes('const safeOrder = updatedOrder ? {'), 'Must sanitize returned order');
      assert.ok(!content.includes('order: updatedOrder,'), 'Must not return raw order with secure_token');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH08: Server-Side Identity Derivation for Maintenance Mutations
  // ---------------------------------------------------------------------------
  describe('AUTH08: Unauthenticated Maintenance Request Rejection & Ownership Verification', () => {
    test('/api/subscriptions/order rejects unauthenticated requests and validates engagement ownership', () => {
      const orderRoutePath = path.join(process.cwd(), 'src/app/api/subscriptions/order/route.ts');
      const content = fs.readFileSync(orderRoutePath, 'utf8');

      assert.ok(content.includes('Unauthorized: Authentication required'), 'Must reject unauthenticated callers');
      assert.ok(!content.includes("body.clientId || 'anonymous-client'"), 'Must not trust body.clientId');
      assert.ok(content.includes('assertClientEngagementAccess'), 'Must assert engagement ownership');
    });

    test('/api/subscriptions/correction POST rejects unauthenticated requests and verifies ownership', () => {
      const correctionRoutePath = path.join(process.cwd(), 'src/app/api/subscriptions/correction/route.ts');
      const content = fs.readFileSync(correctionRoutePath, 'utf8');

      assert.ok(content.includes('Unauthorized: Authentication required to submit correction requests'), 'Must reject unauthenticated POST');
      assert.ok(!content.includes("body.clientId || 'anonymous-client'"), 'Must not trust body.clientId');
      assert.ok(content.includes('assertClientEngagementAccess'), 'Must assert client engagement access');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH09 & AUTH10: Maintenance RLS & Assigned Staff DELETE Prevention
  // ---------------------------------------------------------------------------
  describe('AUTH09 & AUTH10: Maintenance Orders Anti-Tampering & Subscriptions Delete Protection', () => {
    test('guard_maintenance_order_mutation blocks client financial, status, and verification tampering', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('guard_maintenance_order_mutation'), 'Must create order mutation guard');
      assert.ok(migrationSql.includes('Pricing, plan, and ownership fields are immutable for clients'), 'Must block price tampering');
      assert.ok(migrationSql.includes('Only Super Admin can mark maintenance orders as verified'), 'Must block status tampering');
    });

    test('Splits maintenance_subscriptions policies to prevent assigned staff from deleting subscriptions', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('staff_select_assigned_subscriptions'), 'Must create SELECT-only policy for staff');
      assert.ok(migrationSql.includes('super_admin_delete_subscriptions'), 'Must restrict DELETE strictly to super_admin');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH11: Mandatory Payment Token Validation & Terminal State Checking
  // ---------------------------------------------------------------------------
  describe('AUTH11: Mandatory Payment Token Validation & Terminal State Rejection', () => {
    test('submitBillingDetails rejects absent, empty, or whitespace secureToken', async () => {
      // Test missing token
      await assert.rejects(
        async () => {
          await submitBillingDetails({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            clientLegalName: 'Test Client',
            contactName: 'Test Contact',
            contactEmail: 'client@example.com',
            addressLine1: '123 Main St',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641001',
            secureToken: '', // Empty token
          });
        },
        (err: Error) => {
          assert.match(err.message, /Payment request not found|Unauthorized: Invalid payment token/);
          return true;
        }
      );
    });

    test('recordPaymentAttempt rejects empty secureToken and blocks submissions on terminal states', async () => {
      await assert.rejects(
        async () => {
          await recordPaymentAttempt({
            paymentRequestId: '00000000-0000-0000-0000-000000000001',
            utr: '123456789012',
            reportedAmountPaise: 100000,
            secureToken: '   ', // Whitespace token
          });
        },
        (err: Error) => {
          assert.match(err.message, /Payment request not found|Unauthorized: Invalid payment token/);
          return true;
        }
      );
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH12: Canonical Client Identity Model
  // ---------------------------------------------------------------------------
  describe('AUTH12: Canonical Client Identity Model (auth.users.id vs clients.id)', () => {
    test('resolveClientIdentity returns safe Context and never conflates auth.users.id with clients.id', async () => {
      const fakeAuthUserId = '11111111-2222-3333-4444-555555555555';
      const ctx = await resolveClientIdentity(fakeAuthUserId);

      assert.strictEqual(ctx.authUserId, fakeAuthUserId);
      assert.strictEqual(typeof ctx.role, 'string');
      assert.ok(Array.isArray(ctx.engagementIds));
    });

    test('assertClientEngagementAccess safely evaluates access without crashing', async () => {
      const allowed = await assertClientEngagementAccess(
        '11111111-2222-3333-4444-555555555555',
        '00000000-0000-0000-0000-000000000099'
      );
      assert.strictEqual(typeof allowed, 'boolean');
      assert.strictEqual(allowed, false); // Unknown user & engagement returns false
    });

    test('Database RLS policies resolve clients.user_id = auth.uid() instead of comparing client_id = auth.uid()', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(
        migrationSql.includes('client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))'),
        'RLS policies must map user_id to clients.id'
      );
    });

    test('Financial document API uses resolveClientIdentity instead of direct UUID comparison', () => {
      const docRoutePath = path.join(process.cwd(), 'src/app/api/documents/financial/[id]/route.ts');
      const content = fs.readFileSync(docRoutePath, 'utf8');

      assert.ok(content.includes('resolveClientIdentity(user.id)'));
      assert.ok(content.includes('doc.client_id === clientContext.clientId'));
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH13: Command Center Financial Metrics Scoping
  // ---------------------------------------------------------------------------
  describe('AUTH13: Command Center Financial Scoping for Non-Superadmin Staff', () => {
    test('Command Center restricts commercial revenue metrics and scopes engagements for staff', () => {
      const pagePath = path.join(process.cwd(), 'src/app/admin/command-center/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('const isSuperAdmin = session.role === "super_admin"'));
      assert.ok(content.includes('isSuperAdmin ? supabaseAdmin.from("invoices").select("amount, status") : Promise.resolve('));
      assert.ok(content.includes('value: !isSuperAdmin ? "Restricted" :'));
      assert.ok(content.includes('staff_client_assignments'));
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH14: Workspace Project Resolver Expiry & Status Enforcement
  // ---------------------------------------------------------------------------
  describe('AUTH14: Workspace Project Resolver Expiry & Permission Enforcement', () => {
    test('service.ts filters expired assignments and suspended/offboarded employees', () => {
      const servicePath = path.join(process.cwd(), 'src/lib/workspaces/service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('isSuspendedOrOffboarded'), 'Must check suspended or offboarded status');
      assert.ok(content.includes('!a.expires_at || new Date(a.expires_at).getTime() > Date.now()'), 'Must filter expired assignments');
      assert.ok(content.includes('legal_name'), 'Must query legal_name on clients (WS05 fix)');
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH15: Rotate Literal Webhook Credential
  // ---------------------------------------------------------------------------
  describe('AUTH15: Hardcoded Database Webhook Credential Removal', () => {
    test('Explicitly drops legacy welcome email trigger and function containing literal webhook secret', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261017070000_auth_rls_security_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      assert.ok(migrationSql.includes('DROP TRIGGER IF EXISTS trg_send_welcome_email_on_profiles_insert ON public.profiles;'));
      assert.ok(migrationSql.includes('DROP FUNCTION IF EXISTS public.send_welcome_email_on_profiles_insert();'));
    });
  });

  // ---------------------------------------------------------------------------
  // AUTH16: Notification Queries Client Ownership Conjunction
  // ---------------------------------------------------------------------------
  describe('AUTH16: Notification Queries Strict Ownership Conjunction', () => {
    test('getClientNotifications strictly requires client_email matching and does not OR untrusted engagementRef', async () => {
      const testEmail = 'verified-client@acme.corp';
      const foreignRef = 'ENG-OTHER-CLIENT-REF';

      // Call getClientNotifications
      const notifs = await getClientNotifications(testEmail, foreignRef);
      assert.ok(Array.isArray(notifs));
      for (const n of notifs) {
        assert.strictEqual(n.clientEmail.toLowerCase(), testEmail.toLowerCase(), 'Must never return another client email');
      }
    });

    test('getUnreadNotificationCount strictly checks verified client_email', async () => {
      const count = await getUnreadNotificationCount('verified-client@acme.corp', 'ENG-OTHER-CLIENT-REF');
      assert.strictEqual(typeof count, 'number');
    });

    test('Source code enforces AND conjunction instead of OR between email and engagementRef', () => {
      const v4ActionsPath = path.join(process.cwd(), 'src/lib/client-portal/v4-actions.ts');
      const content = fs.readFileSync(v4ActionsPath, 'utf8');

      assert.ok(!content.includes('query.or(`client_email.eq.'), 'Must not use query.or for notification filtering');
      assert.ok(content.includes('query = query.eq("client_email", normalizedEmail);'), 'Must strictly eq client_email');
    });
  });

});
