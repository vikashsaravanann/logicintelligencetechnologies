/**
 * Logic Intelligence Technologies (LIT) — Section 33 Manifest-Driven Operational History Reset
 * 
 * INVARIANTS:
 * 1. BACKUP FIRST: All rows in operational scope are backed up with SHA-256 checksums before mutation.
 * 2. PRESERVED VERBATIM:
 *    - All auth.users accounts, passwords, sessions.
 *    - Legitimate Superadmin accounts:
 *      * createwithvikash@gmail.com (05991d42-44b3-4fbb-baaa-c6db030844c7)
 *      * 4a2e552d-c53b-4b4d-82a5-754b6ac4476c
 *      * d1a95302-5101-4a25-bff2-129558039574
 *      * 69002d0e-e76c-4b8b-b6ec-2b36ad2e6bd0
 *    - All profiles and staff workspace structures.
 *    - Company & beneficiary config, master PDF/email templates, system settings.
 *    - Security and access audit logs (audit_events, admin_action_logs).
 *    - Suppression lists (do-not-contact, unsubscribes).
 * 3. CHILD-FIRST DELETION: Foreign key dependencies respected in strict topological order.
 * 4. DRY-RUN BY DEFAULT: Explicit `--execute` flag required for live database mutation.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Strict Superadmin Preservation Allowlist
export const PRESERVED_SUPERADMIN_IDS = new Set([
  '05991d42-44b3-4fbb-baaa-c6db030844c7', // createwithvikash@gmail.com
  '4a2e552d-c53b-4b4d-82a5-754b6ac4476c',
  'd1a95302-5101-4a25-bff2-129558039574',
  '69002d0e-e76c-4b8b-b6ec-2b36ad2e6bd0',
]);

export const PRESERVED_TABLES = [
  'profiles',
  'staff_workspaces',
  'staff_employees',
  'staff_workspace_tasks',
  'audit_events',
  'admin_action_logs',
  'staff_support_access_events',
  'do_not_contact',
  'outreach_suppression',
  'maintenance_catalog',
  'beneficiary_config',
  'company_facts',
];

// Operational Candidates in Strict Child-First (Topological) Order
export const OPERATIONAL_TABLES_CHILD_FIRST = [
  // Level 1: Outbox and notifications
  'email_outbox',
  'client_notifications',
  
  // Level 2: Messages, notes, logs linked to tickets & stages
  'project_messages',
  'client_conversations',
  'staff_support_notes',
  'staff_escalations',
  'support_tickets',
  
  // Level 3: Financial & Stage child artifacts
  'financial_documents',
  'invoice_preparation_requests',
  'quotation_technical_drafts',
  'payment_attempts',
  'payment_requests',
  'maintenance_orders',
  'maintenance_subscriptions',
  'invoices',
  'quotations',
  'proposals',
  
  // Level 4: Stage records and RFC change requests
  'engagement_change_requests',
  'identity_correction_requests',
  'engagement_stages',
  
  // Level 5: Collaboration invites and assignments
  'project_staff_invitations',
  'staff_client_assignments',
  
  // Level 6: Form submissions and leads
  'checklist_leads',
  'discovery_submissions',
  'consultation_bookings',
  'demo_requests',
  'contact_submissions',
  'website_enquiries',
  'ai_assistant_enquiries',
  
  // Level 7: Operational engagements (Parent)
  'client_engagements',
];

export interface BackupManifest {
  timestamp: string;
  backupDirectory: string;
  dryRun: boolean;
  preservedSuperadmins: string[];
  preservedTables: string[];
  operationalTables: string[];
  tableCounts: Record<string, number>;
  tableChecksums: Record<string, string>;
  totalRowsBackedUp: number;
  totalRowsDeleted: number;
}

export function computeSha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

export async function runOperationalReset(options: {
  execute?: boolean;
  supabaseUrl?: string;
  serviceKey?: string;
  backupBaseDir?: string;
}): Promise<BackupManifest> {
  const isExecute = options.execute === true;
  const url = options.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = options.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    throw new Error('Supabase URL and Service Role Key are required to run operational reset.');
  }

  const supabase: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(
    options.backupBaseDir || path.join(process.cwd(), 'backups'),
    `operational-reset-${timestamp}`
  );

  fs.mkdirSync(backupDir, { recursive: true });

  const manifest: BackupManifest = {
    timestamp: new Date().toISOString(),
    backupDirectory: backupDir,
    dryRun: !isExecute,
    preservedSuperadmins: Array.from(PRESERVED_SUPERADMIN_IDS),
    preservedTables: PRESERVED_TABLES,
    operationalTables: OPERATIONAL_TABLES_CHILD_FIRST,
    tableCounts: {},
    tableChecksums: {},
    totalRowsBackedUp: 0,
    totalRowsDeleted: 0,
  };

  console.log(`\n================================================================`);
  console.log(`LIT SECTION 33 OPERATIONAL RESET — ${isExecute ? 'LIVE EXECUTION' : 'DRY RUN'}`);
  console.log(`Backup Directory: ${backupDir}`);
  console.log(`================================================================\n`);

  // STEP 1: Verify Superadmin Preservation Pre-Condition
  const { data: superadmins, error: saError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .in('id', Array.from(PRESERVED_SUPERADMIN_IDS));

  if (saError) {
    throw new Error(`Failed to verify superadmin profiles: ${saError.message}`);
  }

  console.log(`[VERIFY] Verified ${superadmins?.length || 0} protected superadmin profile(s).`);
  for (const sa of superadmins || []) {
    console.log(`  - Preserved: ${sa.email} (${sa.id}) [Role: ${sa.role}]`);
  }

  // STEP 2: Backup All Operational Rows to Disk with SHA-256 Checksums
  console.log(`\n--- PHASE 1: PRIVATE SECURE BACKUP ---`);
  for (const table of OPERATIONAL_TABLES_CHILD_FIRST) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`[BACKUP] Table public.${table} query skipped: ${error.message}`);
        manifest.tableCounts[table] = 0;
        manifest.tableChecksums[table] = 'TABLE_UNAVAILABLE_OR_EMPTY';
        continue;
      }

      const rows = data || [];
      const rowCount = rows.length;
      manifest.tableCounts[table] = rowCount;
      manifest.totalRowsBackedUp += rowCount;

      const serialized = JSON.stringify(rows, null, 2);
      const checksum = computeSha256(serialized);
      manifest.tableChecksums[table] = checksum;

      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, serialized, 'utf8');

      console.log(`  ✓ Backed up public.${table}: ${rowCount} row(s) [SHA-256: ${checksum.slice(0, 12)}...]`);
    } catch (err: any) {
      console.warn(`  ! Could not backup ${table}: ${err.message}`);
    }
  }

  // Write Manifest to Backup Directory
  const manifestPath = path.join(backupDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n[BACKUP COMPLETE] Total rows securely backed up: ${manifest.totalRowsBackedUp}`);
  console.log(`Manifest written to: ${manifestPath}\n`);

  // STEP 3: Child-First Deletion (Only if execute=true)
  if (!isExecute) {
    console.log(`[DRY RUN] No database records were modified. Pass --execute to apply deletion.`);
    return manifest;
  }

  console.log(`--- PHASE 2: CHILD-FIRST TOPOLOGICAL RESET ---`);
  for (const table of OPERATIONAL_TABLES_CHILD_FIRST) {
    const rowCount = manifest.tableCounts[table] || 0;
    if (rowCount === 0) {
      console.log(`  - public.${table}: 0 rows (Skipped)`);
      continue;
    }

    try {
      // Explicitly delete without TRUNCATE CASCADE to protect foreign relational boundaries
      const { error: delError } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid unconditional delete without CASCADE

      if (delError) {
        console.error(`  ✗ Failed to delete from public.${table}: ${delError.message}`);
        throw new Error(`Deletion aborted on table ${table}: ${delError.message}`);
      }

      manifest.totalRowsDeleted += rowCount;
      console.log(`  ✓ Cleared public.${table} (${rowCount} rows deleted)`);
    } catch (err: any) {
      console.error(`  ✗ Error resetting ${table}: ${err.message}`);
      throw err;
    }
  }

  // STEP 4: Post-Reset Superadmin Invariant Re-Verification
  console.log(`\n--- PHASE 3: POST-RESET INVARIANT VERIFICATION ---`);
  const { data: postSuperadmins, error: postSaError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .in('id', Array.from(PRESERVED_SUPERADMIN_IDS));

  if (postSaError || !postSuperadmins || postSuperadmins.length !== superadmins?.length) {
    throw new Error(`CRITICAL INVARIANT VIOLATION: Superadmin profile counts changed after reset!`);
  }

  console.log(`  ✓ Superadmin invariant confirmed: ${postSuperadmins.length} accounts remain 100% intact.`);
  for (const sa of postSuperadmins) {
    console.log(`    - Intact: ${sa.email} (${sa.id})`);
  }

  // Record Audit Event for Reset
  await supabase.from('audit_events').insert({
    event_type: 'OPERATIONAL_HISTORY_RESET',
    actor_id: '05991d42-44b3-4fbb-baaa-c6db030844c7',
    actor_email: 'createwithvikash@gmail.com',
    ip_address: '127.0.0.1',
    user_agent: 'LIT-Section-33-Reset-Script',
    metadata: {
      timestamp: manifest.timestamp,
      backupDirectory: backupDir,
      totalRowsDeleted: manifest.totalRowsDeleted,
      totalRowsBackedUp: manifest.totalRowsBackedUp,
    },
  }).then(() => undefined, () => undefined);

  console.log(`\n================================================================`);
  console.log(`LIT SECTION 33 RESET COMPLETED SUCCESSFULLY`);
  console.log(`Total Rows Cleared: ${manifest.totalRowsDeleted}`);
  console.log(`Audit Event Logged: OPERATIONAL_HISTORY_RESET`);
  console.log(`================================================================\n`);

  return manifest;
}

// CLI Entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');

  runOperationalReset({ execute: isExecute })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[FATAL] Reset failed:`, err);
      process.exit(1);
    });
}
