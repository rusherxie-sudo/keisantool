import { describe, expect, it } from 'vitest';
import { solveRectangle, solveCuboid, screenFromDiagonal, screenFromDimensions } from '../src/lib/taikakusen.js';

describe('長方形の対角線と辺の逆算', () => {
  it('3×4の対角線は5', () => expect(solveRectangle({ target: 'diagonal', width: 3, height: 4 }).diagonal).toBe(5));
  it('対角線13と高さ5から幅12', () => expect(solveRectangle({ target: 'width', diagonal: 13, height: 5 }).width).toBe(12));
  it('斜辺以下の辺・0・負数を拒否する', () => {
    expect(solveRectangle({ target: 'width', diagonal: 5, height: 5 })).toBeNull();
    expect(solveRectangle({ target: 'diagonal', width: 0, height: 4 })).toBeNull();
    expect(solveRectangle({ target: 'diagonal', width: -3, height: 4 })).toBeNull();
  });
});

describe('直方体と画面サイズ', () => {
  it('2×3×6の空間対角線は7', () => expect(solveCuboid({ width: 2, height: 3, depth: 6 }).diagonal).toBe(7));
  it('50インチ16:9の幅と高さを求める', () => {
    const r = screenFromDiagonal({ diagonalInch: 50, aspectWidth: 16, aspectHeight: 9 });
    expect(r.widthCm).toBeCloseTo(110.69, 2); expect(r.heightCm).toBeCloseTo(62.26, 2);
  });
  it('幅110.69cm・高さ62.26cmは約50インチ', () => {
    expect(screenFromDimensions({ widthCm: 110.69, heightCm: 62.26 }).diagonalInch).toBeCloseTo(50, 2);
  });
  it('非有限・不正なアスペクト比を拒否する', () => {
    expect(solveCuboid({ width: 1, height: 2, depth: Infinity })).toBeNull();
    expect(screenFromDiagonal({ diagonalInch: 50, aspectWidth: 0, aspectHeight: 9 })).toBeNull();
  });
});
