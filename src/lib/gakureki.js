import { seirekiToWareki } from './wareki.js';

function parseISO(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function schoolCohortYear(birthDate) {
  const parsed = parseISO(birthDate);
  if (!parsed) return null;
  return parsed.month < 4 || (parsed.month === 4 && parsed.day === 1) ? parsed.year - 1 : parsed.year;
}

function ym(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function period(admissionYear, durationYears) {
  return { admission: ym(admissionYear, 4), graduation: ym(admissionYear + durationYears, 3) };
}

const HIGHER = {
  none: { label: '進学なし', years: 0 },
  'vocational-2': { label: '専門学校（2年制）', years: 2 },
  'vocational-3': { label: '専門学校（3年制）', years: 3 },
  'junior-college': { label: '短期大学', years: 2 },
  university: { label: '大学', years: 4 },
  'university-6': { label: '大学（6年制）', years: 6 },
};

export function academicHistory(birthDate, options = {}) {
  const cohort = schoolCohortYear(birthDate);
  if (cohort === null) return null;
  const entranceDelay = Math.max(0, Math.floor(Number(options.entranceDelay) || 0));
  const graduationDelay = Math.max(0, Math.floor(Number(options.graduationDelay) || 0));
  const higherType = options.higherEducation ?? 'university';
  const higherConfig = HIGHER[higherType] ?? HIGHER.university;
  const elementaryAdmission = cohort + 7;
  const highSchoolAdmission = elementaryAdmission + 9;
  const higherAdmission = highSchoolAdmission + 3 + entranceDelay;
  const result = {
    cohort,
    elementary: period(elementaryAdmission, 6),
    juniorHigh: period(elementaryAdmission + 6, 3),
    highSchool: period(highSchoolAdmission, 3),
    higher: null,
    graduate: null,
  };
  if (higherConfig.years > 0) {
    result.higher = {
      label: higherConfig.label,
      ...period(higherAdmission, higherConfig.years + graduationDelay),
    };
    if (options.graduateSchool && (higherType === 'university' || higherType === 'university-6')) {
      const graduateAdmission = higherAdmission + higherConfig.years + graduationDelay;
      result.graduate = { label: '大学院（修士課程）', ...period(graduateAdmission, 2) };
    }
  }
  return result;
}

export function formatAcademicMonth(value, calendar = 'both') {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const western = `${year}年${month}月`;
  const wareki = seirekiToWareki(year, month, 1)?.label.replace('年', `年${month}月`) ?? '';
  if (calendar === 'western') return western;
  if (calendar === 'wareki') return wareki;
  return `${western}（${wareki}）`;
}
