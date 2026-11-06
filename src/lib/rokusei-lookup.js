import { rokusei, unmeiNumber, fortuneZone, fortuneTypes } from './rokusei.js';

export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
export function calculationSteps(year, month, day) {
  const number = unmeiNumber(year, month);
  const person = rokusei(year, month, day);
  if (number === null || !person) return null;
  const raw = number - 1 + day;
  return { ...person, number, raw, starNumber: ((raw - 1) % 60) + 1, wrapped: raw > 60 };
}
export function birthYearTable(year) {
  if (unmeiNumber(year, 1) === null) return [];
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, number: unmeiNumber(year, i + 1) }));
}
// Query years are inclusive; periods keep the full three years even at a clipped edge.
export function daisakkaiRange(type, from, to) {
  if (![from,to].every(Number.isInteger) || from < 1900 || to > 2099 || from > to || !fortuneZone(type, from)) return null;
  const years = Array.from({ length: to - from + 1 }, (_, i) => ({ year: from + i, ...fortuneZone(type, from + i) }));
  const periods = [];
  for (let y = from - 2; y <= to; y++) {
    if (fortuneZone(type, y).zone === '陰影' && y + 2 >= from) {
      periods.push({ startYear: y, endYear: y + 2, seedYear: y + 3, clipped: y < from || y + 2 > to });
    }
  }
  return { type, from, to, years, periods };
}
// One direction only: the column is the partner's birth-year branch, NOT their star.
// Public worked example: 1956-04-12 木星人＋ -> 子 = 安定.
// https://www.senjutsu.jp/labo_6sei/aishou
export function chiun(type, branch) {
  const i = BRANCHES.indexOf(branch);
  if (i < 0) return null;
  return fortuneZone(type, 2008 + i); // 2008 = 子; only the branch enters the cycle.
}
export function chiunTable() {
  return fortuneTypes().map((row) => ({ ...row, cells: BRANCHES.map((branch) => ({ branch, ...chiun(row.type, branch) })) }));
}
