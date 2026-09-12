/**
 * Deterministic Lead Scoring Matrix for Logic Intelligence Technologies
 * Scores leads 0 - 100 based on business criteria and intent indicators.
 */

export interface LeadScoringInput {
  email: string;
  company?: string | null;
  phone?: string | null;
  budget?: string | null;
  serviceInterest?: string | null;
  message?: string | null;
  hasBookedMeeting?: boolean;
  downloadedResourcesCount?: number;
  hasInteractedWithAI?: boolean;
}

export type LeadCategory = 'low_intent' | 'developing' | 'qualified' | 'high_priority';

export interface LeadScoreResult {
  score: number;
  category: LeadCategory;
  breakdown: Record<string, number>;
}

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'mail.com', 'zoho.com'
]);

export function calculateLeadScore(input: LeadScoringInput): LeadScoreResult {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // 1. Corporate / Business Email vs Free Personal Email (+20 pts)
  const domain = input.email?.split('@')[1]?.toLowerCase();
  if (domain && !FREE_EMAIL_DOMAINS.has(domain)) {
    score += 20;
    breakdown['Corporate Domain'] = 20;
  } else {
    score += 5;
    breakdown['Email Provided'] = 5;
  }

  // 2. Verified Company Name (+15 pts)
  if (input.company && input.company.trim().length > 2) {
    score += 15;
    breakdown['Company Profile'] = 15;
  }

  // 3. Direct Phone Number Provided (+15 pts)
  if (input.phone && input.phone.trim().length >= 8) {
    score += 15;
    breakdown['Direct Phone'] = 15;
  }

  // 4. Budget Range Indicated (+15 pts)
  if (input.budget) {
    const b = input.budget.toLowerCase();
    if (b.includes('enterprise') || b.includes('custom') || b.includes('1,50,000') || b.includes('5,00,000') || b.includes('$5000')) {
      score += 20;
      breakdown['Enterprise Budget Tier'] = 20;
    } else {
      score += 10;
      breakdown['Standard Budget Tier'] = 10;
    }
  }

  // 5. Detailed Scope / Message Provided (+15 pts)
  if (input.message && input.message.trim().length > 30) {
    score += 15;
    breakdown['Detailed Project Scope'] = 15;
  }

  // 6. High-Intent Actions
  if (input.hasBookedMeeting) {
    score += 25;
    breakdown['Booked Consultation'] = 25;
  }

  if (input.downloadedResourcesCount && input.downloadedResourcesCount > 0) {
    const pts = Math.min(input.downloadedResourcesCount * 5, 15);
    score += pts;
    breakdown['Resource Engagement'] = pts;
  }

  // Clamp score between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  // Categorize
  let category: LeadCategory = 'low_intent';
  if (score >= 75) {
    category = 'high_priority';
  } else if (score >= 50) {
    category = 'qualified';
  } else if (score >= 25) {
    category = 'developing';
  }

  return { score, category, breakdown };
}
