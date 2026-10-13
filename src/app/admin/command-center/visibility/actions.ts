"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

/**
 * Approve or reject a content suggestion. Flips status and records the
 * reviewer. Never touches already-applied rows. Phase 3 does NOT auto-apply —
 * 'approved' only marks the suggestion ready for the apply step (PR).
 */
export async function reviewSuggestion(input: {
  id: string;
  decision: "approved" | "rejected";
}): Promise<ReviewResult> {
  const session = await requireCapabilityAction("seo.manage", "visibility.content_review");

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid review input." };

  const { error } = await supabaseAdmin
    .from("content_suggestions")
    .update({
      status: parsed.data.decision,
      reviewed_by: session.email ?? session.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .neq("status", "applied"); // applied suggestions are immutable here

  if (error) return { ok: false, error: "Could not update the suggestion." };

  revalidatePath("/admin/command-center/visibility");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Phase 4 — Citation & Mention Engine
// ---------------------------------------------------------------------------

function hostFromUrl(u: string): string {
  try {
    return new URL(u).host.replace(/^www\./, "").toLowerCase();
  } catch {
    return u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
  }
}

/** Build a truthful, human-editable outreach/submission draft for a target. */
function buildCitationDraft(
  target: { type: string; name: string; url: string },
  entity: { name: string; domain: string | null },
): { subject: string; body: string; channel: string } {
  const site = entity.domain ? `https://${entity.domain}` : "(official site)";
  if (target.type === "directory" || target.type === "review_site") {
    return {
      channel: "other",
      subject: `Submit ${entity.name} to ${target.name}`,
      body: [
        `Submission checklist — ${target.name} (${target.url})`,
        "",
        `Product/company: ${entity.name}`,
        `Official site: ${site}`,
        `Listing type: ${target.type}`,
        "",
        "Steps:",
        "1. Create or claim the profile.",
        "2. Add only verified company details (name, site, category, location).",
        "3. Link the official site above.",
        "4. For reviews: invite genuine, real customers only — never post fake or incentivised reviews.",
        "",
        "Suggested one-line summary (edit to a specific, true detail before submitting):",
        `“${entity.name} — <add one accurate, verifiable sentence from ${site}>.”`,
      ].join("\n"),
    };
  }
  // press / community / partner / wiki_source → personalised outreach draft
  return {
    channel: "email",
    subject: `${entity.name} — story/collaboration idea`,
    body: [
      `Hi ${target.name} team,`,
      "",
      `I'm reaching out from ${entity.name} (${site}).`,
      "",
      "<Add one specific, true, verifiable reason this is relevant to your audience — no superlatives, no invented numbers or claims.>",
      "",
      target.type === "community"
        ? "Note: this is a participation suggestion only. Respect the platform's self-promotion rules — contribute genuinely; do not spam."
        : "Would a brief conversation or a review copy be useful? Happy to share verifiable details.",
      "",
      "Thanks for considering,",
      `${entity.name}`,
    ].join("\n"),
  };
}

export type CitationResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * Promote a citation target into the EXISTING Lead Engine outreach queue:
 * creates a lead_businesses row for the venue + a lead_outreach_messages draft
 * (status 'needs_review'), and flips the target to 'queued'. Nothing auto-sends;
 * the draft is approved in /admin/outreach/queue like any other message.
 */
export async function promoteCitationTarget(id: string): Promise<CitationResult> {
  const session = await requireCapabilityAction("outreach.manage", "visibility.citation_promote");

  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid target." };

  const { data: target } = await supabaseAdmin
    .from("citation_targets")
    .select("id, entity_id, type, name, url, status, tracked_entities!inner(name, domain)")
    .eq("id", id)
    .maybeSingle();
  if (!target) return { ok: false, error: "Citation target not found." };
  if (!["identified", "rejected"].includes(target.status as string)) {
    return { ok: false, error: `Target is already '${target.status}'.` };
  }

  const entRel = target.tracked_entities as unknown;
  const entity = (Array.isArray(entRel) ? entRel[0] : entRel) as { name: string; domain: string | null };
  const draft = buildCitationDraft(
    { type: target.type as string, name: target.name as string, url: target.url as string },
    entity,
  );

  // 1. venue as a lead_businesses row (so it fits the existing queue + FK)
  const { data: biz, error: bizErr } = await supabaseAdmin
    .from("lead_businesses")
    .insert({
      company_name: target.name as string,
      domain: hostFromUrl(target.url as string),
      category: "citation_target",
      status: "new",
      source_url: target.url as string,
      provenance: {
        kind: "citation_target",
        citation_target_id: target.id,
        entity_id: target.entity_id,
        entity_name: entity.name,
      },
    })
    .select("id")
    .maybeSingle();
  if (bizErr || !biz) return { ok: false, error: "Could not stage the outreach venue." };

  // 2. draft into the existing human-review queue (needs_review, approvable)
  const { error: msgErr } = await supabaseAdmin.from("lead_outreach_messages").insert({
    business_id: biz.id,
    version: 1,
    channel: draft.channel,
    subject: draft.subject,
    body: draft.body,
    evidence_used: [],
    claims_requiring_review: [],
    qa_gates: [],
    blockers_pass: true,
    status: "needs_review",
    generated_by: session.email ?? session.userId,
  });
  if (msgErr) return { ok: false, error: "Could not create the outreach draft." };

  await supabaseAdmin.from("citation_targets").update({ status: "queued" }).eq("id", id);

  revalidatePath("/admin/command-center/visibility");
  return {
    ok: true,
    message: "Draft queued for human review in Outreach → Dispatch & Approval Queue. It will not send automatically.",
  };
}

const markSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["actioned", "live", "rejected"]),
  citationUrl: z.string().url().optional(),
});

/** Human-driven status transitions for a citation target. */
export async function markCitationStatus(input: {
  id: string;
  status: "actioned" | "live" | "rejected";
  citationUrl?: string;
}): Promise<CitationResult> {
  await requireCapabilityAction("seo.manage", "visibility.citation_mark");
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  if (parsed.data.status === "live" && !parsed.data.citationUrl) {
    return { ok: false, error: "A citation URL is required to mark a target live." };
  }

  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "live") patch.citation_url = parsed.data.citationUrl;

  const { error } = await supabaseAdmin.from("citation_targets").update(patch).eq("id", parsed.data.id);
  if (error) return { ok: false, error: "Could not update the target." };

  revalidatePath("/admin/command-center/visibility");
  return { ok: true, message: `Marked ${parsed.data.status}.` };
}
