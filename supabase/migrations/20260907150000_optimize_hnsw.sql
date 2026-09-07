-- Optimized HNSW for knowledge_chunks.embedding (vector 768, cosine)
-- Applied in production: m=16, ef_construction=64, partial (embedding IS NOT NULL)

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

DROP INDEX IF EXISTS public.idx_knowledge_chunks_embedding_hnsw;
DROP INDEX IF EXISTS public.idx_knowledge_chunks_embedding;
DROP INDEX IF EXISTS public.knowledge_chunks_embedding_hnsw;

CREATE INDEX idx_knowledge_chunks_embedding_hnsw
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts
  ON public.knowledge_chunks
  USING gin (fts);

ANALYZE public.knowledge_chunks;
