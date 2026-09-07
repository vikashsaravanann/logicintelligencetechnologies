#!/usr/bin/env python3
"""Backfill knowledge_chunks.embedding with nomic-embed-text-v1.5 (768-d).

Groq does not offer embedding models. Run:
  pip install fastembed
  export NEXT_PUBLIC_SUPABASE_URL=...
  export SUPABASE_SERVICE_ROLE_KEY=...
  python scripts/backfill-embeddings.py
"""
import json
import os
import urllib.request
from datetime import datetime, timezone

from fastembed import TextEmbedding

url = (os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL") or "").rstrip("/")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise SystemExit("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
    "Prefer": "return=minimal",
}

req = urllib.request.Request(
    f"{url}/rest/v1/knowledge_chunks?select=id,title,content&order=created_at.asc",
    headers=headers,
)
with urllib.request.urlopen(req, timeout=30) as r:
    rows = json.load(r)

model = TextEmbedding(model_name="nomic-ai/nomic-embed-text-v1.5-Q")
texts = ["search_document: " + (row.get("title") or "") + "\n\n" + (row.get("content") or "") for row in rows]
embs = list(model.embed(texts))
now = datetime.now(timezone.utc).isoformat()
updated = 0
for row, emb in zip(rows, embs):
    vec = [float(x) for x in emb]
    if len(vec) != 768:
        raise SystemExit(f"bad dim {len(vec)}")
    body = json.dumps({"embedding": vec, "updated_at": now}).encode()
    req = urllib.request.Request(
        f"{url}/rest/v1/knowledge_chunks?id=eq.{row['id']}",
        data=body,
        method="PATCH",
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()
    updated += 1
    print("embedded", row.get("title"))
print(f"Done. updated={updated} total={len(rows)}")
