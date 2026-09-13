import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
import { portfolioProjects } from "@/data/portfolioData";
import { LEAD_QUALIFICATION_GUIDANCE } from "@/lib/ai/tools";
import {
  constrainedPriceFacts,
  formatRetrievedContext,
  retrieveKnowledge,
  embedQuery,
  type KnowledgeChunk,
} from "@/lib/ai/rag";

/** Full catalog summary — always available as baseline (small corpus). */
export function buildCompanyKnowledgeBlock(): string {
  const packagesSummary = packagesData
    .map((p) => {
      const inclusions = (p.inclusions || [])
        .slice(0, 8)
        .map((i) => i.title)
        .join("; ");
      return `- ${p.title} (${p.price}): ${p.subtitle}. Best for: ${p.bestFor}. Includes: ${inclusions}. Payment: ${(p.paymentTerms || []).join(" / ") || "see package page"}.`;
    })
    .join("\n");

  const servicesSummary = servicesData
    .map((s: { title: string; subtitle?: string; description?: string }) => {
      const desc = (s.description || s.subtitle || "").replace(/\s+/g, " ").slice(0, 220);
      return `- ${s.title}: ${desc}`;
    })
    .join("\n");

  const portfolioSummary = portfolioProjects
    .map((p) => {
      const metrics = (p.metrics || [])
        .map((m) => `${m.label}=${m.value}`)
        .join(", ");
      return `- ${p.title} (${p.category}): ${p.description}${metrics ? ` | Metrics: ${metrics}` : ""}`;
    })
    .join("\n");

  return `VERIFIED COMPANY FACTS (do not invent outside this block):

${constrainedPriceFacts()}

PACKAGES:
${packagesSummary}

SERVICES:
${servicesSummary}

PORTFOLIO:
${portfolioSummary}

CONTACT:
- Email: ${COMPANY.email}
- WhatsApp / Phone: ${COMPANY.phone}
- Website: ${COMPANY.websiteUrl}
- Free demo: ${COMPANY.websiteUrl}/free-demo
- Contact form: ${COMPANY.websiteUrl}/contact
- Location: Coimbatore, Tamil Nadu, India
- Founder: ${FOUNDER.name} (${FOUNDER.title})

FOUNDER & EXPERTISE:
- ${FOUNDER.shortBio}
- Key Project: ${FOUNDER.projects[0].name} - ${FOUNDER.projects[0].description}

PAYMENT & PROCESS (summary):
- Launch & Pro packs: typically 50% advance, 50% on delivery
- Enterprise: milestone-based
- Free demo available before payment when scope fits
- Free support window depends on package (1 / 3 / 6 months)

GENERAL KNOWLEDGE & SCOPE:
- You are a capable general-purpose assistant as well as the company expert for Logic Intelligence Technologies.
- For non-company questions, give accurate, balanced, professional answers.
- Do not refuse general questions or force every reply back to company sales.
- Never invent or alter CONSTRAINED PRICE FACTS.

${LEAD_QUALIFICATION_GUIDANCE}
`;
}

/**
 * Hybrid RAG-augmented system knowledge for a specific user query.
 * Always includes constrained price facts + retrieved passages.
 */
export async function buildQueryGroundedKnowledge(
  userQuery: string
): Promise<{ block: string; chunks: KnowledgeChunk[] }> {
  const baseline = buildCompanyKnowledgeBlock();
  if (!userQuery?.trim()) {
    return { block: baseline, chunks: [] };
  }

  const embedding = await embedQuery(userQuery);
  const chunks = await retrieveKnowledge(userQuery, {
    limit: 8,
    embedding,
  });
  const retrieved = formatRetrievedContext(chunks);
  const block = retrieved ? `${baseline}\n\n${retrieved}` : baseline;
  return { block, chunks };
}
