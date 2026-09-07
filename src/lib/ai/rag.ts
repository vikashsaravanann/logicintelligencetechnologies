import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
import { portfolioProjects } from "@/data/portfolioData";
import { COMPANY } from "@/config/company";

export type KnowledgeChunk = {
  id?: string;
  source: string;
  source_id: string | null;
  title: string;
  content: string;
  is_price_constrained: boolean;
  metadata?: Record<string, unknown>;
  rank?: number;
};

/** Hard price/timeline facts — always injected so the model cannot invent numbers. */
export function constrainedPriceFacts(): string {
  const lines = packagesData.map(
    (p) =>
      `- ${p.title}: ${p.price} | payment: ${(p.paymentTerms || []).join("; ") || "see package"} | best for: ${p.bestFor}`
  );
  return `CONSTRAINED PRICE FACTS (never invent or alter these numbers):
${lines.join("\n")}
- Contact: ${COMPANY.phone} | ${COMPANY.email}
- Free demo: ${COMPANY.websiteUrl}/free-demo`;
}

/** Build seed chunks from live site data (used by seed script + offline fallback). */
export function buildSeedChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const p of packagesData) {
    const inclusions = (p.inclusions || []).map((i) => `${i.title}: ${i.desc}`).join(" | ");
    chunks.push({
      source: "packages",
      source_id: p.slug,
      title: p.title,
      content: `${p.title} (${p.price}). ${p.subtitle}. Best for: ${p.bestFor}. Includes: ${inclusions}. Payment: ${(p.paymentTerms || []).join("; ")}.`,
      is_price_constrained: true,
      metadata: { price: p.price, slug: p.slug },
    });
  }

  for (const s of servicesData as Array<{
    id?: string;
    slug?: string;
    title: string;
    subtitle?: string;
    description?: string;
  }>) {
    chunks.push({
      source: "services",
      source_id: s.slug || s.id || s.title,
      title: s.title,
      content: `${s.title}. ${s.subtitle || ""}. ${(s.description || "").replace(/\s+/g, " ").slice(0, 1200)}`,
      is_price_constrained: false,
      metadata: { slug: s.slug || s.id },
    });
  }

  for (const p of portfolioProjects) {
    chunks.push({
      source: "portfolio",
      source_id: p.slug,
      title: p.title,
      content: `${p.title} (${p.category}). ${p.description}. ${p.problem || ""} ${p.solution || ""} Results: ${p.results || ""}`,
      is_price_constrained: false,
      metadata: { slug: p.slug, category: p.category },
    });
  }

  // Policy / process constrained facts
  const policies: KnowledgeChunk[] = [
    {
      source: "policy",
      source_id: "payment-terms",
      title: "Payment terms",
      content:
        "Launch and Pro packages typically use 50% advance and 50% on delivery. Enterprise uses milestone-based payments. Invoices follow the signed SOW.",
      is_price_constrained: true,
    },
    {
      source: "policy",
      source_id: "free-demo",
      title: "Free demo policy",
      content:
        "Logic Intelligence Technologies offers a free demo when scope fits — clients can see direction before payment. Start at /free-demo or WhatsApp the team.",
      is_price_constrained: false,
    },
    {
      source: "policy",
      source_id: "support-windows",
      title: "Support windows",
      content:
        "Digital Launch Pack includes about 1 month free support. Business Pro Pack about 3 months. Enterprise about 6 months. After free support, paid maintenance is available.",
      is_price_constrained: true,
    },
    {
      source: "policy",
      source_id: "refund",
      title: "Refund policy summary",
      content:
        "Initial deposits are typically non-refundable once discovery or design has started. Approved milestone payments are non-refundable. Mid-development cancellation is billed for work completed. Post-deployment: no refunds; warranty covers bug fixes per SOW.",
      is_price_constrained: true,
    },
    {
      source: "policy",
      source_id: "contact",
      title: "Contact",
      content: `WhatsApp/Phone ${COMPANY.phone}. Email ${COMPANY.email}. Website ${COMPANY.websiteUrl}. Location: Coimbatore, Tamil Nadu, India. Response target within 24 hours.`,
      is_price_constrained: false,
    },
  ];
  chunks.push(...policies);
  return chunks;
}

/** Lexical fallback when DB/RPC unavailable. */
function lexicalRetrieve(query: string, limit: number): KnowledgeChunk[] {
  const q = query.toLowerCase();
  const tokens = q.split(/[^a-z0-9+]+/).filter((t) => t.length > 2);
  const scored = buildSeedChunks().map((c) => {
    const hay = `${c.title} ${c.content}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    if (c.is_price_constrained && /(price|cost|pack|₹|rs\.?|budget)/i.test(query)) {
      score += 2;
    }
    return { ...c, rank: score };
  });
  return scored
    .filter((c) => (c.rank || 0) > 0)
    .sort((a, b) => (b.rank || 0) - (a.rank || 0))
    .slice(0, limit);
}

/**
 * Hybrid retrieve: Supabase match_knowledge_chunks (FTS + optional vector).
 * Falls back to in-process lexical ranking if RPC fails.
 */
export async function retrieveKnowledge(
  query: string,
  options?: { limit?: number; embedding?: number[] | null }
): Promise<KnowledgeChunk[]> {
  const limit = options?.limit ?? 8;
  const q = (query || "").trim();
  if (!q) return [];

  try {
    const { data, error } = await supabaseAdmin.rpc("match_knowledge_chunks", {
      query_text: q,
      match_count: limit,
      query_embedding: options?.embedding ?? null,
    });

    if (error) {
      console.warn("[rag] RPC failed, lexical fallback:", error.message);
      return lexicalRetrieve(q, limit);
    }

    const rows = (data || []) as KnowledgeChunk[];
    if (!rows.length) {
      return lexicalRetrieve(q, limit);
    }
    return rows;
  } catch (err) {
    console.warn("[rag] retrieve exception, lexical fallback:", err);
    return lexicalRetrieve(q, limit);
  }
}

/** Format retrieved chunks for system prompt injection. */
export function formatRetrievedContext(chunks: KnowledgeChunk[]): string {
  if (!chunks.length) return "";
  const body = chunks
    .map(
      (c, i) =>
        `[${i + 1}] (${c.source}${c.is_price_constrained ? ", PRICE-CONSTRAINED" : ""}) ${c.title}\n${c.content}`
    )
    .join("\n\n");
  return `RETRIEVED KNOWLEDGE (prefer these passages; do not contradict PRICE-CONSTRAINED facts):\n${body}`;
}

/**
 * Dense embedding for hybrid RAG.
 * Priority: xAI/Grok embeddings → Groq nomic-embed-text-v1_5 (768-d). OpenAI removed.
 * Schema is vector(768). FTS still works when all providers fail.
 */
type EmbedProvider = {
  name: string;
  url: string;
  key: string;
  model: string;
};

function embedProviders(): EmbedProvider[] {
  const list: EmbedProvider[] = [];
  // Prefer xAI/Grok embeddings when configured
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (xaiKey) {
    list.push({
      name: "xai",
      url: process.env.XAI_EMBEDDING_URL || "https://api.x.ai/v1/embeddings",
      key: xaiKey,
      model: process.env.XAI_EMBEDDING_MODEL || "grok-embedding-small",
    });
  }
  if (process.env.GROQ_API_KEY) {
    list.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/embeddings",
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_EMBEDDING_MODEL || "nomic-embed-text-v1_5",
    });
  }
  return list;
}

export async function embedQuery(text: string): Promise<number[] | null> {
  const input = text.slice(0, 8000);
  for (const p of embedProviders()) {
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${p.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: p.model, input }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`[embed] ${p.name} HTTP ${res.status}`);
        continue;
      }
      const json = (await res.json()) as {
        data?: Array<{ embedding: number[] }>;
      };
      const emb = json.data?.[0]?.embedding;
      if (emb?.length) {
        // Accept 768; if provider returns other dims, skip to next
        if (emb.length === 768 || process.env.EMBEDDING_FLEX_DIMS === "true") {
          return emb;
        }
        console.warn(
          `[embed] ${p.name} returned ${emb.length}-d vector; expected 768`
        );
      }
    } catch (err) {
      console.warn(`[embed] ${p.name} failed`, err);
    }
  }
  return null;
}

/** Upsert seed chunks (no embeddings). Safe to re-run. */
export async function seedKnowledgeChunks(): Promise<{ upserted: number; error?: string }> {
  const chunks = buildSeedChunks();
  const rows = chunks.map((c) => ({
    source: c.source,
    source_id: c.source_id,
    title: c.title,
    content: c.content,
    is_price_constrained: c.is_price_constrained,
    metadata: c.metadata || {},
    updated_at: new Date().toISOString(),
  }));

  // Delete + insert by source for idempotent seed
  const { error: delErr } = await supabaseAdmin
    .from("knowledge_chunks")
    .delete()
    .in("source", ["packages", "services", "portfolio", "policy"]);
  if (delErr) {
    return { upserted: 0, error: delErr.message };
  }

  const { error } = await supabaseAdmin.from("knowledge_chunks").insert(rows);
  if (error) return { upserted: 0, error: error.message };
  return { upserted: rows.length };
}
