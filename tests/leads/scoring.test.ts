import test from "node:test";
import assert from "node:assert/strict";
import { calculateLeadScore, type LeadScoreInput } from "../../src/lib/leads/scoring";

test("calculateLeadScore returns INSUFFICIENT_EVIDENCE when contact or project facts are missing", () => {
  // Empty lead
  const emptyResult = calculateLeadScore({});
  assert.equal(emptyResult.status, "INSUFFICIENT_EVIDENCE");
  assert.equal(emptyResult.score, 0);
  assert.equal(emptyResult.priorityBand, "p4");
  assert.ok(emptyResult.missingEvidence && emptyResult.missingEvidence.length > 0);

  // Email present, but zero project scope/text/service
  const noScopeResult = calculateLeadScore({
    email: "sarah@acme-enterprises.com",
    message: "Hi",
  });
  assert.equal(noScopeResult.status, "INSUFFICIENT_EVIDENCE");
  assert.ok(
    noScopeResult.missingEvidence?.some((m) => m.includes("project signal")),
    "Should flag missing project signal",
  );

  // Project scope present, but invalid/missing contact info
  const noContactResult = calculateLeadScore({
    message: "We need a complete healthcare platform built with Next.js and PostgreSQL.",
  });
  assert.equal(noContactResult.status, "INSUFFICIENT_EVIDENCE");
  assert.ok(
    noContactResult.missingEvidence?.some((m) => m.includes("contact channel")),
    "Should flag missing contact channel",
  );
});

test("calculateLeadScore DISQUALIFIES disposable email domains", () => {
  const disposableResult = calculateLeadScore({
    email: "tester99@mailinator.com",
    companyName: "Test Company",
    message: "Looking for website development with high traffic handling.",
  });
  assert.equal(disposableResult.status, "DISQUALIFIED");
  assert.equal(disposableResult.score, 0);
  assert.ok(
    /temporary|burner|disposable/i.test(disposableResult.disqualificationReason || ""),
    "Must state temporary or burner email as reason",
  );
});

test("calculateLeadScore accurately scores a high-intent enterprise lead into P1 band", () => {
  const enterpriseLead: LeadScoreInput = {
    email: "cto@fintechglobal.com",
    phone: "+1-415-555-0199",
    contactName: "Marcus Vance",
    role: "Chief Technology Officer",
    companyName: "FinTech Global Solutions",
    websiteUrl: "https://fintechglobal.com",
    companySize: "100-500",
    country: "United States",
    industry: "FINTECH",
    budget: "$75,000",
    timeline: "3 months",
    requestedServices: ["SAAS_DEVELOPMENT", "AI_AUTOMATION", "CYBERSECURITY"],
    techStack: ["Next.js", "Python FastAPI", "PostgreSQL", "Docker", "AWS"],
    message:
      "We are building an enterprise multi-tenant banking automation platform with real-time biometric verification and sub-120ms AI query latency. Need production architecture review, SOC2 compliance, and MVP development.",
    hasBookedMeeting: true,
    hasInteractedWithAI: true,
    consentGiven: true,
  };

  const result = calculateLeadScore(enterpriseLead);
  assert.equal(result.status, "QUALIFIED");
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
  assert.equal(result.priorityBand, "p1");

  // Verify breakdown scores are within theoretical bounds
  const b = result.breakdown;
  assert.ok(b.technicalNeed.score <= 25 && b.technicalNeed.score > 0);
  assert.ok(b.serviceFit.score <= 20 && b.serviceFit.score > 0);
  assert.ok(b.commercialIntent.score <= 15 && b.commercialIntent.score > 0);
  assert.ok(b.verifiedContactability.score <= 15 && b.verifiedContactability.score > 0);
  assert.ok(b.industryBusinessScale.score <= 15 && b.industryBusinessScale.score > 0);
  assert.ok(b.geographicClearance.score <= 10 && b.geographicClearance.score > 0);

  // Sum of dimensions matches total score
  const calculatedSum =
    b.technicalNeed.score +
    b.serviceFit.score +
    b.commercialIntent.score +
    b.verifiedContactability.score +
    b.industryBusinessScale.score +
    b.geographicClearance.score;
  assert.equal(result.score, calculatedSum);

  // Service categories matched
  assert.ok(result.categoriesMatched.includes("SAAS_DEVELOPMENT"));
  assert.ok(result.categoriesMatched.includes("AI_AUTOMATION"));
});

test("calculateLeadScore assigns standard P2 / P3 priority bands appropriately", () => {
  const standardLead: LeadScoreInput = {
    email: "rajesh.kumar@shoppingsolutions.in",
    contactName: "Rajesh Kumar",
    companyName: "Shopping Solutions Pvt Ltd",
    country: "India",
    message: "We need an e-commerce website redesign with payment gateway integration for our retail chain.",
    requestedServices: ["WEB_DEVELOPMENT"],
    consentGiven: true,
  };

  const result = calculateLeadScore(standardLead);
  assert.equal(result.status, "QUALIFIED");
  assert.ok(
    result.score >= 40 && result.score < 80,
    `Expected standard score between 40 and 80, got ${result.score}`,
  );
  assert.ok(result.priorityBand === "p2" || result.priorityBand === "p3");
  assert.ok(result.categoriesMatched.includes("WEB_DEVELOPMENT"));
});
