import { NextResponse } from "next/server";
import { COMPANY } from "@/config/company";
import { packagesData } from "@/data/packagesData";
import { logAgentRun } from "@/lib/agent-eval/logger";
import { estimateFaithfulness } from "@/lib/agent-eval/faithfulness";
import type { FailureClass } from "@/lib/agent-eval/types";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";
import { completeWithProviders, hasAnyProvider, streamWithProviders } from "@/lib/ai/providers";
import {
  AI_TOOLS,
  dispatchToolCall,
  loadUserMemory,
} from "@/lib/ai/tools";
import { guardAiRequest, readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";
import { z } from "zod";

const aiSchema = z.object({
  text: z.string().max(4000).optional(),
  message: z.string().max(4000).optional(),
  file: z.object({ name: z.string().max(255).optional(), type: z.string().max(100), data: z.string().max(48000) }).optional(),
  max_tokens: z.number().int().min(64).max(1200).optional(),
  chat_id: z.string().uuid().nullable().optional(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(12).optional(),
  stream: z.union([z.boolean(), z.literal("true"), z.literal("false")]).optional(),
  mode: z.enum(["company", "general"]).optional(),
}).refine(data => Boolean(data.text?.trim() || data.message?.trim()), "Message required");

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

function buildSystemPrompt(knowledge: string, memoryContext?: string, mode: "company" | "general" = "company"): string {
  const modeBlock =
    mode === "general"
      ? "MODE: GENERAL. Answer like a capable general-purpose assistant. Use company facts and PRICE-CONSTRAINED numbers only when the visitor asks about LIT, packages, or services."
      : "MODE: COMPANY. Prefer verified company facts and PRICE-CONSTRAINED numbers. Still answer general questions accurately if asked.";
  return `You are LOGIC AI for ${COMPANY.displayName} (${COMPANY.tagline}). You are both a company expert and a capable general-purpose assistant: answer any visitor question accurately and professionally, including topics unrelated to the company.\n\n${modeBlock}\n\nYou can write production code when asked (Next.js, React, Tailwind, Python) using Markdown code blocks.\nYou answer company questions strictly from verified facts below — never contradict PRICE-CONSTRAINED facts.\n\n${knowledge}\n\n${memoryContext || ""}\n\nGUIDELINES:\n1. Helpful, confident, professional.\n2. Never invent prices, rankings, or impossible timelines.\n3. Use tools: capture_lead (name+email), lookup_lead_status, save_memory (logged-in only).\n4. For custom enterprise work, offer WhatsApp (${COMPANY.phone}) or email (${COMPANY.email}).\n`;
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

export async function POST(request: Request) {
  const started = Date.now();
  const runId = newRunId();
  let userText = "";
  let modelName: string | null = null;
  let failureClass: FailureClass = "none";
  let usedFallback = false;
  let success = false;
  let reply = "";
  let toolCalls = 0;
  let steps = 1;

  try {
    const auth = await guardAiRequest();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const parsedBody = aiSchema.safeParse(await readBoundedAiJson(request));
    if (!parsedBody.success) return NextResponse.json({ success: false, error: "Invalid AI request" }, { status: 400 });
    const body = parsedBody.data;
    const { text, message, file, max_tokens, history, stream, mode: rawMode } = body;
    const mode: "company" | "general" = rawMode === "general" ? "general" : "company";
    userText =
      (typeof text === "string" && text) ||
      (typeof message === "string" && message) ||
      "";
    const wantStream = stream === true || stream === "true";
    modelName = null;

    const userId = auth.user.id;
    const memoryContext = userId ? await loadUserMemory(userId) : "";
    const toolCtx = {
      source: "ai_page" as const,
      userId,
      chatId: null,
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

    const grounded = await buildQueryGroundedKnowledge(userText);
    const skipCatalog =
      mode === "general" && !/lit|logic intelligence|package|price|₹|demo/i.test(userText);
    const knowledgeBlock = skipCatalog
      ? "(General mode — skip catalog unless asked.)"
      : grounded.block;
    const citations = (grounded.chunks || [])
      .slice(0, 4)
      .map((c) => c.title)
      .filter(Boolean);
    const faithfulnessHint = skipCatalog ? "general" : "catalog";

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
        content: `${buildSystemPrompt(knowledgeBlock, memoryContext, mode)}\n${injectedContext}`,
      },
      ...historyMsgs,
      { role: "user", content: userText },
    ];

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
            send({ type: "meta", provider: "starting", citations, mode, faithfulnessHint });
            const needsTools = /@|my name|i am |i'm |talk to a human|ticket|call me/i.test(userText);
            if (needsTools) {
              try {
                const dual = await completeWithProviders(conversation as any, {
                  tools: AI_TOOLS as any,
                  temperature: 0.2,
                  max_tokens: 500,
                });
                const msg = (dual.raw as { choices?: Array<{ message?: { tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> } }> })?.choices?.[0]?.message;
                if (msg?.tool_calls?.length) {
                  const toolMessages: Array<Record<string, unknown>> = [];
                  for (const toolCall of msg.tool_calls.slice(0, 2)) {
                    let args: Record<string, unknown> = {};
                    try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch { args = {}; }
                    const toolResult = await dispatchToolCall(toolCall.function.name, args, toolCtx);
                    toolCalls += 1;
                    send({ type: "tool", name: toolCall.function.name, ok: Boolean((toolResult as { ok?: boolean }).ok) });
                    toolMessages.push({
                      role: "tool",
                      tool_call_id: toolCall.id,
                      name: toolCall.function.name,
                      content: JSON.stringify(toolResult),
                    });
                  }
                  conversation.push(msg as Record<string, unknown>, ...toolMessages);
                }
              } catch (toolErr) {
                console.warn("[api/ai stream tools]", toolErr);
              }
            }
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
              citations,
              faithfulnessHint,
              run_id: runId,
            });
            await logAgentRun({
              run_id: runId,
              agent_role: "logic-ai",
              success: Boolean(full.trim()),
              steps: 1 + toolCalls,
              tool_calls: toolCalls,
              tokens_in: 0,
              tokens_out: 0,
              latency_ms: Date.now() - started,
              cost_usd: 0,
              failure_class: usedFallback ? "model" : "none",
              used_fallback: usedFallback,
              model: streamModel,
              meta: { stream: true, mode, citations },
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

    if (hasAnyProvider()) {
      try {
        const dual = await completeWithProviders(conversation as any, {
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
              meta: { provider: dual.provider, mode },
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
        console.warn("[ai] provider failed", e);
      }
      const fallback = getLocalFallbackReply(userText);
      return NextResponse.json({ success: true, generated_text: fallback, reply: fallback, run_id: runId });
    }

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
      meta: { reason: "no_cloud_provider" },
    });
    return NextResponse.json({
      success: true,
      generated_text: reply,
      reply,
      run_id: runId,
    });
  } catch (error: unknown) {
    if (error instanceof InvalidAiRequest) return NextResponse.json({ error: error.message }, { status: 400 });
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
