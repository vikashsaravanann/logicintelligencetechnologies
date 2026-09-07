import "server-only";

/**
 * Real 768-d embeddings (nomic-embed-text-v1.5).
 * Groq has no embedding models; xAI has none on this account.
 * Query and documents MUST share this space (backfill uses the same prefixes).
 */

type Pipe = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array | number[] }>;

let pipe: Pipe | null = null;
let loading: Promise<Pipe> | null = null;

async function getPipe(): Promise<Pipe> {
  if (pipe) return pipe;
  if (!loading) {
    loading = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return (await pipeline(
        "feature-extraction",
        "Xenova/nomic-embed-text-v1.5",
        { quantized: true }
      )) as unknown as Pipe;
    })();
  }
  pipe = await loading;
  return pipe;
}

export async function nomicEmbed(
  text: string,
  kind: "query" | "document"
): Promise<number[] | null> {
  const raw = text.trim();
  if (!raw) return null;
  const prefix = kind === "query" ? "search_query: " : "search_document: ";
  try {
    const extractor = await getPipe();
    const out = await extractor((prefix + raw).slice(0, 8000), {
      pooling: "mean",
      normalize: true,
    });
    const arr = Array.from(out.data);
    return arr.length === 768 ? arr : null;
  } catch (err) {
    console.warn("[nomic-embed] failed", err);
    return null;
  }
}
