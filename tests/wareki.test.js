import { describe, it, expect } from 'vitest';
import {
  seirekiToWareki,
  warekiToSeireki,
  eras,
} from '../src/lib/wareki.js';

describe('seirekiToWareki（西暦→和暦）', () => {
  it('令和8年（2026年）を正しく変換する', () => {
    expect(seirekiToWareki(2026)).toEqual({ era: '令和', eraYear: 8, label: '令和8年' });
  });

  it('改元年は元年として「元年」表記になる', () => {
    expect(seirekiToWareki(2019, 5, 1)).toEqual({ era: '令和', eraYear: 1, label: '令和元年' });
    expect(seirekiToWareki(1989, 1, 8)).toEqual({ era: '平成', eraYear: 1, label: '平成元年' });
    expect(seirekiToWareki(1868, 10, 23)).toEqual({ era: '明治', eraYear: 1, label: '明治元年' });
  });

  it('改元日の境界（平成⇔昭和）が正しい', () => {
    // 1989-01-07 = 昭和64年（昭和最終日）
    expect(seirekiToWareki(1989, 1, 7)).toEqual({ era: '昭和', eraYear: 64, label: '昭和64年' });
    // 1989-01-08 = 平成元年（改元日）
    expect(seirekiToWareki(1989, 1, 8)).toEqual({ era: '平成', eraYear: 1, label: '平成元年' });
  });

  it('改元日の境界（令和⇔平成）が正しい', () => {
    // 2019-04-30 = 平成31年（平成最終日）
    expect(seirekiToWareki(2019, 4, 30)).toEqual({ era: '平成', eraYear: 31, label: '平成31年' });
    // 2019-05-01 = 令和元年（改元日）
    expect(seirekiToWareki(2019, 5, 1)).toEqual({ era: '令和', eraYear: 1, label: '令和元年' });
  });

  it('年のみ指定時は、その年の改元後の元号を採用する', () => {
    // 1989年は1/8から平成 → 年のみは平成元年
    expect(seirekiToWareki(1989)).toEqual({ era: '平成', eraYear: 1, label: '平成元年' });
    // 2019年は5/1から令和 → 年のみは令和元年
    expect(seirekiToWareki(2019)).toEqual({ era: '令和', eraYear: 1, label: '令和元年' });
    // 改元のない年はその年いっぱいの元号
    expect(seirekiToWareki(2000)).toEqual({ era: '平成', eraYear: 12, label: '平成12年' });
  });

  it('昭和の境界（昭和元年＝1926-12-25）', () => {
    expect(seirekiToWareki(1926, 12, 24)).toEqual({ era: '大正', eraYear: 15, label: '大正15年' });
    expect(seirekiToWareki(1926, 12, 25)).toEqual({ era: '昭和', eraYear: 1, label: '昭和元年' });
  });

  it('大正の境界（大正元年＝1912-07-30）', () => {
    expect(seirekiToWareki(1912, 7, 29)).toEqual({ era: '明治', eraYear: 45, label: '明治45年' });
    expect(seirekiToWareki(1912, 7, 30)).toEqual({ era: '大正', eraYear: 1, label: '大正元年' });
  });

  it('明治より前はnullを返す', () => {
    expect(seirekiToWareki(1867)).toBeNull();
    expect(seirekiToWareki(1868, 10, 22)).toBeNull(); // 明治改元日の前日
    expect(seirekiToWareki(1000)).toBeNull();
  });

  it('不正な入力はnullを返す', () => {
    expect(seirekiToWareki(NaN)).toBeNull();
    expect(seirekiToWareki(null)).toBeNull();
    expect(seirekiToWareki('abc')).toBeNull();
  });
});

describe('warekiToSeireki（和暦→西暦）', () => {
  it('令和8年→2026', () => {
    expect(warekiToSeireki('令和', 8)).toBe(2026);
  });

  it('平成元年→1989、平成31年→2019', () => {
    expect(warekiToSeireki('平成', 1)).toBe(1989);
    expect(warekiToSeireki('平成', 31)).toBe(2019);
  });

  it('昭和64年→1989、昭和元年→1926', () => {
    expect(warekiToSeireki('昭和', 64)).toBe(1989);
    expect(warekiToSeireki('昭和', 1)).toBe(1926);
  });

  it('明治元年→1868、大正元年→1912、令和元年→2019', () => {
    expect(warekiToSeireki('明治', 1)).toBe(1868);
    expect(warekiToSeireki('大正', 1)).toBe(1912);
    expect(warekiToSeireki('令和', 1)).toBe(2019);
  });

  it('「元年」文字列も1年として扱う', () => {
    expect(warekiToSeireki('令和', '元')).toBe(2019);
    expect(warekiToSeireki('平成', '元年')).toBe(1989);
  });

  it('存在しない元号・不正な年はnull', () => {
    expect(warekiToSeireki('慶応', 1)).toBeNull();
    expect(warekiToSeireki('令和', 0)).toBeNull();
    expect(warekiToSeireki('令和', -1)).toBeNull();
    expect(warekiToSeireki('令和', NaN)).toBeNull();
    expect(warekiToSeireki('', 1)).toBeNull();
  });
});

describe('双方向の往復（ラウンドトリップ）', () => {
  it('西暦→和暦→西暦で元の年に戻る（改元のない年）', () => {
    for (const y of [1900, 1950, 1980, 2000, 2010, 2026]) {
      const w = seirekiToWareki(y);
      expect(warekiToSeireki(w.era, w.eraYear)).toBe(y);
    }
  });

  it('改元年も往復する', () => {
    // 2019年 年のみ→令和元年→2019
    const w = seirekiToWareki(2019);
    expect(warekiToSeireki(w.era, w.eraYear)).toBe(2019);
  });
});

describe('eras（元号リスト）', () => {
  it('5つの元号を新しい順に含む', () => {
    expect(Array.isArray(eras)).toBe(true);
    expect(eras.map((e) => e.name)).toEqual(['令和', '平成', '昭和', '大正', '明治']);
  });

  it('各元号が改元日と開始西暦年を持つ', () => {
    const reiwa = eras.find((e) => e.name === '令和');
    expect(reiwa.startYear).toBe(2019);
    expect(reiwa.startMonth).toBe(5);
    expect(reiwa.startDay).toBe(1);
  });
});
