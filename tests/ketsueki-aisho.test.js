import { describe, it, expect } from 'vitest';
import { TYPES, ketsuekiAisho, allCombos } from '../src/lib/ketsueki-aisho.js';

// ── 検証の根拠（独立アンカー）─────────────────────────────
// 血液型相性は日本の血液型占い（娯楽・文化的慣習）で広く言われる傾向をまとめた
// 本ツールの判定基準。通行の定番評価に沿う（the-uranai.jp／unkoi.com 等）:
//  - O型×A型: 補い合う定番の最良ペア → 90 ◎
//  - AB型×AB型: 互いのペースを守れてストレスが少ない → 85 ◎
//  - B型×O型: 波長が合う → 82 ○ / A型×A型: 価値観が同じ → 80 ○
//  - A型×B型: 唯一「努力が必要」とされる定番 → 52 △（最下位）
// 10組（無序対）を全て独立アンカーで固定。スコアは対称、コメントは視点つき（方向別）。

const EXPECTED = {
  'A-A': 80, 'A-B': 52, 'A-O': 90, 'A-AB': 75,
  'B-B': 68, 'B-O': 82, 'B-AB': 58,
  'O-O': 72, 'O-AB': 63,
  'AB-AB': 85,
};

describe('TYPES', () => {
  it('A・B・O・AB の4種', () => {
    expect(TYPES).toEqual(['A', 'B', 'O', 'AB']);
  });
});

describe('ketsuekiAisho（10組の判定表を独立アンカーで固定）', () => {
  it('全10組のスコアが判定基準どおり', () => {
    for (const [key, score] of Object.entries(EXPECTED)) {
      const [a, b] = key.split('-');
      expect(ketsuekiAisho(a, b).score, key).toBe(score);
    }
  });
  it('スコアは対称（16組すべて）・ランク帯が一貫（◎≥85／○70-84／△55-69）', () => {
    for (const a of TYPES) {
      for (const b of TYPES) {
        const r = ketsuekiAisho(a, b);
        expect(r.score, `${a}-${b}`).toBe(ketsuekiAisho(b, a).score);
        const want = r.score >= 85 ? '◎' : r.score >= 70 ? '○' : '△';
        expect(r.rank, `${a}-${b}`).toBe(want);
      }
    }
  });
  it('O×A は最高の90・◎、A×B は最低の52・△', () => {
    expect(ketsuekiAisho('O', 'A')).toMatchObject({ score: 90, rank: '◎' });
    expect(ketsuekiAisho('A', 'B')).toMatchObject({ score: 52, rank: '△' });
  });
  it('コメントは視点つき（A→B と B→A で文面が異なる）・16組すべて空でない', () => {
    for (const a of TYPES) {
      for (const b of TYPES) {
        const r = ketsuekiAisho(a, b);
        expect(r.comment.length, `${a}-${b}`).toBeGreaterThan(20);
        if (a !== b) {
          expect(r.comment, `${a}-${b}`).not.toBe(ketsuekiAisho(b, a).comment);
        }
      }
    }
  });
  it('アドバイスが16組すべて空でない', () => {
    for (const a of TYPES) {
      for (const b of TYPES) {
        expect(ketsuekiAisho(a, b).advice.length, `${a}-${b}`).toBeGreaterThan(10);
      }
    }
  });
  it('無効な血液型は null', () => {
    expect(ketsuekiAisho('C', 'A')).toBeNull();
    expect(ketsuekiAisho('A', '')).toBeNull();
    expect(ketsuekiAisho('a', 'B')).toBeNull();
  });
});

describe('allCombos（静的表示用）', () => {
  it('無序対10組を返す（重複なし）', () => {
    const combos = allCombos();
    expect(combos).toHaveLength(10);
    const keys = new Set(combos.map((c) => `${c.t1}-${c.t2}`));
    expect(keys.size).toBe(10);
    expect(keys.has('A-O') || keys.has('O-A')).toBe(true);
  });
});
