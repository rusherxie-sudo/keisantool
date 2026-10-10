// 育児休業給付金・支給日数30日の比較。切替を含む期間・資格判定は対象外。
// 厚労省「育児休業等給付の内容と支給申請手続」令和8年8月版 p16。
// https://www.mhlw.go.jp/content/11600000/001461102.pdf
export const IKUKYU_DAILY_CAP = 16540;
export const IKUKYU_DAILY_FLOOR = 3061;
export const clampIkujiDaily = (daily) => Math.min(IKUKYU_DAILY_CAP, Math.max(IKUKYU_DAILY_FLOOR, daily));

export function calcIkuji({ sixMonthWages, leaveWages = 0 } = {}) {
  const wages = Number(sixMonthWages);
  const paid = Number(leaveWages);
  if (!Number.isFinite(wages) || wages <= 0 || !Number.isFinite(paid) || paid < 0) return null;
  const rawDailyWage = Math.floor(wages / 180);
  const dailyWage = clampIkujiDaily(rawDailyWage);
  const base = dailyWage * 30;
  const payment = (percent) => Math.max(0, Math.floor(Math.min(base * percent / 100, base * 80 / 100 - paid)));
  return { rawDailyWage, dailyWage, base, amount67: payment(67), amount50: payment(50) };
}
