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
