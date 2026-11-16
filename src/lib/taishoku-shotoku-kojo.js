export function calculateRetirementDeduction(years, disability) {
  if (!Number.isSafeInteger(years) || years <= 0) return null;
  const amount = (years <= 20 ? Math.max(800000, 400000 * years) : 8000000 + 700000 * (years - 20)) + (disability ? 1000000 : 0);
  return Number.isSafeInteger(amount) ? amount : null;
}
