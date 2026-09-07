import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Query embedding in the nomic-embed-text-v1.5 space.
 * Documents were backfilled with real 768-d nomic vectors.
 * Groq has no embedding models; Xenova/sharp is unsafe on Vercel.
 * Query vector = L2-normalized weighted mean of stored document vectors
 * (weights = lexical overlap). Same space, no hashes.
 */

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw) && raw.length === 768) return raw.map(Number);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 768) return parsed.map(Number);
    } catch {
      return null;
    }
  }
  return null;
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

export async function nomicEmbed(
  text: string,
  kind: "query" | "document"
): Promise<number[] | null> {
  if (kind !== "query") return null;
  const q = tokens(text);
  if (q.size === 0) return null;

  const { data, error } = await supabaseAdmin
    .from("knowledge_chunks")
    .select("title, content, embedding");
  if (error || !data?.length) return null;

  const acc = new Array<number>(768).fill(0);
  let wsum = 0;
  for (const row of data) {
    const emb = parseEmbedding(row.embedding);
    if (!emb) continue;
    const w = overlap(q, tokens(`${row.title || ""} ${row.content || ""}`));
    if (w <= 0) continue;
    for (let i = 0; i < 768; i += 1) acc[i] += w * emb[i];
    wsum += w;
  }
  if (wsum === 0) return null;
  for (let i = 0; i < 768; i += 1) acc[i] /= wsum;
  let norm = 0;
  for (let i = 0; i < 768; i += 1) norm += acc[i] * acc[i];
  norm = Math.sqrt(norm) || 1;
  return acc.map((x) => x / norm);
}
