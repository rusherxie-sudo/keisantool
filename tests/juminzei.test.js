import { describe, expect, it } from 'vitest';
import {
  calcJuminzei,
  dependentDeduction,
  equalLevyExemptLimit,
  incomeLevyExemptLimit,
  residentBasicDeduction,
  spouseIncomeDeduction,
  spouseSpecialIncomeDeduction,
} from '../src/lib/juminzei.js';

describe('令和8年度の住民税所得控除', () => {
  it('基礎控除は合計所得2,400万円以下で43万円', () => {
    expect(residentBasicDeduction(24000000)).toBe(430000);
    expect(residentBasicDeduction(24000001)).toBe(290000);
    expect(residentBasicDeduction(24500001)).toBe(150000);
    expect(residentBasicDeduction(25000001)).toBe(0);
  });

  it('配偶者控除は配偶者所得58万円以下で本人所得に応じて逓減する', () => {
    expect(spouseIncomeDeduction(9000000, 580000)).toBe(330000);
    expect(spouseIncomeDeduction(9500000, 580000)).toBe(220000);
    expect(spouseIncomeDeduction(10000000, 580000)).toBe(110000);
    expect(spouseIncomeDeduction(10000001, 0)).toBe(0);
    expect(spouseIncomeDeduction(5000000, 580001)).toBe(0);
  });

  it('配偶者特別控除は58万円超133万円以下だけに適用する', () => {
    expect(spouseSpecialIncomeDeduction(5000000, 580000)).toBe(0);
    expect(spouseSpecialIncomeDeduction(5000000, 580001)).toBe(330000);
    expect(spouseSpecialIncomeDeduction(5000000, 1000000)).toBe(330000);
    expect(spouseSpecialIncomeDeduction(5000000, 1000001)).toBe(310000);
    expect(spouseSpecialIncomeDeduction(5000000, 1330000)).toBe(30000);
    expect(spouseSpecialIncomeDeduction(5000000, 1330001)).toBe(0);
  });

  it('扶養控除は16歳未満0円、一般33万円、特定45万円、老人38万円', () => {
    expect(dependentDeduction(15)).toBe(0);
    expect(dependentDeduction(16)).toBe(330000);
    expect(dependentDeduction(19)).toBe(450000);
    expect(dependentDeduction(23)).toBe(330000);
    expect(dependentDeduction(70)).toBe(380000);
  });
});

describe('令和8年度の非課税限度額（標準的な自治体）', () => {
  it('扶養なしは所得45万円以下で均等割・所得割とも非課税', () => {
    expect(equalLevyExemptLimit(0)).toBe(450000);
    expect(incomeLevyExemptLimit(0)).toBe(450000);
  });

  it('扶養等1人は均等割101万円、所得割112万円以下が非課税', () => {
    expect(equalLevyExemptLimit(1)).toBe(1010000);
    expect(incomeLevyExemptLimit(1)).toBe(1120000);
  });
});

describe('calcJuminzei（令和8年度・給与所得者向け概算）', () => {
  it('年収360万円・単身・社会保険料15%推計は年額149,500円', () => {
    const result = calcJuminzei(3600000);
    expect(result.salaryIncome).toBe(2440000);
    expect(result.socialInsuranceDeduction).toBe(540000);
    expect(result.taxableIncome).toBe(1470000);
    expect(result.prefecturalIncomeLevy).toBe(57800);
    expect(result.municipalIncomeLevy).toBe(86700);
    expect(result.adjustmentCredit).toBe(2500);
    expect(result.equalLevy).toBe(4000);
    expect(result.forestEnvironmentTax).toBe(1000);
    expect(result.residentTax).toBe(149500);
    expect(result.monthlyEstimate).toBe(12458);
    expect(result.socialInsuranceEstimated).toBe(true);
  });

  it('社会保険料を入力した場合は推計値ではなく入力値を使う', () => {
    const result = calcJuminzei(3600000, { socialInsurance: 600000 });
    expect(result.socialInsuranceDeduction).toBe(600000);
    expect(result.socialInsuranceEstimated).toBe(false);
    expect(result.residentTax).toBeLessThan(calcJuminzei(3600000).residentTax);
  });

  it('配偶者控除と配偶者特別控除を同時に加算しない', () => {
    const ordinary = calcJuminzei(5000000, { hasSpouse: true, spouseIncome: 580000 });
    const special = calcJuminzei(5000000, { hasSpouse: true, spouseIncome: 580001 });
    expect(ordinary.spouseDeduction).toBe(330000);
    expect(ordinary.spouseSpecialDeduction).toBe(0);
    expect(special.spouseDeduction).toBe(0);
    expect(special.spouseSpecialDeduction).toBe(330000);
  });

  it('年収110万円の単身者は標準非課税限度額内で0円', () => {
    const result = calcJuminzei(1100000);
    expect(result.salaryIncome).toBe(450000);
    expect(result.isEqualLevyExempt).toBe(true);
    expect(result.isIncomeLevyExempt).toBe(true);
    expect(result.residentTax).toBe(0);
  });

  it('扶養1人・給与収入166万円は全額非課税、1円超では均等割等のみ', () => {
    const exempt = calcJuminzei(1660000, { under16Dependents: 1 });
    const equalOnly = calcJuminzei(1660001, { under16Dependents: 1 });
    expect(exempt.salaryIncome).toBe(1010000);
    expect(exempt.residentTax).toBe(0);
    expect(equalOnly.salaryIncome).toBe(1010001);
    expect(equalOnly.isEqualLevyExempt).toBe(false);
    expect(equalOnly.isIncomeLevyExempt).toBe(true);
    expect(equalOnly.residentTax).toBe(5000);
  });

  it('扶養控除の年齢区分を税額計算に反映する', () => {
    const noDependent = calcJuminzei(5000000);
    const general = calcJuminzei(5000000, { generalDependents: 1 });
    const special = calcJuminzei(5000000, { specialDependents: 1 });
    const elderly = calcJuminzei(5000000, { elderlyDependents: 1 });
    expect(general.dependentDeduction).toBe(330000);
    expect(special.dependentDeduction).toBe(450000);
    expect(elderly.dependentDeduction).toBe(380000);
    expect(special.residentTax).toBeLessThan(general.residentTax);
    expect(general.residentTax).toBeLessThan(noDependent.residentTax);
  });

  it('不正な入力は0円の空結果を返す', () => {
    expect(calcJuminzei('').residentTax).toBe(0);
    expect(calcJuminzei(-1).residentTax).toBe(0);
    expect(calcJuminzei(Number.NaN).residentTax).toBe(0);
  });
});
