// 令和7年度税制改正後（令和7・8年分）の給与所得者向け所得税共通ルール。
// 出典: 国税庁「令和7年度税制改正による所得税の基礎控除の見直し等について」。
// 各ツールが独自に税率・控除表を持たないよう、このファイルを唯一の実装にする。

export function salaryDeduction(salary) {
  const amount = Number(salary);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount <= 1625000) return 650000;
  if (amount <= 1800000) return Math.floor(amount * 0.4 - 100000);
  if (amount <= 1900000) return Math.floor(amount * 0.3 + 80000);
  if (amount <= 3600000) return Math.floor(amount * 0.3 + 80000);
  if (amount <= 6600000) return Math.floor(amount * 0.2 + 440000);
  if (amount <= 8500000) return Math.floor(amount * 0.1 + 1100000);
  return 1950000;
}

// 令和7・8年分。引数は給与所得控除後などの「合計所得金額」。
export function basicDeduction(totalIncome) {
  const amount = Number(totalIncome);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  if (amount <= 1320000) return 950000;
  if (amount <= 3360000) return 880000;
  if (amount <= 4890000) return 680000;
  if (amount <= 6550000) return 630000;
  if (amount <= 23500000) return 580000;
  if (amount <= 24000000) return 480000;
  if (amount <= 24500000) return 320000;
  if (amount <= 25000000) return 160000;
  return 0;
}

export function incomeTaxBeforeSurtax(taxableIncome) {
  const amount = Number(taxableIncome);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount <= 1950000) return Math.floor(amount * 0.05);
  if (amount <= 3300000) return Math.floor(amount * 0.1 - 97500);
  if (amount <= 6950000) return Math.floor(amount * 0.2 - 427500);
  if (amount <= 9000000) return Math.floor(amount * 0.23 - 636000);
  if (amount <= 18000000) return Math.floor(amount * 0.33 - 1536000);
  if (amount <= 40000000) return Math.floor(amount * 0.4 - 2796000);
  return Math.floor(amount * 0.45 - 4796000);
}

export function incomeTaxWithSurtax(taxableIncome) {
  return Math.floor(incomeTaxBeforeSurtax(taxableIncome) * 1.021);
}

// 給与収入から、給与所得控除・基礎控除・利用者入力の所得控除を反映した課税所得を返す。
// 課税所得は所得税法の計算に合わせて1,000円未満を切り捨てる。
export function taxableIncomeFromSalary(yearlySalary, additionalDeductions = 0) {
  const salary = Number(yearlySalary);
  const extra = Number(additionalDeductions);
  if (!Number.isFinite(salary) || salary <= 0) return 0;
  const salaryIncome = Math.max(0, salary - salaryDeduction(salary));
  const deductions = basicDeduction(salaryIncome) + (Number.isFinite(extra) && extra > 0 ? extra : 0);
  return Math.max(0, Math.floor((salaryIncome - deductions) / 1000) * 1000);
}
