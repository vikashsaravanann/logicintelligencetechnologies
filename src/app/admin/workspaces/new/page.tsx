import { Metadata } from 'next';
import { requireCapabilityPage } from '@/lib/auth/session';
import { listAllEngagements } from '@/lib/engagements/db';
import WorkspaceCreationForm from './WorkspaceCreationForm';

export const metadata: Metadata = {
  title: 'Create Staff Workspace | Admin | Logic Intelligence Technologies',
  description: 'Founder-provisioned individual private workspace and credentials for Logic Intelligence Technologies employees.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function NewStaffWorkspacePage() {
  await requireCapabilityPage('team.manage', '/admin/workspaces/new');
  
  let engagements: Array<{ id: string; companyName: string; projectTitle: string; status: string }> = [];
  try {
    const rawEngagements = await listAllEngagements();
    engagements = (rawEngagements || []).map((e) => ({
      id: e.id,
      companyName: e.company_name,
      projectTitle: e.project_title,
      status: e.status,
    }));
  } catch (err) {
    console.warn('[workspaces/new] failed to load engagements list:', err);
  }

  return <WorkspaceCreationForm engagements={engagements} />;
}
