import test from "node:test";
import assert from "node:assert/strict";
import {
  MAINTENANCE_PLANS,
  MAINTENANCE_PLANS_LIST,
  calculatePlanPricing,
  formatPaiseToInr,
  GST_RATE_PERCENT,
  type MaintenancePlanKey,
} from "../../src/config/maintenance-plans.ts";

test("Maintenance Catalog: exactly five plans exist with canonical keys", () => {
  const expectedKeys: MaintenancePlanKey[] = [
    "FREE_TRIAL",
    "STANDARD",
    "BASIC",
    "PRO",
    "ENTERPRISE",
  ];

  assert.equal(MAINTENANCE_PLANS_LIST.length, 5, "Must have exactly 5 plans");
  const actualKeys = MAINTENANCE_PLANS_LIST.map((p) => p.id);
  assert.deepEqual(actualKeys, expectedKeys, "Plan keys must match the canonical 5 tiers");
});

test("Maintenance Plan 1: FREE_TRIAL (₹0 subscription, ₹20 refundable verification)", () => {
  const trial = MAINTENANCE_PLANS.FREE_TRIAL;
  assert.ok(trial, "FREE_TRIAL plan must exist");

  assert.equal(trial.basePricePaise, 0);
  assert.equal(trial.refundablePaise, 2000, "One-time verification must be 2000 paise (₹20)");
  assert.equal(trial.planType, "free_trial", "Must be flagged as free_trial");
  assert.equal(trial.durationDays, 30, "Trial duration must be 30 days");
  assert.equal(trial.enhancementHoursMonthly, 0, "No enhancement hours included in trial");
  assert.equal(trial.ctaButtonText, "Start Free Trial — Pay ₹20");

  const pricing = calculatePlanPricing("FREE_TRIAL", "monthly");
  assert.equal(pricing.basePricePaise, 0);
  assert.equal(pricing.taxPaise, 0);
  assert.equal(pricing.totalPayablePaise, 2000, "Payable amount must be exactly ₹20 (2000 paise)");
  assert.equal(pricing.isRefundableTrialVerification, true);
});

test("Maintenance Plan 2: STANDARD (₹999/mo + 18% GST = ₹1,178.82)", () => {
  const plan = MAINTENANCE_PLANS.STANDARD;
  assert.ok(plan, "STANDARD plan must exist");
  assert.equal(plan.basePricePaise, 99900);
  assert.equal(plan.refundablePaise, 0);
  assert.equal(plan.planType, "paid", "Must be flagged as paid");
  assert.equal(plan.durationDays, 30);
  assert.equal(plan.enhancementHoursMonthly, 0);
  assert.equal(plan.ctaButtonText, "Choose Standard");

  const monthly = calculatePlanPricing("STANDARD", "monthly");
  assert.equal(monthly.basePricePaise, 99900);
  assert.equal(monthly.taxPaise, 17982);
  assert.equal(monthly.totalPayablePaise, 117882, "99900 + 17982 = 117882 paise (₹1,178.82)");
  assert.equal(monthly.isRefundableTrialVerification, false);

  const annual = calculatePlanPricing("STANDARD", "annual");
  assert.equal(annual.basePricePaise, 99900 * 12);
  assert.equal(annual.taxPaise, Math.round(99900 * 12 * 0.18));
  assert.equal(annual.totalPayablePaise, annual.basePricePaise + annual.taxPaise);
});

test("Maintenance Plan 3: BASIC (₹4,999/mo + 18% GST = ₹5,898.82, 1 hr/mo enhancement)", () => {
  const plan = MAINTENANCE_PLANS.BASIC;
  assert.ok(plan);
  assert.equal(plan.basePricePaise, 499900);
  assert.equal(plan.enhancementHoursMonthly, 1);
  assert.equal(plan.ctaButtonText, "Choose Basic");

  const monthly = calculatePlanPricing("BASIC", "monthly");
  assert.equal(monthly.basePricePaise, 499900);
  // 4999 * 0.18 = 899.82 -> 89982 paise
  assert.equal(monthly.taxPaise, 89982);
  assert.equal(monthly.totalPayablePaise, 589882, "499900 + 89982 = 589882 paise (₹5,898.82)");
});

test("Maintenance Plan 4: PRO (₹9,999/mo + 18% GST = ₹11,798.82, 3 hrs/mo enhancement)", () => {
  const plan = MAINTENANCE_PLANS.PRO;
  assert.ok(plan);
  assert.equal(plan.basePricePaise, 999900);
  assert.equal(plan.enhancementHoursMonthly, 3);
  assert.equal(plan.ctaButtonText, "Choose Pro");

  const monthly = calculatePlanPricing("PRO", "monthly");
  assert.equal(monthly.basePricePaise, 999900);
  // 9999 * 0.18 = 1799.82 -> 179982 paise
  assert.equal(monthly.taxPaise, 179982);
  assert.equal(monthly.totalPayablePaise, 1179882, "99900 + 179982 = 1179882 paise (₹11,798.82)");
});

test("Maintenance Plan 5: ENTERPRISE (₹19,999/mo + 18% GST = ₹23,598.82, 6 hrs/mo enhancement)", () => {
  const plan = MAINTENANCE_PLANS.ENTERPRISE;
  assert.ok(plan);
  assert.equal(plan.basePricePaise, 1999900);
  assert.equal(plan.enhancementHoursMonthly, 6);
  assert.equal(plan.ctaButtonText, "Choose Enterprise");

  const monthly = calculatePlanPricing("ENTERPRISE", "monthly");
  assert.equal(monthly.basePricePaise, 1999900);
  // 19999 * 0.18 = 3599.82 -> 359982 paise
  assert.equal(monthly.taxPaise, 359982);
  assert.equal(monthly.totalPayablePaise, 2359882, "1999900 + 359982 = 2359882 paise (₹23,598.82)");
});

test("formatPaiseToInr formats Indian currency correctly", () => {
  assert.equal(formatPaiseToInr(0), "₹0");
  assert.equal(formatPaiseToInr(2000), "₹20");
  assert.equal(formatPaiseToInr(117882), "₹1,178.82");
  assert.equal(formatPaiseToInr(589882), "₹5,898.82");
  assert.equal(formatPaiseToInr(1179882), "₹11,798.82");
  assert.equal(formatPaiseToInr(2359882), "₹23,598.82");
});

test("GST Rate is locked at 18%", () => {
  assert.equal(GST_RATE_PERCENT, 18);
});
