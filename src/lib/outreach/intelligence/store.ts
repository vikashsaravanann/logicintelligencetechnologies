import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EvidenceItem, GeneratorOutput } from "./message-schema";
import type { GateResult, QaScore } from "./qa-gates";

/**
 * Server data access for the Outreach Studio. All reads/writes go through the
 * service-role client behind requireCapabilityPage/Action — the lead tables are
 * service_role-only. Evidence handed to the generator is built ONLY from
 * verified rows (technical audits, detected opportunities); nothing is invented.
 */

export interface StudioLeadRow {
  id: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  country_code: string | null;
  domain: string | null;
  status: string;
  priority: string | null;
  score: number | null;
  opportunity_type: string | null;
}

export interface ComplianceState {
  countryCode: string | null;
  jurisdictionStatus: "allowed" | "review_required" | "blocked" | "unlisted";
  suppressed: boolean;
  cleared: boolean;
  reason: string;
}

/** Leads worth drafting for: have a current score and at least one open opportunity. */
export async function listStudioLeads(limit = 50): Promise<StudioLeadRow[]> {
  const { data, error } = await supabaseAdmin
    .from("lead_businesses")
    .select(
      "id, company_name, industry, city, country_code, domain, status, priority, " +
        "lead_scores!inner(score, is_current), lead_opportunities(opportunity_type, status)",
    )
    .eq("lead_scores.is_current", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const rows = data as unknown as Array<Record<string, unknown>>;
  return rows.map((b) => {
    const scores = (b.lead_scores as Array<{ score: number }> | null) ?? [];
    const opps = (b.lead_opportunities as Array<{ opportunity_type: string; status: string }> | null) ?? [];
    const open = opps.find((o) => o.status === "open") ?? opps[0];
    return {
      id: b.id as string,
      company_name: b.company_name as string,
      industry: (b.industry as string) ?? null,
      city: (b.city as string) ?? null,
      country_code: (b.country_code as string) ?? null,
      domain: (b.domain as string) ?? null,
      status: b.status as string,
      priority: (b.priority as string) ?? null,
      score: scores[0]?.score ?? null,
      opportunity_type: open?.opportunity_type ?? null,
    };
  });
}

export interface StudioLeadDetail {
  business: Record<string, unknown>;
  opportunities: Array<Record<string, unknown>>;
  audits: Array<Record<string, unknown>>;
  contacts: Array<Record<string, unknown>>;
  evidence: EvidenceItem[];
  compliance: ComplianceState;
  messages: Array<Record<string, unknown>>;
}

/** Build verified evidence from a business's technical audits + opportunities. */
function buildEvidence(
  audits: Array<Record<string, unknown>>,
  opportunities: Array<Record<string, unknown>>,
): EvidenceItem[] {
  const out: EvidenceItem[] = [];
  for (const a of audits) {
    const perf = a.performance_score as number | null;
    if (typeof perf === "number") {
      out.push({
        kind: "technical_measurement",
        statement: `Mobile performance measured ${Math.round(perf)}/100.`,
        source: (a.tool as string) ?? "PageSpeed Insights",
        measured_value: `${Math.round(perf)}/100`,
        data_source: (a.data_source as "lab" | "field_crux") ?? "lab",
        checked_at: (a.audited_at as string)?.slice(0, 10),
      });
    }
    if (a.has_meta_description === false) {
      out.push({ kind: "observation", statement: "The page has no meta description.", source: (a.tool as string) ?? "LIT audit worker", data_source: "manual_check" });
    }
  }
  for (const o of opportunities) {
    const ev = o.evidence as Record<string, unknown> | null;
    const note = ev && typeof ev.note === "string" ? (ev.note as string) : null;
    if (note) out.push({ kind: "observation", statement: note, source: "LIT audit" });
  }
  return out.slice(0, 12);
}

export async function getStudioLead(businessId: string): Promise<StudioLeadDetail | null> {
  const { data: business, error } = await supabaseAdmin
    .from("lead_businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();
  if (error || !business) return null;

  const [opps, audits, contacts, scores, messages] = await Promise.all([
    supabaseAdmin.from("lead_opportunities").select("*").eq("business_id", businessId).order("detected_at", { ascending: false }),
    supabaseAdmin.from("lead_technical_audits").select("*").eq("business_id", businessId).order("audited_at", { ascending: false }).limit(3),
    supabaseAdmin.from("lead_contacts").select("*").eq("business_id", businessId).limit(5),
    supabaseAdmin.from("lead_scores").select("*").eq("business_id", businessId).eq("is_current", true).maybeSingle(),
    supabaseAdmin.from("lead_outreach_messages").select("*").eq("business_id", businessId).order("generated_at", { ascending: false }).limit(10),
  ]);

  const opportunities = opps.data ?? [];
  const auditRows = audits.data ?? [];
  const current = scores.data as Record<string, unknown> | null;
  if (current) (business as Record<string, unknown>).current_score = current.score;

  const compliance = await resolveCompliance(business as Record<string, unknown>);
  return {
    business: business as Record<string, unknown>,
    opportunities,
    audits: auditRows,
    contacts: contacts.data ?? [],
    evidence: buildEvidence(auditRows, opportunities),
    compliance,
    messages: messages.data ?? [],
  };
}

/** Mirror of the DB gate: is this business clear to receive outreach right now? */
export async function resolveCompliance(business: Record<string, unknown>): Promise<ComplianceState> {
  const countryCode = (business.country_code as string) ?? null;
  const domain = (business.domain as string) ?? null;
  if (!countryCode) {
    return { countryCode, jurisdictionStatus: "unlisted", suppressed: false, cleared: false, reason: "No country on record." };
  }
  const { data: j } = await supabaseAdmin.from("lead_jurisdictions").select("outreach_status").eq("country_code", countryCode).maybeSingle();
  const jurisdictionStatus = (j?.outreach_status as ComplianceState["jurisdictionStatus"]) ?? "unlisted";

  const { data: supp } = await supabaseAdmin
    .from("lead_suppressions")
    .select("id")
    .eq("active", true)
    .or(`business_id.eq.${business.id}${domain ? `,domain.eq.${domain}` : ""}`)
    .limit(1);
  const suppressed = Boolean(supp && supp.length);

  const cleared = jurisdictionStatus === "allowed" && !suppressed;
  const reason = suppressed
    ? "An active suppression exists for this business."
    : jurisdictionStatus !== "allowed"
      ? `Jurisdiction ${countryCode} is ${jurisdictionStatus} (not on the outreach allowlist).`
      : "Jurisdiction allowlisted and no suppression.";
  return { countryCode, jurisdictionStatus, suppressed, cleared, reason };
}

export interface SaveMessageInput {
  businessId: string;
  channel: string;
  opportunityType: string | null;
  output: GeneratorOutput;
  gates: GateResult[];
  score: QaScore | null;
  blockersPass: boolean;
  provider: string | null;
  model: string | null;
  generatedBy: string | null;
}

/** Persist a new draft version (never overwrites prior versions). */
export async function saveMessageVersion(input: SaveMessageInput): Promise<string | null> {
  const { data: prev } = await supabaseAdmin
    .from("lead_outreach_messages")
    .select("version")
    .eq("business_id", input.businessId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = ((prev?.version as number) ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("lead_outreach_messages")
    .insert({
      business_id: input.businessId,
      version,
      channel: input.channel,
      opportunity_type: input.opportunityType,
      subject: input.output.subject,
      observation: input.output.observation,
      impact: input.output.impact,
      cta: input.output.cta,
      body: input.output.body,
      evidence_used: input.output.evidence_used,
      claims_requiring_review: input.output.claims_requiring_review,
      qa_score: input.score?.total ?? null,
      qa_gates: input.gates,
      blockers_pass: input.blockersPass,
      status: input.blockersPass ? "needs_review" : "draft",
      provider: input.provider,
      model: input.model,
      generated_by: input.generatedBy,
    })
    .select("id")
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}
