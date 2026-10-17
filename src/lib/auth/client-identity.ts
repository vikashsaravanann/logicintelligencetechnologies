import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { isStaffRole } from '@/config/roles';

export interface ClientIdentityContext {
  authUserId: string;        // auth.users.id (UUID)
  profileId: string;         // profiles.id (UUID)
  role: 'super_admin' | 'staff' | 'client';
  clientId?: string;         // clients.id (UUID)
  clientOrgName?: string;    // clients.legal_name
  engagementIds: string[];   // authorized client_engagements.id list
}

/**
 * Resolves the canonical client identity relationship bridging Auth User UUID,
 * Profile role, Client Organization ID (clients.id), and authorized Engagement IDs.
 *
 * Guarantees that clients.id is never directly compared with auth.users.id.
 */
export async function resolveClientIdentity(authUserId: string): Promise<ClientIdentityContext> {
  if (!authUserId || typeof authUserId !== 'string') {
    return {
      authUserId: '',
      profileId: '',
      role: 'client',
      engagementIds: [],
    };
  }

  const cleanUserId = authUserId.trim();

  if (!isAdminClientConfigured()) {
    return {
      authUserId: cleanUserId,
      profileId: cleanUserId,
      role: 'client',
      engagementIds: [],
    };
  }

  // 1. Fetch user profile to determine authoritative role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, email')
    .eq('id', cleanUserId)
    .maybeSingle();

  const rawRole = profile?.role ?? 'client';
  const isSuperAdmin = rawRole === 'super_admin';
  const isStaff = isStaffRole(rawRole);

  if (isSuperAdmin) {
    // Superadmin has sovereign access to all client engagements
    const { data: allEngagements } = await supabaseAdmin
      .from('client_engagements')
      .select('id');

    return {
      authUserId: cleanUserId,
      profileId: profile?.id ?? cleanUserId,
      role: 'super_admin',
      engagementIds: (allEngagements || []).map((e) => e.id),
    };
  }

  if (isStaff) {
    // Staff access is scoped strictly to active, non-expired staff_client_assignments
    const { data: assignments } = await supabaseAdmin
      .from('staff_client_assignments')
      .select('engagement_id, expires_at')
      .eq('staff_user_id', cleanUserId)
      .eq('status', 'active');

    const validEngagementIds = (assignments || [])
      .filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now())
      .map((a) => a.engagement_id)
      .filter((id): id is string => Boolean(id));

    return {
      authUserId: cleanUserId,
      profileId: profile?.id ?? cleanUserId,
      role: 'staff',
      engagementIds: validEngagementIds,
    };
  }

  // 2. Client role: resolve client organization via clients.user_id = authUserId
  let { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, legal_name, display_name, user_id, contact_email')
    .eq('user_id', cleanUserId)
    .maybeSingle();

  // Fallback lookup by profile email if user_id was not populated on clients row
  if (!client && profile?.email) {
    const { data: clientByEmail } = await supabaseAdmin
      .from('clients')
      .select('id, legal_name, display_name, user_id, contact_email')
      .ilike('contact_email', profile.email.trim())
      .maybeSingle();

    if (clientByEmail) {
      client = clientByEmail;
    }
  }

  const clientId = client?.id;
  const clientOrgName = client?.legal_name || client?.display_name || undefined;

  // 3. Resolve authorized engagements for this client organization or contact email
  const engagementIds: string[] = [];

  if (clientId) {
    const { data: engagementsByClient } = await supabaseAdmin
      .from('client_engagements')
      .select('id')
      .eq('client_id', clientId);

    if (engagementsByClient) {
      engagementsByClient.forEach((e) => {
        if (!engagementIds.includes(e.id)) engagementIds.push(e.id);
      });
    }
  }

  if (profile?.email) {
    const { data: engagementsByEmail } = await supabaseAdmin
      .from('client_engagements')
      .select('id')
      .ilike('contact_email', profile.email.trim());

    if (engagementsByEmail) {
      engagementsByEmail.forEach((e) => {
        if (!engagementIds.includes(e.id)) engagementIds.push(e.id);
      });
    }
  }

  return {
    authUserId: cleanUserId,
    profileId: profile?.id ?? cleanUserId,
    role: 'client',
    clientId,
    clientOrgName,
    engagementIds,
  };
}

/**
 * Asserts whether a given authenticated user has authorized access to a specific engagement.
 */
export async function assertClientEngagementAccess(
  authUserId: string,
  engagementId: string
): Promise<boolean> {
  if (!authUserId || !engagementId) return false;

  const identity = await resolveClientIdentity(authUserId);

  if (identity.role === 'super_admin') return true;

  if (identity.engagementIds.includes(engagementId)) return true;

  // Check if engagementId passed is an engagement_ref
  const { data: eng } = await supabaseAdmin
    .from('client_engagements')
    .select('id, engagement_ref, client_id, contact_email')
    .or(`id.eq.${engagementId},engagement_ref.eq.${engagementId}`)
    .maybeSingle();

  if (!eng) return false;

  if (identity.engagementIds.includes(eng.id)) return true;

  if (identity.clientId && eng.client_id === identity.clientId) return true;

  return false;
}
