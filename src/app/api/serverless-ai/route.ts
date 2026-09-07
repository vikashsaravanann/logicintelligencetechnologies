import { NextResponse } from "next/server";
import { z } from "zod";
import { runServerlessAI } from "@/lib/ai/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Serverless function wall time (Vercel). */
export const maxDuration = 30;

const bodySchema = z.object({
  message: z.string().min(1).max(8000).optional(),
  /** OpenAI-style messages array (portfolio chatbot). */
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().optional(),
      })
    )
    .max(40)
    .optional(),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .max(40)
    .optional(),
  systemExtra: z.string().max(12000).optional(),
  skipRag: z.boolean().optional(),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().min(64).max(2048).optional(),
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
    const json = await req.json();
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
      error: result.error,
      // OpenAI-compatible shape for older clients
      choices: [
        {
          message: { role: "assistant", content: result.reply },
        },
      ],
    });
  } catch (err) {
    console.error("[api/serverless-ai]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
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
