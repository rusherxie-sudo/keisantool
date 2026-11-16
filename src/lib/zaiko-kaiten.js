export function calculateInventoryTurnover({ cost, opening, closing, days }) {
  if (![cost, opening, closing, days].every(Number.isFinite) || cost < 0 || opening < 0 || closing < 0 || days <= 0) return null;
  const average = opening / 2 + closing / 2;
  if (average === 0) return null;
  const turnover = cost / average;
  const turnoverDays = turnover === 0 ? null : days / turnover;
  if (!Number.isFinite(turnover) || (turnoverDays !== null && !Number.isFinite(turnoverDays))) return null;
  return { average, turnover, turnoverDays };
}
