import { describe, it, expect } from 'vitest';
import {
  warekiLabels,
  etoYomi,
  hayamiTable,
  rokuseiSegments,
  seizaRanges,
  yakudoshiSeirekiYears,
  gakunenTable,
} from '../src/lib/hayami.js';
import { schoolGrade } from '../src/lib/nenrei.js';

describe('warekiLabels（和暦表記・改元年は併記）', () => {
  it('通常年は単一表記', () => {
    expect(warekiLabels(2026)).toBe('令和8年');
    expect(warekiLabels(1985)).toBe('昭和60年');
    expect(warekiLabels(1900)).toBe('明治33年');
  });

  it('改元年は「旧元号／新元号」の併記', () => {
    expect(warekiLabels(2019)).toBe('平成31年／令和元年');
    expect(warekiLabels(1989)).toBe('昭和64年／平成元年');
    expect(warekiLabels(1926)).toBe('大正15年／昭和元年');
    expect(warekiLabels(1912)).toBe('明治45年／大正元年');
  });

  it('元年は「元」表記', () => {
    expect(warekiLabels(2020)).toBe('令和2年');
    expect(warekiLabels(1990)).toBe('平成2年');
  });

  it('明治改元年（1868）は明治元年のみ（年初は明治より前）', () => {
    expect(warekiLabels(1868)).toBe('明治元年');
  });

  it('明治より前・不正入力は null', () => {
    expect(warekiLabels(1867)).toBeNull();
    expect(warekiLabels('abc')).toBeNull();
    expect(warekiLabels(null)).toBeNull();
  });
});

describe('etoYomi（十二支＋読み）', () => {
  it('2026年は午（うま）', () => {
    expect(etoYomi(2026)).toEqual({ kanji: '午', yomi: 'うま' });
  });

  it('1985年は丑（うし）、2020年は子（ね）、1900年は子（ね）', () => {
    expect(etoYomi(1985)).toEqual({ kanji: '丑', yomi: 'うし' });
    expect(etoYomi(2020)).toEqual({ kanji: '子', yomi: 'ね' });
    expect(etoYomi(1900)).toEqual({ kanji: '子', yomi: 'ね' });
  });

  it('12支すべてに読みが定義されている（連続12年で欠けなし）', () => {
    for (let y = 2020; y < 2032; y++) {
      const r = etoYomi(y);
      expect(r.kanji).toBeTruthy();
      expect(r.yomi).toBeTruthy();
    }
  });

  it('不正入力は null', () => {
    expect(etoYomi('abc')).toBeNull();
    expect(etoYomi(null)).toBeNull();
  });
});

describe('hayamiTable（年齢早見表の行データ）', () => {
  it('1985年生まれ・2026年基準：昭和60年・満41歳・数え42歳・丑', () => {
    const rows = hayamiTable(1985, 1985, 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      seireki: 1985,
      wareki: '昭和60年',
      age: 41,
      kazoe: 42,
      eto: '丑',
      etoYomi: 'うし',
    });
  });

  it('範囲指定：fromYear〜toYear を昇順で返す', () => {
    const rows = hayamiTable(2024, 2026, 2026);
    expect(rows).toHaveLength(3);
    expect(rows[0].seireki).toBe(2024);
    expect(rows[2].seireki).toBe(2026);
    expect(rows[0].eto).toBe('辰');
    expect(rows[2].age).toBe(0);
    expect(rows[2].kazoe).toBe(1);
  });

  it('改元年の行は和暦が併記になる', () => {
    const rows = hayamiTable(1989, 1989, 2026);
    expect(rows[0].wareki).toBe('昭和64年／平成元年');
  });

  it('from > to や不正入力は空配列', () => {
    expect(hayamiTable(2000, 1990, 2026)).toEqual([]);
    expect(hayamiTable('a', 2000, 2026)).toEqual([]);
  });
});

describe('rokuseiSegments（生まれ年ごとの運命星の日付区間）', () => {
  const STARS = ['土星人', '金星人', '火星人', '天王星人', '木星人', '水星人'];

  it('1958年：2/16〜2/25 が土星人（公式例 1958-02-24=壬申→土星人を含む旬）', () => {
    const segs = rokuseiSegments(1958);
    const hit = segs.find(
      (s) => s.from.month === 2 && s.from.day === 16 && s.to.month === 2 && s.to.day === 25
    );
    expect(hit).toBeTruthy();
    expect(hit.star).toBe('土星人');
  });

  it('1985年：8/20 を含む区間は火星人（公式例 1985-08-20=辛卯）', () => {
    const segs = rokuseiSegments(1985);
    const hit = segs.find(
      (s) =>
        (s.from.month < 8 || (s.from.month === 8 && s.from.day <= 20)) &&
        (s.to.month > 8 || (s.to.month === 8 && s.to.day >= 20))
    );
    expect(hit).toBeTruthy();
    expect(hit.star).toBe('火星人');
  });

  it('区間は 1/1 から 12/31 まで途切れなく年間を覆う', () => {
    const segs = rokuseiSegments(1985);
    expect(segs[0].from).toEqual({ month: 1, day: 1 });
    expect(segs[segs.length - 1].to).toEqual({ month: 12, day: 31 });
    // 10日周期なので 36〜38 区間
    expect(segs.length).toBeGreaterThanOrEqual(36);
    expect(segs.length).toBeLessThanOrEqual(38);
    // すべて六星のいずれか
    for (const s of segs) expect(STARS).toContain(s.star);
  });

  it('不正入力は空配列', () => {
    expect(rokuseiSegments('x')).toEqual([]);
    expect(rokuseiSegments(null)).toEqual([]);
  });
});

describe('seizaRanges(12星座の誕生日区間)', () => {
  it('12区間で、先頭は牡羊座（3/21〜4/19）', () => {
    const ranges = seizaRanges();
    expect(ranges).toHaveLength(12);
    expect(ranges[0].name).toBe('牡羊座');
    expect(ranges[0].from).toEqual({ month: 3, day: 21 });
    expect(ranges[0].to).toEqual({ month: 4, day: 19 });
  });

  it('山羊座は年をまたぐ 12/22〜1/19', () => {
    const cap = seizaRanges().find((r) => r.name === '山羊座');
    expect(cap.from).toEqual({ month: 12, day: 22 });
    expect(cap.to).toEqual({ month: 1, day: 19 });
  });

  it('魚座は 2/19〜3/20', () => {
    const p = seizaRanges().find((r) => r.name === '魚座');
    expect(p.from).toEqual({ month: 2, day: 19 });
    expect(p.to).toEqual({ month: 3, day: 20 });
  });
});

describe('yakudoshiSeirekiYears（生まれ年→厄年の西暦）', () => {
  it('1985年生まれ男性：2026年が本厄42歳（大厄）', () => {
    const rows = yakudoshiSeirekiYears(1985, 'male');
    expect(rows).toContainEqual({ kind: '本厄', kazoe: 42, year: 2026, isTaiyaku: true });
    expect(rows).toContainEqual({ kind: '前厄', kazoe: 41, year: 2025, isTaiyaku: false });
    expect(rows).toContainEqual({ kind: '後厄', kazoe: 43, year: 2027, isTaiyaku: false });
  });

  it('1991年生まれ女性：2023年が本厄33歳（大厄）・2026年が前厄36歳', () => {
    const rows = yakudoshiSeirekiYears(1991, 'female');
    expect(rows).toContainEqual({ kind: '本厄', kazoe: 33, year: 2023, isTaiyaku: true });
    expect(rows).toContainEqual({ kind: '前厄', kazoe: 36, year: 2026, isTaiyaku: false });
  });

  it('数え年の昇順に並ぶ', () => {
    const rows = yakudoshiSeirekiYears(1990, 'male');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].kazoe).toBeGreaterThan(rows[i - 1].kazoe);
    }
  });

  it('男性は 3 本厄 ×3行 = 9行、女性は 4 本厄 ×3行 = 12行', () => {
    expect(yakudoshiSeirekiYears(1990, 'male')).toHaveLength(9);
    expect(yakudoshiSeirekiYears(1990, 'female')).toHaveLength(12);
  });

  it('不正入力は空配列', () => {
    expect(yakudoshiSeirekiYears('x', 'male')).toEqual([]);
    expect(yakudoshiSeirekiYears(1990, 'unknown')).toEqual([]);
  });
});

describe('gakunenTable（学年早見表：学年度→生まれ年度ごとの学年）', () => {
  it('2026年度（令和8年度）：15行、高3(13歳上限)〜未就学(下限)まで昇順に並ぶ', () => {
    const rows = gakunenTable(2026);
    expect(rows).toHaveLength(15);
    expect(rows[0].grade).toBe(13);
    expect(rows[0].label).toBe('高校卒業後');
    expect(rows[rows.length - 1].grade).toBe(-1);
    expect(rows[rows.length - 1].label).toBe('未就学');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].grade).toBeLessThan(rows[i - 1].grade);
    }
  });

  it('小1(grade=1)の行は生まれ年度2019年（2019-04-02〜2020-04-01）', () => {
    const rows = gakunenTable(2026);
    const g1 = rows.find((r) => r.grade === 1);
    expect(g1.cohortYear).toBe(2019);
    expect(g1.label).toBe('小学1年生');
    expect(g1.cohortLabel).toBe('2019年4月2日〜2020年4月1日');
  });

  it('高3(grade=12)の行は生まれ年度2008年', () => {
    const rows = gakunenTable(2026);
    const g12 = rows.find((r) => r.grade === 12);
    expect(g12.cohortYear).toBe(2008);
    expect(g12.label).toBe('高校3年生');
  });

  it('各行の grade/label は schoolGrade(cohortYear-04-02, baseSchoolYear-04-02) と一致する（二重実装を防ぐ整合性チェック）', () => {
    const rows = gakunenTable(2026);
    for (const r of rows) {
      const expected = schoolGrade(`${r.cohortYear}-04-02`, '2026-04-02');
      expect(r.grade).toBe(expected.grade);
      expect(r.label).toBe(expected.label);
    }
  });

  it('age は基準年度4/2時点の満年齢', () => {
    const rows = gakunenTable(2026);
    const g1 = rows.find((r) => r.grade === 1);
    expect(g1.age).toBe(7);
  });

  it('不正入力は空配列', () => {
    expect(gakunenTable('x')).toEqual([]);
    expect(gakunenTable(null)).toEqual([]);
  });
});
