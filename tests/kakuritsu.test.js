import { describe, expect, it } from 'vitest';
import {
  combination,
  factorial,
  permutation,
  repeatedTrialProbability,
  simpleProbability,
} from '../src/lib/kakuritsu.js';

describe('factorial（階乗）', () => {
  it('0!と1!は1', () => {
    expect(factorial(0)).toBe('1');
    expect(factorial(1)).toBe('1');
  });

  it('10!をBigIntで正確に計算する', () => {
    expect(factorial(10)).toBe('3628800');
  });

  it('負数・小数・上限超過はnull', () => {
    expect(factorial(-1)).toBeNull();
    expect(factorial(2.5)).toBeNull();
    expect(factorial(1001)).toBeNull();
  });
});

describe('permutation / combination（順列・組み合わせ）', () => {
  it('10個から3個を選んで並べる順列は720通り', () => {
    expect(permutation(10, 3)).toBe('720');
  });

  it('10個から3個を選ぶ組み合わせは120通り', () => {
    expect(combination(10, 3)).toBe('120');
  });

  it('nC0・nCnは1で、対称性を保つ', () => {
    expect(combination(100, 0)).toBe('1');
    expect(combination(100, 100)).toBe('1');
    expect(combination(100, 3)).toBe(combination(100, 97));
  });

  it('安全整数を超える結果も正確に返す', () => {
    expect(combination(100, 50)).toBe('100891344545564193334812497256');
  });

  it('rがnを超える場合や不正入力はnull', () => {
    expect(permutation(3, 4)).toBeNull();
    expect(combination(3, -1)).toBeNull();
    expect(combination('10', 3)).toBeNull();
  });
});

describe('simpleProbability（基本確率）', () => {
  it('サイコロで偶数が出る確率3/6を1/2へ約分する', () => {
    expect(simpleProbability(3, 6)).toEqual({
      favorable: 3,
      total: 6,
      numerator: '1',
      denominator: '2',
      decimal: 0.5,
      percent: 50,
    });
  });

  it('0通りと全事象を扱える', () => {
    expect(simpleProbability(0, 8)).toMatchObject({ numerator: '0', denominator: '1', percent: 0 });
    expect(simpleProbability(8, 8)).toMatchObject({ numerator: '1', denominator: '1', percent: 100 });
  });

  it('全体0・有利な場合が全体を超える入力はnull', () => {
    expect(simpleProbability(1, 0)).toBeNull();
    expect(simpleProbability(7, 6)).toBeNull();
    expect(simpleProbability(1.5, 6)).toBeNull();
  });
});

describe('repeatedTrialProbability（反復試行）', () => {
  it('成功率20%を5回試してちょうど2回成功する確率', () => {
    const result = repeatedTrialProbability(5, 2, 0.2);
    expect(result.exactly).toBeCloseTo(0.2048, 12);
    expect(result.atLeastOne).toBeCloseTo(0.67232, 12);
    expect(result.combinations).toBe('10');
  });

  it('成功率0%・100%の境界を扱える', () => {
    expect(repeatedTrialProbability(4, 0, 0)).toMatchObject({ exactly: 1, atLeastOne: 0 });
    expect(repeatedTrialProbability(4, 4, 1)).toMatchObject({ exactly: 1, atLeastOne: 1 });
  });

  it('試行0回では0回成功だけが確率1', () => {
    expect(repeatedTrialProbability(0, 0, 0.5)).toMatchObject({ exactly: 1, atLeastOne: 0 });
  });

  it('確率範囲外・成功回数超過・上限超過はnull', () => {
    expect(repeatedTrialProbability(5, 6, 0.5)).toBeNull();
    expect(repeatedTrialProbability(5, 2, 1.1)).toBeNull();
    expect(repeatedTrialProbability(1001, 2, 0.5)).toBeNull();
  });
});
