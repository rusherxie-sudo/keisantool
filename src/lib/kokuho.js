// 2026年度（2025年所得）、通年加入・一般所得の国保概算。
// https://www.city.nerima.tokyo.jp/kurashi/nenkinhoken/kokuminkenkohoken/hoken_hokenryo/keisan_hoho.html
// https://www.city.osaka.lg.jp/fukushima/page/0000624311.html
// 所得割・均等割・平等割・限度額、未就学児・18歳未満の均等割軽減を反映。
import { salaryIncome } from './japan-tax-2026.js';
import { residentBasicDeduction } from './juminzei.js';
export const BASIC_DEDUCTION = 430000;
export const CITIES = [
  { key:'tokyo23', name:'練馬区', rates: {
    medical:{ incomeRate:0.0751, perCapita:47600, household:0, cap:670000 },
    support:{ incomeRate:0.028, perCapita:17600, household:0, cap:260000 },
    care:{ incomeRate:0.0243, perCapita:17800, household:0, cap:170000 },
    childcare:{ incomeRate:0.0027, perCapita:1873, household:0, cap:30000 },
  }},
  { key:'osaka', name:'大阪市', rates: {
    medical:{ incomeRate:0.095, perCapita:34990, household:33908, cap:660000 },
    support:{ incomeRate:0.0306, perCapita:11191, household:10845, cap:260000 },
    care:{ incomeRate:0.026, perCapita:18682, household:0, cap:170000 },
    childcare:{ incomeRate:0.0028, perCapita:1841, household:0, cap:30000 },
  }},
];

export function incomeFromSalary(salary) { return salaryIncome(salary, 2025); }

// 判定用所得（世帯主等を含む・年金特例調整済み）を別途用意した場合の補助関数。
export function reductionRate(income, members, salaryPensionEarners = 1) {
  const inc = Number(income);
  const n = Math.max(1, Math.floor(Number(members) || 1));
  if (!Number.isFinite(inc) || inc < 0) return 0;
  const threshold = 430000 + 100000 * Math.max(0, Math.floor(salaryPensionEarners) - 1);
  if (inc <= threshold) return 0.7;
  if (inc <= threshold + 310000 * n) return 0.5;
  if (inc <= threshold + 570000 * n) return 0.2;
  return 0;
}

// people: 国保加入者ごとの所得と年齢区分。ageGroup: preschool / child / adult / care / senior。
// reduction は通知書等で確認した軽減割合。未申告・世帯主の所得等が不明なため自動認定しない。
export function calcKokuho({ people = [], city = 'tokyo23', reduction = 0 }) {
  const selected = CITIES.find(c => c.key === city);
  if (!selected) throw new RangeError('対応する自治体を選んでください。');
  if (![0, 0.2, 0.5, 0.7].includes(reduction)) throw new RangeError('軽減区分を確認してください。');
  const members = people.map(person => {
    const income = Number(person.income);
    if (!Number.isFinite(income) || income < 0 || !['preschool','child','adult','care','senior'].includes(person.ageGroup)) {
      throw new RangeError('加入者の所得・年齢区分を確認してください。');
    }
    return { ...person, income, base:Math.max(0, income - residentBasicDeduction(income)) };
  });
  const result = { total:0, income:members.reduce((s,p) => s+p.income,0), taxableBase:members.reduce((s,p) => s+p.base,0), reduction };
  for (const key of ['medical','support','care','childcare']) {
    const rate = selected.rates[key];
    const eligible = key === 'care' ? members.filter(p => p.ageGroup === 'care') : members;
    const taxableBase = eligible.reduce((s,p) => s+p.base,0);
    const fixedUnits = eligible.reduce((s,p) => {
      if (key === 'childcare') return s + (['preschool','child'].includes(p.ageGroup) ? 0 : 1);
      return s + (p.ageGroup === 'preschool' ? 0.5 : 1);
    },0);
    const percentRemaining = 100 - Math.round(reduction * 100);
    const perCapita = Math.floor(rate.perCapita * fixedUnits * percentRemaining / 100);
    const household = eligible.length ? Math.floor(rate.household * percentRemaining / 100) : 0;
    const incomePart = Math.floor(taxableBase * Math.round(rate.incomeRate * 10000) / 10000);
    result[key] = Math.min(rate.cap, incomePart + perCapita + household);
    result[`${key}PerCapita`] = perCapita;
    result[`${key}Household`] = household;
    result.total += result[key];
  }
  return result;
}
