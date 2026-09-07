/**
 * JS wrapper — real backfill is Python (fastembed nomic-embed-text-v1.5).
 * Groq has no embedding models. Xenova/sharp breaks Vercel.
 *
 *   python scripts/backfill-embeddings.py
 */
console.error(
  "Use Python backfill (real nomic 768-d):\n  pip install fastembed\n  python scripts/backfill-embeddings.py"
);
process.exit(1);
