// 令和8年度の被用者保険概算ルール。
// 健康保険は加入支部により異なるため、ここでは全国平均9.90%の折半額を使う。
// 出典: 協会けんぽ・日本年金機構・厚生労働省の令和8年度保険料率表。

const PENSION_BRACKETS = [
  [93000, 88000], [101000, 98000], [107000, 104000], [114000, 110000],
  [122000, 118000], [130000, 126000], [138000, 134000], [146000, 142000],
  [155000, 150000], [165000, 160000], [175000, 170000], [185000, 180000],
  [195000, 190000], [210000, 200000], [230000, 220000], [250000, 240000],
  [270000, 260000], [290000, 280000], [310000, 300000], [330000, 320000],
  [350000, 340000], [370000, 360000], [395000, 380000], [425000, 410000],
  [455000, 440000], [485000, 470000], [515000, 500000], [545000, 530000],
  [575000, 560000], [605000, 590000], [635000, 620000], [Infinity, 650000],
];

export function estimatePensionPremiumBase(monthlyRemuneration) {
  const amount = Number(monthlyRemuneration);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return PENSION_BRACKETS.find(([upper]) => amount < upper)?.[1] ?? 650000;
}

export function employeeHealthInsurance(monthlyRemuneration) {
  const base = estimatePensionPremiumBase(monthlyRemuneration);
  return Math.floor(base * 0.0495);
}

export function pensionInsurance(monthlyRemuneration) {
  return Math.floor(estimatePensionPremiumBase(monthlyRemuneration) * 0.0915);
}

export function employeeEmploymentInsurance(monthlyWage) {
  const amount = Number(monthlyWage);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.floor(amount * 0.005);
}

export function employeeChildcareSupport(monthlyRemuneration) {
  return Math.floor(estimatePensionPremiumBase(monthlyRemuneration) * 0.00115);
}

export function employeeNursingInsurance(monthlyRemuneration, age) {
  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge) || parsedAge < 40 || parsedAge >= 65) return 0;
  return Math.floor(estimatePensionPremiumBase(monthlyRemuneration) * 0.0081);
}

export function calculateEmployeeSocialInsurance(monthlyRemuneration, age) {
  const premiumBase = estimatePensionPremiumBase(monthlyRemuneration);
  const health = employeeHealthInsurance(monthlyRemuneration);
  const pension = pensionInsurance(monthlyRemuneration);
  const employment = employeeEmploymentInsurance(monthlyRemuneration);
  const childcare = employeeChildcareSupport(monthlyRemuneration);
  const nursing = employeeNursingInsurance(monthlyRemuneration, age);
  return { premiumBase, health, pension, employment, childcare, nursing, total: health + pension + employment + childcare + nursing };
}
