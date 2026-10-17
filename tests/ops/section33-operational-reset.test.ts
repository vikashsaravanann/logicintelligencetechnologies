// Stub server-only for standalone Node.js test runner
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  PRESERVED_SUPERADMIN_IDS,
  PRESERVED_TABLES,
  OPERATIONAL_TABLES_CHILD_FIRST,
  computeSha256,
} = require('../../scripts/operational-reset');

describe('Section 33: Operational History Reset Manifest & Invariant Behavioral Test Suite', () => {

  // ---------------------------------------------------------------------------
  // Invariant 1: Superadmin Account Absolute Preservation
  // ---------------------------------------------------------------------------
  describe('Invariant 1: Absolute Superadmin Preservation', () => {
    test('contains exact primary superadmin UUID for createwithvikash@gmail.com', () => {
      assert.ok(
        PRESERVED_SUPERADMIN_IDS.has('05991d42-44b3-4fbb-baaa-c6db030844c7'),
        'Primary superadmin createwithvikash@gmail.com must be explicitly protected'
      );
    });

    test('preserves all four legitimate superadmin UUIDs verbatim', () => {
      assert.strictEqual(PRESERVED_SUPERADMIN_IDS.size, 4, 'Must protect all four audited superadmins');
      assert.ok(PRESERVED_SUPERADMIN_IDS.has('4a2e552d-c53b-4b4d-82a5-754b6ac4476c'));
      assert.ok(PRESERVED_SUPERADMIN_IDS.has('d1a95302-5101-4a25-bff2-129558039574'));
      assert.ok(PRESERVED_SUPERADMIN_IDS.has('69002d0e-e76c-4b8b-b6ec-2b36ad2e6bd0'));
    });
  });

  // ---------------------------------------------------------------------------
  // Invariant 2: Preserved Tables & Schema Configurations
  // ---------------------------------------------------------------------------
  describe('Invariant 2: Preserved Tables & Schema Configurations', () => {
    test('strictly preserves profiles, staff workspaces, and audit logs', () => {
      assert.ok(PRESERVED_TABLES.includes('profiles'), 'Profiles must be preserved');
      assert.ok(PRESERVED_TABLES.includes('staff_workspaces'), 'Staff workspaces must be preserved');
      assert.ok(PRESERVED_TABLES.includes('audit_events'), 'Audit events must be preserved');
      assert.ok(PRESERVED_TABLES.includes('admin_action_logs'), 'Admin action logs must be preserved');
      assert.ok(PRESERVED_TABLES.includes('do_not_contact'), 'Suppression preferences must be preserved');
    });

    test('none of the preserved tables appear in the operational deletion list', () => {
      for (const preserved of PRESERVED_TABLES) {
        assert.ok(
          !OPERATIONAL_TABLES_CHILD_FIRST.includes(preserved),
          `Preserved table '${preserved}' must NEVER be in operational deletion candidates`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Invariant 3: Child-First Deletion Ordering
  // ---------------------------------------------------------------------------
  describe('Invariant 3: Child-First Deletion Ordering', () => {
    test('parent client_engagements is deleted AFTER child stages, invoices, and tickets', () => {
      const engIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('client_engagements');
      assert.ok(engIndex >= 0, 'client_engagements must be in deletion list');

      const ticketIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('support_tickets');
      const invoiceIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('invoices');
      const stageIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('engagement_stages');
      const outboxIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('email_outbox');

      assert.ok(ticketIndex < engIndex, 'support_tickets must be deleted BEFORE client_engagements');
      assert.ok(invoiceIndex < engIndex, 'invoices must be deleted BEFORE client_engagements');
      assert.ok(stageIndex < engIndex, 'engagement_stages must be deleted BEFORE client_engagements');
      assert.ok(outboxIndex < engIndex, 'email_outbox must be deleted BEFORE client_engagements');
    });

    test('invoice_preparation_requests deleted before invoices', () => {
      const prepIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('invoice_preparation_requests');
      const invoiceIndex = OPERATIONAL_TABLES_CHILD_FIRST.indexOf('invoices');
      assert.ok(prepIndex < invoiceIndex, 'invoice_preparation_requests must be deleted before invoices');
    });
  });

  // ---------------------------------------------------------------------------
  // Invariant 4: Cryptographic Integrity Verification
  // ---------------------------------------------------------------------------
  describe('Invariant 4: Cryptographic Checksum Integrity', () => {
    test('computeSha256 produces valid 64-character hexadecimal digest', () => {
      const hash = computeSha256(JSON.stringify([{ id: 'test-1', status: 'completed' }]));
      assert.match(hash, /^[a-f0-9]{64}$/, 'Must be a standard SHA-256 hexadecimal string');
    });

    test('checksum is deterministic across repeated runs', () => {
      const payload = JSON.stringify({ event: 'RESET', count: 42 });
      const hash1 = computeSha256(payload);
      const hash2 = computeSha256(payload);
      assert.strictEqual(hash1, hash2, 'SHA-256 must be strictly deterministic');
    });
  });

});
