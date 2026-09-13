import { PDF_RESOURCES, type PdfResource } from './pdfs';

export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
}

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'pdf' | 'tool' | 'guide' | 'checklist';
  category: string;
  href: string;
  badge?: string;
  isDownloadable?: boolean;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'corporate',
    name: 'Corporate & Capability',
    description: 'Executive overviews, capability statements, and corporate documentation.',
  },
  {
    id: 'technical-guides',
    name: 'Technical Guides & Checklists',
    description: 'In-depth engineering frameworks, checklists, and implementation standards.',
  },
  {
    id: 'ai-frameworks',
    name: 'AI & Automation Frameworks',
    description: 'Readiness assessments, workflow automation blueprints, and architecture plans.',
  },
  {
    id: 'contracts-templates',
    name: 'Contracts & Project Templates',
    description: 'Statement of work templates, project scopes, and roadmap blueprints.',
  },
];

export const RESOURCES_CONFIG: ResourceItem[] = [
  ...PDF_RESOURCES.map((pdf): ResourceItem => ({
    id: pdf.id,
    slug: pdf.slug,
    title: pdf.title,
    description: pdf.description,
    type: 'pdf',
    category: pdf.category,
    href: `/resources/${pdf.slug}`,
    badge: 'Official PDF',
    isDownloadable: true,
  })),
  {
    id: 'resource-website-checklist',
    slug: 'website-checklist',
    title: 'Interactive 50-Point Production Website Launch Checklist',
    description: 'Live interactive audit tool evaluating security, performance, SEO, mobile UX, and accessibility before going live.',
    type: 'tool',
    category: 'Technical Guide',
    href: '/checklist',
    badge: 'Interactive Tool',
    isDownloadable: false,
  },
  {
    id: 'resource-ai-assistant',
    slug: 'ai-assistant',
    title: 'Logic AI Knowledge Workspace',
    description: 'Private RAG knowledge workspace grounded strictly in Logic Intelligence Technologies capabilities, architectures, and pricing.',
    type: 'tool',
    category: 'AI & Automation',
    href: '/ai',
    badge: 'AI Workspace',
    isDownloadable: false,
  },
  {
    id: 'resource-free-demo',
    slug: 'free-demo',
    title: 'Architectural Blueprint & Free Working Demo',
    description: 'Request a non-committal technical prototype or layout direction before entering contract commitments.',
    type: 'guide',
    category: 'Corporate',
    href: '/free-demo',
    badge: 'Client Service',
    isDownloadable: false,
  },
];

export function getResourceBySlug(slug: string): ResourceItem | undefined {
  return RESOURCES_CONFIG.find((r) => r.slug === slug);
}

export function getAllResourceSlugs(): string[] {
  return RESOURCES_CONFIG.map((r) => r.slug);
}
