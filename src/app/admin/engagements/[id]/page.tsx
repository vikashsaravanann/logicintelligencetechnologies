import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireCapabilityPage } from '@/lib/auth/session';
import {
  getEngagementByRef,
  getEngagementStages,
  getEngagementDocumentLinks,
  listIdentityChangeRequests,
} from '@/lib/engagements/db';
import { AdminBackLink } from '../../components/AdminBackLink';
import EngagementDetailAdminClient from './EngagementDetailAdminClient';

export const metadata: Metadata = {
  title: 'Manage Engagement Lifecycle | Admin | Logic Intelligence Technologies',
  description: 'Super-Admin controller for 13-stage gates, manual unlocks, and audit ledgers.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

interface AdminEngagementDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ stage?: string }>;
}

export default async function AdminEngagementDetailPage({ params, searchParams }: AdminEngagementDetailPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  await requireCapabilityPage('clients.read', `/admin/engagements/${id}`);

  const engagement = await getEngagementByRef(id);

  if (!engagement) {
    notFound();
  }

  const stages = await getEngagementStages(engagement.id);
  const documents = await getEngagementDocumentLinks(engagement.id);
  const identityRequests = await listIdentityChangeRequests(engagement.id);

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/engagements" label="All Engagements" />

      <EngagementDetailAdminClient
        engagement={engagement}
        initialStages={stages}
        documents={documents}
        identityRequests={identityRequests}
        initialActiveStageKey={query.stage as any}
      />
    </div>
  );
}
