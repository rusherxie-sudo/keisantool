// ふるさと納税の控除上限額・控除内訳の概算（2026年分／令和8年度）。
// 根拠：国税庁 No.1155「ふるさと納税(寄附金控除)」＝(寄附−2,000)が控除対象、
// 所得税＝所得控除×所得税率(総所得等40%上限)、住民税基本分＝(寄附−2,000)×10%(30%上限)、
// 住民税特例分＝(寄附−2,000)×(100%−10%−所得税率)、所得割額20%限度。
// 総務省ふるさと納税ポータル：令和19年中の寄附までは所得税率に復興特別所得税を加算。
// 課税所得・住民税所得割額は既存の japan-tax-2026.js / juminzei.js を唯一の計算源として再利用する。
import { salaryIncome, taxableIncomeFromSalary, incomeTaxWithSurtax } from './japan-tax-2026.js';
import {
  calcJuminzei,
  spouseIncomeDeduction,
  spouseSpecialIncomeDeduction,
  dependentDeduction,
} from './juminzei.js';

const DONATION_YEAR = 2026;
const RESIDENT_YEAR = 2025; // 令和8年度住民税は2025年所得
const RECONSTRUCTION_RATE = 1.021; // 復興特別所得税 2.1%

const nonNegativeInt = (value) => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
};

// 課税所得から所得税率（復興特別所得税込みの実効税率）を求める。
export function incomeTaxRateForTaxableIncome(taxableIncome) {
  const amount = Number(taxableIncome);
  let baseRate = 0;
  if (amount > 1950000) baseRate = 0.05;
  if (amount > 3300000) baseRate = 0.10;
  if (amount > 6950000) baseRate = 0.20;
  if (amount > 9000000) baseRate = 0.23;
  if (amount > 18000000) baseRate = 0.33;
  if (amount > 40000000) baseRate = 0.40;
  return { base: baseRate, effective: baseRate * RECONSTRUCTION_RATE };
}

function deductionParts(employmentIncome, options) {
  const social = options.socialInsurance;
  const spouseIncome = options.spouseIncome;
  const ordinarySpouse = options.hasSpouse ? spouseIncomeDeduction(employmentIncome, spouseIncome) : 0;
  const specialSpouse = options.hasSpouse ? spouseSpecialIncomeDeduction(employmentIncome, spouseIncome) : 0;
  const general = options.generalDependents * 330000;
  const special = options.specialDependents * 450000;
  const elderly = options.elderlyDependents * 380000;
  // 16歳未満は所得税・住民税とも扶養控除なし（非課税限度額の人数には効くが上限額にはほぼ影響しない）。
  return {
    social,
    spouse: ordinarySpouse + specialSpouse,
    dependents: general + special + elderly,
    other: options.otherDeductions,
    total: social + ordinarySpouse + specialSpouse + general + special + elderly + options.otherDeductions,
  };
}

function invalid(message) {
  return { status: 'invalid', message };
}

export function calcFurusato(input = {}) {
  const yearlySalary = nonNegativeInt(input.yearlySalary);
  if (yearlySalary === null || yearlySalary === 0) return invalid('給与年収は0以上の整数で入力してください。');

  const defaults = {
    socialInsurance: null,
    hasSpouse: false,
    spouseIncome: 0,
    generalDependents: 0,
    specialDependents: 0,
    elderlyDependents: 0,
    otherDeductions: 0,
    donation: 0,
  };
  const raw = { ...defaults, ...input, yearlySalary };
  const socialInsurance = raw.socialInsurance === null || raw.socialInsurance === ''
    ? Math.floor(yearlySalary * 0.15)
    : nonNegativeInt(raw.socialInsurance);
  if (socialInsurance === null) return invalid('社会保険料は0以上の整数で入力してください。');
  const spouseIncome = nonNegativeInt(raw.spouseIncome);
  const otherDeductions = nonNegativeInt(raw.otherDeductions);
  const donation = nonNegativeInt(raw.donation);
  const counts = [raw.generalDependents, raw.specialDependents, raw.elderlyDependents].map(nonNegativeInt);
  if (spouseIncome === null || otherDeductions === null || donation === null || counts.some((c) => c === null)) {
    return invalid('金額・人数は0以上の整数で入力してください。');
  }
  const options = {
    socialInsurance,
    hasSpouse: raw.hasSpouse === true,
    spouseIncome,
    generalDependents: counts[0],
    specialDependents: counts[1],
    elderlyDependents: counts[2],
    otherDeductions,
  };

  // 所得税側（寄附を行った年＝2026年分）
  const employmentIncome = salaryIncome(yearlySalary, DONATION_YEAR);
  const incomeDeductions = deductionParts(employmentIncome, options);
  const taxableIncome = taxableIncomeFromSalary(yearlySalary, incomeDeductions.total, DONATION_YEAR);
  const rate = incomeTaxRateForTaxableIncome(taxableIncome);
  const incomeTaxDue = incomeTaxWithSurtax(taxableIncome);

  // 住民税側（令和8年度＝2025年所得）
  const resident = calcJuminzei(yearlySalary, options);
  const residentEmploymentIncome = salaryIncome(yearlySalary, RESIDENT_YEAR);
  const residentIncomeLevy = resident.incomeLevy;

  // 3つの上限。どれか最初に効くものが実質の限度額。
  const incomeTax40Cap = 2000 + residentEmploymentIncome * 0.40; // 所得税の所得控除は総所得等40%まで
  const residentBasic30Cap = 2000 + residentEmploymentIncome * 0.30; // 住民税基本分は総所得等30%まで
  const specialDenominator = 0.90 - rate.effective;
  const special20Cap = 2000 + (residentIncomeLevy * 0.20) / specialDenominator;
  const incomeTaxDueCap = rate.effective > 0 ? 2000 + incomeTaxDue / rate.effective : Infinity;
  const candidates = [
    { key: 'incomeTax40', value: incomeTax40Cap, label: '所得税の所得控除（総所得金額等の40%）' },
    { key: 'residentBasic30', value: residentBasic30Cap, label: '住民税基本分（総所得金額等の30%）' },
    { key: 'special20', value: special20Cap, label: '住民税特例分（所得割額の20%）' },
    { key: 'incomeTaxDue', value: incomeTaxDueCap, label: '所得税額（還付される税額の範囲）' },
  ];
  const binding = candidates.reduce((a, b) => (b.value < a.value ? b : a));
  const maxDonation = Math.max(2000, Math.floor(binding.value));

  // 指定寄附額での控除内訳。
  function breakdown(d) {
    const base = Math.max(0, d - 2000);
    const incomeTaxDeduction = base * rate.effective;
    const residentBasic = base * 0.10;
    const residentSpecial = base * (specialDenominator);
    const rawTotal = incomeTaxDeduction + residentBasic + residentSpecial;
    // 各上限を適用（通常は	maxDonation 内なら抵触しない）。
    const cappedIncome = Math.min(incomeTaxDeduction, incomeTaxDue, residentEmploymentIncome * 0.40 * rate.effective);
    const cappedBasic = Math.min(residentBasic, residentEmploymentIncome * 0.30);
    const cappedSpecial = Math.min(residentSpecial, residentIncomeLevy * 0.20);
    const totalDeduction = cappedIncome + cappedBasic + cappedSpecial;
    return {
      donation: d,
      incomeTaxDeduction: cappedIncome,
      residentBasic: cappedBasic,
      residentSpecial: cappedSpecial,
      totalDeduction,
      selfCost: d - totalDeduction,
      uncappedTotal: rawTotal,
    };
  }

  return {
    status: 'ok',
    yearlySalary,
    employmentIncome,
    residentEmploymentIncome,
    incomeDeductions,
    taxableIncome,
    incomeTaxRate: rate.effective,
    incomeTaxRateBase: rate.base,
    incomeTaxDue,
    residentIncomeLevy,
    residentTax: resident.residentTax,
    limits: {
      incomeTax40: incomeTax40Cap,
      residentBasic30: residentBasic30Cap,
      special20: special20Cap,
      incomeTaxDue: incomeTaxDueCap,
      max: maxDonation,
      binding: binding.key,
      bindingLabel: binding.label,
    },
    atLimit: breakdown(maxDonation),
    atDonation: breakdown(donation),
    socialInsuranceEstimated: raw.socialInsurance === null || raw.socialInsurance === '',
  };
}
