import { describe, it, expect } from 'vitest';
import { predictPeriods, ovulation, fertileWindow } from '../src/lib/seiri.js';

describe('predictPeriods — 次回以降の生理開始日', () => {
  it('周期28日で3回分を予測', () => {
    expect(predictPeriods('2026-01-01', 28, 3)).toEqual([
      '2026-01-29',
      '2026-02-26',
      '2026-03-26',
    ]);
  });

  it('count 既定は1回分', () => {
    expect(predictPeriods('2026-01-01', 30)).toEqual(['2026-01-31']);
  });

  it('無効な入力は null', () => {
    expect(predictPeriods('', 28, 3)).toBeNull();
    expect(predictPeriods('2026-01-01', 0, 3)).toBeNull();
    expect(predictPeriods('2026-01-01', 28, 0)).toBeNull();
  });
});

describe('ovulation — 排卵日の予測', () => {
  it('排卵日 = 生理開始日 +(周期 − 14)。周期28日なら +14 日', () => {
    expect(ovulation('2026-01-01', 28)).toBe('2026-01-15');
  });

  it('周期が変われば排卵日もずれる（30日なら +16 日）', () => {
    expect(ovulation('2026-01-01', 30)).toBe('2026-01-17');
  });

  it('無効な入力は null', () => {
    expect(ovulation('2026-01-01', -5)).toBeNull();
    expect(ovulation('abc', 28)).toBeNull();
  });

  it('現実的でない周期（15未満・60超）は null', () => {
    // 黄体期14日の仮定では cycle−14 ≥ 1 が必要（排卵日が開始日より前に出るのを防ぐ）
    expect(ovulation('2026-01-01', 5)).toBeNull();
    expect(predictPeriods('2026-01-01', 14, 1)).toBeNull();
    expect(predictPeriods('2026-01-01', 61, 1)).toBeNull();
    expect(fertileWindow('2026-01-01', 10)).toBeNull();
  });

  it('境界値：周期15日と60日は有効', () => {
    expect(predictPeriods('2026-01-01', 15)).toEqual(['2026-01-16']);
    expect(ovulation('2026-01-01', 15)).toBe('2026-01-02');
    expect(predictPeriods('2026-01-01', 60)).toEqual(['2026-03-02']);
  });
});

describe('fertileWindow — 妊娠しやすい時期（排卵日−5〜+1）', () => {
  it('周期28日：排卵日1/15 → 1/10〜1/16', () => {
    expect(fertileWindow('2026-01-01', 28)).toEqual({
      start: '2026-01-10',
      end: '2026-01-16',
    });
  });

  it('無効な入力は null', () => {
    expect(fertileWindow('', 28)).toBeNull();
  });
});
