// 令和8年度（令和7年所得）の給与所得者向け個人住民税概算。
// 標準税率・標準的な非課税限度額を使い、自治体独自の超過課税等は含めない。
// 金額の端数は Math.floor で切り捨てる。
import { salaryDeduction, salaryIncome } from './japan-tax-2026.js';

export { salaryDeduction };

const nonNegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const count = (value) => Math.floor(nonNegative(value));
const floorTo100 = (value) => Math.max(0, Math.floor(nonNegative(value) / 100) * 100);

export function residentBasicDeduction(totalIncome) {
  const income = nonNegative(totalIncome);
  if (income <= 24000000) return 430000;
  if (income <= 24500000) return 290000;
  if (income <= 25000000) return 150000;
  return 0;
}

function taxpayerTier(taxpayerIncome) {
  const income = nonNegative(taxpayerIncome);
  if (income <= 9000000) return 0;
  if (income <= 9500000) return 1;
  if (income <= 10000000) return 2;
  return -1;
}

export function spouseIncomeDeduction(taxpayerIncome, spouseIncome) {
  const spouse = nonNegative(spouseIncome);
  const tier = taxpayerTier(taxpayerIncome);
  if (tier < 0 || spouse > 580000) return 0;
  return [330000, 220000, 110000][tier];
}

export function spouseSpecialIncomeDeduction(taxpayerIncome, spouseIncome) {
  const spouse = nonNegative(spouseIncome);
  const tier = taxpayerTier(taxpayerIncome);
  if (tier < 0 || spouse <= 580000 || spouse > 1330000) return 0;

  const rows = [
    [1000000, [330000, 220000, 110000]],
    [1050000, [310000, 210000, 110000]],
    [1100000, [260000, 180000, 90000]],
    [1150000, [210000, 140000, 70000]],
    [1200000, [160000, 110000, 60000]],
    [1250000, [110000, 80000, 40000]],
    [1300000, [60000, 40000, 20000]],
    [1330000, [30000, 20000, 10000]],
  ];
  return rows.find(([upper]) => spouse <= upper)?.[1][tier] ?? 0;
}

export function dependentDeduction(age) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < 16) return 0;
  if (years < 19) return 330000;
  if (years < 23) return 450000;
  if (years < 70) return 330000;
  return 380000;
}

export function equalLevyExemptLimit(qualifyingFamilyCount = 0) {
  const family = count(qualifyingFamilyCount);
  return family === 0 ? 450000 : 350000 * (family + 1) + 310000;
}

export function incomeLevyExemptLimit(qualifyingFamilyCount = 0) {
  const family = count(qualifyingFamilyCount);
  return family === 0 ? 450000 : 350000 * (family + 1) + 420000;
}

function adjustmentCreditParts(taxableIncome, humanDeductionDifference, totalIncome) {
  if (taxableIncome <= 0 || totalIncome > 25000000) {
    return { prefectural: 0, municipal: 0, total: 0 };
  }

  let basis;
  if (taxableIncome <= 2000000) {
    basis = Math.min(humanDeductionDifference, taxableIncome);
  } else {
    basis = Math.max(50000, humanDeductionDifference - (taxableIncome - 2000000));
  }

  const prefectural = Math.floor(basis * 0.02);
  const municipal = Math.floor(basis * 0.03);
  return { prefectural, municipal, total: prefectural + municipal };
}

function emptyResult() {
  return {
    yearlySalary: 0,
    salaryIncome: 0,
    salaryDeduction: 0,
    socialInsuranceDeduction: 0,
    socialInsuranceEstimated: false,
    basicDeduction: 0,
    spouseDeduction: 0,
    spouseSpecialDeduction: 0,
    dependentDeduction: 0,
    otherDeductions: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    adjustmentCredit: 0,
    prefecturalIncomeLevy: 0,
    municipalIncomeLevy: 0,
    incomeLevy: 0,
    equalLevy: 0,
    forestEnvironmentTax: 0,
    prefecturalTax: 0,
    municipalTax: 0,
    residentTax: 0,
    monthlyEstimate: 0,
    monthlyTax: 0,
    isEqualLevyExempt: true,
    isIncomeLevyExempt: true,
  };
}

export function calcJuminzei(yearlySalary, options = {}) {
  const salary = Number(yearlySalary);
  if (!Number.isFinite(salary) || salary <= 0) return emptyResult();

  const employmentIncome = salaryIncome(salary);
  const explicitSocialInsurance = Number(options.socialInsurance);
  const usesExplicitSocialInsurance = Number.isFinite(explicitSocialInsurance) && explicitSocialInsurance >= 0;
  const socialInsurance = usesExplicitSocialInsurance
    ? Math.floor(explicitSocialInsurance)
    : Math.floor(salary * 0.15);
  const spouseIncome = nonNegative(options.spouseIncome);
  const hasSpouse = options.hasSpouse === true;
  const ordinarySpouseDeduction = hasSpouse
    ? spouseIncomeDeduction(employmentIncome, spouseIncome)
    : 0;
  const specialSpouseDeduction = hasSpouse
    ? spouseSpecialIncomeDeduction(employmentIncome, spouseIncome)
    : 0;

  const under16 = count(options.under16Dependents);
  const general = count(options.generalDependents);
  const special = count(options.specialDependents);
  const elderly = count(options.elderlyDependents);
  const dependentDeductionTotal = general * 330000 + special * 450000 + elderly * 380000;
  const otherDeductions = Math.floor(nonNegative(options.otherDeductions));
  const basic = residentBasicDeduction(employmentIncome);
  const totalDeductions = socialInsurance + basic + ordinarySpouseDeduction
    + specialSpouseDeduction + dependentDeductionTotal + otherDeductions;
  const taxableIncome = Math.max(0, Math.floor((employmentIncome - totalDeductions) / 1000) * 1000);

  const spouseForExemption = hasSpouse && spouseIncome <= 580000 ? 1 : 0;
  const qualifyingFamilyCount = spouseForExemption + under16 + general + special + elderly;
  const isEqualLevyExempt = employmentIncome <= equalLevyExemptLimit(qualifyingFamilyCount);
  const isIncomeLevyExempt = employmentIncome <= incomeLevyExemptLimit(qualifyingFamilyCount);

  // 調整控除の人的控除差。基礎控除5万円、配偶者控除2〜5万円、
  // 一般扶養5万円、特定扶養18万円、老人扶養10万円を反映する。
  const spouseDifference = ordinarySpouseDeduction > 0
    ? [50000, 40000, 20000][taxpayerTier(employmentIncome)]
    : 0;
  const humanDeductionDifference = (basic > 0 ? 50000 : 0) + spouseDifference
    + general * 50000 + special * 180000 + elderly * 100000;
  const adjustment = isIncomeLevyExempt
    ? { prefectural: 0, municipal: 0, total: 0 }
    : adjustmentCreditParts(taxableIncome, humanDeductionDifference, employmentIncome);

  const prefecturalIncomeLevy = isIncomeLevyExempt
    ? 0
    : floorTo100(taxableIncome * 0.04 - adjustment.prefectural);
  const municipalIncomeLevy = isIncomeLevyExempt
    ? 0
    : floorTo100(taxableIncome * 0.06 - adjustment.municipal);
  const incomeLevy = prefecturalIncomeLevy + municipalIncomeLevy;
  const equalLevy = isEqualLevyExempt ? 0 : 4000;
  const forestEnvironmentTax = isEqualLevyExempt ? 0 : 1000;
  const prefecturalTax = prefecturalIncomeLevy + (isEqualLevyExempt ? 0 : 1000);
  const municipalTax = municipalIncomeLevy + (isEqualLevyExempt ? 0 : 3000);
  const residentTax = prefecturalTax + municipalTax + forestEnvironmentTax;

  return {
    yearlySalary: Math.floor(salary),
    salaryIncome: employmentIncome,
    salaryDeduction: salaryDeduction(salary),
    socialInsuranceDeduction: socialInsurance,
    socialInsuranceEstimated: !usesExplicitSocialInsurance,
    basicDeduction: basic,
    spouseDeduction: ordinarySpouseDeduction,
    spouseSpecialDeduction: specialSpouseDeduction,
    dependentDeduction: dependentDeductionTotal,
    otherDeductions,
    totalDeductions: Math.floor(totalDeductions),
    taxableIncome,
    adjustmentCredit: adjustment.total,
    prefecturalIncomeLevy,
    municipalIncomeLevy,
    incomeLevy,
    equalLevy,
    forestEnvironmentTax,
    prefecturalTax,
    municipalTax,
    residentTax,
    monthlyEstimate: Math.floor(residentTax / 12),
    monthlyTax: Math.floor(residentTax / 12),
    isEqualLevyExempt,
    isIncomeLevyExempt,
    rates: { prefectural: 4, municipal: 6, total: 10 },
    qualifyingFamilyCount,
  };
}
