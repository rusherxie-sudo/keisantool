import { describe, it, expect } from 'vitest';
import { workTimeExamples, workTimeExampleCsvRows } from '../src/data/work-time-examples.js';
import { workMinutes, sumWorkRows, csvText } from '../src/lib/office-tools.js';

describe('downloadable work-time check examples', () => {
  it('covers ordinary, overnight, zero, 24h, missing and invalid break inputs', () => {
    expect(workTimeExamples.length).toBe(14);
    expect(new Set(workTimeExamples.map(x => x.id)).size).toBe(14);
    expect(workTimeExamples.filter(x => x.expectedMinutes === null)).toHaveLength(5);
    expect(workTimeExamples.some(x => x.expectedMinutes === 0)).toBe(true);
    expect(workTimeExamples.some(x => x.expectedMinutes === 1)).toBe(true);
    expect(workTimeExamples.some(x => x.start === x.end && x.nextDay)).toBe(true);
  });
  it('matches independently specified results and dated elapsed-time arithmetic', () => {
    for (const x of workTimeExamples) {
      expect(workMinutes(x.start, x.end, x.breakMinutes, x.nextDay), x.id).toBe(x.expectedMinutes);
      if (x.expectedMinutes !== null) {
        // Independent oracle: two explicit UTC datetimes, no production parser or modulo.
        const start = Date.parse('2026-11-30T' + x.start + ':00Z');
        const end = Date.parse((x.nextDay ? '2026-12-01T' : '2026-11-30T') + x.end + ':00Z');
        expect((end - start) / 60000 - Number(x.breakMinutes), x.id).toBe(x.expectedMinutes);
      }
      expect(x.explanation.length).toBeGreaterThan(10);
    }
  });
  it('adds three overnight shifts beyond 24h without rounding or wrapping', () => {
    const rows = ['night', 'split-break', 'full-day'].map(id => workTimeExamples.find(x => x.id === id));
    const result = sumWorkRows(rows);
    expect(result.errors).toEqual([]);
    expect(result.totalMinutes).toBe(2445); // 435 + 630 + 1380 = 40h45m, 40.75h
    expect(result.workedDays).toBe(3);
    expect(sumWorkRows([...rows, workTimeExamples.find(x => x.id === 'no-next-day')]).errors).toEqual([3]);
  });
  it('exports all inputs plus independently fixed expected outputs and explanations', () => {
    const rows = workTimeExampleCsvRows();
    expect(rows).toHaveLength(15);
    expect(rows[0]).toEqual(['ID','確認する場面','出勤','退勤','翌日退勤','休憩分','期待する実働分','期待する表示','確認のポイント']);
    expect(rows.find(x => x[0] === 'night').slice(2, 8)).toEqual(['22:00','06:00',1,45,435,'7時間15分']);
    expect(rows.find(x => x[0] === 'no-next-day')[6]).toBe('入力エラー');
    expect(csvText(rows).startsWith('\uFEFF')).toBe(true);
    expect(csvText(rows)).toContain('1380');
  });
});
