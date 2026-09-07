import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { COMPANY } from "@/config/company";
import { packagesData } from "@/data/packagesData";
import { logAgentRun } from "@/lib/agent-eval/logger";
import { estimateCostUsd } from "@/lib/agent-eval/cost";
import { estimateFaithfulness } from "@/lib/agent-eval/faithfulness";
import type { FailureClass } from "@/lib/agent-eval/types";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";
import { completeWithProviders, hasAnyProvider, streamWithProviders } from "@/lib/ai/providers";
import {
  AI_TOOLS,
  dispatchToolCall,
  loadUserMemory,
} from "@/lib/ai/tools";
import { env } from "@/config/env";

const DEFAULT_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

function getAiConfig() {
  const apiKey =
    process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY;
  const apiUrl =
    process.env.GROQ_API_URL || process.env.XAI_API_URL || DEFAULT_GROQ_URL;
  let model = process.env.GROQ_MODEL || process.env.GROK_MODEL || DEFAULT_MODEL;
  if (apiUrl.includes("x.ai")) model = "grok-beta";
  else if (apiUrl.includes("openrouter.ai"))
    model = "qwen/qwen-2.5-72b-instruct";
  return { apiKey, apiUrl, model };
}

function getLocalFallbackReply(userText: string): string {
  const lower = (userText || "").toLowerCase();
  if (/price|cost|package|plan|pricing|quote|launch pack|pro pack|enterprise/i.test(lower)) {
    return (
      `Packages at ${COMPANY.displayName}:\n\n` +
      packagesData.map((p) => `- **${p.title} (${p.price})**: ${p.subtitle}`).join("\n") +
      `\n\nWhatsApp **${COMPANY.phone}** or **${COMPANY.email}**.`
    );
  }
  if (/demo|free/i.test(lower)) {
    return `Yes — free demo before you pay when scope fits. Start at ${COMPANY.websiteUrl}/free-demo or WhatsApp ${COMPANY.phone}.`;
  }
  return `I'm LOGIC AI from ${COMPANY.displayName}. Ask about packages, services, or scoping — or WhatsApp **${COMPANY.phone}**.`;
}

function buildSystemPrompt(knowledge: string, memoryContext?: string): string {
  return `You are LOGIC AI for ${COMPANY.displayName} (${COMPANY.tagline}). You are both a company expert and a capable general-purpose assistant: answer any visitor question accurately and professionally, including topics unrelated to the company.

You can write production code when asked (Next.js, React, Tailwind, Python) using Markdown code blocks.
You answer company questions strictly from verified facts below — never contradict PRICE-CONSTRAINED facts.

${knowledge}

${memoryContext || ""}

GUIDELINES:
1. Helpful, confident, professional.
2. Never invent prices, rankings, or impossible timelines.
3. Use tools: capture_lead (name+email), lookup_lead_status, save_memory (logged-in only).
4. For custom enterprise work, offer WhatsApp (${COMPANY.phone}) or email (${COMPANY.email}).
`;
}

function cleanedContent(rawText: string): string {
  return (rawText || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

function newRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function resolveUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const started = Date.now();
  const runId = newRunId();
  let userText = "";
  let modelName: string | null = null;
  let failureClass: FailureClass = "none";
  let usedFallback = false;
  let success = false;
  let reply = "";
  let tokensIn = 0;
  let tokensOut = 0;
  let toolCalls = 0;
  let steps = 1;

  try {
    const body = await request.json();
    const { text, message, file, max_tokens, chat_id, history, stream } = body;
    userText =
      (typeof text === "string" && text) ||
      (typeof message === "string" && message) ||
      "";
    const wantStream = stream === true || stream === "true";
    const { apiKey, apiUrl, model } = getAiConfig();
    modelName = model;

    const userId = await resolveUserId();
    const memoryContext = userId ? await loadUserMemory(userId) : "";
    const toolCtx = {
      source: "ai_page" as const,
      userId,
      chatId: typeof chat_id === "string" ? chat_id : null,
    };

    let injectedContext = "";
    if (file && file.type === "application/pdf") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfModule = require("pdf-parse");
        const pdfParse = pdfModule?.default || pdfModule;
        const base64Data = (file.data as string).replace(
          /^data:application\/pdf;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        const parsed = await pdfParse(buffer);
        const extractedText = parsed.text?.trim();
        injectedContext = extractedText
          ? `\n\nUploaded PDF Content:\n"""\n${extractedText.slice(0, 8000)}\n"""`
          : `\n\n[PDF empty or image-only.]`;
      } catch {
        injectedContext = `\n\n[PDF could not be parsed.]`;
      }
    } else if (file && file.data) {
      injectedContext = `\n\nUploaded File (${file.name || "file"}):\n"""\n${(file.data as string).slice(0, 8000)}\n"""`;
    }

    const { block: knowledgeBlock } = await buildQueryGroundedKnowledge(userText);

    const historyMsgs = Array.isArray(history)
      ? history
          .filter(
            (m: { role?: string; content?: string }) =>
              (m.role === "user" || m.role === "assistant") && m.content
          )
          .slice(-12)
          .map((m: { role: string; content: string }) => ({
            role: m.role,
            content: String(m.content).slice(0, 4000),
          }))
      : [];

    const conversation: Array<Record<string, unknown>> = [
      {
        role: "system",
        content: `${buildSystemPrompt(knowledgeBlock, memoryContext)}\n${injectedContext}`,
      },
      ...historyMsgs,
      { role: "user", content: userText },
    ];

    // Streaming path (no tools — fastest UX for /ai page)
    if (wantStream && hasAnyProvider()) {
      const encoder = new TextEncoder();
      let full = "";
      let providerName = "none";
      let streamModel = modelName || "unknown";

      const readable = new ReadableStream({
        async start(controller) {
          const send = (obj: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };
          try {
            send({ type: "meta", provider: "starting" });
            const gen = streamWithProviders(conversation as any, {
              temperature: 0.35,
              max_tokens: typeof max_tokens === "number" ? max_tokens : 900,
            });
            for await (const part of gen) {
              if (part.chunk) {
                full += part.chunk;
                providerName = part.provider;
                streamModel = part.model;
                send({ type: "token", content: part.chunk });
              }
            }
            if (!full.trim()) {
              full = getLocalFallbackReply(userText);
              usedFallback = true;
            }
            send({
              type: "done",
              content: full,
              provider: providerName,
              model: streamModel,
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            console.error("[api/ai stream]", err);
            full = getLocalFallbackReply(userText);
            send({ type: "done", content: full, provider: "fallback", model: "local" });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Parallel Groq + xAI when configured
    if (hasAnyProvider()) {
      try {
        const dual = await completeWithProviders(conversation as any, {
          tools: AI_TOOLS as any,
          temperature: 0.3,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
        });
        if (dual.content) {
          const cleaned = cleanedContent(dual.content);
          if (cleaned) {
            reply = cleaned;
            success = true;
            modelName = dual.model;
            const latency_ms = Date.now() - started;
            await logAgentRun({
              run_id: runId,
              agent_role: "logic-ai",
              success: true,
              steps: 1,
              tool_calls: 0,
              tokens_in: 0,
              tokens_out: 0,
              latency_ms,
              cost_usd: 0,
              failure_class: "none",
              faithfulness: estimateFaithfulness(userText, reply),
              used_fallback: false,
              model: modelName,
              meta: { provider: dual.provider },
            });
            return NextResponse.json({
              success: true,
              generated_text: reply,
              reply,
              run_id: runId,
              provider: dual.provider,
              model: dual.model,
            });
          }
        }
      } catch (e) {
        console.warn("[ai] dual provider race failed", e);
      }
    }

    if (!apiKey) {
      usedFallback = true;
      failureClass = "dependency";
      reply = getLocalFallbackReply(userText);
      success = Boolean(reply);
      await logAgentRun({
        run_id: runId,
        agent_role: "logic-ai",
        success,
        steps,
        tool_calls: 0,
        tokens_in: 0,
        tokens_out: 0,
        latency_ms: Date.now() - started,
        cost_usd: 0,
        failure_class: failureClass,
        faithfulness: estimateFaithfulness(userText, reply),
        used_fallback: true,
        model: "local-fallback",
        meta: { reason: "missing_api_key" },
      });
      return NextResponse.json({
        success: true,
        generated_text: reply,
        reply,
        run_id: runId,
      });
    }

    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: conversation,
        tools: AI_TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (response.status === 400) {
      const errText = await response.text();
      if (/tool|function/i.test(errText)) {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: conversation,
            temperature: 0.3,
            max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
          }),
          signal: AbortSignal.timeout(30000),
        });
      } else {
        console.error("AI model error:", 400, errText);
      }
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("AI model error:", response.status, errText);
      usedFallback = true;
      failureClass = response.status >= 500 ? "infra" : "model";
      reply = getLocalFallbackReply(userText);
      success = Boolean(reply);
      await logAgentRun({
        run_id: runId,
        agent_role: "logic-ai",
        success,
        steps,
        tool_calls: 0,
        tokens_in: 0,
        tokens_out: 0,
        latency_ms: Date.now() - started,
        cost_usd: 0,
        failure_class: failureClass,
        faithfulness: estimateFaithfulness(userText, reply),
        used_fallback: true,
        model: modelName,
        meta: { http_status: response.status },
      });
      return NextResponse.json({
        success: true,
        generated_text: reply,
        reply,
        run_id: runId,
      });
    }

    let data = await response.json();
    const usage = data.usage || {};
    tokensIn = Number(usage.prompt_tokens || usage.input_tokens || 0);
    tokensOut = Number(usage.completion_tokens || usage.output_tokens || 0);
    let assistantMessage = data.choices?.[0]?.message;

    for (let i = 0; i < 3 && assistantMessage?.tool_calls?.length; i++) {
      toolCalls += assistantMessage.tool_calls.length;
      steps = 1 + toolCalls;
      const toolMessages: Array<Record<string, unknown>> = [];
      for (const toolCall of assistantMessage.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          args = {};
        }
        const toolResult = await dispatchToolCall(
          toolCall.function.name,
          args,
          toolCtx
        );
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(toolResult),
        });
      }

      const followUp = [...conversation, assistantMessage, ...toolMessages];
      const followupResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: followUp,
          tools: AI_TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!followupResponse.ok) break;
      data = await followupResponse.json();
      assistantMessage = data.choices?.[0]?.message;
      conversation.push(...toolMessages);
    }

    const rawContent =
      assistantMessage?.content || assistantMessage?.reasoning_content || "";
    const cleaned = cleanedContent(rawContent);

    if (cleaned) {
      reply = cleaned;
      success = true;
    } else {
      usedFallback = true;
      failureClass = "model";
      reply = getLocalFallbackReply(userText);
      success = Boolean(reply);
    }

    const latency_ms = Date.now() - started;
    const faithfulness = estimateFaithfulness(userText, reply);

    await logAgentRun({
      run_id: runId,
      agent_role: "logic-ai",
      success,
      steps,
      tool_calls: toolCalls,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      latency_ms,
      cost_usd: estimateCostUsd(tokensIn, tokensOut, modelName),
      failure_class: failureClass,
      faithfulness,
      used_fallback: usedFallback,
      model: modelName,
      meta: { has_file: Boolean(file), tool_calls: toolCalls },
    });

    return NextResponse.json({
      success: true,
      generated_text: reply,
      reply,
      run_id: runId,
      metrics: {
        latency_ms,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        faithfulness,
        used_fallback: usedFallback,
        tool_calls: toolCalls,
      },
    });
  } catch (error: unknown) {
    console.error("Error connecting to AI:", error);
    usedFallback = true;
    const err = error as { name?: string };
    failureClass =
      err?.name === "TimeoutError" || err?.name === "AbortError"
        ? "timeout"
        : "unknown";
    reply = getLocalFallbackReply(userText);
    success = Boolean(reply);
    await logAgentRun({
      run_id: runId,
      agent_role: "logic-ai",
      success,
      steps: 1,
      tool_calls: 0,
      tokens_in: 0,
      tokens_out: 0,
      latency_ms: Date.now() - started,
      cost_usd: 0,
      failure_class: failureClass,
      faithfulness: estimateFaithfulness(userText, reply),
      used_fallback: true,
      model: modelName,
      meta: { error_name: err?.name || "Error" },
    });
    return NextResponse.json({
      success: true,
      generated_text: reply,
      reply,
      run_id: runId,
    });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
