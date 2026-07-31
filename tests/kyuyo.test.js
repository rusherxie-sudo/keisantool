import { describe, it, expect } from 'vitest';
import {
  hourlyWage,
  overtimePay,
  takeHomePay,
  hourlyFromMonthly,
  overtimeBreakdown,
  salaryDeduction,
  incomeTax,
  residentTax,
  healthInsurance,
  pensionInsurance,
  employmentInsurance,
  socialInsuranceTotal,
} from '../src/lib/kyuyo.js';

describe('hourlyWage(時給計算: 時給 × 労働時間)', () => {
  it('時給1000円 × 8時間 → 8000円', () => {
    expect(hourlyWage(1000, 8)).toEqual({ pay: 8000 });
  });

  it('時給1200円 × 160時間 → 192000円', () => {
    expect(hourlyWage(1200, 160)).toEqual({ pay: 192000 });
  });

  it('端数は切り捨て: 時給1013円 × 7.5時間 → 7597.5 を切り捨て7597', () => {
    expect(hourlyWage(1013, 7.5)).toEqual({ pay: 7597 });
  });

  it('時給0円 → 0円', () => {
    expect(hourlyWage(0, 8)).toEqual({ pay: 0 });
  });

  it('労働時間0 → 0円', () => {
    expect(hourlyWage(1000, 0)).toEqual({ pay: 0 });
  });
});

describe('overtimePay(残業代計算: 時給 × 残業時間 × 割増率)', () => {
  it('時給1000円 × 10時間 × 1.25（通常）→ 12500円', () => {
    expect(overtimePay(1000, 10, 1.25)).toEqual({ pay: 12500 });
  });

  it('時給1000円 × 10時間 × 1.5（深夜）→ 15000円', () => {
    expect(overtimePay(1000, 10, 1.5)).toEqual({ pay: 15000 });
  });

  it('時給1000円 × 10時間 × 1.5（月60時間超の残業）→ 15000円', () => {
    expect(overtimePay(1000, 10, 1.5)).toEqual({ pay: 15000 });
  });

  it('時給1000円 × 10時間 × 1.35（休日）→ 13500円', () => {
    expect(overtimePay(1000, 10, 1.35)).toEqual({ pay: 13500 });
  });

  it('端数は切り捨て: 時給1013円 × 3時間 × 1.25 → 3798.75 を切り捨て3798', () => {
    expect(overtimePay(1013, 3, 1.25)).toEqual({ pay: 3798 });
  });

  it('残業時間0 → 0円', () => {
    expect(overtimePay(1000, 0, 1.25)).toEqual({ pay: 0 });
  });

  it('時給0円 → 0円', () => {
    expect(overtimePay(0, 10, 1.25)).toEqual({ pay: 0 });
  });
});

describe('takeHomePay(手取り精算)', () => {
  it('月収300000円 → 精算結果', () => {
    const result = takeHomePay(300000);
    expect(result.yearlyIncome).toBe(3600000);
    expect(result.salaryDeduction).toBe(Math.floor(3600000 * 0.3 + 80000));
    expect(result.taxableIncome).toBe(1560000);
    expect(result.socialInsurance.health).toBe(Math.floor(300000 * 0.0495));
    expect(result.socialInsurance.pension).toBe(Math.floor(300000 * 0.0915));
    expect(result.socialInsurance.employment).toBe(Math.floor(300000 * 0.005));
    expect(result.socialInsurance.childcare).toBe(Math.floor(300000 * 0.00115));
    expect(result.deduction).toBe(result.socialInsurance.total + result.incomeTax + result.residentTax);
    expect(result.takeHome).toBe(Math.floor(300000 - result.deduction));
  });

  it('月収250000円 → 精算結果', () => {
    const result = takeHomePay(250000);
    expect(result.yearlyIncome).toBe(3000000);
    expect(result.socialInsurance.total).toBe(socialInsuranceTotal(250000).total);
  });

  it('端数は切り捨て: 月収333333円', () => {
    const result = takeHomePay(333333);
    expect(result.takeHome).toBe(Math.floor(333333 - result.deduction));
  });

  it('月収0円 → 全て0', () => {
    const result = takeHomePay(0);
    expect(result.takeHome).toBe(0);
    expect(result.deduction).toBe(0);
    expect(result.socialInsurance.total).toBe(0);
    expect(result.incomeTax).toBe(0);
    expect(result.residentTax).toBe(0);
  });
});

describe('hourlyFromMonthly(基本給 ÷ 月平均所定労働時間 = 時給)', () => {
  it('基本給250000円 ÷ 月160時間 → floor(1562.5)=1562円', () => {
    expect(hourlyFromMonthly(250000, 160)).toBe(1562);
  });

  it('基本給200000円 ÷ 月160時間 → 1250円', () => {
    expect(hourlyFromMonthly(200000, 160)).toBe(1250);
  });

  it('基本給300000円 ÷ 月170時間 → floor(1764.7...)=1764円', () => {
    expect(hourlyFromMonthly(300000, 170)).toBe(1764);
  });

  it('月所定労働時間0 → null', () => {
    expect(hourlyFromMonthly(250000, 0)).toBeNull();
  });

  it('基本給が負 → null', () => {
    expect(hourlyFromMonthly(-250000, 160)).toBeNull();
  });

  it('非数値 → null', () => {
    expect(hourlyFromMonthly(NaN, 160)).toBeNull();
    expect(hourlyFromMonthly(250000, NaN)).toBeNull();
  });

  it('空文字 → null', () => {
    expect(hourlyFromMonthly('', '')).toBeNull();
  });
});

describe('overtimeBreakdown(分類別の残業代を一括計算)', () => {
  it('時給1000円, 普通10時間のみ → normal12500, total12500', () => {
    expect(overtimeBreakdown(1000, { normal: 10 })).toEqual({
      normal: 12500,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 12500,
    });
  });

  it('時給1000円, 普通10+深夜5 → 12500+7500=20000', () => {
    expect(overtimeBreakdown(1000, { normal: 10, night: 5 })).toEqual({
      normal: 12500,
      night: 7500,
      holiday: 0,
      over60: 0,
      total: 20000,
    });
  });

  it('時給1000円, 全種別 普通10/深夜5/休日4/60h超3', () => {
    // normal: 1000*10*1.25=12500
    // night: 1000*5*1.5=7500
    // holiday: 1000*4*1.35=5400
    // over60: 1000*3*1.5=4500
    // total: 29900
    expect(overtimeBreakdown(1000, { normal: 10, night: 5, holiday: 4, over60: 3 })).toEqual({
      normal: 12500,
      night: 7500,
      holiday: 5400,
      over60: 4500,
      total: 29900,
    });
  });

  it('端数は各項で切り捨て: 時給1013円, 普通3時間 → floor(3798.75)=3798', () => {
    expect(overtimeBreakdown(1013, { normal: 3 })).toEqual({
      normal: 3798,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 3798,
    });
  });

  it('時数の指定なし（空オブジェクト）→ 全て0', () => {
    expect(overtimeBreakdown(1000, {})).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('引数省略でも全て0', () => {
    expect(overtimeBreakdown(1000)).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('時給0円 → 全て0', () => {
    expect(overtimeBreakdown(0, { normal: 10, night: 5 })).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('時給が非数値 → 全て0', () => {
    expect(overtimeBreakdown(NaN, { normal: 10 })).toEqual({
      normal: 0,
      night: 0,
      holiday: 0,
      over60: 0,
      total: 0,
    });
  });

  it('負の時数は0扱い', () => {
    expect(overtimeBreakdown(1000, { normal: -10, night: 5 })).toEqual({
      normal: 0,
      night: 7500,
      holiday: 0,
      over60: 0,
      total: 7500,
    });
  });
});

describe('salaryDeduction(給与所得控除)', () => {
  it('162.5万超〜180万は改正後の段階式', () => {
    expect(salaryDeduction(1800000)).toBe(650000);
    expect(salaryDeduction(1900000)).toBe(650000);
  });
  it('年収190万超〜360万 → 控除 = 収入×30%+8万', () => {
    expect(salaryDeduction(2500000)).toBe(Math.floor(2500000 * 0.3 + 80000));
    expect(salaryDeduction(3600000)).toBe(Math.floor(3600000 * 0.3 + 80000));
  });
  it('年収360万超〜660万 → 控除 = 収入×20%+44万', () => {
    expect(salaryDeduction(4500000)).toBe(Math.floor(4500000 * 0.2 + 440000));
    expect(salaryDeduction(6600000)).toBe(Math.floor(6600000 * 0.2 + 440000));
  });
  it('年収660万超〜850万 → 控除 = 収入×10%+110万', () => {
    expect(salaryDeduction(7500000)).toBe(Math.floor(7500000 * 0.1 + 1100000));
    expect(salaryDeduction(8500000)).toBe(Math.floor(8500000 * 0.1 + 1100000));
  });
  it('年収850万超 → 控除上限195万', () => {
    expect(salaryDeduction(9000000)).toBe(1950000);
    expect(salaryDeduction(10000000)).toBe(1950000);
  });
  it('不正な入力 → 0', () => {
    expect(salaryDeduction(0)).toBe(0);
    expect(salaryDeduction(-1000000)).toBe(0);
    expect(salaryDeduction(NaN)).toBe(0);
  });
});

describe('incomeTax(所得税)', () => {
  it('課税所得195万以下 → 5%', () => {
    expect(incomeTax(1000000)).toBe(Math.floor(1000000 * 0.05));
    expect(incomeTax(1950000)).toBe(Math.floor(1950000 * 0.05));
  });
  it('課税所得195万超〜330万 → 10%-97500', () => {
    expect(incomeTax(2500000)).toBe(Math.floor(2500000 * 0.1 - 97500));
  });
  it('課税所得330万超〜695万 → 20%-427500', () => {
    expect(incomeTax(4000000)).toBe(Math.floor(4000000 * 0.2 - 427500));
  });
  it('課税所得695万超〜900万 → 23%-636000', () => {
    expect(incomeTax(8000000)).toBe(Math.floor(8000000 * 0.23 - 636000));
  });
  it('課税所得900万超〜1800万 → 33%-1536000', () => {
    expect(incomeTax(10000000)).toBe(Math.floor(10000000 * 0.33 - 1536000));
  });
  it('不正な入力 → 0', () => {
    expect(incomeTax(0)).toBe(0);
    expect(incomeTax(-1000000)).toBe(0);
    expect(incomeTax(NaN)).toBe(0);
  });
});

describe('residentTax(住民税)', () => {
  it('課税所得 × 10%', () => {
    expect(residentTax(1000000)).toBe(Math.floor(1000000 * 0.1));
    expect(residentTax(3000000)).toBe(Math.floor(3000000 * 0.1));
  });
  it('不正な入力 → 0', () => {
    expect(residentTax(0)).toBe(0);
    expect(residentTax(-1000000)).toBe(0);
    expect(residentTax(NaN)).toBe(0);
  });
});

describe('healthInsurance(健康保険料)', () => {
  it('標準報酬月額 × 4.95%', () => {
    expect(healthInsurance(300000)).toBe(Math.floor(300000 * 0.0495));
  });
  it('上限650,000円', () => {
    expect(healthInsurance(700000)).toBe(Math.floor(650000 * 0.0495));
    expect(healthInsurance(620000)).toBe(Math.floor(620000 * 0.0495));
  });
  it('不正な入力 → 0', () => {
    expect(healthInsurance(0)).toBe(0);
    expect(healthInsurance(-100000)).toBe(0);
    expect(healthInsurance(NaN)).toBe(0);
  });
});

describe('pensionInsurance(厚生年金保険料)', () => {
  it('標準報酬月額 × 9.15%', () => {
    expect(pensionInsurance(300000)).toBe(Math.floor(300000 * 0.0915));
  });
  it('上限650,000円', () => {
    expect(pensionInsurance(700000)).toBe(Math.floor(650000 * 0.0915));
  });
  it('不正な入力 → 0', () => {
    expect(pensionInsurance(0)).toBe(0);
    expect(pensionInsurance(-100000)).toBe(0);
    expect(pensionInsurance(NaN)).toBe(0);
  });
});

describe('employmentInsurance(雇用保険料)', () => {
  it('一般事業の賃金総額 × 0.5%', () => {
    expect(employmentInsurance(300000)).toBe(Math.floor(300000 * 0.005));
  });
  it('標準報酬月額の上限を使わない', () => {
    expect(employmentInsurance(500000)).toBe(Math.floor(500000 * 0.005));
  });
  it('不正な入力 → 0', () => {
    expect(employmentInsurance(0)).toBe(0);
    expect(employmentInsurance(-100000)).toBe(0);
    expect(employmentInsurance(NaN)).toBe(0);
  });
});

describe('socialInsuranceTotal(社会保険料合計)', () => {
  it('健康保険+厚生年金+雇用保険', () => {
    const result = socialInsuranceTotal(300000);
    expect(result.health).toBe(Math.floor(300000 * 0.0495));
    expect(result.pension).toBe(Math.floor(300000 * 0.0915));
    expect(result.employment).toBe(Math.floor(300000 * 0.005));
    expect(result.total).toBe(result.health + result.pension + result.employment + result.childcare);
  });
});

describe('takeHomePay(手取り精算)', () => {
  it('月収30万、標準報酬月額30万 → 手取り精算', () => {
    const result = takeHomePay(300000, { premiumBase: 300000 });
    expect(result.yearlyIncome).toBe(3600000);
    expect(result.salaryDeduction).toBe(Math.floor(3600000 * 0.3 + 80000));
    expect(result.taxableIncome).toBe(1560000);
    expect(result.socialInsurance.health).toBe(Math.floor(300000 * 0.0495));
    expect(result.socialInsurance.pension).toBe(Math.floor(300000 * 0.0915));
    expect(result.socialInsurance.employment).toBe(Math.floor(300000 * 0.005));
    expect(result.deduction).toBe(result.socialInsurance.total + result.incomeTax + result.residentTax);
    expect(result.takeHome).toBe(Math.floor(300000 - result.deduction));
  });
  it('月収0 → 全て0', () => {
    const result = takeHomePay(0);
    expect(result.takeHome).toBe(0);
    expect(result.deduction).toBe(0);
    expect(result.socialInsurance.total).toBe(0);
    expect(result.incomeTax).toBe(0);
    expect(result.residentTax).toBe(0);
  });
  it('月収25万（標準報酬月額省略）', () => {
    const result = takeHomePay(250000);
    expect(result.socialInsurance.total).toBe(socialInsuranceTotal(250000).total);
  });
});

describe('不正な入力は全て0を返す（ページ側で非表示にする）', () => {
  it('hourlyWage: 非数値の時給', () => {
    expect(hourlyWage(NaN, 8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 負の時給', () => {
    expect(hourlyWage(-1000, 8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 負の労働時間', () => {
    expect(hourlyWage(1000, -8)).toEqual({ pay: 0 });
  });
  it('hourlyWage: 空文字', () => {
    expect(hourlyWage('', '')).toEqual({ pay: 0 });
  });
  it('overtimePay: 非数値', () => {
    expect(overtimePay(NaN, 10, 1.25)).toEqual({ pay: 0 });
  });
  it('overtimePay: 負の残業時間', () => {
    expect(overtimePay(1000, -10, 1.25)).toEqual({ pay: 0 });
  });
  it('overtimePay: 不正な割増率（1未満）', () => {
    expect(overtimePay(1000, 10, 0)).toEqual({ pay: 0 });
  });
});
