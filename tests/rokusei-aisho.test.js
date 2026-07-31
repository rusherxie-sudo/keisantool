import { describe, it, expect } from 'vitest';
import {
  rokuseiCompatibility,
  rokuseiCompatibilityRank,
} from '../src/lib/rokusei-aisho.js';

// 六星占術の地運相性は、相手の生まれ年が自分の運命周期のどこに
// 当たるかを双方向で確認する。基礎となる12ゾーンの判定とスコアは
// tanjobi-aisho.test.js で全件固定済み。本テストは専用ツールの集約契約を固定する。

describe('rokuseiCompatibilityRank（相性スコアの表示帯）', () => {
  it('境界値を4段階に分類する', () => {
    expect(rokuseiCompatibilityRank(100)).toEqual({ rank: '◎', label: 'とても良い相性' });
    expect(rokuseiCompatibilityRank(85)).toEqual({ rank: '◎', label: 'とても良い相性' });
    expect(rokuseiCompatibilityRank(84)).toEqual({ rank: '○', label: '良い相性' });
    expect(rokuseiCompatibilityRank(70)).toEqual({ rank: '○', label: '良い相性' });
    expect(rokuseiCompatibilityRank(69)).toEqual({ rank: '△', label: '工夫しだいの相性' });
    expect(rokuseiCompatibilityRank(55)).toEqual({ rank: '△', label: '工夫しだいの相性' });
    expect(rokuseiCompatibilityRank(54)).toEqual({ rank: '▲', label: '刺激し合う相性' });
    expect(rokuseiCompatibilityRank(0)).toEqual({ rank: '▲', label: '刺激し合う相性' });
  });

  it('範囲外・非数値は null', () => {
    expect(rokuseiCompatibilityRank(-1)).toBeNull();
    expect(rokuseiCompatibilityRank(101)).toBeNull();
    expect(rokuseiCompatibilityRank(NaN)).toBeNull();
  });
});

describe('rokuseiCompatibility（ふたりの地運相性）', () => {
  it('1985-08-20 × 1958-02-24 は双方向とも緑生・総合82点', () => {
    expect(
      rokuseiCompatibility(
        { y: 1985, m: 8, d: 20 },
        { y: 1958, m: 2, d: 24 },
        2026,
      ),
    ).toEqual({
      p1: {
        type: '火星人マイナス',
        star: '火星人',
        polarity: 'マイナス',
        birthYear: 1985,
        yearFortune: { zone: '陰影', category: '大殺界' },
      },
      p2: {
        type: '土星人プラス',
        star: '土星人',
        polarity: 'プラス',
        birthYear: 1958,
        yearFortune: { zone: '再会', category: '好調' },
      },
      p1ToP2: {
        zone: '緑生',
        category: '好調',
        score: 82,
        comment: expect.any(String),
      },
      p2ToP1: {
        zone: '緑生',
        category: '好調',
        score: 82,
        comment: expect.any(String),
      },
      total: { score: 82, rank: '○', label: '良い相性' },
      year: 2026,
    });
  });

  it('人物を入れ替えても総合点は同じで、方向だけが入れ替わる', () => {
    const a = { y: 1985, m: 8, d: 20 };
    const b = { y: 1958, m: 2, d: 24 };
    const ab = rokuseiCompatibility(a, b, 2026);
    const ba = rokuseiCompatibility(b, a, 2026);
    expect(ba.total).toEqual(ab.total);
    expect(ba.p1ToP2).toEqual(ab.p2ToP1);
    expect(ba.p2ToP1).toEqual(ab.p1ToP2);
  });

  it('総合点は双方向スコアの平均を切り捨てる', () => {
    const result = rokuseiCompatibility(
      { y: 1990, m: 8, d: 15 },
      { y: 1985, m: 8, d: 20 },
      2026,
    );
    expect(result.total.score).toBe(
      Math.floor((result.p1ToP2.score + result.p2ToP1.score) / 2),
    );
  });

  it('不正な日付・年は null', () => {
    const valid = { y: 1985, m: 8, d: 20 };
    expect(rokuseiCompatibility({ y: 1985, m: 2, d: 30 }, valid, 2026)).toBeNull();
    expect(rokuseiCompatibility(valid, { y: 1958, m: 13, d: 1 }, 2026)).toBeNull();
    expect(rokuseiCompatibility(valid, valid, NaN)).toBeNull();
  });
});
