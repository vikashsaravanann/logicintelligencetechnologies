/**
 * Serverless AI integration layer for Logic Intelligence Technologies.
 *
 * Runs entirely inside Vercel/Next.js Route Handlers:
 *   request → ground (RAG) → dual providers (xAI + Groq) → structured response
 *
 * No long-lived GPU process required for production chat.
 */

import "server-only";
import {
  completeWithProviders,
  hasAnyProvider,
  type ChatMessage,
  type ProviderResult,
} from "@/lib/ai/providers";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";

export type ServerlessAIRequest = {
  /** Latest user text (required for RAG grounding). */
  message: string;
  /** Prior turns; system messages are ignored (we inject our own). */
  history?: Array<{ role: string; content: string }>;
  /** Optional extra system instructions (portfolio persona, etc.). */
  systemExtra?: string;
  temperature?: number;
  max_tokens?: number;
  /** When true, skip company RAG (pure general / persona-only). */
  skipRag?: boolean;
};

export type ServerlessAIResponse = {
  success: boolean;
  reply: string;
  provider: ProviderResult["provider"];
  model: string;
  grounded: boolean;
  latency_ms: number;
  error?: string;
};

function cleanReply(text: string): string {
  return String(text || "")
    .replace(/^\s*assistant[:\s]*/i, "")
    .trim();
}

/**
 * Core serverless completion: ground → race providers → return first good reply.
 */
export async function runServerlessAI(
  req: ServerlessAIRequest
): Promise<ServerlessAIResponse> {
  const started = Date.now();
  const message = String(req.message || "").trim();

  if (!message) {
    return {
      success: false,
      reply: "",
      provider: "none",
      model: "none",
      grounded: false,
      latency_ms: 0,
      error: "Empty message",
    };
  }

  if (!hasAnyProvider()) {
    return {
      success: false,
      reply:
        "AI providers are not configured. Set XAI_API_KEY and/or GROQ_API_KEY on the server.",
      provider: "none",
      model: "none",
      grounded: false,
      latency_ms: Date.now() - started,
      error: "No providers",
    };
  }

  let system =
    "You are a helpful, professional AI assistant for Logic Intelligence Technologies. " +
    "Answer accurately. Never invent package prices. Prefer concise, clear replies.";

  let grounded = false;
  if (!req.skipRag) {
    try {
      const { block } = await buildQueryGroundedKnowledge(message);
      system = `${system}\n\n${block}`;
      grounded = true;
    } catch (err) {
      console.warn("[serverless-ai] RAG grounding failed:", err);
    }
  }

  if (req.systemExtra?.trim()) {
    system = `${system}\n\n${req.systemExtra.trim()}`;
  }

  const history = (req.history || [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 4000),
    }));

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await completeWithProviders(messages, {
      temperature: req.temperature ?? 0.35,
      max_tokens: req.max_tokens ?? 900,
    });

    const reply = cleanReply(result.content);
    if (!reply) {
      return {
        success: false,
        reply:
          "I could not generate a response right now. Please try again in a moment.",
        provider: result.provider,
        model: result.model,
        grounded,
        latency_ms: Date.now() - started,
        error: "Empty model output",
      };
    }

    return {
      success: true,
      reply,
      provider: result.provider,
      model: result.model,
      grounded,
      latency_ms: Date.now() - started,
    };
  } catch (err) {
    console.error("[serverless-ai] completion failed:", err);
    return {
      success: false,
      reply: "Something went wrong while contacting the AI service.",
      provider: "none",
      model: "none",
      grounded,
      latency_ms: Date.now() - started,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}
