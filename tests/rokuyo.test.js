import { describe, it, expect } from 'vitest';
import { toKyureki, rokuyo, rokuyoDesc, rokuyoMonthTable } from '../src/lib/rokuyo.js';

// アンカーデータ出典：benri.jp / arachne.jp の旧暦カレンダー、日本語版ウィキペディア「六曜」条目。
// 2020年閏4月・2023年閏2月の境界日を含み、閏月の扱い（絶対値をそのまま使う）を検証する。
describe('toKyureki（公暦→旧暦変換）', () => {
  it('2020-05-23 は旧暦閏4月1日', () => {
    expect(toKyureki(2020, 5, 23)).toEqual({ month: 4, day: 1, isLeap: true });
  });

  it('2023-04-19 は旧暦閏2月29日（閏月の末日）', () => {
    expect(toKyureki(2023, 4, 19)).toEqual({ month: 2, day: 29, isLeap: true });
  });

  it('2018-10-1 は旧暦8月22日（平月）', () => {
    expect(toKyureki(2018, 10, 1)).toEqual({ month: 8, day: 22, isLeap: false });
  });

  it('不正な日付は null', () => {
    expect(toKyureki(2026, 2, 30)).toBeNull();
    expect(toKyureki('x', 1, 1)).toBeNull();
    expect(toKyureki(2026, 13, 1)).toBeNull();
  });
});

describe('rokuyo（六曜判定・実測アンカーによる検証）', () => {
  const cases = [
    [2018, 10, 1, '大安'],
    [2018, 10, 9, '先負'],
    [2020, 1, 1, '赤口'],
    [2020, 5, 23, '仏滅'], // 閏4月1日
    [2020, 5, 31, '赤口'], // 閏4月9日
    [2021, 1, 1, '仏滅'],
    [2023, 3, 22, '友引'], // 閏2月1日
    [2023, 4, 19, '赤口'], // 閏2月29日
    [2024, 1, 1, '赤口'],
    [2025, 1, 1, '先勝'],
    [2025, 8, 15, '先負'], // 閏6月22日
    [2026, 1, 1, '大安'],
  ];

  it.each(cases)('%i-%i-%i の六曜は%s', (y, m, d, expected) => {
    expect(rokuyo(y, m, d)).toBe(expected);
  });

  it('不正な日付は null', () => {
    expect(rokuyo(2026, 2, 30)).toBeNull();
    expect(rokuyo(null, 1, 1)).toBeNull();
  });
});

describe('rokuyoDesc（六曜の一言解説）', () => {
  it('六曜名から解説文を返す', () => {
    expect(rokuyoDesc('大安')).toMatch(/良い/);
    expect(rokuyoDesc('仏滅')).toMatch(/凶/);
  });

  it('不明な値は null', () => {
    expect(rokuyoDesc('存在しない')).toBeNull();
  });
});

describe('rokuyoMonthTable（月間六曜カレンダー）', () => {
  it('2026年2月は28日分（平年）を1日から末日まで昇順で返す', () => {
    const rows = rokuyoMonthTable(2026, 2);
    expect(rows).toHaveLength(28);
    expect(rows[0].day).toBe(1);
    expect(rows[27].day).toBe(28);
    expect(rows[0].rokuyo).toBe(rokuyo(2026, 2, 1));
  });

  it('2024年2月は29日分（閏年）', () => {
    expect(rokuyoMonthTable(2024, 2)).toHaveLength(29);
  });

  it('六曜は6日周期でおおむね循環する（同じ曜日パターンが月内に複数回現れる）', () => {
    const rows = rokuyoMonthTable(2026, 1);
    const first = rows[0].rokuyo;
    const occurrences = rows.filter((r) => r.rokuyo === first).length;
    expect(occurrences).toBeGreaterThanOrEqual(4);
  });

  it('不正な月は空配列', () => {
    expect(rokuyoMonthTable(2026, 13)).toEqual([]);
    expect(rokuyoMonthTable(2026, 0)).toEqual([]);
  });
});
