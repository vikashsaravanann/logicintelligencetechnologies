/**
 * Backfill knowledge_chunks.embedding (768-d) via Groq → xAI.
 *
 * Env:
 *   GROQ_API_KEY (preferred) and/or XAI_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Model: GROQ_EMBEDDING_MODEL=nomic-embed-text-v1_5 (default)
 */

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const providers = [];
if (process.env.GROQ_API_KEY) {
  providers.push({
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/embeddings",
    key: process.env.GROQ_API_KEY,
    model: process.env.GROQ_EMBEDDING_MODEL || "nomic-embed-text-v1_5",
  });
}
const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
if (xaiKey) {
  providers.push({
    name: "xai",
    endpoint: process.env.XAI_EMBEDDING_URL || "https://api.x.ai/v1/embeddings",
    key: xaiKey,
    model: process.env.XAI_EMBEDDING_MODEL || "grok-embedding-small",
  });
}
if (!providers.length) {
  console.error("Need GROQ_API_KEY or XAI_API_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function embed(text) {
  let lastErr = "";
  for (const p of providers) {
    const res = await fetch(p.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${p.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: p.model, input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      lastErr = `${p.name} ${res.status}: ${(await res.text()).slice(0, 200)}`;
      continue;
    }
    const json = await res.json();
    const emb = json.data?.[0]?.embedding;
    if (!emb?.length) {
      lastErr = `${p.name}: empty embedding`;
      continue;
    }
    if (emb.length !== 768) {
      lastErr = `${p.name}: got ${emb.length}-d, need 768`;
      continue;
    }
    return { emb, provider: p.name, model: p.model };
  }
  throw new Error(lastErr || "All embed providers failed");
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
  if (row.embedding) {
    skipped += 1;
    continue;
  }
  try {
    const { emb, provider, model } = await embed(`${row.title}\n\n${row.content}`);
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
    console.log("embedded", row.title, `(${provider}/${model})`);
    await new Promise((r) => setTimeout(r, 200));
  } catch (e) {
    console.error("Embed failed:", e.message || e);
    process.exitCode = 1;
    break;
  }
}

console.log(`Done. updated=${updated} skipped=${skipped} total=${rows.length}`);

// Note: When GROQ is blocked (CDN 1010) from CI sandboxes, run from your laptop:
//   export $(grep -v '^#' .env.local | xargs) && npm run backfill:embeddings
// Prefer Groq nomic-embed-text-v1_5 (768-d) for production quality.
