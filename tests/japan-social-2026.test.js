import { describe, expect, it } from 'vitest';
import {
  employeeEmploymentInsurance,
  employeeNursingInsurance,
  estimatePensionPremiumBase,
  pensionInsurance,
} from '../src/lib/japan-social-2026.js';

describe('令和8年度の社会保険概算ルール', () => {
  it('厚生年金の標準報酬月額は公式等級に当てはめ、上限は65万円', () => {
    expect(estimatePensionPremiumBase(300000)).toBe(300000);
    expect(estimatePensionPremiumBase(700000)).toBe(650000);
    expect(pensionInsurance(700000)).toBe(59475);
  });

  it('一般事業の雇用保険（労働者負担）は賃金総額の0.5%', () => {
    expect(employeeEmploymentInsurance(700000)).toBe(3500);
  });

  it('介護保険は40〜64歳の労働者負担0.81%', () => {
    expect(employeeNursingInsurance(650000, 39)).toBe(0);
    expect(employeeNursingInsurance(650000, 40)).toBe(5265);
    expect(employeeNursingInsurance(650000, 65)).toBe(0);
  });
});
