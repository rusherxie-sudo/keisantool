import { describe, expect, it } from 'vitest';
import { academicHistory, schoolCohortYear } from '../src/lib/gakureki.js';

describe('schoolCohortYear', () => {
  it('4月2日生まれはその西暦の学年 cohort', () => {
    expect(schoolCohortYear('2000-04-02')).toBe(2000);
  });

  it('4月1日生まれは前年度 cohort', () => {
    expect(schoolCohortYear('2001-04-01')).toBe(2000);
  });

  it('存在しない日付はnull', () => {
    expect(schoolCohortYear('2001-02-29')).toBeNull();
  });
});

describe('academicHistory', () => {
  it('2000年4月2日生まれの標準学歴を生成する', () => {
    const result = academicHistory('2000-04-02', { higherEducation: 'university' });
    expect(result.elementary).toEqual({ admission: '2007-04', graduation: '2013-03' });
    expect(result.juniorHigh).toEqual({ admission: '2013-04', graduation: '2016-03' });
    expect(result.highSchool).toEqual({ admission: '2016-04', graduation: '2019-03' });
    expect(result.higher).toMatchObject({ label: '大学', admission: '2019-04', graduation: '2023-03' });
  });

  it('早生まれでも同じcohortなら同じ年度になる', () => {
    expect(academicHistory('2001-04-01').elementary).toEqual(
      academicHistory('2000-04-02').elementary,
    );
  });

  it('浪人・留年年数を高等教育の入学・卒業へ反映する', () => {
    const result = academicHistory('2000-04-02', {
      higherEducation: 'junior-college',
      entranceDelay: 1,
      graduationDelay: 1,
    });
    expect(result.higher).toMatchObject({ label: '短期大学', admission: '2020-04', graduation: '2023-03' });
  });

  it('大学院修士課程を続けて表示できる', () => {
    const result = academicHistory('2000-04-02', { higherEducation: 'university', graduateSchool: true });
    expect(result.graduate).toMatchObject({ label: '大学院（修士課程）', admission: '2023-04', graduation: '2025-03' });
  });

  it('無効入力はnull', () => {
    expect(academicHistory('')).toBeNull();
  });
});
