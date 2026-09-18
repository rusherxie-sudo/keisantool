// 国税庁No.1140、生命保険文化センター新旧制度表（2026-09-18確認）。
// 入力は証明書の年間保険料（配当・割戻金控除後）、同じ区分を合算した整数円。
export const PREMIUM_FIELDS = ['generalNew', 'generalOld', 'medical', 'pensionNew', 'pensionOld'];
const validYen = (value) => Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000;

function deduction(premium, thresholds) {
  const [first, second, third, cap] = thresholds;
  if (premium <= first) return premium;
  if (premium <= second) return Math.ceil(premium / 2 + first / 2);
  if (premium <= third) return Math.ceil(premium / 4 + second / 4 + first / 2);
  return cap;
}

function selectDeduction(newAmount, oldAmount, cap) {
  const combined = Math.min(newAmount + oldAmount, cap);
  return { newAmount, oldAmount, combined, amount: Math.max(newAmount, oldAmount, combined) };
}

export function calculateLifeInsurance(input = {}) {
  const { year = 2026, under23Dependent = false } = input;
  if (year !== 2026 || typeof under23Dependent !== 'boolean') return null;
  const premiums = Object.fromEntries(PREMIUM_FIELDS.map((field) => [field, input[field] ?? 0]));
  if (!Object.values(premiums).every(validYen)) return null;
  const { generalNew, generalOld, medical, pensionNew, pensionOld } = premiums;
  const enhanced = under23Dependent && generalNew > 0;
  const incomeNew = [20000, 40000, 80000, 40000];
  const incomeOld = [25000, 50000, 100000, 50000];
  const residentNew = [12000, 32000, 56000, 28000];
  const residentOld = [15000, 40000, 70000, 35000];
  const income = {
    general: selectDeduction(deduction(generalNew, enhanced ? [30000, 60000, 120000, 60000] : incomeNew), deduction(generalOld, incomeOld), enhanced ? 60000 : 40000),
    medical: deduction(medical, incomeNew),
    pension: selectDeduction(deduction(pensionNew, incomeNew), deduction(pensionOld, incomeOld), 40000),
  };
  const resident = {
    general: selectDeduction(deduction(generalNew, residentNew), deduction(generalOld, residentOld), 28000),
    medical: deduction(medical, residentNew),
    pension: selectDeduction(deduction(pensionNew, residentNew), deduction(pensionOld, residentOld), 28000),
  };
  for (const [tax, cap] of [[income, 120000], [resident, 70000]]) {
    tax.subtotal = tax.general.amount + tax.medical + tax.pension.amount;
    tax.total = Math.min(tax.subtotal, cap);
  }
  return { year, residentYear: year + 1, premiums, enhanced, income, resident };
}
