import { redis } from './redis';
import crypto from 'crypto';

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ProviderConfig = {
  id: string;
  models: string[];
  apiUrl: string;
  apiKey: string;
};

export type ProviderResult = {
  provider: string;
  model: string;
  content: string;
  raw?: unknown;
};

function buildProviders(): ProviderConfig[] {
  const list: ProviderConfig[] = [];

  // THROUGHPUTS - Primary AI for VoiceShield & Forensic
  if (process.env.THROUGHPUTS_API_KEY) {
    list.push({
      id: "throughputs",
      apiKey: process.env.THROUGHPUTS_API_KEY,
      apiUrl: process.env.THROUGHPUTS_BASE_URL
        ? `${process.env.THROUGHPUTS_BASE_URL.replace(/\/$/, '')}/chat/completions`
        : "https://api.throughputs.in/v1/chat/completions",
      models: [
        process.env.THROUGHPUTS_INFERENCE_MODEL || "throughputs-core-latest",
      ],
    });
  }

  // xAI (Grok) — sole cloud LLM fallback after THROUGHPUTS
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (xaiKey) {
    list.push({
      id: "xai",
      apiKey: xaiKey,
      apiUrl:
        process.env.XAI_API_URL ||
        "https://api.x.ai/v1/chat/completions",
      models: [
        process.env.XAI_MODEL || "grok-3",
        "grok-3-mini",
      ].filter(Boolean),
    });
  }

  // Preference: throughputs -> xai
  list.sort((a, b) => {
    if (a.id === "throughputs") return -1;
    if (b.id === "throughputs") return 1;
    if (a.id === "xai") return -1;
    if (b.id === "xai") return 1;
    return 0;
  });

  return list.filter((p) => Boolean(p.apiKey));
}

function computeExactHash(
  provider: string,
  model: string,
  messages: ChatMessage[],
  options?: unknown
): string {
  const payload = JSON.stringify({ provider, model, messages, options });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function callProvider(
  provider: ProviderConfig,
  messages: ChatMessage[],
  options?: {
    tools?: unknown[];
    temperature?: number;
    max_tokens?: number;
    signal?: AbortSignal;
    cacheTtlSeconds?: number;
  }
): Promise<ProviderResult | null> {
  const temperature = options?.temperature ?? 0.4;
  const max_tokens = Math.min(1200, Math.max(64, Math.floor(options?.max_tokens ?? 800)));

  for (const model of provider.models.slice(0, 1)) {
    let cacheKey = "";
    if (redis) {
      cacheKey = `ai_exact:${computeExactHash(provider.id, model, messages, { temperature, max_tokens, tools: options?.tools })}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return typeof cached === "string" ? (JSON.parse(cached) as ProviderResult) : (cached as unknown as ProviderResult);
        }
      } catch (e) {
        console.warn("Redis cache read failed:", e);
      }
    }

    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens,
      };
      if (options?.tools?.length) {
        body.tools = options.tools;
        body.tool_choice = "auto";
      }

      const res = await fetch(provider.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: options?.signal ?? AbortSignal.timeout(20000),
      });

      if (!res.ok && res.status === 400 && options?.tools?.length) {
        const errText = await res.text();
        if (/tool|function/i.test(errText)) {
          const res2 = await fetch(provider.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens,
            }),
            signal: options?.signal ?? AbortSignal.timeout(20000),
          });
          if (!res2.ok) continue;
          const data2 = await res2.json();
          const msg2 = data2.choices?.[0]?.message;
          const content2 =
            msg2?.content || msg2?.reasoning_content || "";
          if (content2 || msg2?.tool_calls?.length) {
            const result = {
              provider: provider.id,
              model,
              content: typeof content2 === "string" ? content2 : "",
              raw: data2,
            };
            if (redis && cacheKey) {
               await redis.setex(cacheKey, options?.cacheTtlSeconds || 3600, JSON.stringify(result));
            }
            return result;
          }
          continue;
        }
        continue;
      }

      if (!res.ok) {
        console.warn(`[${provider.id}] ${model} HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      const content = msg?.content || msg?.reasoning_content || "";
      if (content || msg?.tool_calls?.length) {
        const result = {
          provider: provider.id,
          model,
          content: typeof content === "string" ? content : "",
          raw: data,
        };
        if (redis && cacheKey) {
           await redis.setex(cacheKey, options?.cacheTtlSeconds || 3600, JSON.stringify(result));
        }
        return result;
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return null;
      console.warn(`[${provider.id}] ${model} error`, err);
    }
  }
  return null;
}

/**
 * One configured provider/model per completion; no paid provider races.
 */
export async function completeWithProviders(
  messages: ChatMessage[],
  options?: {
    tools?: unknown[];
    temperature?: number;
    max_tokens?: number;
    cacheTtlSeconds?: number;
  }
): Promise<ProviderResult> {
  const providers = buildProviders().slice(0, 1);
  if (!providers.length) {
    return { provider: "none", model: "none", content: "" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);

  try {
    const tasks = providers.map((p) =>
      callProvider(p, messages, { ...options, signal: controller.signal })
    );

    const result = await new Promise<ProviderResult | null>((resolve) => {
      let remaining = tasks.length;
      let settled = false;
      for (const t of tasks) {
        t.then((r) => {
          if (settled) return;
          if (r && (r.content || (r.raw as { choices?: unknown })?.choices)) {
            settled = true;
            controller.abort();
            resolve(r);
            return;
          }
          remaining -= 1;
          if (remaining === 0) resolve(null);
        }).catch(() => {
          remaining -= 1;
          if (remaining === 0 && !settled) resolve(null);
        });
      }
    });

    if (result) return result;
    return { provider: "none", model: "none", content: "" };
  } finally {
    clearTimeout(timeout);
  }
}

export function hasAnyProvider(): boolean {
  return buildProviders().length > 0;
}

/**
 * Stream from the first available provider.
 */
export async function* streamWithProviders(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): AsyncGenerator<{ chunk: string; provider: string; model: string }, ProviderResult, void> {
  const providers = buildProviders().slice(0, 1);
  if (!providers.length) {
    yield { chunk: "", provider: "none", model: "none" };
    return { provider: "none", model: "none", content: "" };
  }

  let lastError: unknown = null;
  for (const provider of providers) {
    for (const model of provider.models.slice(0, 1)) {
      try {
        const res = await fetch(provider.apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options?.temperature ?? 0.35,
            max_tokens: Math.min(1200, Math.max(64, Math.floor(options?.max_tokens ?? 900))),
            stream: true,
          }),
          signal: AbortSignal.timeout(22000),
        });
        if (!res.ok || !res.body) {
          lastError = new Error(`${provider.id} ${model} HTTP ${res.status}`);
          continue;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta =
                json.choices?.[0]?.delta?.content ||
                json.choices?.[0]?.text ||
                "";
              if (delta && full.length + delta.length <= 12000) {
                full += delta;
                yield { chunk: delta, provider: provider.id, model };
              } else if (delta) {
                await reader.cancel();
                return { provider: provider.id, model, content: full };
              }
            } catch {
              /* ignore partial JSON */
            }
          }
        }

        if (full.trim()) {
          return { provider: provider.id, model, content: full };
        }
      } catch (err) {
        lastError = err;
        console.warn(`[stream ${provider.id}]`, err);
      }
    }
  }

  console.warn("[streamWithProviders] all failed", lastError);
  return { provider: "none", model: "none", content: "" };
}
