import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEngagementFinancials,
  generateScopeItems,
  getFinancialsForEngagement,
  validateExplicitSubtotalAmount,
  formatInr,
} from '../../src/lib/engagements/financials';

describe('Engagement Financials Calculation Engine', () => {
  it('correctly calculates GST and 50/50 milestones for 50 rupees base amount', () => {
    const fin = calculateEngagementFinancials(50);
    assert.equal(fin.isPriced, true);
    assert.equal(fin.subtotal, 50);
    assert.equal(fin.cgstAmount, 4.5);
    assert.equal(fin.sgstAmount, 4.5);
    assert.equal(fin.gstAmount, 9);
    assert.equal(fin.totalAmount, 59);
    assert.equal(fin.depositAmount, 29.5);
    assert.equal(fin.settlementAmount, 29.5);
    assert.equal(fin.cgstRate, 0.09);
    assert.equal(fin.sgstRate, 0.09);
    assert.equal(fin.gstRate, 0.18);
  });

  it('supports gstApplicable=false (0% GST) and discounts with exact 50/50 milestone split', () => {
    const fin = calculateEngagementFinancials(50000, {
      gstApplicable: false,
      discountAmount: 5000,
    });
    assert.equal(fin.subtotal, 50000);
    assert.equal(fin.discountAmount, 5000);
    assert.equal(fin.taxableSubtotal, 45000);
    assert.equal(fin.gstAmount, 0);
    assert.equal(fin.totalAmount, 45000);
    assert.equal(fin.depositAmount, 22500);
    assert.equal(fin.settlementAmount, 22500);
  });

  it('rejects missing, zero, negative, or non-numeric subtotals in validateExplicitSubtotalAmount', () => {
    assert.equal(validateExplicitSubtotalAmount(undefined).ok, false);
    assert.equal(validateExplicitSubtotalAmount(null).ok, false);
    assert.equal(validateExplicitSubtotalAmount(0).ok, false);
    assert.equal(validateExplicitSubtotalAmount(-500).ok, false);
    assert.equal(validateExplicitSubtotalAmount('abc').ok, false);
    const valid = validateExplicitSubtotalAmount(50000);
    assert.equal(valid.ok, true);
    if (valid.ok) assert.equal(valid.subtotal, 50000);
  });

  it('correctly handles string inputs like "50", "₹50.00", and raw integers', () => {
    const fin1 = calculateEngagementFinancials('50');
    assert.equal(fin1.subtotal, 50);
    assert.equal(fin1.gstAmount, 9);
    assert.equal(fin1.totalAmount, 59);

    const fin2 = calculateEngagementFinancials('₹50.00');
    assert.equal(fin2.subtotal, 50);
    assert.equal(fin2.gstAmount, 9);

    const fin3 = calculateEngagementFinancials('50 rupees');
    assert.equal(fin3.subtotal, 50);
    assert.equal(fin3.gstAmount, 9);
  });

  it('generates scope items that sum up precisely to the subtotal without fabricating 5-item splits', () => {
    const items = generateScopeItems(50);
    assert.equal(items.length, 1);
    const sum = items.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    assert.equal(Math.round(sum * 100) / 100, 50);

    const largeItems = generateScopeItems(1800000);
    assert.equal(largeItems.length, 1);
    const largeSum = largeItems.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    assert.equal(Math.round(largeSum * 100) / 100, 1800000);
  });

  it('correctly extracts financials from engagement metadata and proposal snapshot', () => {
    const mockEngagement = {
      id: 'eng-123',
      engagement_ref: 'ENG-2026-TEST',
      client_name: 'Healthcare Technologies',
      client_email: 'test@example.com',
      company_name: 'Healthcare Technologies',
      project_title: 'Platform',
      current_stage_key: 'proposal',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        subtotal: 50,
      },
    } as unknown as import('../../src/lib/engagements/types').ClientEngagement;

    const fin = getFinancialsForEngagement(mockEngagement);
    assert.equal(fin.subtotal, 50);
    assert.equal(fin.totalAmount, 59);
    assert.equal(fin.depositAmount, 29.5);
    assert.equal(fin.settlementAmount, 29.5);
  });

  it('formats INR currency strings properly', () => {
    const formatted = formatInr(50);
    assert.ok(formatted.includes('50'));
  });
});

