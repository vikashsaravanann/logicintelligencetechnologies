/**
 * Dual LLM providers: Groq + xAI (Grok), raced in parallel.
 * First non-empty successful completion wins; the other is cancelled via AbortSignal where possible.
 */

export type ChatMessage = {
  role: string;
  content?: string;
  [key: string]: unknown;
};

export type ProviderResult = {
  provider: "groq" | "xai" | "none";
  model: string;
  content: string;
  raw?: unknown;
};

type ProviderConfig = {
  id: "groq" | "xai";
  apiKey: string;
  apiUrl: string;
  models: string[];
};

function buildProviders(): ProviderConfig[] {
  const list: ProviderConfig[] = [];

  const groqKey =
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY || // legacy misname sometimes used for Groq
    "";
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";

  // Prefer explicit GROQ_API_KEY for Groq; XAI_API_KEY for xAI
  if (process.env.GROQ_API_KEY || process.env.GROQ_API_URL?.includes("groq.com")) {
    list.push({
      id: "groq",
      apiKey: process.env.GROQ_API_KEY || groqKey,
      apiUrl:
        process.env.GROQ_API_URL ||
        "https://api.groq.com/openai/v1/chat/completions",
      models: [
        process.env.GROQ_MODEL || "",
        "llama-3.3-70b-versatile",
        "openai/gpt-oss-120b",
        "llama-3.1-8b-instant",
      ].filter(Boolean),
    });
  } else if (groqKey && !process.env.XAI_API_KEY) {
    // Only one key labeled GROK — try Groq if URL says groq
    if ((process.env.GROQ_API_URL || "").includes("groq")) {
      list.push({
        id: "groq",
        apiKey: groqKey,
        apiUrl: process.env.GROQ_API_URL!,
        models: [process.env.GROQ_MODEL || "llama-3.3-70b-versatile"],
      });
    }
  }

  if (process.env.XAI_API_KEY || process.env.XAI_API_URL) {
    list.push({
      id: "xai",
      apiKey: process.env.XAI_API_KEY || xaiKey,
      apiUrl:
        process.env.XAI_API_URL || "https://api.x.ai/v1/chat/completions",
      models: [
        process.env.XAI_MODEL || process.env.GROK_MODEL || "",
        "grok-3",
        "grok-3-mini",
      ].filter(Boolean),
    });
  } else if (process.env.GROK_API_KEY && (process.env.GROQ_API_URL || "").includes("x.ai")) {
    list.push({
      id: "xai",
      apiKey: process.env.GROK_API_KEY,
      apiUrl: process.env.GROQ_API_URL || "https://api.x.ai/v1/chat/completions",
      models: ["grok-3-mini"],
    });
  }

  // If GROQ_API_KEY set but not added yet
  if (process.env.GROQ_API_KEY && !list.some((p) => p.id === "groq")) {
    list.push({
      id: "groq",
      apiKey: process.env.GROQ_API_KEY,
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      models: [
        process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
      ],
    });
  }

  // Prefer xAI first when both present
  list.sort((a, b) => (a.id === "xai" ? -1 : b.id === "xai" ? 1 : 0));
  return list.filter((p) => Boolean(p.apiKey));
}

async function callProvider(
  provider: ProviderConfig,
  messages: ChatMessage[],
  options?: {
    tools?: unknown[];
    temperature?: number;
    max_tokens?: number;
    signal?: AbortSignal;
  }
): Promise<ProviderResult | null> {
  const temperature = options?.temperature ?? 0.4;
  const max_tokens = options?.max_tokens ?? 800;

  for (const model of provider.models) {
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

      // Retry without tools if unsupported
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
            return {
              provider: provider.id,
              model,
              content: typeof content2 === "string" ? content2 : "",
              raw: data2,
            };
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
        return {
          provider: provider.id,
          model,
          content: typeof content === "string" ? content : "",
          raw: data,
        };
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return null;
      console.warn(`[${provider.id}] ${model} error`, err);
    }
  }
  return null;
}

/**
 * Race Groq and xAI in parallel. First successful text/tool result wins.
 */
export async function completeWithProviders(
  messages: ChatMessage[],
  options?: {
    tools?: unknown[];
    temperature?: number;
    max_tokens?: number;
  }
): Promise<ProviderResult> {
  const providers = buildProviders();
  if (!providers.length) {
    return { provider: "none", model: "none", content: "" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);

  try {
    const tasks = providers.map((p) =>
      callProvider(p, messages, { ...options, signal: controller.signal })
    );

    // Promise.any-like: first non-null success
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
 * Stream from the first available provider (xAI preferred, then Groq).
 * Yields plain text chunks via async generator.
 */
export async function* streamWithProviders(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): AsyncGenerator<{ chunk: string; provider: string; model: string }, ProviderResult, void> {
  const providers = buildProviders();
  if (!providers.length) {
    yield { chunk: "", provider: "none", model: "none" };
    return { provider: "none", model: "none", content: "" };
  }

  let lastError: unknown = null;
  for (const provider of providers) {
    for (const model of provider.models) {
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
            max_tokens: options?.max_tokens ?? 900,
            stream: true,
          }),
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
              if (delta) {
                full += delta;
                yield { chunk: delta, provider: provider.id, model };
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
