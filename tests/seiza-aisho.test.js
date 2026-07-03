import { describe, it, expect } from 'vitest';
import { SIGNS, signBySlug, seizaAisho, allPairs } from '../src/lib/seiza-aisho.js';

// ── 検証の根拠（独立アンカー）─────────────────────────────
// 判定は西洋占星術で通行の「エレメント×アスペクト」方式：
//  - エレメント区分（火：牡羊・獅子・射手／地：牡牛・乙女・山羊／風：双子・天秤・水瓶／水：蟹・蠍・魚）
//    は /seiza/ ページの早見表と同一の通行区分。
//  - アスペクト（星座同士の角度＝環上の距離 d）：
//      d=4 トライン（120度・同エレメント）＝最良 / d=2 セクスタイル（60度）＝好調
//      d=0 同じ星座 / d=6 オポジション（180度）＝正反対で惹かれ合う
//      d=1 セミセクスタイル / d=5 インコンジャンクト / d=3 スクエア（90度）＝緊張
//  - スコアは本ツールの判定基準（ページで公開）：
//      d4=92◎ / d2=84○ / d0=80○ / d6=76○ / d1=62△ / d5=55△ / d3=48▲
// 数学的性質：奇数距離は必ず陰陽（火風／地水）をまたぐ＝相剋側、
//             偶数距離は必ず同グループ（同エレメント or 相生）になる。

// 12星座の並び（牡羊座=0 起点、黄道十二宮の通行順）と slug・エレメント
const EXPECTED_ORDER = [
  'ohitsuji', 'oushi', 'futago', 'kani', 'shishi', 'otome',
  'tenbin', 'sasori', 'ite', 'yagi', 'mizugame', 'uo',
];
const EXPECTED_ELEMENTS = {
  ohitsuji: '火', shishi: '火', ite: '火',
  oushi: '地', otome: '地', yagi: '地',
  futago: '風', tenbin: '風', mizugame: '風',
  kani: '水', sasori: '水', uo: '水',
};

describe('SIGNS（12星座データ）', () => {
  it('黄道十二宮の通行順で12星座が並ぶ', () => {
    expect(SIGNS.map((s) => s.slug)).toEqual(EXPECTED_ORDER);
  });
  it('エレメント区分が /seiza/ の早見表と一致する（全12星座）', () => {
    for (const s of SIGNS) {
      expect(s.element, s.slug).toBe(EXPECTED_ELEMENTS[s.slug]);
    }
  });
  it('各星座に name・かな・記号・期間・性格説明が揃っている', () => {
    for (const s of SIGNS) {
      expect(s.name.endsWith('座'), s.slug).toBe(true);
      expect(s.kana.length, s.slug).toBeGreaterThan(2);
      expect(s.symbol.length, s.slug).toBeGreaterThan(0);
      expect(s.period).toMatch(/^\d{1,2}\/\d{1,2}〜\d{1,2}\/\d{1,2}$/);
      expect(s.desc.length, s.slug).toBeGreaterThan(20);
      expect(s.traits.length, s.slug).toBeGreaterThanOrEqual(3);
    }
  });
  it('signBySlug で引ける・無効slugは null', () => {
    expect(signBySlug('ohitsuji').name).toBe('牡羊座');
    expect(signBySlug('uo').name).toBe('魚座');
    expect(signBySlug('nope')).toBeNull();
  });
});

describe('seizaAisho（アスペクト別スコアの独立アンカー）', () => {
  it('トライン（d=4・同エレメント）＝92・◎：牡羊×獅子（火×火）', () => {
    const r = seizaAisho('ohitsuji', 'shishi');
    expect(r.score).toBe(92);
    expect(r.rank).toBe('◎');
    expect(r.aspect.distance).toBe(4);
  });
  it('トライン別例：山羊×乙女（地×地）・蠍×魚（水×水）・天秤×水瓶（風×風）', () => {
    expect(seizaAisho('yagi', 'otome').score).toBe(92);
    expect(seizaAisho('sasori', 'uo').score).toBe(92);
    expect(seizaAisho('tenbin', 'mizugame').score).toBe(92);
  });
  it('セクスタイル（d=2）＝84・○：牡羊×双子（火×風の相生）', () => {
    const r = seizaAisho('ohitsuji', 'futago');
    expect(r.score).toBe(84);
    expect(r.rank).toBe('○');
    expect(r.aspect.distance).toBe(2);
  });
  it('同じ星座（d=0）＝80・○：牡羊×牡羊', () => {
    const r = seizaAisho('ohitsuji', 'ohitsuji');
    expect(r.score).toBe(80);
    expect(r.rank).toBe('○');
    expect(r.aspect.distance).toBe(0);
  });
  it('オポジション（d=6）＝76・○：牡羊×天秤・蟹×山羊・双子×射手', () => {
    expect(seizaAisho('ohitsuji', 'tenbin').score).toBe(76);
    expect(seizaAisho('kani', 'yagi').score).toBe(76);
    expect(seizaAisho('futago', 'ite').score).toBe(76);
  });
  it('セミセクスタイル（d=1）＝62・△：牡羊×牡牛・水瓶×魚', () => {
    expect(seizaAisho('ohitsuji', 'oushi').score).toBe(62);
    expect(seizaAisho('ohitsuji', 'oushi').rank).toBe('△');
    expect(seizaAisho('mizugame', 'uo').score).toBe(62);
  });
  it('インコンジャンクト（d=5）＝55・△：牡羊×乙女', () => {
    const r = seizaAisho('ohitsuji', 'otome');
    expect(r.score).toBe(55);
    expect(r.rank).toBe('△');
    expect(r.aspect.distance).toBe(5);
  });
  it('スクエア（d=3）＝48・▲：牡羊×蟹・獅子×蠍', () => {
    expect(seizaAisho('ohitsuji', 'kani').score).toBe(48);
    expect(seizaAisho('ohitsuji', 'kani').rank).toBe('▲');
    expect(seizaAisho('shishi', 'sasori').score).toBe(48);
  });
  it('環をまたぐ距離が正しい：魚×牡羊は隣同士（d=1）', () => {
    expect(seizaAisho('uo', 'ohitsuji').aspect.distance).toBe(1);
    expect(seizaAisho('uo', 'ohitsuji').score).toBe(62);
  });
  it('無効な slug は null', () => {
    expect(seizaAisho('nope', 'ohitsuji')).toBeNull();
    expect(seizaAisho('ohitsuji', '')).toBeNull();
  });
});

describe('seizaAisho（全144組の整合性）', () => {
  it('スコアは対称（score(a,b) === score(b,a)）', () => {
    for (const a of EXPECTED_ORDER) {
      for (const b of EXPECTED_ORDER) {
        expect(seizaAisho(a, b).score, `${a}×${b}`).toBe(seizaAisho(b, a).score);
      }
    }
  });
  it('スコアは7種類のみ・ランク帯が一貫（◎≥85／○70-84／△55-69／▲<55）', () => {
    const seen = new Set();
    for (const a of EXPECTED_ORDER) {
      for (const b of EXPECTED_ORDER) {
        const r = seizaAisho(a, b);
        seen.add(r.score);
        const want = r.score >= 85 ? '◎' : r.score >= 70 ? '○' : r.score >= 55 ? '△' : '▲';
        expect(r.rank, `${a}×${b}`).toBe(want);
      }
    }
    expect([...seen].sort((x, y) => x - y)).toEqual([48, 55, 62, 76, 80, 84, 92]);
  });
  it('全組み合わせでアスペクト名・コメント・アドバイスが空でない', () => {
    for (const a of EXPECTED_ORDER) {
      for (const b of EXPECTED_ORDER) {
        const r = seizaAisho(a, b);
        expect(r.aspect.name.length, `${a}×${b}`).toBeGreaterThan(0);
        expect(r.comment.length, `${a}×${b}`).toBeGreaterThan(20);
        expect(r.advice.length, `${a}×${b}`).toBeGreaterThan(10);
      }
    }
  });
});

describe('allPairs（144ページ生成用）', () => {
  it('12×12=144組（同星座含む・両方向を別ページとして返す）', () => {
    const pairs = allPairs();
    expect(pairs).toHaveLength(144);
    const keys = new Set(pairs.map((p) => `${p.slug1}-${p.slug2}`));
    expect(keys.size).toBe(144);
    expect(keys.has('ohitsuji-ohitsuji')).toBe(true);
    expect(keys.has('ohitsuji-oushi')).toBe(true);
    expect(keys.has('oushi-ohitsuji')).toBe(true);
    expect(keys.has('uo-uo')).toBe(true);
  });
});
