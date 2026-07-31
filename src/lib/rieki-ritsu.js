// 利润率、原价率与目标售价计算。金额统一向下舍去到整数日元。

function nonNegativeMoney(value) {
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

function signedMoney(value) {
  if (!Number.isFinite(value)) return null;
  return Math.floor(value);
}

function validRate(value) {
  return Number.isFinite(value) && value >= 0 && value < 100;
}

export function calculateGrossMargin(cost, salePrice, additionalCosts = 0, feeRate = 0) {
  const normalizedCost = nonNegativeMoney(cost);
  const normalizedSalePrice = nonNegativeMoney(salePrice);
  const normalizedAdditionalCosts = nonNegativeMoney(additionalCosts);
  if (
    normalizedCost == null ||
    normalizedSalePrice == null ||
    normalizedSalePrice <= 0 ||
    normalizedAdditionalCosts == null ||
    !validRate(feeRate)
  ) return null;

  const totalCost = normalizedCost + normalizedAdditionalCosts;
  const feeAmount = Math.floor(normalizedSalePrice * feeRate / 100);
  const grossProfit = Math.floor(normalizedSalePrice - totalCost - feeAmount);

  return {
    salePrice: normalizedSalePrice,
    cost: normalizedCost,
    additionalCosts: normalizedAdditionalCosts,
    totalCost,
    feeRate,
    feeAmount,
    grossProfit,
    grossMarginRate: grossProfit / normalizedSalePrice * 100,
    costRate: totalCost / normalizedSalePrice * 100,
    markupRate: totalCost === 0 ? null : grossProfit / totalCost * 100,
  };
}

export function priceForTargetMargin(cost, targetMarginRate, additionalCosts = 0, feeRate = 0) {
  const normalizedCost = nonNegativeMoney(cost);
  const normalizedAdditionalCosts = nonNegativeMoney(additionalCosts);
  if (
    normalizedCost == null ||
    normalizedAdditionalCosts == null ||
    !validRate(targetMarginRate) ||
    !validRate(feeRate) ||
    targetMarginRate + feeRate >= 100
  ) return null;

  const totalCost = normalizedCost + normalizedAdditionalCosts;
  const denominator = 1 - (targetMarginRate + feeRate) / 100;
  const salePrice = Math.floor(totalCost / denominator);
  const feeAmount = Math.floor(salePrice * feeRate / 100);
  const grossProfit = Math.floor(salePrice - totalCost - feeAmount);

  return {
    salePrice,
    cost: normalizedCost,
    additionalCosts: normalizedAdditionalCosts,
    totalCost,
    feeRate,
    feeAmount,
    grossProfit,
    targetMarginRate,
    achievedMarginRate: salePrice === 0 ? null : grossProfit / salePrice * 100,
  };
}

export function calculateSalesProfitMargin(sales, profit) {
  const normalizedSales = nonNegativeMoney(sales);
  const normalizedProfit = signedMoney(profit);
  if (normalizedSales == null || normalizedSales <= 0 || normalizedProfit == null) return null;

  return {
    sales: normalizedSales,
    profit: normalizedProfit,
    profitMarginRate: normalizedProfit / normalizedSales * 100,
  };
}
