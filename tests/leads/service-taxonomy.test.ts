import test from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_CATEGORIES,
  isServiceCategory,
  classifyOpportunity,
  getServiceOfferDetails,
  getAllServiceOfferDetails,
  type ServiceCategory,
} from "../../src/lib/leads/service-taxonomy";

test("service taxonomy defines all 15 LIT service categories", () => {
  assert.equal(SERVICE_CATEGORIES.length, 15);
  const expected: ServiceCategory[] = [
    "WEB_DEVELOPMENT",
    "WEB_DESIGN",
    "APP_DEVELOPMENT",
    "MOBILE_DEVELOPMENT",
    "GAME_DEVELOPMENT",
    "CUSTOM_SOFTWARE",
    "SAAS_DEVELOPMENT",
    "AI_AUTOMATION",
    "AI_AGENTS",
    "DATABASE_ENGINEERING",
    "API_INTEGRATION",
    "ENTERPRISE_PLATFORM",
    "HEALTHCARE_TECH",
    "CYBERSECURITY",
    "TECHNICAL_CONSULTING",
  ];
  for (const cat of expected) {
    assert.ok(SERVICE_CATEGORIES.includes(cat), `Category ${cat} should exist in taxonomy`);
  }
});

test("isServiceCategory validates known and unknown strings", () => {
  assert.equal(isServiceCategory("GAME_DEVELOPMENT"), true);
  assert.equal(isServiceCategory("AI_AUTOMATION"), true);
  assert.equal(isServiceCategory("HEALTHCARE_TECH"), true);
  assert.equal(isServiceCategory("UNKNOWN_CATEGORY"), false);
  assert.equal(isServiceCategory(""), false);
});

test("classifyOpportunity detects single service categories accurately", () => {
  const webLead = classifyOpportunity({
    text: "We need a fast responsive marketing website built with Next.js and Tailwind CSS with high SEO scores.",
  });
  assert.ok(webLead.includes("WEB_DEVELOPMENT"), "Should classify as WEB_DEVELOPMENT");

  const gameLead = classifyOpportunity({
    text: "Building a 3D multiplayer action game using Unity engine, custom shaders, and physics simulation.",
  });
  assert.ok(gameLead.includes("GAME_DEVELOPMENT"), "Should classify as GAME_DEVELOPMENT");

  const aiLead = classifyOpportunity({
    text: "We want an autonomous LLM customer support agent with RAG pipeline and sub-120ms latency.",
  });
  assert.ok(
    aiLead.includes("AI_AGENTS") || aiLead.includes("AI_AUTOMATION"),
    "Should classify as AI_AGENTS or AI_AUTOMATION",
  );

  const healthcareLead = classifyOpportunity({
    text: "Hospital management system for multi-specialty clinic with OPD/IPD scheduling, EHR, and ABHA compliance.",
  });
  assert.ok(healthcareLead.includes("HEALTHCARE_TECH"), "Should classify as HEALTHCARE_TECH");

  const cyberLead = classifyOpportunity({
    text: "We need a comprehensive penetration test, vulnerability audit, and zero-trust authentication review.",
  });
  assert.ok(cyberLead.includes("CYBERSECURITY"), "Should classify as CYBERSECURITY");
});

test("classifyOpportunity handles multi-service opportunities without forcing every service", () => {
  const multiLead = classifyOpportunity({
    text: "We are developing an iOS and Android mobile app that integrates real-time conversational AI voice agents and connects to our legacy PostgreSQL database.",
  });
  assert.ok(
    multiLead.includes("APP_DEVELOPMENT") || multiLead.includes("MOBILE_DEVELOPMENT"),
    "Must include mobile/app development",
  );
  assert.ok(
    multiLead.includes("AI_AGENTS") || multiLead.includes("AI_AUTOMATION"),
    "Must include AI agents/automation",
  );
  assert.ok(
    multiLead.includes("DATABASE_ENGINEERING") || multiLead.includes("API_INTEGRATION"),
    "Must include database or API integration",
  );
  // Ensure it does not include irrelevant services like GAME_DEVELOPMENT
  assert.equal(
    multiLead.includes("GAME_DEVELOPMENT"),
    false,
    "Should not include GAME_DEVELOPMENT when unrequested",
  );
});

test("classifyOpportunity respects explicitly requestedServices and techStack hints", () => {
  const explicitLead = classifyOpportunity({
    requestedServices: ["SAAS_DEVELOPMENT", "API_INTEGRATION"],
    techStack: ["Next.js", "Stripe", "Docker"],
  });
  assert.ok(explicitLead.includes("SAAS_DEVELOPMENT"));
  assert.ok(explicitLead.includes("API_INTEGRATION"));
});

test("getServiceOfferDetails returns complete commercial offer details for each category", () => {
  for (const cat of SERVICE_CATEGORIES) {
    const details = getServiceOfferDetails(cat);
    assert.equal(details.category, cat);
    assert.ok(details.displayName.length > 0, "Display name must be non-empty");
    assert.ok(details.pricingGuidance.startingPriceInINR > 0, "Price in INR must be positive");
    assert.ok(details.packageMappings.length > 0, "Must have package mappings");
    assert.ok(details.deliverables.length > 0, "Must have defined deliverables");
    assert.ok(typeof details.freeArchitectureDemoEligible === "boolean");
  }
});

test("getAllServiceOfferDetails covers all 15 categories", () => {
  const allDetails = getAllServiceOfferDetails();
  assert.equal(allDetails.length, 15);
  const categoriesFound = allDetails.map((d) => d.category);
  for (const cat of SERVICE_CATEGORIES) {
    assert.ok(categoriesFound.includes(cat));
  }
});
