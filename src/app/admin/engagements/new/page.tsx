import { Metadata } from 'next';
import { requireCapabilityPage } from '@/lib/auth/session';
import NewEngagementForm from './NewEngagementForm';

export const metadata: Metadata = {
  title: 'Create Client Engagement | Admin | Logic Intelligence Technologies',
  description: 'Issue a 13-stage client lifecycle engagement portal, initialize milestone gates, and dispatch client access email.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewEngagementPage() {
  await requireCapabilityPage('clients.write', '/admin/engagements/new');
  return <NewEngagementForm />;
}
