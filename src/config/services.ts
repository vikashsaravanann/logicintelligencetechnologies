import { servicesData } from '@/data/servicesData';

export interface ServiceProcessStep {
  step: string;
  desc: string;
}

export interface ServiceWhyUs {
  title: string;
  desc: string;
}

export interface ServicePricingTier {
  tier: string;
  price: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceTechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  deployment?: string[];
  tools?: string[];
  [key: string]: string[] | undefined;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  whatWeBuild?: string[];
  techStack?: ServiceTechStack;
  process?: ServiceProcessStep[];
  whyUs?: ServiceWhyUs[];
  pricing?: ServicePricingTier[];
  faqs?: ServiceFaq[];
}

export const SERVICES_CONFIG: ServiceItem[] = servicesData;

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return SERVICES_CONFIG.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return SERVICES_CONFIG.map((s) => s.slug);
}

export const SERVICE_CATEGORIES = [
  { id: 'web-engineering', label: 'Web & System Engineering' },
  { id: 'ai-automation', label: 'AI & Workflow Automation' },
  { id: 'enterprise-solutions', label: 'Enterprise Platform Solutions' },
] as const;
