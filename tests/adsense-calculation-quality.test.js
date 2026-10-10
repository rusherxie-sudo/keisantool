import { describe, it, expect } from 'vitest';
import * as social from '../src/lib/japan-social-2026.js';
import { takeHomePay } from '../src/lib/kyuyo.js';
import { calcShotokuzei } from '../src/lib/shotokuzei.js';
import { calcNematsu, medicalExpenseDeduction } from '../src/lib/nematsu.js';

// Independent anchors: 協会けんぽ R8_44oita.pdf (grades), NTA 1199/1410/2260/2662/1120.
describe('health and pension use their own official grades', () => {
  it.each([[62000,58000,88000],[63000,68000,88000],[73000,78000,88000],
    [83000,88000,88000],[295000,300000,300000],[665000,680000,650000],
    [700000,710000,650000],[1355000,1390000,650000]])('%i remuneration', (wage, health, pension) => {
    const r = social.calculateEmployeeSocialInsurance(wage, 40);
    expect(r.healthPremiumBase).toBe(health);
    expect(r.pensionPremiumBase).toBe(pension);
  });
  it('700,000 yen: health, care and support continue beyond the pension cap', () => {
    const r = social.calculateEmployeeSocialInsurance(700000, 40);
    expect(r).toMatchObject({ health:35145, pension:59475, nursing:5751, childcare:816, employment:3500 });
  });
});
describe('salary annual tax estimate', () => {
  it('deducts actual modeled social contributions and includes surtax', () => {
    const r = takeHomePay(300000);
    expect(r.socialInsurance.total).toBe(44145);
    expect(r.taxableIncome).toBe(870000);
    expect(r.incomeTax).toBe(3701); // floor((43,500 + 913) / 12)
    expect(r.residentTax).toBe(12541); // 2025 income: 2,440,000 - 529,740 - 430,000
    expect(r.takeHome).toBe(239613);
  });
  it('employment uses wage even when remuneration differs', () => {
    expect(takeHomePay(320000, { premiumBase:300000 }).socialInsurance.employment).toBe(1600);
  });
  it('age 40 adds nursing insurance', () => {
    expect(takeHomePay(300000, { age:40 }).socialInsurance.nursing).toBe(2430);
  });
  it('income tax accepts user deductions', () => {
    expect(calcShotokuzei(3600000, 540000)).toMatchObject({ taxableIncome:860000, incomeTax:43903, basicDeduction:1040000 });
  });
});
describe('year-end and medical deduction', () => {
  it('annual year-end tax is rounded down to 100 yen', () => {
    expect(calcNematsu(3600000, 140000, { socialInsurance:40000, lifeInsurance:60000, earthquakeInsurance:10000 }))
      .toMatchObject({ taxableIncome:875000, actualTax:44600, refund:95400, totalDeductions:1565000 });
  });
  it('supports actual annual social payment and a separately calculated life deduction', () => {
    expect(calcNematsu(3600000, 100000, { annualSocialInsurance:529740, lifeDeduction:120000 }))
      .toMatchObject({ taxableIncome:750000, actualTax:38200, totalDeductions:1689740 });
  });
  it.each([[100000,3000000,0,0],[100000,1000000,0,50000],[300000,3000000,50000,150000],[3000000,3000000,0,2000000]])
    ('medical expense %i, income %i, compensation %i', (expense, income, compensation, expected) => {
      expect(medicalExpenseDeduction(expense, income, compensation)).toBe(expected);
    });
});
