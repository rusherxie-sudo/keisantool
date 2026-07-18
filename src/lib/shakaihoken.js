// 社会保険料の概算。加入支部・業種・賞与などで実額は変わる。
import {
  calculateEmployeeSocialInsurance,
  employeeChildcareSupport,
  employeeEmploymentInsurance,
  employeeHealthInsurance,
  employeeNursingInsurance,
  estimatePensionPremiumBase,
  pensionInsurance as employeePensionInsurance,
} from './japan-social-2026.js';

export const healthInsurance = employeeHealthInsurance;
export const pensionInsurance = employeePensionInsurance;
export const employmentInsurance = employeeEmploymentInsurance;
export const nursingInsurance = employeeNursingInsurance;
export { estimatePensionPremiumBase };
export const estimatePremiumBase = estimatePensionPremiumBase;

export function calcShakaihoken(monthlySalary, age) {
  const salary = Number(monthlySalary);
  if (!Number.isFinite(salary) || salary <= 0) {
    return { premiumBase: 0, health: 0, pension: 0, employment: 0, childcare: 0, nursing: 0, total: 0, yearlyTotal: 0 };
  }
  const result = calculateEmployeeSocialInsurance(salary, age);
  return {
    ...result,
    yearlyTotal: result.total * 12,
    rates: {
      health: 4.95, pension: 9.15, employment: 0.5,
      childcare: 0.115, nursing: Number(age) >= 40 && Number(age) < 65 ? 0.81 : 0,
    },
  };
}

export { employeeChildcareSupport };
