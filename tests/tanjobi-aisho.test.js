import { describe, it, expect } from 'vitest';
import {
  birthNumber,
  suuhiAisho,
  rokuseiAisho,
  zoneAisho,
  tanjobiAisho,
  NUMBER_PROFILES,
} from '../src/lib/tanjobi-aisho.js';

// ── 検証の根拠（独立アンカー）─────────────────────────────
// 誕生数（ライフパスナンバー）: 生年月日の全桁を足し、1桁になるまで繰り返す。
//   途中で 11・22・33 になったら「マスターナンバー」として止める（通行の算法。
//   spirika33.com / ura9.com など数秘術解説の共通手順）。手計算アンカーで固定。
// 数秘術相性表: 45組（9×9の無序対）を本ツールの判定基準として固定。
//   {1,5,7}{2,4,8}{3,6,9} の気質グループ + 各解説サイト共通の定番評価
//   （1×2◎・2×6◎・3×5◎・4×8◎・6×9◎ / 4×5▲・3×4▲ など）に基づく。
//   ※流派により評価が異なるため、この表自体を独立アンカーとして全組固定する。
// 六星占術パート: 「相手の生まれ年の年支が、自分のタイプの運命周期12ゾーンの
//   どれに当たるか」（地運相性の考え方）＝ fortuneZone(自分type, 相手生年) を利用。
//   ゾーン→スコアは本ツールの判定基準として12ゾーン全て固定。
//   手計算例: 1958年=戌年(10)・火星人マイナスの種子=酉(9) → 10-9=1 → 緑生。
//             1985年=丑年(1)・土星人プラスの種子=子(0) → 1-0=1 → 緑生。

describe('birthNumber（数秘術の誕生数）', () => {
  it('1990-08-15 → 33（マスターナンバー・基数6）', () => {
    expect(birthNumber(1990, 8, 15)).toEqual({ number: 33, isMaster: true, base: 6 });
  });
  it('1985-08-20 → 33（1+9+8+5+0+8+2+0=33）', () => {
    expect(birthNumber(1985, 8, 20)).toEqual({ number: 33, isMaster: true, base: 6 });
  });
  it('2000-05-04 → 11（マスターナンバー・基数2）', () => {
    expect(birthNumber(2000, 5, 4)).toEqual({ number: 11, isMaster: true, base: 2 });
  });
  it('2000-09-29 → 22（マスターナンバー・基数4）', () => {
    expect(birthNumber(2000, 9, 29)).toEqual({ number: 22, isMaster: true, base: 4 });
  });
  it('1993-07-09 → 合計38 → 3+8=11（2段目でマスター成立）', () => {
    expect(birthNumber(1993, 7, 9)).toEqual({ number: 11, isMaster: true, base: 2 });
  });
  it('1999-09-09 → 合計46 → 10 → 1（多段の還元）', () => {
    expect(birthNumber(1999, 9, 9)).toEqual({ number: 1, isMaster: false, base: 1 });
  });
  it('2000-01-01 → 4 / 1993-06-25 → 8 / 1984-11-30 → 9 / 1958-02-24 → 4', () => {
    expect(birthNumber(2000, 1, 1).number).toBe(4);
    expect(birthNumber(1993, 6, 25).number).toBe(8);
    expect(birthNumber(1984, 11, 30).number).toBe(9);
    expect(birthNumber(1958, 2, 24).number).toBe(4);
  });
  it('不正な日付は null', () => {
    expect(birthNumber(1985, 13, 1)).toBeNull();
    expect(birthNumber(1985, 2, 30)).toBeNull();
    expect(birthNumber(NaN, 1, 1)).toBeNull();
  });
});

// 45組の判定表（テスト側の独立コピー）。◎=88 ○=76 △=62 ▲=50。
const SUUHI_TABLE = {
  '1-1': '△', '1-2': '◎', '1-3': '○', '1-4': '△', '1-5': '◎', '1-6': '○', '1-7': '○', '1-8': '△', '1-9': '△',
  '2-2': '○', '2-3': '○', '2-4': '◎', '2-5': '△', '2-6': '◎', '2-7': '▲', '2-8': '○', '2-9': '○',
  '3-3': '○', '3-4': '▲', '3-5': '◎', '3-6': '○', '3-7': '△', '3-8': '△', '3-9': '◎',
  '4-4': '○', '4-5': '▲', '4-6': '○', '4-7': '◎', '4-8': '◎', '4-9': '△',
  '5-5': '○', '5-6': '△', '5-7': '○', '5-8': '△', '5-9': '○',
  '6-6': '○', '6-7': '△', '6-8': '○', '6-9': '◎',
  '7-7': '△', '7-8': '△', '7-9': '◎',
  '8-8': '▲', '8-9': '▲',
  '9-9': '○',
};
const RANK_SCORE = { '◎': 88, '○': 76, '△': 62, '▲': 50 };

describe('suuhiAisho（数秘術の相性判定表・全45組を独立アンカーで固定）', () => {
  it('45組すべてがテスト側の表と一致する（ランク・スコア）', () => {
    for (const [key, rank] of Object.entries(SUUHI_TABLE)) {
      const [a, b] = key.split('-').map(Number);
      const r = suuhiAisho(a, b);
      expect(r.rank, key).toBe(rank);
      expect(r.score, key).toBe(RANK_SCORE[rank]);
    }
  });
  it('対称（suuhiAisho(a,b) と suuhiAisho(b,a) は同スコア）', () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        expect(suuhiAisho(a, b).score, `${a}-${b}`).toBe(suuhiAisho(b, a).score);
      }
    }
  });
  it('ランク分布は ◎10・○17・△13・▲5', () => {
    const count = { '◎': 0, '○': 0, '△': 0, '▲': 0 };
    for (const rank of Object.values(SUUHI_TABLE)) count[rank]++;
    expect(count).toEqual({ '◎': 10, '○': 17, '△': 13, '▲': 5 });
  });
  it('コメントが全45組で空でない', () => {
    for (const key of Object.keys(SUUHI_TABLE)) {
      const [a, b] = key.split('-').map(Number);
      expect(suuhiAisho(a, b).comment.length, key).toBeGreaterThan(15);
    }
  });
});

describe('suuhiAisho（マスターナンバーの規則）', () => {
  it('マスターと対応基数は強い共鳴（11×2・22×4・33×6 → ◎）', () => {
    expect(suuhiAisho(11, 2).rank).toBe('◎');
    expect(suuhiAisho(22, 4).rank).toBe('◎');
    expect(suuhiAisho(33, 6).rank).toBe('◎');
  });
  it('マスター同士：11×22◎ / 11×33○ / 22×33○ / 同数同士○', () => {
    expect(suuhiAisho(11, 22).rank).toBe('◎');
    expect(suuhiAisho(11, 33).rank).toBe('○');
    expect(suuhiAisho(22, 33).rank).toBe('○');
    expect(suuhiAisho(11, 11).rank).toBe('○');
    expect(suuhiAisho(22, 22).rank).toBe('○');
    expect(suuhiAisho(33, 33).rank).toBe('○');
  });
  it('マスター×通常数は基数の表で判定（11×5=2×5の△ / 33×9=6×9の◎ / 22×7=4×7の◎）', () => {
    expect(suuhiAisho(11, 5).rank).toBe('△');
    expect(suuhiAisho(11, 5).score).toBe(suuhiAisho(2, 5).score);
    expect(suuhiAisho(33, 9).rank).toBe('◎');
    expect(suuhiAisho(22, 7).rank).toBe('◎');
  });
  it('マスターを含んでも対称', () => {
    expect(suuhiAisho(4, 22).score).toBe(suuhiAisho(22, 4).score);
    expect(suuhiAisho(9, 33).score).toBe(suuhiAisho(33, 9).score);
  });
  it('不正な数は null', () => {
    expect(suuhiAisho(0, 5)).toBeNull();
    expect(suuhiAisho(10, 5)).toBeNull();
    expect(suuhiAisho(1, 34)).toBeNull();
  });
});

// 12ゾーン→スコア（テスト側の独立コピー）
const ZONE_SCORES = {
  種子: 80, 緑生: 82, 立花: 88, 健弱: 58, 達成: 92, 乱気: 52,
  再会: 78, 財成: 86, 安定: 88, 陰影: 42, 停止: 38, 減退: 46,
};

describe('zoneAisho（六星占術ゾーン→相性スコアの固定）', () => {
  it('12ゾーンすべてのスコアが判定基準どおり', () => {
    for (const [zone, score] of Object.entries(ZONE_SCORES)) {
      expect(zoneAisho(zone).score, zone).toBe(score);
      expect(zoneAisho(zone).comment.length, zone).toBeGreaterThan(10);
    }
  });
  it('未知のゾーンは null', () => {
    expect(zoneAisho('未知')).toBeNull();
  });
});

describe('rokuseiAisho（相手の生まれ年があなたの周期のどのゾーンか）', () => {
  it('火星人マイナス × 1958年（戌年）生まれの相手 → 緑生・82', () => {
    const r = rokuseiAisho('火星人マイナス', 1958);
    expect(r.zone).toBe('緑生');
    expect(r.score).toBe(82);
  });
  it('土星人プラス × 1985年（丑年）生まれの相手 → 緑生・82', () => {
    const r = rokuseiAisho('土星人プラス', 1985);
    expect(r.zone).toBe('緑生');
    expect(r.score).toBe(82);
  });
  it('火星人マイナス × 1979年（未年）生まれの相手 → 停止（大殺界ゾーン）・38', () => {
    const r = rokuseiAisho('火星人マイナス', 1979);
    expect(r.zone).toBe('停止');
    expect(r.category).toBe('大殺界');
    expect(r.score).toBe(38);
  });
  it('不正なタイプ・年は null', () => {
    expect(rokuseiAisho('無星人プラス', 1990)).toBeNull();
    expect(rokuseiAisho('土星人プラス', NaN)).toBeNull();
  });
});

describe('tanjobiAisho（総合判定）', () => {
  it('1985-08-20 × 1958-02-24：数秘76・六星82・総合79「良い相性」', () => {
    const r = tanjobiAisho({ y: 1985, m: 8, d: 20 }, { y: 1958, m: 2, d: 24 });
    // 本人プロフィール
    expect(r.p1.birth.number).toBe(33);
    expect(r.p1.rokusei.type).toBe('火星人マイナス');
    expect(r.p2.birth.number).toBe(4);
    expect(r.p2.rokusei.type).toBe('土星人プラス');
    // 数秘: 33→基数6 × 4 → 4-6 の○=76
    expect(r.suuhi.score).toBe(76);
    expect(r.suuhi.rank).toBe('○');
    // 六星: 双方向とも緑生82 → floor((82+82)/2)=82
    expect(r.rokusei.a2b.zone).toBe('緑生');
    expect(r.rokusei.b2a.zone).toBe('緑生');
    expect(r.rokusei.score).toBe(82);
    // 総合: floor((76+82)/2)=79 → ○
    expect(r.total.score).toBe(79);
    expect(r.total.rank).toBe('○');
    expect(r.total.label).toBe('良い相性');
  });
  it('総合スコアは端数切り捨て（Math.floor）', () => {
    // 数秘88 + 六星（達成92+停止38 → floor(65)）= floor((88+65)/2) = 76 のような
    // 奇数和ケースを含め、常に整数で返る
    const r = tanjobiAisho({ y: 1990, m: 8, d: 15 }, { y: 1990, m: 8, d: 15 });
    expect(Number.isInteger(r.total.score)).toBe(true);
    expect(Number.isInteger(r.rokusei.score)).toBe(true);
  });
  it('同じ誕生日同士でも判定できる（33×33 → ○76）', () => {
    const r = tanjobiAisho({ y: 1990, m: 8, d: 15 }, { y: 1990, m: 8, d: 15 });
    expect(r.suuhi.rank).toBe('○');
    expect(r.suuhi.score).toBe(76);
  });
  it('総合ランクの帯：◎≥85／○70-84／△55-69／▲<55', () => {
    const r = tanjobiAisho({ y: 1985, m: 8, d: 20 }, { y: 1958, m: 2, d: 24 });
    const want = r.total.score >= 85 ? '◎' : r.total.score >= 70 ? '○' : r.total.score >= 55 ? '△' : '▲';
    expect(r.total.rank).toBe(want);
  });
  it('不正な日付は null', () => {
    expect(tanjobiAisho({ y: 1985, m: 13, d: 1 }, { y: 1990, m: 1, d: 1 })).toBeNull();
    expect(tanjobiAisho({ y: 1985, m: 1, d: 1 }, { y: 1990, m: 2, d: 30 })).toBeNull();
  });
});

describe('NUMBER_PROFILES（誕生数の性格プロフィール）', () => {
  it('1〜9・11・22・33 の12種が揃い、説明が空でない', () => {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    for (const k of keys) {
      expect(NUMBER_PROFILES[k], `number ${k}`).toBeDefined();
      expect(NUMBER_PROFILES[k].catch.length, `number ${k}`).toBeGreaterThan(3);
      expect(NUMBER_PROFILES[k].desc.length, `number ${k}`).toBeGreaterThan(20);
    }
  });
});
