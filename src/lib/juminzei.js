// 住民税計算ロジック（純関数・DOM非依存）。
// 都道府県民税（6%）と市町村民税（4%）の合計10%を基に計算。
// 金額の端数は全て切り捨て（Math.floor）。

// 給与所得控除（令和7年税制改正後）
export function salaryDeduction(salary) {
  const s = Number(salary);
  if (!Number.isFinite(s) || s <= 0) return 0;
  if (s <= 1900000) return 650000;
  if (s <= 3600000) return Math.floor(s * 0.3 + 80000);
  if (s <= 6600000) return Math.floor(s * 0.2 + 440000);
  if (s <= 8500000) return Math.floor(s * 0.1 + 1100000);
  return 1950000;
}

// 基礎控除（全員適用）
export function basicDeduction() {
  return 430000;
}

// 配偶者控除
export function spouseDeduction(spouseIncome) {
  const s = Number(spouseIncome);
  if (!Number.isFinite(s) || s < 0) return 0;
  if (s <= 380000) return 380000;
  if (s <= 980000) return Math.floor(760000 - s);
  return 0;
}

// 配偶者特別控除
export function spouseSpecialDeduction(spouseIncome) {
  const s = Number(spouseIncome);
  if (!Number.isFinite(s) || s < 0) return 0;
  if (s <= 150000) return 250000;
  if (s <= 450000) return Math.floor(400000 - s);
  return 0;
}

// 扶養控除（一人あたり）
export function dependentDeduction(dependentIncome, age) {
  const i = Number(dependentIncome);
  const a = Number(age);
  if (!Number.isFinite(i) || i < 0 || !Number.isFinite(a) || a < 0) return 0;
  
  if (i > 980000) return 0;
  
  if (a >= 70) return 480000;
  if (a >= 16) return 380000;
  return 330000;
}

// 障害者控除
export function disabilityDeduction(level) {
  if (level === 1) return 270000;
  if (level === 2) return 130000;
  return 0;
}

// 寡婦・寡夫控除
export function widowDeduction() {
  return 270000;
}

// 勤労学生控除
export function workingStudentDeduction() {
  return 380000;
}

// 住民税計算（都道府県民税 + 市町村民税）
export function residentTax(taxableIncome) {
  const i = Number(taxableIncome);
  if (!Number.isFinite(i) || i <= 0) return 0;
  return Math.floor(i * 0.1);
}

// 都道府県民税のみ
export function prefecturalTax(taxableIncome) {
  const i = Number(taxableIncome);
  if (!Number.isFinite(i) || i <= 0) return 0;
  return Math.floor(i * 0.06);
}

// 市町村民税のみ
export function municipalTax(taxableIncome) {
  const i = Number(taxableIncome);
  if (!Number.isFinite(i) || i <= 0) return 0;
  return Math.floor(i * 0.04);
}

// 住民税精算
export function calcJuminzei(yearlySalary, options = {}) {
  const s = Number(yearlySalary);
  if (!Number.isFinite(s) || s <= 0) {
    return { yearlySalary: 0, taxableIncome: 0, residentTax: 0, prefecturalTax: 0, municipalTax: 0, monthlyTax: 0 };
  }
  
  let totalDeductions = salaryDeduction(s);
  totalDeductions += basicDeduction();
  totalDeductions += spouseDeduction(options.spouseIncome || 0);
  totalDeductions += spouseSpecialDeduction(options.spouseIncome || 0);
  totalDeductions += (options.dependents || []).reduce((sum, d) => {
    return sum + dependentDeduction(d.income || 0, d.age || 0);
  }, 0);
  totalDeductions += disabilityDeduction(options.disabilityLevel || 0);
  totalDeductions += options.isWidow ? widowDeduction() : 0;
  totalDeductions += options.isWorkingStudent ? workingStudentDeduction() : 0;
  
  const taxableIncome = Math.max(0, s - totalDeductions);
  const prefTax = prefecturalTax(taxableIncome);
  const munTax = municipalTax(taxableIncome);
  const total = prefTax + munTax;
  
  return {
    yearlySalary: Math.floor(s),
    salaryDeduction: salaryDeduction(s),
    basicDeduction: basicDeduction(),
    spouseDeduction: spouseDeduction(options.spouseIncome || 0),
    spouseSpecialDeduction: spouseSpecialDeduction(options.spouseIncome || 0),
    totalDeductions: Math.floor(totalDeductions),
    taxableIncome: Math.floor(taxableIncome),
    prefecturalTax: prefTax,
    municipalTax: munTax,
    residentTax: total,
    monthlyTax: Math.floor(total / 12),
    rates: {
      prefectural: 6,
      municipal: 4,
      total: 10,
    },
  };
}