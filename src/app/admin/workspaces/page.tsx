import { Metadata } from 'next';
import { requireCapabilityPage } from '@/lib/auth/session';
import { listStaffWorkspaces } from '@/lib/workspaces/service';
import type { StaffWorkspaceSummaryDTO } from '@/lib/workspaces/types';
import WorkspacesDirectoryClient from './WorkspacesDirectoryClient';

export const metadata: Metadata = {
  title: 'Staff Admin Workspaces | Admin | Logic Intelligence Technologies',
  description: 'Manage individual employee admin workspaces, status, and role entitlements.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminWorkspacesDirectoryPage() {
  const session = await requireCapabilityPage('team.manage', '/admin/workspaces');
  
  let workspaces: StaffWorkspaceSummaryDTO[] = [];
  try {
    workspaces = await listStaffWorkspaces(session.userId);
  } catch (err) {
    console.warn('[workspaces/directory] failed to list workspaces:', err);
  }

  return <WorkspacesDirectoryClient initialWorkspaces={workspaces} />;
}
