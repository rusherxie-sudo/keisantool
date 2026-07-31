import { describe, it, expect } from 'vitest';
import {
  rokusei,
  unmeiStar,
  polarity,
  kanshi,
  fortuneZone,
  forecast,
  fortuneTable,
  fortuneTypes,
} from '../src/lib/rokusei.js';

// 検証の根拠となる公開例:
//  - 1958-02-24 → 日干支「壬申」→ 空亡「戌亥」→ 土星人（大久保占い研究室 senjutsu.jp の公式例）
//  - 1985-08-20 → 日干支「辛卯」（中国暦/万年暦で確認）→ 空亡「午未」→ 火星人
//  - 年支による陽陰: 子寅辰午申戌=プラス / 丑卯巳未酉亥=マイナス（複数ソースの多数派）
//  - ゾーン周期は daisakkai.net の 2025/2026 年運一覧から導出（種子の年が運命星・陰陽で固定）

describe('kanshi（日の六十干支）', () => {
  it('1958-02-24 は 壬申', () => {
    expect(kanshi(1958, 2, 24)).toBe('壬申');
  });
  it('1985-08-20 は 辛卯', () => {
    expect(kanshi(1985, 8, 20)).toBe('辛卯');
  });
});

describe('unmeiStar（日の空亡から運命星）', () => {
  it('1958-02-24 → 土星人（空亡 戌亥）', () => {
    expect(unmeiStar(1958, 2, 24)).toEqual({ star: '土星人', kuubou: '戌亥' });
  });
  it('1985-08-20 → 火星人（空亡 午未）', () => {
    expect(unmeiStar(1985, 8, 20)).toEqual({ star: '火星人', kuubou: '午未' });
  });
});

describe('polarity（年支による陽陰）', () => {
  it('1958年（戌年）はプラス', () => {
    expect(polarity(1958)).toBe('プラス');
  });
  it('1985年（丑年）はマイナス', () => {
    expect(polarity(1985)).toBe('マイナス');
  });
  it('1990年（午年）はプラス', () => {
    expect(polarity(1990)).toBe('プラス');
  });
});

describe('rokusei（総合判定）', () => {
  it('1985-08-20 → 火星人 マイナス', () => {
    const r = rokusei(1985, 8, 20);
    expect(r.star).toBe('火星人');
    expect(r.polarity).toBe('マイナス');
    expect(r.type).toBe('火星人マイナス');
    expect(r.kanshi).toBe('辛卯');
    expect(r.kuubou).toBe('午未');
  });
  it('1958-02-24 → 土星人 プラス', () => {
    const r = rokusei(1958, 2, 24);
    expect(r.type).toBe('土星人プラス');
  });
  it('不正な日付は null を返す', () => {
    expect(rokusei(1985, 13, 1)).toBeNull();
    expect(rokusei(1985, 2, 30)).toBeNull();
    expect(rokusei(NaN, 1, 1)).toBeNull();
  });
});

describe('fortuneZone（指定年のゾーン）', () => {
  // daisakkai.net の年運一覧（2025年）で検証
  it('土星人プラスの2025年は乱気（中殺界）', () => {
    const z = fortuneZone('土星人プラス', 2025);
    expect(z.zone).toBe('乱気');
    expect(z.category).toBe('中殺界');
  });
  it('火星人プラスの2025年は陰影（大殺界）', () => {
    const z = fortuneZone('火星人プラス', 2025);
    expect(z.zone).toBe('陰影');
    expect(z.category).toBe('大殺界');
  });
  it('天王星人プラスの2025年は減退（大殺界）', () => {
    const z = fortuneZone('天王星人プラス', 2025);
    expect(z.zone).toBe('減退');
    expect(z.category).toBe('大殺界');
  });
  it('木星人マイナスの2025年は種子', () => {
    const z = fortuneZone('木星人マイナス', 2025);
    expect(z.zone).toBe('種子');
    expect(z.category).toBe('好調');
  });
  // 2026年でも整合
  it('天王星人プラスの2026年は種子', () => {
    expect(fortuneZone('天王星人プラス', 2026).zone).toBe('種子');
  });
  it('火星人マイナスの2026年は陰影（大殺界）', () => {
    const z = fortuneZone('火星人マイナス', 2026);
    expect(z.zone).toBe('陰影');
    expect(z.category).toBe('大殺界');
  });
  it('水星人プラスの2025年は健弱（小殺界）', () => {
    const z = fortuneZone('水星人プラス', 2025);
    expect(z.zone).toBe('健弱');
    expect(z.category).toBe('小殺界');
  });
});

describe('forecast（向こう数年の運勢）', () => {
  it('基準年から指定年数分を返す', () => {
    const list = forecast('火星人プラス', 2025, 3);
    expect(list).toHaveLength(3);
    expect(list[0]).toMatchObject({ year: 2025, zone: '陰影', category: '大殺界' });
    expect(list[1]).toMatchObject({ year: 2026, zone: '停止', category: '大殺界' });
    expect(list[2]).toMatchObject({ year: 2027, zone: '減退', category: '大殺界' });
  });
  it('12年で一周し種子に戻る', () => {
    const list = forecast('土星人プラス', 2025, 13);
    expect(list[0].zone).toBe(list[12].zone);
  });
});

describe('fortuneTable（指定年の12タイプ早見表）', () => {
  it('2026年の全12タイプを固定順で返す', () => {
    expect(fortuneTable(2026)).toEqual([
      { type: '土星人プラス', zone: '再会', category: '好調' },
      { type: '土星人マイナス', zone: '乱気', category: '中殺界' },
      { type: '金星人プラス', zone: '安定', category: '好調' },
      { type: '金星人マイナス', zone: '財成', category: '好調' },
      { type: '火星人プラス', zone: '停止', category: '大殺界' },
      { type: '火星人マイナス', zone: '陰影', category: '大殺界' },
      { type: '天王星人プラス', zone: '種子', category: '好調' },
      { type: '天王星人マイナス', zone: '減退', category: '大殺界' },
      { type: '木星人プラス', zone: '立花', category: '好調' },
      { type: '木星人マイナス', zone: '緑生', category: '好調' },
      { type: '水星人プラス', zone: '達成', category: '好調' },
      { type: '水星人マイナス', zone: '健弱', category: '小殺界' },
    ]);
  });

  it('不正な年は空配列を返す', () => {
    expect(fortuneTable(NaN)).toEqual([]);
  });
});

describe('fortuneTypes（12タイプの静的ページ定義）', () => {
  it('6運命星×プラス・マイナスの12タイプを一意なslugで返す', () => {
    const types = fortuneTypes();
    expect(types).toHaveLength(12);
    expect(new Set(types.map((item) => item.slug)).size).toBe(12);
    expect(types.map((item) => item.type)).toEqual([
      '土星人プラス', '土星人マイナス',
      '金星人プラス', '金星人マイナス',
      '火星人プラス', '火星人マイナス',
      '天王星人プラス', '天王星人マイナス',
      '木星人プラス', '木星人マイナス',
      '水星人プラス', '水星人マイナス',
    ]);
  });

  it('URL向けslugと表示用の星・陽陰を返す', () => {
    expect(fortuneTypes()).toContainEqual({
      slug: 'kaseijin-plus',
      type: '火星人プラス',
      star: '火星人',
      polarity: 'プラス',
    });
  });

  it('呼び出し側で変更しても内部定義を汚染しない', () => {
    const types = fortuneTypes();
    types[0].type = '変更';
    expect(fortuneTypes()[0].type).toBe('土星人プラス');
  });
});
