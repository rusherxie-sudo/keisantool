const ZERO_RESULT = Object.freeze({
  wageDaily: 0,
  benefitDaily: 0,
  benefit28Days: 0,
  prescribedDays: 0,
  totalBenefit: 0,
});

const AGE_LIMITS = [
  { maxAge: 29, wageMax: 14_900, benefitMax: 7_450 },
  { maxAge: 44, wageMax: 16_540, benefitMax: 8_270 },
  { maxAge: 59, wageMax: 18_220, benefitMax: 9_110 },
  { maxAge: 64, wageMax: 17_400, benefitMax: 7_830 },
];

function companyDaysByAge(age, years) {
  if (years < 1) return 90;
  const band = years < 5 ? 0 : years < 10 ? 1 : years < 20 ? 2 : 3;
  if (age < 30) return [90, 120, 180, 180][band];
  if (age < 35) return [120, 180, 210, 240][band];
  if (age < 45) return [150, 180, 240, 270][band];
  if (age < 60) return [180, 240, 270, 330][band];
  return [150, 180, 210, 240][band];
}

export function prescribedBenefitDays(ageInput, insuredYearsInput, reason = 'ordinary') {
  const age = Number(ageInput);
  const years = Number(insuredYearsInput);
  if (!Number.isFinite(age) || !Number.isFinite(years) || age < 18 || age > 64 || years < 0) return 0;

  if (reason === 'company') return companyDaysByAge(age, years);
  if (reason !== 'ordinary' || years < 1) return 0;
  if (years < 10) return 90;
  if (years < 20) return 120;
  return 150;
}

function calculateBenefitDaily(age, wageDaily, benefitMax) {
  let amount;
  if (wageDaily < 5_480) {
    amount = wageDaily * 0.8;
  } else if (age >= 60 && wageDaily <= 12_120) {
    const declining = 0.8 * wageDaily - 0.35 * ((wageDaily - 5_480) / 6_640) * wageDaily;
    const alternate = 0.05 * wageDaily + 4_848;
    amount = Math.min(declining, alternate);
  } else if (age < 60 && wageDaily <= 13_490) {
    amount = 0.8 * wageDaily - 0.3 * ((wageDaily - 5_480) / 8_010) * wageDaily;
  } else {
    amount = wageDaily * (age >= 60 ? 0.45 : 0.5);
  }
  return Math.min(benefitMax, Math.max(2_562, Math.floor(amount)));
}

export function calculateShitsugyouTeate({ age: ageInput, wages6Months: wagesInput, insuredYears: yearsInput, reason = 'ordinary' } = {}) {
  const age = Number(ageInput);
  const wages = Number(wagesInput);
  const insuredYears = Number(yearsInput);
  const limits = AGE_LIMITS.find((item) => age <= item.maxAge);

  if (!limits || age < 18 || !Number.isFinite(wages) || wages <= 0 || !Number.isFinite(insuredYears) || insuredYears < 0) {
    return { ...ZERO_RESULT };
  }

  const wageDaily = Math.min(limits.wageMax, Math.max(3_203, Math.floor(wages / 180)));
  const benefitDaily = calculateBenefitDaily(age, wageDaily, limits.benefitMax);
  const prescribedDays = prescribedBenefitDays(age, insuredYears, reason);

  return {
    wageDaily,
    benefitDaily,
    benefit28Days: benefitDaily * 28,
    prescribedDays,
    totalBenefit: benefitDaily * prescribedDays,
  };
}
