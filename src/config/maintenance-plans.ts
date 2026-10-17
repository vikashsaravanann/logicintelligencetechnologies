/**
 * LOGIC INTELLIGENCE TECHNOLOGIES
 * Authoritative Central Maintenance Plans & Entitlements Catalog
 * 
 * Strict business rules:
 * - 5 Canonical options: FREE_TRIAL, STANDARD, BASIC, PRO, ENTERPRISE
 * - All calculations in integer paise to eliminate floating-point discrepancies.
 * - Standard 18% GST (1800 basis points).
 * - Free Trial: ₹0 subscription + ₹20 one-time refundable verification payment (30 consecutive days).
 * - Standard: ₹999/mo + 18% GST = ₹1,178.82 (117882 paise).
 * - Basic: ₹4,999/mo + 18% GST = ₹5,898.82 (589882 paise). 1 hr/mo enhancement.
 * - Pro: ₹9,999/mo + 18% GST = ₹11,798.82 (1179882 paise). 3 hrs/mo enhancement.
 * - Enterprise: ₹19,999/mo + 18% GST = ₹23,598.82 (2359882 paise). 6 hrs/mo enhancement.
 */

export type PlanIdentifier = 'FREE_TRIAL' | 'STANDARD' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface PlanFeature {
  id: string;
  name: string;
  category: 'support' | 'maintenance' | 'monitoring' | 'security' | 'enhancements' | 'governance';
  freeTrial: boolean | string;
  standard: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
  isPlanned?: boolean;
}

export interface MaintenancePlanDefinition {
  id: PlanIdentifier;
  name: string;
  badge: string;
  planType: 'free_trial' | 'paid';
  basePricePaise: number;
  gstRateBps: number;
  gstAmountPaise: number;
  totalPricePaise: number;
  billingFrequency: 'one_time' | 'monthly';
  durationDays: number;
  refundablePaise: number;
  enhancementHoursMonthly: number;
  slaResponseTime: string;
  supportHours: string;
  shortDescription: string;
  targetAudience: string;
  includedServices: string[];
  serviceLimits: string[];
  plannedFeatures: { title: string; description: string }[];
  ctaButtonText: string;
  popular?: boolean;
}

export const MAINTENANCE_PLANS: Record<PlanIdentifier, MaintenancePlanDefinition> = {
  FREE_TRIAL: {
    id: 'FREE_TRIAL',
    name: 'Free Trial',
    badge: '30-Day Evaluation',
    planType: 'free_trial',
    basePricePaise: 0,
    gstRateBps: 1800,
    gstAmountPaise: 0,
    totalPricePaise: 2000, // ₹20.00 refundable verification payment
    billingFrequency: 'one_time',
    durationDays: 30,
    refundablePaise: 2000,
    enhancementHoursMonthly: 0,
    slaResponseTime: 'Best-Effort (Community & Knowledge Base)',
    supportHours: 'Self-Service Documentation & FAQs',
    shortDescription: '30-Day Free Trial with one-time refundable ₹20 UPI verification payment. No automatic paid conversion or recurring debit.',
    targetAudience: 'Clients evaluating the LIT support workflow before selecting a dedicated monthly care plan.',
    includedServices: [
      '30-Day Free Trial Dashboard Access',
      'Knowledge Base & Engineering Documentation',
      'Self-Service Maintenance FAQs',
      'General Support Enquiry Submission',
      'Introductory Project Health Overview',
      'Guided Ticket Intake Preparation',
      'Option to Compare & Select Paid Plans',
    ],
    serviceLimits: [
      'No dedicated engineering hours',
      'No emergency response guarantees',
      'No custom code modifications',
      'Third-party cloud costs excluded',
    ],
    plannedFeatures: [
      {
        title: 'Personalized Onboarding Walkthrough',
        description: 'Interactive step-by-step tour covering technical documentation and ticket intake.',
      },
      {
        title: 'AI-Assisted Architecture FAQs',
        description: 'Conversational FAQ assistant for rapid resolution of common integration questions.',
      },
      {
        title: 'Automated Introductory Diagnostics',
        description: 'One-click automated baseline health check probe for public endpoints.',
      },
    ],
    ctaButtonText: 'Start Free Trial — Pay ₹20',
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard Care',
    badge: 'Entry-Level Care',
    planType: 'paid',
    basePricePaise: 99900, // ₹999.00
    gstRateBps: 1800,
    gstAmountPaise: 17982, // ₹179.82
    totalPricePaise: 117882, // ₹1,178.82
    billingFrequency: 'monthly',
    durationDays: 30,
    refundablePaise: 0,
    enhancementHoursMonthly: 0,
    slaResponseTime: '< 24 Business Hours',
    supportHours: 'Standard Business Hours (Mon – Fri, 9 AM – 6 PM IST)',
    shortDescription: 'Entry-level paid software maintenance, basic support ticketing, and monthly health summary.',
    targetAudience: 'Informational websites, landing pages, and micro-applications requiring dependable baseline support.',
    includedServices: [
      'Dedicated Client Support Dashboard',
      'Incident Ticketing System (Standard Queue)',
      'Standard Business-Hours Email Support',
      'Monthly Application Health & Uptime Summary',
      'Critical Security Advisory Bulletins',
      'Master Document & Contract Repository Access',
    ],
    serviceLimits: [
      'No included enhancement hours',
      'Non-emergency SLA response targets',
      'Major upgrades require separate RFC quotation',
    ],
    plannedFeatures: [
      {
        title: 'Automated Uptime & Health Alerts',
        description: 'Email notifications upon edge endpoint latency degradation or certificate expiry.',
      },
      {
        title: 'Self-Service Technical Guidance',
        description: 'Guided troubleshooting flowcharts for runtime configuration issues.',
      },
      {
        title: 'Quarterly Maintenance Recommendations',
        description: 'Automated architectural best-practice suggestions based on stack evolution.',
      },
    ],
    ctaButtonText: 'Choose Standard',
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic Care',
    badge: 'Routine Maintenance',
    planType: 'paid',
    basePricePaise: 499900, // ₹4,999.00
    gstRateBps: 1800,
    gstAmountPaise: 89982, // ₹899.82
    totalPricePaise: 589882, // ₹5,898.82
    billingFrequency: 'monthly',
    durationDays: 30,
    refundablePaise: 0,
    enhancementHoursMonthly: 1.0,
    slaResponseTime: '< 12 Business Hours',
    supportHours: 'Business Hours (Mon – Sat, 9 AM – 6 PM IST)',
    shortDescription: 'Routine software maintenance, bug remediation, security review, and 1 minor enhancement hour/month.',
    targetAudience: 'Small businesses and active websites needing routine bug investigation and minor UI/UX adjustments.',
    includedServices: [
      'All Standard Care inclusions',
      'Routine Bug Investigation & Minor Remediation',
      '1 Minor Enhancement Hour / Billing Month',
      'Monthly Website & Application Health Review',
      'Basic Security & Dependency Updates Review',
      'Monthly Maintenance Report & Telemetry Review',
    ],
    serviceLimits: [
      'Unused enhancement hours do not roll over',
      'New large functional modules excluded',
      'Emergency 24/7 hotline excluded',
    ],
    plannedFeatures: [
      {
        title: 'Automated Monthly Website Reports',
        description: 'Comprehensive monthly performance, uptime, and Core Web Vitals executive report.',
      },
      {
        title: 'Scheduled Dependency Review Workflows',
        description: 'Automated vulnerability alerts and npm package health auditing.',
      },
      {
        title: 'Guided Technical SEO Scoring',
        description: 'Automated crawler audit highlighting meta tags, schema markup, and sitemap health.',
      },
    ],
    ctaButtonText: 'Choose Basic',
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Care',
    badge: 'Most Popular',
    planType: 'paid',
    basePricePaise: 999900, // ₹9,999.00
    gstRateBps: 1800,
    gstAmountPaise: 179982, // ₹1,799.82
    totalPricePaise: 1179882, // ₹11,798.82
    billingFrequency: 'monthly',
    durationDays: 30,
    refundablePaise: 0,
    enhancementHoursMonthly: 3.0,
    slaResponseTime: '< 8 Business Hours',
    supportHours: 'Extended Business Hours (Mon – Sat, 8 AM – 8 PM IST)',
    shortDescription: 'Higher-priority support queue, weekly health reviews, error monitoring, and 3 minor enhancement hours/month.',
    targetAudience: 'Growing businesses, e-commerce stores, SaaS applications, and high-traffic platforms.',
    popular: true,
    includedServices: [
      'All Basic Care inclusions',
      'Priority Support Queue & Escalation',
      '3 Minor Enhancement Hours / Billing Month',
      'Weekly Application Health & Error Reviews',
      'Automated Performance Monitoring & Trend Analysis',
      'Monthly Security & Vulnerability Review',
      'Structured Change Request Impact Assessment',
    ],
    serviceLimits: [
      'Unused enhancement hours capped at 3 hrs/mo',
      'Major structural refactors quoted separately',
    ],
    plannedFeatures: [
      {
        title: 'AI-Assisted Incident Diagnosis',
        description: 'Automated log anomaly detection correlating HTTP 5xx errors with recent deployments.',
      },
      {
        title: 'Advanced API Health Dashboard',
        description: 'Live p95 latency heatmaps and webhook delivery success monitors.',
      },
      {
        title: 'Automated Smoke & Regression Probes',
        description: 'Synthetic scheduled test runs verifying checkout and contact form availability.',
      },
    ],
    ctaButtonText: 'Choose Pro',
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Care',
    badge: 'Mission-Critical SLA',
    planType: 'paid',
    basePricePaise: 1999900, // ₹19,999.00
    gstRateBps: 1800,
    gstAmountPaise: 359982, // ₹3,599.82
    totalPricePaise: 2359882, // ₹23,598.82
    billingFrequency: 'monthly',
    durationDays: 30,
    refundablePaise: 0,
    enhancementHoursMonthly: 6.0,
    slaResponseTime: '< 4 Business Hours',
    supportHours: 'Priority Coverage with Designated Technical Lead',
    shortDescription: 'Highest business-hours queue priority, critical incident escalation, architecture reviews, and 6 minor enhancement hours/month.',
    targetAudience: 'Organizations operating complex, multi-service, or revenue-critical production infrastructure.',
    includedServices: [
      'All Pro Care inclusions',
      'Highest Business-Hours Queue Priority',
      '6 Minor Enhancement Hours / Billing Month',
      'Critical Incident Escalation & Response Protocols',
      'Monthly Architecture & Reliability Reviews',
      'Monthly Security Posture & Compliance Report',
      'Monthly Technical Planning & Strategy Consultation',
      'Management-level Operational Governance Summary',
    ],
    serviceLimits: [
      '24/7 staffed on-call bridge requires separate contract',
      'Substantial functional modules require RFC change quotation',
    ],
    plannedFeatures: [
      {
        title: 'Unified Multi-Project Command Center',
        description: 'Single pane of glass monitoring multiple client web platforms and microservices.',
      },
      {
        title: 'Predictive Operational Monitoring',
        description: 'Machine learning trend detection for memory consumption and database connection saturation.',
      },
      {
        title: 'Custom Operational Webhook Integrations',
        description: 'Bi-directional alert routing to client enterprise Slack, PagerDuty, or Microsoft Teams.',
      },
    ],
    ctaButtonText: 'Choose Enterprise',
  },
};

/**
 * Format paise into Indian Rupee currency string
 */
export function formatPaiseToInr(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export const GST_RATE_PERCENT = 18;
export type MaintenancePlanKey = PlanIdentifier;
export const MAINTENANCE_PLANS_LIST = Object.values(MAINTENANCE_PLANS);

/**
 * Authoritative Server-side Price Calculation Engine
 * Recomputes all amounts in integer paise and verifies integrity against catalog.
 */
export function calculatePlanPricing(
  planId: PlanIdentifier,
  billingCycle: 'monthly' | 'annual' = 'monthly'
) {
  const plan = MAINTENANCE_PLANS[planId];
  if (!plan) {
    throw new Error(`Unknown maintenance plan identifier: ${planId}`);
  }

  const multiplier = billingCycle === 'annual' && plan.planType !== 'free_trial' ? 12 : 1;
  const basePricePaise = plan.basePricePaise * multiplier;
  const gstRateBps = plan.gstRateBps;
  const gstAmountPaise = Math.round((basePricePaise * gstRateBps) / 10000);
  const totalPricePaise = plan.planType === 'free_trial' ? plan.refundablePaise : basePricePaise + gstAmountPaise;

  return {
    planId,
    name: plan.name,
    planType: plan.planType,
    billingCycle,
    basePricePaise,
    gstRateBps,
    gstAmountPaise,
    taxPaise: gstAmountPaise,
    totalPricePaise,
    totalPayablePaise: totalPricePaise,
    refundablePaise: plan.refundablePaise,
    isRefundableTrialVerification: plan.planType === 'free_trial',
    formattedBase: formatPaiseToInr(basePricePaise),
    formattedGst: formatPaiseToInr(gstAmountPaise),
    formattedTotal: formatPaiseToInr(totalPricePaise),
    formattedRefundable: formatPaiseToInr(plan.refundablePaise),
    durationDays: plan.durationDays,
    enhancementHoursMonthly: plan.enhancementHoursMonthly,
    slaResponseTime: plan.slaResponseTime,
  };
}

/**
 * Detailed Feature Comparison Matrix
 */
export const MAINTENANCE_FEATURES_MATRIX: PlanFeature[] = [
  {
    id: 'f-dashboard',
    name: 'Client Support Dashboard',
    category: 'support',
    freeTrial: true,
    standard: true,
    basic: true,
    pro: true,
    enterprise: true,
  },
  {
    id: 'f-kb',
    name: 'Knowledge Base & FAQs',
    category: 'support',
    freeTrial: true,
    standard: true,
    basic: true,
    pro: true,
    enterprise: true,
  },
  {
    id: 'f-ticketing',
    name: 'Incident Ticketing System',
    category: 'support',
    freeTrial: 'General Enquiry',
    standard: 'Standard Queue',
    basic: 'Routine Queue',
    pro: 'Priority Queue',
    enterprise: 'Highest Priority',
  },
  {
    id: 'f-sla',
    name: 'Target First-Response Time',
    category: 'support',
    freeTrial: 'Best Effort',
    standard: '< 24 Hours',
    basic: '< 12 Hours',
    pro: '< 8 Hours',
    enterprise: '< 4 Hours',
  },
  {
    id: 'f-enhancement-hours',
    name: 'Included Minor Enhancement Allowance',
    category: 'enhancements',
    freeTrial: false,
    standard: false,
    basic: '1 hour / month',
    pro: '3 hours / month',
    enterprise: '6 hours / month',
  },
  {
    id: 'f-bug-fixes',
    name: 'Bug Remediation in Delivered Code',
    category: 'maintenance',
    freeTrial: false,
    standard: 'Advisory Only',
    basic: 'Routine Minor Fixes',
    pro: 'Comprehensive Investigation',
    enterprise: 'Root-Cause Analysis',
  },
  {
    id: 'f-health-reviews',
    name: 'Health & Error Review Frequency',
    category: 'monitoring',
    freeTrial: false,
    standard: 'Monthly Overview',
    basic: 'Monthly Review',
    pro: 'Weekly Reviews',
    enterprise: 'Continuous / Dedicated',
  },
  {
    id: 'f-security-review',
    name: 'Security & Dependency Auditing',
    category: 'security',
    freeTrial: false,
    standard: 'Critical Bulletins',
    basic: 'Monthly Review',
    pro: 'Monthly Vulnerability Scan',
    enterprise: 'Monthly Architecture Audit',
  },
  {
    id: 'f-designated-lead',
    name: 'Designated Technical Lead Contact',
    category: 'governance',
    freeTrial: false,
    standard: false,
    basic: false,
    pro: false,
    enterprise: true,
  },
  {
    id: 'f-monthly-planning',
    name: 'Monthly Technical Planning Strategy',
    category: 'governance',
    freeTrial: false,
    standard: false,
    basic: false,
    pro: false,
    enterprise: true,
  },
];
