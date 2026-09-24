import { describe, it, expect } from 'vitest';
import { businessMonth, workMinutes, sumWorkRows, runningResult, csvText } from '../src/lib/office-tools.js';
describe('business calendar', () => {
  it('2026 September excludes the three consecutive weekday holidays without double counting', () => {
    expect(businessMonth(2026, 9).businessDays).toBe(19);
    expect(businessMonth(2026, 9).days.find(d => d.day === 22).holiday).toBe('国民の休日');
  });
  it('2027 March includes the substitute holiday', () => expect(businessMonth(2027, 3).businessDays).toBe(22));
  it('company holidays and custom working weekdays are combined without duplication', () => {
    expect(businessMonth(2026, 9, ['2026-09-01', '2026-09-01', '2026-09-21']).businessDays).toBe(18);
    expect(businessMonth(2026, 9, [], []).businessDays).toBe(0);
    expect(businessMonth(2026, 9, [], [0,1,2,3,4,5,6]).businessDays).toBe(27);
  });
  it('rejects unverified years and invalid months', () => {
    expect(businessMonth(2028, 1)).toBeNull(); expect(businessMonth(2026, 13)).toBeNull();
  });
});
describe('monthly time', () => {
  it('subtracts breaks and supports explicit overnight shifts', () => {
    expect(workMinutes('09:00','18:00',60)).toBe(480);
    expect(workMinutes('22:00','06:00',45,true)).toBe(435);
    expect(workMinutes('22:00','06:00',45)).toBeNull();
  });
  it('rejects excess breaks, malformed times and spans above 24h', () => {
    expect(workMinutes('09:00','10:00',61)).toBeNull();
    expect(workMinutes('24:00','10:00',0)).toBeNull();
    expect(workMinutes('09:00','18:00',0,true)).toBeNull();
    expect(workMinutes('09:00','18:00','')).toBeNull();
  });
  it('sums minutes without daily decimal rounding; flags partial inputs', () => {
    const r = sumWorkRows([{start:'09:00',end:'09:01',breakMinutes:0},{start:'09:00',end:'09:01',breakMinutes:0},{start:'09:00',end:'',breakMinutes:0},{start:'',end:''}]);
    expect(r.totalMinutes).toBe(2); expect(r.errors).toEqual([2]); expect(r.workedDays).toBe(2);
  });
});
describe('running pace', () => {
  it('6 min/km means 10km/h and 4h13m10.2s for a marathon', () => {
    expect(runningResult('pace',360,42.195)).toEqual({paceSeconds:360,speedKmh:10,totalSeconds:15190.2});
  });
  it('inverts finish time and speed', () => {
    expect(runningResult('time',1500,5).paceSeconds).toBe(300);
    expect(runningResult('speed',12,10).totalSeconds).toBe(3000);
  });
  it('rejects zero, infinity and unknown modes', () => {
    expect(runningResult('pace',0,5)).toBeNull(); expect(runningResult('speed',Infinity,5)).toBeNull(); expect(runningResult('x',3,5)).toBeNull();
  });
});
it('CSV preserves Japanese and escapes commas and quotes', () => expect(csvText([['祝日','a,"b"']])).toBe('\uFEFF"祝日","a,""b"""'));

import { weeklyWorkPattern } from '../src/lib/yukyu-nissu.js';
it('classifies prescribed weekly work at the 30-hour and five-day boundaries', () => {
  expect(weeklyWorkPattern(30, 4)).toBe('regular');
  expect(weeklyWorkPattern(29.9, 4)).toBe('four-days');
  expect(weeklyWorkPattern(10, 5)).toBe('regular');
  expect(weeklyWorkPattern(6, 1)).toBe('one-day');
  expect(weeklyWorkPattern('', 4)).toBeNull();
  expect(weeklyWorkPattern(20, 2.5)).toBeNull();
});
