# AI Architecture

## Core Stack
- Orchestration: LangChain / LlamaIndex
- Embeddings: OpenAI `text-embedding-3-large`
- Vector Store: Pinecone or Supabase pgvector
- LLMs: GPT-4o for complex reasoning, Claude 3.5 Sonnet for coding and structured extraction, Llama 3 for local privacy-preserving tasks.
- Caching: Redis for semantic caching.