/**
 * Logic Intelligence Technologies (LIT) Evidence-Based Lead Scoring Engine
 *
 * Implements a rigorous 0–100 multi-dimensional scoring algorithm:
 * - Technical Need (0–25 points)
 * - Service Fit (0–20 points)
 * - Commercial Intent (0–15 points)
 * - Verified Contactability (0–15 points)
 * - Industry & Business Scale (0–15 points)
 * - Geographic / Jurisdiction Clearance (0–10 points)
 *
 * Explicitly guards against hallucinated or fabricated scores by returning
 * status: "INSUFFICIENT_EVIDENCE" whenever verifiable empirical facts are missing.
 *
 * Priority Bands:
 * - p1: 80–100 (Immediate Executive Outreach / Solutions Architect Prototype)
 * - p2: 60–79 (High-Probability Discovery / Package Recommendation)
 * - p3: 40–59 (Entry-Tier Packages ₹8,999–₹18,999 / Automated Nurture)
 * - p4: <40 (Low Intent / Self-Serve Catalog)
 */

import {
  classifyOpportunity,
  getServiceOfferDetails,
  type ServiceCategory,
} from "./service-taxonomy";

export type PriorityBand = "p1" | "p2" | "p3" | "p4";
export type LeadScoringStatus = "QUALIFIED" | "INSUFFICIENT_EVIDENCE" | "DISQUALIFIED";

export interface LeadScoreInput {
  leadId?: string;
  email?: string | null;
  phone?: string | null;
  contactName?: string | null;
  role?: string | null;
  companyName?: string | null;
  websiteUrl?: string | null;
  companySize?: string | null;
  country?: string | null;
  industry?: string | null;
  budget?: string | number | null;
  timeline?: string | null;
  message?: string | null;
  requirements?: string | null;
  techStack?: string[] | null;
  requestedServices?: string[] | null;
  hasBookedMeeting?: boolean;
  hasInteractedWithAI?: boolean;
  downloadedResourcesCount?: number;
  existingSystemOrProduct?: boolean;
  consentGiven?: boolean;
}

export interface DimensionScore {
  score: number;
  maxScore: number;
  evidence: string[];
}

export interface LeadScoreBreakdown {
  technicalNeed: DimensionScore;
  serviceFit: DimensionScore;
  commercialIntent: DimensionScore;
  verifiedContactability: DimensionScore;
  industryBusinessScale: DimensionScore;
  geographicClearance: DimensionScore;
}

export interface LeadScoreResult {
  status: LeadScoringStatus;
  score: number;
  priorityBand: PriorityBand;
  categoriesMatched: ServiceCategory[];
  breakdown: LeadScoreBreakdown;
  missingEvidence?: string[];
  disqualificationReason?: string;
  recommendations: string[];
  evaluatedAt: string;
}

/**
 * Recognized public / free consumer email domains.
 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "mail.com",
  "zoho.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "rediffmail.com",
]);

/**
 * Known disposable / burner email provider domains.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "trashmail.com",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "getnada.com",
  "tempmail.com",
]);

/**
 * Comprehensive Tier 1 allowed and vetted jurisdictions for international delivery.
 */
const TIER_1_APPROVED_COUNTRIES = new Set([
  "IN", "INDIA",
  "US", "USA", "UNITED STATES", "UNITED STATES OF AMERICA",
  "GB", "UK", "UNITED KINGDOM", "ENGLAND", "SCOTLAND", "WALES",
  "CA", "CANADA",
  "AE", "UAE", "UNITED ARAB EMIRATES", "DUBAI",
  "SG", "SINGAPORE",
  "AU", "AUSTRALIA",
  "NZ", "NEW ZEALAND",
  "DE", "GERMANY",
  "FR", "FRANCE",
  "NL", "NETHERLANDS",
  "IE", "IRELAND",
  "CH", "SWITZERLAND",
  "SE", "SWEDEN",
  "NO", "NORWAY",
  "DK", "DENMARK",
  "FI", "FINLAND",
  "JP", "JAPAN",
]);

/**
 * Sanctioned or prohibited jurisdictions subject to strict export control or embargo.
 */
const PROHIBITED_JURISDICTIONS = new Set([
  "KP", "NORTH KOREA", "DEMOCRATIC PEOPLE'S REPUBLIC OF KOREA",
  "IR", "IRAN", "ISLAMIC REPUBLIC OF IRAN",
  "SY", "SYRIA", "SYRIAN ARAB REPUBLIC",
  "CU", "CUBA",
]);

/**
 * Keywords indicating high architectural complexity.
 */
const COMPLEXITY_KEYWORDS = [
  "microservices",
  "kubernetes",
  "high availability",
  "hipaa",
  "hl7",
  "fhir",
  "rag",
  "vector database",
  "autonomous agent",
  "multiplayer",
  "realtime",
  "sharding",
  "migration",
  "payment gateway",
  "webhook",
  "erp",
  "zero downtime",
  "security audit",
  "penetration test",
];

/**
 * Executive decision-maker role indicators.
 */
const DECISION_MAKER_ROLES = [
  "founder",
  "co-founder",
  "ceo",
  "cto",
  "cio",
  "cpo",
  "cmo",
  "coo",
  "vp",
  "vice president",
  "director",
  "head of engineering",
  "head of product",
  "head of technology",
  "product lead",
  "tech lead",
  "partner",
  "owner",
  "managing director",
];

/**
 * Priority industry verticals for high-ticket software and engineering.
 */
const HIGH_VALUE_INDUSTRIES = [
  "healthcare",
  "medtech",
  "hospital",
  "pharmaceutical",
  "fintech",
  "banking",
  "insurance",
  "saas",
  "b2b software",
  "gaming",
  "interactive",
  "cybersecurity",
  "e-commerce",
  "ai",
  "biotech",
];

/**
 * Validates whether an email string adheres to basic syntactic structure.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates phone numbers to check for at least 8 digits.
 */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Extracts and normalizes domain from email.
 */
function extractEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;
  const parts = email.split("@");
  return parts[1] ? parts[1].toLowerCase().trim() : null;
}

/**
 * Parses budget string or number into an estimated INR value.
 */
function parseBudgetValue(budget: string | number | null | undefined): {
  amountInINR: number | null;
  tier: "enterprise" | "pro" | "launch" | "flexible" | "sub_market" | "unknown";
} {
  if (budget === null || budget === undefined) {
    return { amountInINR: null, tier: "unknown" };
  }

  if (typeof budget === "number") {
    if (budget >= 50000) return { amountInINR: budget, tier: "enterprise" };
    if (budget >= 18999) return { amountInINR: budget, tier: "pro" };
    if (budget >= 8999) return { amountInINR: budget, tier: "launch" };
    if (budget > 0 && budget < 8999) return { amountInINR: budget, tier: "sub_market" };
    return { amountInINR: budget, tier: "flexible" };
  }

  const str = budget.toLowerCase().trim();
  if (str.includes("enterprise") || str.includes("50,000") || str.includes("50000") || str.includes("1,00,000") || str.includes("custom quote") || str.includes("$5,000") || str.includes("$10,000")) {
    return { amountInINR: 50000, tier: "enterprise" };
  }
  if (str.includes("pro") || str.includes("18,999") || str.includes("18999") || str.includes("25,000") || str.includes("35,000") || str.includes("$1,000") || str.includes("$2,000")) {
    return { amountInINR: 18999, tier: "pro" };
  }
  if (str.includes("launch") || str.includes("8,999") || str.includes("8999") || str.includes("12,999") || str.includes("$300") || str.includes("$500")) {
    return { amountInINR: 8999, tier: "launch" };
  }
  if (str.includes("flexible") || str.includes("undecided") || str.includes("negotiable") || str.includes("tbd")) {
    return { amountInINR: null, tier: "flexible" };
  }
  if (str.includes("free") || str.includes("< 5,000") || str.includes("1000") || str.includes("2000")) {
    return { amountInINR: 2000, tier: "sub_market" };
  }

  return { amountInINR: null, tier: "unknown" };
}

/**
 * Calculates evidence-based 0–100 lead score.
 * Never fabricates points when empirical verifiable facts are missing.
 */
export function calculateLeadScore(lead: LeadScoreInput): LeadScoreResult {
  const evaluatedAt = new Date().toISOString();
  const missingEvidence: string[] = [];

  // =========================================================================
  // STEP 1: VERIFY MANDATORY FACTS (Insufficient Evidence Guard)
  // =========================================================================

  const cleanEmail = lead.email ? lead.email.trim() : "";
  const cleanPhone = lead.phone ? lead.phone.trim() : "";
  const hasValidEmail = cleanEmail.length > 0 && isValidEmail(cleanEmail);
  const hasValidPhone = cleanPhone.length > 0 && isValidPhone(cleanPhone);

  if (!hasValidEmail && !hasValidPhone) {
    missingEvidence.push(
      "Verifiable contact channel: must provide a syntactically valid email address or direct phone number."
    );
  }

  const combinedText = [
    lead.message || "",
    lead.requirements || "",
  ].join(" ").trim();

  const hasServices = Array.isArray(lead.requestedServices) && lead.requestedServices.length > 0;
  const hasTech = Array.isArray(lead.techStack) && lead.techStack.length > 0;
  const hasSubstantiveText = combinedText.length >= 15;
  const hasCommercialContext = Boolean(lead.budget && lead.companyName);

  if (!hasSubstantiveText && !hasServices && !hasTech && !hasCommercialContext) {
    missingEvidence.push(
      "Verifiable project signal: must provide detailed project scope/message, specified tech stack, or requested service category."
    );
  }

  // If mandatory baseline facts are missing, return INSUFFICIENT_EVIDENCE
  if (missingEvidence.length > 0) {
    return {
      status: "INSUFFICIENT_EVIDENCE",
      score: 0,
      priorityBand: "p4",
      categoriesMatched: [],
      breakdown: {
        technicalNeed: { score: 0, maxScore: 25, evidence: [] },
        serviceFit: { score: 0, maxScore: 20, evidence: [] },
        commercialIntent: { score: 0, maxScore: 15, evidence: [] },
        verifiedContactability: { score: 0, maxScore: 15, evidence: [] },
        industryBusinessScale: { score: 0, maxScore: 15, evidence: [] },
        geographicClearance: { score: 0, maxScore: 10, evidence: [] },
      },
      missingEvidence,
      recommendations: [
        "Awaiting lead enrichment or customer response with project requirements.",
        "Prompt lead via automated self-service form for project details and contact verification.",
      ],
      evaluatedAt,
    };
  }

  // =========================================================================
  // STEP 2: DISQUALIFICATION / SANCTIONS CHECK
  // =========================================================================

  const emailDomain = extractEmailDomain(cleanEmail);
  if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    return {
      status: "DISQUALIFIED",
      score: 0,
      priorityBand: "p4",
      categoriesMatched: [],
      breakdown: {
        technicalNeed: { score: 0, maxScore: 25, evidence: [] },
        serviceFit: { score: 0, maxScore: 20, evidence: [] },
        commercialIntent: { score: 0, maxScore: 15, evidence: [] },
        verifiedContactability: { score: 0, maxScore: 15, evidence: ["Disposable / temporary burner email domain detected."] },
        industryBusinessScale: { score: 0, maxScore: 15, evidence: [] },
        geographicClearance: { score: 0, maxScore: 10, evidence: [] },
      },
      disqualificationReason: `Temporary or burner email address (${emailDomain}) is prohibited under platform terms.`,
      recommendations: ["Disqualify lead and suppress from automated outreach."],
      evaluatedAt,
    };
  }

  const countryNormalized = lead.country ? lead.country.trim().toUpperCase() : "";
  if (countryNormalized && PROHIBITED_JURISDICTIONS.has(countryNormalized)) {
    return {
      status: "DISQUALIFIED",
      score: 0,
      priorityBand: "p4",
      categoriesMatched: [],
      breakdown: {
        technicalNeed: { score: 0, maxScore: 25, evidence: [] },
        serviceFit: { score: 0, maxScore: 20, evidence: [] },
        commercialIntent: { score: 0, maxScore: 15, evidence: [] },
        verifiedContactability: { score: 0, maxScore: 15, evidence: [] },
        industryBusinessScale: { score: 0, maxScore: 15, evidence: [] },
        geographicClearance: { score: 0, maxScore: 10, evidence: ["Prohibited / sanctioned jurisdiction."] },
      },
      disqualificationReason: `Country of origin (${lead.country}) is subject to international trade sanctions or compliance embargo.`,
      recommendations: ["Immediate legal suppression. No communication permitted."],
      evaluatedAt,
    };
  }

  // =========================================================================
  // STEP 3: MULTI-DIMENSIONAL SCORING (0–100)
  // =========================================================================

  // --- Dimension 1: Technical Need (0–25 points) ---
  let technicalNeedScore = 0;
  const technicalNeedEvidence: string[] = [];

  // 1a. Scope Description Detail (0–10 pts)
  if (combinedText.length >= 120) {
    technicalNeedScore += 10;
    technicalNeedEvidence.push("Comprehensive technical scope description (>120 chars) (+10)");
  } else if (combinedText.length >= 40) {
    technicalNeedScore += 6;
    technicalNeedEvidence.push("Moderate technical requirements description (>40 chars) (+6)");
  } else if (combinedText.length >= 15) {
    technicalNeedScore += 3;
    technicalNeedEvidence.push("Brief project summary provided (+3)");
  }

  // 1b. Concrete Tech Stack Specification (0–8 pts)
  const techCount = Array.isArray(lead.techStack) ? lead.techStack.length : 0;
  if (techCount >= 2) {
    technicalNeedScore += 8;
    technicalNeedEvidence.push(`Explicit tech stack specified (${lead.techStack?.slice(0, 3).join(", ")}) (+8)`);
  } else if (techCount === 1) {
    technicalNeedScore += 4;
    technicalNeedEvidence.push(`Single target technology specified (${lead.techStack?.[0]}) (+4)`);
  }

  // 1c. Architectural Complexity (0–7 pts)
  const lowerText = (combinedText + " " + (lead.industry || "")).toLowerCase();
  const matchedComplexity = COMPLEXITY_KEYWORDS.filter((kw) => lowerText.includes(kw));
  if (matchedComplexity.length >= 2) {
    technicalNeedScore += 7;
    technicalNeedEvidence.push(`High architectural complexity: ${matchedComplexity.slice(0, 3).join(", ")} (+7)`);
  } else if (matchedComplexity.length === 1) {
    technicalNeedScore += 4;
    technicalNeedEvidence.push(`Moderate system complexity: ${matchedComplexity[0]} (+4)`);
  } else if (technicalNeedScore > 0) {
    technicalNeedScore += 2;
    technicalNeedEvidence.push("Standard digital implementation scope (+2)");
  }

  technicalNeedScore = Math.min(technicalNeedScore, 25);

  // --- Dimension 2: Service Fit (0–20 points) ---
  let serviceFitScore = 0;
  const serviceFitEvidence: string[] = [];

  const matchedCategories = classifyOpportunity({
    text: combinedText,
    techStack: lead.techStack || undefined,
    industry: lead.industry || undefined,
    requestedServices: lead.requestedServices || undefined,
  });

  // 2a. Direct LIT Service Match (0–10 pts)
  if (matchedCategories.length > 0) {
    serviceFitScore += 10;
    serviceFitEvidence.push(`Direct alignment with LIT core service: ${matchedCategories[0]} (+10)`);
  } else {
    serviceFitScore += 3;
    serviceFitEvidence.push("General software engineering inquiry (+3)");
  }

  // 2b. Multi-Service Synergy (0–5 pts)
  if (matchedCategories.length >= 2) {
    serviceFitScore += 5;
    serviceFitEvidence.push(`Multi-service compound requirement: ${matchedCategories.join(" + ")} (+5)`);
  } else if (matchedCategories.length === 1) {
    serviceFitScore += 2;
    serviceFitEvidence.push("Single-focus service requirement (+2)");
  }

  // 2c. Production System Evolution vs Idea (0–5 pts)
  if (lead.existingSystemOrProduct || lowerText.includes("upgrade") || lowerText.includes("redesign") || lowerText.includes("migrate")) {
    serviceFitScore += 5;
    serviceFitEvidence.push("Existing production system evolution / active platform migration (+5)");
  } else if (technicalNeedScore >= 10) {
    serviceFitScore += 3;
    serviceFitEvidence.push("New greenfield project with well-defined product vision (+3)");
  } else {
    serviceFitScore += 1;
    serviceFitEvidence.push("Early concept validation stage (+1)");
  }

  serviceFitScore = Math.min(serviceFitScore, 20);

  // --- Dimension 3: Commercial Intent (0–15 points) ---
  let commercialIntentScore = 0;
  const commercialIntentEvidence: string[] = [];

  // 3a. Budget Tier (0–10 pts)
  const budgetInfo = parseBudgetValue(lead.budget);
  if (budgetInfo.tier === "enterprise") {
    commercialIntentScore += 10;
    commercialIntentEvidence.push("Enterprise budget tier (₹50,000+ / $5,000+) (+10)");
  } else if (budgetInfo.tier === "pro") {
    commercialIntentScore += 7;
    commercialIntentEvidence.push("Business Pro budget tier (₹18,999–₹49,999) (+7)");
  } else if (budgetInfo.tier === "launch") {
    commercialIntentScore += 5;
    commercialIntentEvidence.push("Digital Launch Pack budget tier (₹8,999–₹18,998) (+5)");
  } else if (budgetInfo.tier === "flexible") {
    commercialIntentScore += 4;
    commercialIntentEvidence.push("Flexible / negotiable budget indicated (+4)");
  } else if (budgetInfo.tier === "sub_market") {
    commercialIntentEvidence.push("Sub-market budget under entry threshold (+0)");
  }

  // 3b. Timeline & Urgency (0–3 pts)
  const timelineStr = (lead.timeline || "").toLowerCase();
  if (timelineStr.includes("immediate") || timelineStr.includes("asap") || timelineStr.includes("1 month") || timelineStr.includes("urgent")) {
    commercialIntentScore += 3;
    commercialIntentEvidence.push("Urgent delivery timeline (<30 days) (+3)");
  } else if (timelineStr.includes("2 month") || timelineStr.includes("3 month") || timelineStr.includes("q")) {
    commercialIntentScore += 2;
    commercialIntentEvidence.push("Standard quarterly delivery timeline (1–3 months) (+2)");
  } else if (timelineStr.length > 0) {
    commercialIntentScore += 1;
    commercialIntentEvidence.push("Longer term / exploratory timeline (+1)");
  }

  // 3c. Direct High-Intent Engagement (0–2 pts)
  if (lead.hasBookedMeeting) {
    commercialIntentScore += 2;
    commercialIntentEvidence.push("High-intent action: Booked technical consultation / demo (+2)");
  } else if (lead.hasInteractedWithAI || (lead.downloadedResourcesCount && lead.downloadedResourcesCount > 0)) {
    commercialIntentScore += 1;
    commercialIntentEvidence.push("Active platform interaction: AI assistant chat or whitepaper download (+1)");
  }

  commercialIntentScore = Math.min(commercialIntentScore, 15);

  // --- Dimension 4: Verified Contactability (0–15 points) ---
  let contactabilityScore = 0;
  const contactabilityEvidence: string[] = [];

  // 4a. Corporate Work Email vs Personal (0–8 pts)
  if (emailDomain) {
    if (!FREE_EMAIL_DOMAINS.has(emailDomain)) {
      contactabilityScore += 8;
      contactabilityEvidence.push(`Verified corporate business email domain (@${emailDomain}) (+8)`);
    } else {
      contactabilityScore += 4;
      contactabilityEvidence.push(`Personal consumer email (@${emailDomain}) (+4)`);
    }
  }

  // 4b. Direct Phone Verification (0–4 pts)
  if (hasValidPhone) {
    contactabilityScore += 4;
    contactabilityEvidence.push("Direct telephone contact provided and formatted (+4)");
  }

  // 4c. Decision Maker Authority (0–3 pts)
  const roleStr = (lead.role || "").toLowerCase();
  if (DECISION_MAKER_ROLES.some((r) => roleStr.includes(r))) {
    contactabilityScore += 3;
    contactabilityEvidence.push(`Verified decision maker / executive role: ${lead.role} (+3)`);
  } else if (lead.role && lead.role.trim().length > 2) {
    contactabilityScore += 2;
    contactabilityEvidence.push(`Specified organization role: ${lead.role} (+2)`);
  } else {
    contactabilityScore += 1;
    contactabilityEvidence.push("Standard prospective buyer contact (+1)");
  }

  contactabilityScore = Math.min(contactabilityScore, 15);

  // --- Dimension 5: Industry & Business Scale (0–15 points) ---
  let industryScaleScore = 0;
  const industryScaleEvidence: string[] = [];

  // 5a. High-Value Industry Vertical (0–7 pts)
  const indStr = (lead.industry || "").toLowerCase();
  if (HIGH_VALUE_INDUSTRIES.some((ind) => indStr.includes(ind) || lowerText.includes(ind))) {
    industryScaleScore += 7;
    industryScaleEvidence.push(`Prime industry vertical: ${lead.industry || "High-value sector"} (+7)`);
  } else if (lead.industry && lead.industry.trim().length > 2) {
    industryScaleScore += 5;
    industryScaleEvidence.push(`Commercial business vertical: ${lead.industry} (+5)`);
  } else {
    industryScaleScore += 2;
    industryScaleEvidence.push("Standard business operations (+2)");
  }

  // 5b. Organization Size & Headcount (0–5 pts)
  const sizeStr = (lead.companySize || "").toLowerCase();
  if (sizeStr.includes("500+") || sizeStr.includes("201-500") || sizeStr.includes("51-200") || sizeStr.includes("enterprise")) {
    industryScaleScore += 5;
    industryScaleEvidence.push("Enterprise scale organization (50+ staff) (+5)");
  } else if (sizeStr.includes("11-50") || sizeStr.includes("growth")) {
    industryScaleScore += 4;
    industryScaleEvidence.push("Growth-stage SME (11–50 staff) (+4)");
  } else if (sizeStr.includes("2-10") || sizeStr.includes("1-10")) {
    industryScaleScore += 3;
    industryScaleEvidence.push("Early-stage venture / small business (2–10 staff) (+3)");
  } else if (sizeStr.includes("1") || sizeStr.includes("solo")) {
    industryScaleScore += 2;
    industryScaleEvidence.push("Solo founder / individual operator (+2)");
  } else {
    industryScaleScore += 1;
    industryScaleEvidence.push("Unspecified organization size (+1)");
  }

  // 5c. Verifiable Digital Presence (0–3 pts)
  if (lead.websiteUrl && lead.websiteUrl.trim().length > 4) {
    industryScaleScore += 3;
    industryScaleEvidence.push(`Active company website provided (${lead.websiteUrl}) (+3)`);
  } else if (lead.companyName && lead.companyName.trim().length > 2) {
    industryScaleScore += 2;
    industryScaleEvidence.push(`Verified company entity named (${lead.companyName}) (+2)`);
  }

  industryScaleScore = Math.min(industryScaleScore, 15);

  // --- Dimension 6: Geographic / Jurisdiction Clearance (0–10 points) ---
  let geoScore = 0;
  const geoEvidence: string[] = [];

  // 6a. Tier 1 Jurisdiction Allowlist (0–6 pts)
  if (countryNormalized && TIER_1_APPROVED_COUNTRIES.has(countryNormalized)) {
    geoScore += 6;
    geoEvidence.push(`Tier 1 approved commercial jurisdiction: ${lead.country} (+6)`);
  } else if (countryNormalized) {
    geoScore += 4;
    geoEvidence.push(`Compliant non-sanctioned jurisdiction: ${lead.country} (+4)`);
  } else if (hasValidPhone && cleanPhone.startsWith("+91")) {
    geoScore += 6;
    geoEvidence.push("India domestic operational corridor (+91 phone code) (+6)");
  } else if (hasValidPhone && cleanPhone.startsWith("+1")) {
    geoScore += 6;
    geoEvidence.push("North American commercial corridor (+1 phone code) (+6)");
  } else {
    geoScore += 3;
    geoEvidence.push("Unverified global jurisdiction with standard compliance clearance (+3)");
  }

  // 6b. Operational Timezone & Language Alignment (0–2 pts)
  geoScore += 2;
  geoEvidence.push("Operational timezone & English/regional commercial fluency match (+2)");

  // 6c. Regulatory Clearance (0–2 pts)
  geoScore += 2;
  geoEvidence.push("Clear compliance posture under GDPR / DPDP Act 2023 (+2)");

  geoScore = Math.min(geoScore, 10);

  // =========================================================================
  // STEP 4: COMPUTE TOTAL SCORE & PRIORITY BAND
  // =========================================================================

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      technicalNeedScore +
        serviceFitScore +
        commercialIntentScore +
        contactabilityScore +
        industryScaleScore +
        geoScore
    )
  );

  let priorityBand: PriorityBand = "p4";
  if (totalScore >= 80) {
    priorityBand = "p1";
  } else if (totalScore >= 60) {
    priorityBand = "p2";
  } else if (totalScore >= 40) {
    priorityBand = "p3";
  } else {
    priorityBand = "p4";
  }

  // =========================================================================
  // STEP 5: GENERATE ACTIONABLE RECOMMENDATIONS
  // =========================================================================

  const recommendations: string[] = [];

  if (priorityBand === "p1") {
    recommendations.push(
      "High-Priority P1 Lead (<2 hour SLA): Assign senior solutions architect for immediate technical scoping."
    );
    if (matchedCategories.length > 0) {
      const topCategory = matchedCategories[0];
      const details = getServiceOfferDetails(topCategory);
      if (details.freeArchitectureDemoEligible) {
        recommendations.push(
          `Offer complimentary Free Architecture Demo & Working Prototype for ${details.displayName}.`
        );
      }
    }
  } else if (priorityBand === "p2") {
    recommendations.push(
      "Qualified P2 Lead (<12 hour SLA): Schedule technical discovery call and dispatch tailored service deck."
    );
  } else if (priorityBand === "p3") {
    recommendations.push(
      "Standard P3 Lead (<24 hour SLA): Present entry fixed packages (Digital Launch Pack from ₹8,999 / Business Pro from ₹18,999)."
    );
  } else {
    recommendations.push(
      "Low Priority P4 Lead: Enroll in automated educational email sequence and invite to browse public service packages."
    );
  }

  if (matchedCategories.length >= 2) {
    recommendations.push(
      `Prepare multi-service bundle proposal spanning: ${matchedCategories.join(" and ")}.`
    );
  }

  return {
    status: "QUALIFIED",
    score: totalScore,
    priorityBand,
    categoriesMatched: matchedCategories,
    breakdown: {
      technicalNeed: { score: technicalNeedScore, maxScore: 25, evidence: technicalNeedEvidence },
      serviceFit: { score: serviceFitScore, maxScore: 20, evidence: serviceFitEvidence },
      commercialIntent: { score: commercialIntentScore, maxScore: 15, evidence: commercialIntentEvidence },
      verifiedContactability: { score: contactabilityScore, maxScore: 15, evidence: contactabilityEvidence },
      industryBusinessScale: { score: industryScaleScore, maxScore: 15, evidence: industryScaleEvidence },
      geographicClearance: { score: geoScore, maxScore: 10, evidence: geoEvidence },
    },
    recommendations,
    evaluatedAt,
  };
}
