import { BONUS_RATES_2026, BONUS_OTSU_2026 } from '../data/bonus-rates-2026.js';

const isYen = (value) => Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000;

export function bonusRate2026(previousSalary, dependents, taxClass = 'kou') {
  if (!isYen(previousSalary) || !Number.isInteger(dependents) || dependents < 0 || dependents > 99
    || !['kou', 'otsu'].includes(taxClass)) return null;
  const column = Math.min(dependents, 7);
  const rows = taxClass === 'kou' ? BONUS_RATES_2026 : BONUS_OTSU_2026;
  return rows.findLast((row) => previousSalary >= (taxClass === 'kou' ? row.minimums[column] : row.minimum)).rateMilliPercent;
}

export function calculateBonus({ year = 2026, gross, socialInsurance, previousSalary, dependents = 0, taxClass = 'kou', otherDeductions = 0 } = {}) {
  if (year !== 2026) return { status: 'unsupported', message: '2026年（令和8年）支給分のみ対応しています。' };
  if (![gross, socialInsurance, previousSalary, otherDeductions].every(isYen)
    || socialInsurance > gross || otherDeductions > gross - socialInsurance) {
    return { status: 'invalid', message: '金額は0〜10億円の整数で入力し、控除額の合計は賞与額以下にしてください。' };
  }
  const rateMilliPercent = bonusRate2026(previousSalary, dependents, taxClass);
  if (rateMilliPercent === null) return { status: 'invalid', message: '扶養親族等の数と申告書の提出状況を確認してください。' };
  if (previousSalary === 0) return { status: 'unsupported', message: '前月の給与がない、または社会保険料等控除後が0円の場合は月額表による別計算が必要です。下の国税庁「No.2523」で計算方法をご確認ください。' };
  const taxableBonus = gross - socialInsurance;
  if (taxableBonus > previousSalary * 10) return { status: 'unsupported', message: '社会保険料等控除後の賞与が前月給与の10倍を超えています。賞与の計算期間に応じた月額表による別計算が必要です。下の国税庁「No.2523」をご確認ください。' };
  // 整数で計算し、税額の1円未満を切り捨てる。税率2.042%は2042/100000。
  const withholding = Math.floor(taxableBonus * rateMilliPercent / 100000);
  const takeHome = taxableBonus - withholding - otherDeductions;
  if (takeHome < 0) return { status: 'invalid', message: '税額とその他の控除額の合計が、社会保険料等控除後の賞与額を超えています。' };
  return { status: 'ok', gross, socialInsurance, taxableBonus, previousSalary, dependents, taxClass,
    otherDeductions, rate: rateMilliPercent / 1000, withholding, takeHome };
}
