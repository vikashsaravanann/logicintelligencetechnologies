import { industriesData, type IndustryData } from '@/data/industriesData';

export type { IndustryData };

export const INDUSTRIES_CONFIG: IndustryData[] = industriesData;

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return INDUSTRIES_CONFIG.find((ind) => ind.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return INDUSTRIES_CONFIG.map((ind) => ind.slug);
}

export const INDUSTRY_CATEGORIES = [
  'Healthcare & MedTech',
  'Education & EdTech',
  'Real Estate & Construction',
  'Hospitality & Tourism',
  'Retail & E-Commerce',
  'Manufacturing & Logistics',
] as const;
