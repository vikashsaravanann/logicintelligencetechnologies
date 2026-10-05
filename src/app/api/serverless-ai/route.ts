import { NextResponse } from "next/server";
import { z } from "zod";
import { runServerlessAI } from "@/lib/ai/serverless";
import { guardAiRequest, readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Serverless function wall time (Vercel). */
export const maxDuration = 30;

const bodySchema = z.object({
  message: z.string().min(1).max(4000).optional(),
  /** OpenAI-style messages array (portfolio chatbot). */
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000).optional(),
      })
    )
    .max(12)
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(12)
    .optional(),
  systemExtra: z.string().max(2000).optional(),
  skipRag: z.boolean().optional(),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().int().min(64).max(1200).optional(),
});

/**
 * Unified serverless AI endpoint.
 *
 * POST /api/serverless-ai
 * Body (any of):
 *   { message: "..." }
 *   { messages: [{ role, content }, ...] }  // last user message used
 *   { message, history, systemExtra, skipRag }
 *
 * Response:
 *   { success, reply, generated_text, provider, model, grounded, latency_ms }
 */
export async function POST(req: Request) {
  try {
    const auth = await guardAiRequest();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const json = await readBoundedAiJson(req);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let message = data.message?.trim() || "";
    let history = data.history || [];

    if (!message && data.messages?.length) {
      const users = data.messages.filter((m) => m.role === "user");
      const last = users[users.length - 1];
      message = String(last?.content || "").trim();
      history = data.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content: String(m.content || ""),
        }));
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: "message is required" },
        { status: 400 }
      );
    }

    const result = await runServerlessAI({
      message,
      history,
      systemExtra: data.systemExtra,
      skipRag: data.skipRag,
      temperature: data.temperature,
      max_tokens: data.max_tokens,
    });

    return NextResponse.json({
      success: result.success,
      reply: result.reply,
      generated_text: result.reply,
      message: result.reply,
      provider: result.provider,
      model: result.model,
      grounded: result.grounded,
      latency_ms: result.latency_ms,
      error: result.success ? undefined : "AI service unavailable",
      // OpenAI-compatible shape for older clients
      choices: [
        {
          message: { role: "assistant", content: result.reply },
        },
      ],
    });
  } catch (err) {
    if (err instanceof InvalidAiRequest) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[api/serverless-ai]", err);
    return NextResponse.json(
      {
        success: false,
        error: "AI service unavailable",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "serverless-ai",
    endpoints: {
      post: "/api/serverless-ai",
      chat: "/api/chat",
      ai: "/api/ai",
    },
    providers: ["xai", "groq"],
  });
}
