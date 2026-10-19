import "server-only";
import { completeWithProviders } from "@/lib/ai/providers";
import {
  replyClassificationSchema,
  classifyByRules,
  REPLY_CATEGORIES,
  AUTO_ACTIONABLE,
  type ReplyCategory,
} from "./reply-schema";

export interface ReplyClassificationResult {
  category: ReplyCategory;
  confidence: number;
  rationale: string;
  requiresHuman: boolean;
  classifiedBy: string; // "ai" | "rule"
  provider: string | null;
  model: string | null;
}

const SYSTEM_PROMPT = `You classify an INBOUND reply to a B2B outreach message for Logic Intelligence Technologies (LIT).
You only classify intent. You never draft a response and never invent facts about the sender.

Pick exactly one category:
- positive         the person is interested or open to talking
- question         they ask something and expect an answer
- request_audit    they want the detailed audit / report / proposal / pricing
- not_now          interested in principle but the timing is wrong
- not_interested   they decline
- opt_out          they ask to be removed / stop contacting them / unsubscribe
- bounce           an automated non-delivery / undeliverable notice
- auto_reply       an out-of-office / automatic acknowledgement
- uncategorized    genuinely unclear

Return STRICT JSON ONLY, no markdown:
{"category": <one of the above>, "confidence": <0..1>, "rationale": <short reason>}`;

function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

/**
 * Classify a reply's intent. Tries the server-side AI provider first and falls
 * back to the deterministic rule classifier when AI is unconfigured or returns
 * unusable output. A human is always required unless the category is an
 * unambiguous operational signal (opt_out / bounce) classified with high
 * confidence. Never throws.
 */
export async function classifyReply(subject: string | null, body: string): Promise<ReplyClassificationResult> {
  const trimmed = (body ?? "").trim();
  if (!trimmed) {
    const r = classifyByRules(subject, "");
    return { ...r, classifiedBy: "rule", provider: null, model: null };
  }

  let ai: Awaited<ReturnType<typeof completeWithProviders>> | null = null;
  try {
    ai = await completeWithProviders(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `SUBJECT: ${subject ?? "(none)"}\n\nREPLY:\n${trimmed.slice(0, 4000)}` },
      ],
      { temperature: 0, max_tokens: 200 },
    );
  } catch {
    ai = null;
  }

  if (ai && ai.provider !== "none" && ai.content) {
    const json = extractJson(ai.content);
    if (json) {
      try {
        const parsed = replyClassificationSchema.safeParse(JSON.parse(json));
        if (parsed.success && (REPLY_CATEGORIES as readonly string[]).includes(parsed.data.category)) {
          const { category, confidence, rationale } = parsed.data;
          // Only operational signals at high confidence skip the human gate.
          const requiresHuman = !(AUTO_ACTIONABLE.has(category) && confidence >= 0.8);
          return { category, confidence, rationale, requiresHuman, classifiedBy: "ai", provider: ai.provider, model: ai.model };
        }
      } catch {
        // fall through to rules
      }
    }
  }

  const r = classifyByRules(subject, trimmed);
  return { ...r, classifiedBy: "rule", provider: null, model: null };
}
