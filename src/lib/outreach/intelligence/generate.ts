import "server-only";
import { completeWithProviders } from "@/lib/ai/providers";
import {
  generatorInputSchema,
  generatorOutputSchema,
  INSUFFICIENT_EVIDENCE,
  type GeneratorInput,
  type GeneratorOutput,
} from "./message-schema";
import { OUTREACH_SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { runGates, qaScore, passesBlockers, type GateContext, type GateResult, type QaScore } from "./qa-gates";

export type GenerateStatus =
  | "ok"
  | "insufficient_evidence"
  | "not_configured"
  | "invalid_output"
  | "error";

export interface GenerateResult {
  status: GenerateStatus;
  output?: GeneratorOutput;
  gates?: GateResult[];
  score?: QaScore;
  blockersPass?: boolean;
  provider?: string;
  model?: string;
  message: string;
}

/** Pull the first balanced JSON object out of a model response (handles fences). */
function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === "{") depth++;
    else if (candidate[i] === "}") {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Generate a first-contact outreach draft from verified structured evidence.
 * Server-only. AI runs behind completeWithProviders (keys never reach the
 * browser). Returns insufficient_evidence without calling the model when there
 * is no evidence, and runs the QA gates on any produced draft.
 */
export async function generateOutreachMessage(
  rawInput: unknown,
  ctx: GateContext,
): Promise<GenerateResult> {
  const parsed = generatorInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: "error", message: "Invalid generator input." };
  }
  const input: GeneratorInput = parsed.data;

  // Never fabricate: no evidence → refuse honestly, no model call.
  if (input.evidence.length === 0) {
    return { status: "insufficient_evidence", message: "No verified evidence to write from." };
  }

  let result;
  try {
    result = await completeWithProviders(
      [
        { role: "system", content: OUTREACH_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      { temperature: 0.4, max_tokens: 900 },
    );
  } catch {
    return { status: "error", message: "The generator is temporarily unavailable." };
  }

  if (!result || result.provider === "none") {
    return { status: "not_configured", message: "No AI provider is configured for outreach generation." };
  }
  const content = (result.content || "").trim();
  if (!content) {
    return { status: "error", message: "The generator returned no content." };
  }
  if (content.includes(INSUFFICIENT_EVIDENCE)) {
    return {
      status: "insufficient_evidence",
      provider: result.provider,
      model: result.model,
      message: "The model judged the evidence insufficient to write honestly.",
    };
  }

  const json = extractJson(content);
  if (!json) {
    return { status: "invalid_output", provider: result.provider, model: result.model, message: "No JSON in output." };
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(json);
  } catch {
    return { status: "invalid_output", provider: result.provider, model: result.model, message: "Output was not valid JSON." };
  }
  const outParsed = generatorOutputSchema.safeParse(candidate);
  if (!outParsed.success) {
    return { status: "invalid_output", provider: result.provider, model: result.model, message: "Output failed schema validation." };
  }

  const output = outParsed.data;
  const gates = runGates(input, output, ctx);
  const score = qaScore(input, output, gates);
  return {
    status: "ok",
    output,
    gates,
    score,
    blockersPass: passesBlockers(gates),
    provider: result.provider,
    model: result.model,
    message: "Draft generated.",
  };
}
