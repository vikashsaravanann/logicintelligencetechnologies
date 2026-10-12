import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Server data for the Outreach queues, suppression and analytics pages.
 * service_role-only, behind requireCapabilityPage/Action.
 */

export interface QueueMessageRow {
  id: string;
  business_id: string;
  company_name: string;
  version: number;
  channel: string;
  status: string;
  subject: string | null;
  body: string;
  qa_score: number | null;
  blockers_pass: boolean;
  opportunity_type: string | null;
  generated_by: string | null;
  generated_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

/** Messages in a given lifecycle status (draft / needs_review / approved / sent). */
export async function listMessagesByStatus(statuses: string[], limit = 100): Promise<QueueMessageRow[]> {
  const { data, error } = await supabaseAdmin
    .from("lead_outreach_messages")
    .select(
      "id, business_id, version, channel, status, subject, body, qa_score, blockers_pass, opportunity_type, " +
        "generated_by, generated_at, approved_by, approved_at, lead_businesses(company_name)",
    )
    .in("status", statuses)
    .order("generated_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map((m) => ({
    id: m.id as string,
    business_id: m.business_id as string,
    company_name: ((m.lead_businesses as { company_name?: string } | null)?.company_name as string) ?? "—",
    version: (m.version as number) ?? 1,
    channel: m.channel as string,
    status: m.status as string,
    subject: (m.subject as string) ?? null,
    body: m.body as string,
    qa_score: (m.qa_score as number) ?? null,
    blockers_pass: Boolean(m.blockers_pass),
    opportunity_type: (m.opportunity_type as string) ?? null,
    generated_by: (m.generated_by as string) ?? null,
    generated_at: m.generated_at as string,
    approved_by: (m.approved_by as string) ?? null,
    approved_at: (m.approved_at as string) ?? null,
  }));
}

export interface OutreachStats {
  messagesByStatus: Record<string, number>;
  leadsByStatus: Record<string, number>;
  totalScoredLeads: number;
  totalBusinesses: number;
  totalDecisions: number;
  totalPolicyRules: number;
  activeLegalApprovals: number;
  pendingLegalReviews: number;
  jurisdictions: Array<{ country_code: string; outreach_status: string; businesses: number }>;
  suppressions: number;
  isUnseeded: boolean;
  error: boolean;
}

export async function outreachStats(): Promise<OutreachStats> {
  const [msgs, leads, scored, jur, supp, decs, rules, approvals] = await Promise.all([
    supabaseAdmin.from("lead_outreach_messages").select("status"),
    supabaseAdmin.from("lead_businesses").select("status, country_code"),
    supabaseAdmin.from("lead_scores").select("id", { count: "exact", head: true }).eq("is_current", true),
    supabaseAdmin.from("lead_jurisdictions").select("country_code, outreach_status"),
    supabaseAdmin.from("lead_suppressions").select("id", { count: "exact", head: true }).eq("active", true),
    supabaseAdmin.from("outreach_eligibility_decisions").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("outreach_policy_rules").select("policy_status"),
    supabaseAdmin.from("outreach_policy_approvals").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const error = Boolean(msgs.error || leads.error || jur.error);
  const messagesByStatus: Record<string, number> = {};
  for (const r of (msgs.data as Array<{ status: string }> | null) ?? []) {
    messagesByStatus[r.status] = (messagesByStatus[r.status] ?? 0) + 1;
  }
  const leadsByStatus: Record<string, number> = {};
  const perCountry: Record<string, number> = {};
  const leadsList = (leads.data as Array<{ status: string; country_code: string | null }> | null) ?? [];
  for (const r of leadsList) {
    leadsByStatus[r.status] = (leadsByStatus[r.status] ?? 0) + 1;
    if (r.country_code) perCountry[r.country_code] = (perCountry[r.country_code] ?? 0) + 1;
  }
  const jurisdictions = ((jur.data as Array<{ country_code: string; outreach_status: string }> | null) ?? []).map((j) => ({
    country_code: j.country_code,
    outreach_status: j.outreach_status,
    businesses: perCountry[j.country_code] ?? 0,
  }));

  const totalBusinesses = leadsList.length;
  const totalScoredLeads = scored.count ?? 0;
  const totalDecisions = decs.count ?? 0;
  const rulesList = (rules.data as Array<{ policy_status: string }> | null) ?? [];
  const totalPolicyRules = rulesList.length;
  const activeLegalApprovals = approvals.count ?? 0;
  const pendingLegalReviews = rulesList.filter((r) => r.policy_status === "review_required").length;
  const isUnseeded = totalBusinesses === 0 && Object.keys(messagesByStatus).length === 0;

  return {
    messagesByStatus,
    leadsByStatus,
    totalScoredLeads,
    totalBusinesses,
    totalDecisions,
    totalPolicyRules,
    activeLegalApprovals,
    pendingLegalReviews,
    jurisdictions,
    suppressions: supp.count ?? 0,
    isUnseeded,
    error,
  };
}

export interface SuppressionRow {
  id: string;
  email: string | null;
  phone: string | null;
  domain: string | null;
  reason: string;
  scope: string;
  source: string | null;
  active: boolean;
  created_at: string;
}

export async function listSuppressions(limit = 100): Promise<SuppressionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("lead_suppressions")
    .select("id, email, phone, domain, reason, scope, source, active, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as SuppressionRow[];
}
