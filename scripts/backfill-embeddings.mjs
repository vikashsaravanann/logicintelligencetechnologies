/**
 * Backfill knowledge_chunks.embedding with REAL 768-d nomic-embed-text-v1.5.
 *
 * Groq has no embedding models (verified). This script uses @xenova/transformers
 * locally (same space as src/lib/ai/nomic-embed.ts).
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FORCE=1  overwrite existing vectors
 */

import { pipeline } from "@xenova/transformers";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const force = process.env.FORCE === "1" || process.argv.includes("--force");

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

console.log("Loading Xenova/nomic-embed-text-v1.5 (quantized)…");
const extractor = await pipeline("feature-extraction", "Xenova/nomic-embed-text-v1.5", {
  quantized: true,
});

async function embedDocument(text) {
  const out = await extractor(`search_document: ${String(text).slice(0, 8000)}`, {
    pooling: "mean",
    normalize: true,
  });
  const emb = Array.from(out.data);
  if (emb.length !== 768) throw new Error(`got ${emb.length}-d, need 768`);
  return emb;
}

const listRes = await fetch(
  `${url}/rest/v1/knowledge_chunks?select=id,title,content,embedding&order=created_at.asc`,
  { headers }
);
if (!listRes.ok) {
  console.error("List failed", await listRes.text());
  process.exit(1);
}
const rows = await listRes.json();
let updated = 0;
let skipped = 0;

for (const row of rows) {
  if (row.embedding && !force) {
    skipped += 1;
    continue;
  }
  try {
    const emb = await embedDocument(`${row.title}\n\n${row.content}`);
    const up = await fetch(`${url}/rest/v1/knowledge_chunks?id=eq.${row.id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        embedding: emb,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!up.ok) {
      console.error("Update failed", row.id, await up.text());
      process.exitCode = 1;
      continue;
    }
    updated += 1;
    console.log("embedded", row.title);
  } catch (e) {
    console.error("Embed failed:", e.message || e);
    process.exitCode = 1;
    break;
  }
}

console.log(`Done. updated=${updated} skipped=${skipped} total=${rows.length}`);
