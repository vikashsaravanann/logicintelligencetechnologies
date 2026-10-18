import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CanonicalProject = {
  projectId: string | null;
  engagementId: string | null;
  engagementRef: string | null;
  clientId: string | null;
  title: string;
  status: string | null;
  contactEmail: string | null;
};

/** Resolve engagement + optional portal project into one identity. */
export async function resolveCanonicalByEngagementId(
  engagementId: string
): Promise<CanonicalProject | null> {
  const { data: eng } = await supabaseAdmin
    .from("client_engagements")
    .select("id, engagement_ref, client_id, project_title, company_name, status, contact_email")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng) return null;

  const { data: proj } = await supabaseAdmin
    .from("projects")
    .select("id, name, status")
    .eq("engagement_id", engagementId)
    .maybeSingle();

  return {
    projectId: proj?.id || null,
    engagementId: eng.id,
    engagementRef: eng.engagement_ref,
    clientId: eng.client_id,
    title: proj?.name || eng.project_title || eng.company_name || "Project",
    status: proj?.status || eng.status,
    contactEmail: eng.contact_email,
  };
}

export async function resolveCanonicalByProjectId(
  projectId: string
): Promise<CanonicalProject | null> {
  const { data: proj } = await supabaseAdmin
    .from("projects")
    .select("id, name, status, engagement_id, client_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!proj) return null;
  if (proj.engagement_id) {
    return resolveCanonicalByEngagementId(proj.engagement_id);
  }
  return {
    projectId: proj.id,
    engagementId: null,
    engagementRef: null,
    clientId: proj.client_id,
    title: proj.name || "Project",
    status: proj.status,
    contactEmail: null,
  };
}

/** Link project ↔ engagement when both known (idempotent). */
export async function linkProjectToEngagement(
  projectId: string,
  engagementId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from("projects")
    .update({ engagement_id: engagementId })
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
