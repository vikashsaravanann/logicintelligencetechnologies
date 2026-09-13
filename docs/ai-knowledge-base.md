# AI Knowledge Base Configuration

The Logic Intelligence Technologies AI Assistant is grounded in strict organizational facts. It relies on `src/lib/ai/knowledge.ts`.

## Constraints
1. **No Hallucination**: The AI is explicitly instructed *not* to invent information outside the `VERIFIED COMPANY FACTS` block.
2. **Founder Identity**: The AI prompt embeds the `FOUNDER.shortBio` and key projects (e.g., Omni-Apply Autonomous Workflow Engine) directly from `src/config/founder.ts`.
3. **Age & Personal Info**: Transient metrics (like age) are excluded from the static configuration. The AI should rely solely on the provided graduation timeline (2025-2029) or state that the data is not publicly provided if pressed on unverified personal details.
4. **Capabilities**: The AI must represent the company's capabilities exactly as specified in the `companyCapabilities` object in the founder config.

## Updates
Any changes to the founder's bio, tech stack, or corporate projects MUST be made in `src/config/founder.ts`, which automatically updates the RAG baseline context.
