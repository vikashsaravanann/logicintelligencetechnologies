import { Metadata } from 'next';
import { requireCapabilityPage } from '@/lib/auth/session';
import { listAllEngagements, listIdentityChangeRequests } from '@/lib/engagements/db';
import { AdminBackLink } from '../components/AdminBackLink';
import EngagementsAdminClient from './EngagementsAdminClient';

export const metadata: Metadata = {
  title: 'Client Lifecycle Engagements | Admin | Logic Intelligence Technologies',
  description: 'Manage 13-stage client lifecycles, stage unlock gates, identity corrections, and manual payments.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminEngagementsPage() {
  await requireCapabilityPage('clients.read', '/admin/engagements');

  const engagements = await listAllEngagements();
  const identityRequests = await listIdentityChangeRequests();

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/command-center" label="Command Center" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B2545]">
          Client Lifecycle Engagements (13-Stage Architecture)
        </h1>
        <p className="mt-1 text-sm text-[#52677C]">
          Canonical overview of client onboarding journeys, prerequisite gates, identity correction review queue, and payment clearance.
        </p>
      </div>

      <EngagementsAdminClient
        initialEngagements={engagements}
        initialIdentityRequests={identityRequests}
      />
    </div>
  );
}
