import { test, expect } from 'vitest';
import { calcSuumijutsu } from '../src/lib/suumijutsu.js';

test('誕生数計算 - 1990年1月1日', () => {
  const result = calcSuumijutsu(1990, 1, 1);
  expect(result.birthNumber).toBe(3);
  expect(result.birthNumberName).toBe('創造');
});

test('誕生数計算 - 1985年10月24日', () => {
  const result = calcSuumijutsu(1985, 10, 24);
  expect(result.birthNumber).toBe(3);
});

test('誕生数計算 - 1970年5月5日', () => {
  const result = calcSuumijutsu(1970, 5, 5);
  expect(result.birthNumber).toBe(9);
});

test('誕生数計算 - 1999年12月31日', () => {
  const result = calcSuumijutsu(1999, 12, 31);
  expect(result.birthNumber).toBe(8);
});

test('誕生数計算 - 2000年1月1日', () => {
  const result = calcSuumijutsu(2000, 1, 1);
  expect(result.birthNumber).toBe(4);
});

test('誕生数計算 - 1960年6月6日', () => {
  const result = calcSuumijutsu(1960, 6, 6);
  expect(result.birthNumber).toBe(1);
});

test('誕生数計算 - 1980年8月8日', () => {
  const result = calcSuumijutsu(1980, 8, 8);
  expect(result.birthNumber).toBe(7);
});

test('誕生数計算 - 1955年5月15日', () => {
  const result = calcSuumijutsu(1955, 5, 15);
  expect(result.birthNumber).toBe(4);
});

test('誕生数計算 - 1995年11月11日', () => {
  const result = calcSuumijutsu(1995, 11, 11);
  expect(result.birthNumber).toBe(1);
});

test('誕生数計算 - 1977年7月7日', () => {
  const result = calcSuumijutsu(1977, 7, 7);
  expect(result.birthNumber).toBe(2);
});

test('誕生数計算 - 1991年1月1日', () => {
  const result = calcSuumijutsu(1991, 1, 1);
  expect(result.birthNumber).toBe(4);
});

test('誕生数計算 - 2007年9月9日', () => {
  const result = calcSuumijutsu(2007, 9, 9);
  expect(result.birthNumber).toBe(9);
  expect(result.birthNumberName).toBe('慈悲');
});

test('無効な日付 - 月が13', () => {
  const result = calcSuumijutsu(1990, 13, 1);
  expect(result.valid).toBe(false);
});

test('無効な日付 - 日が32', () => {
  const result = calcSuumijutsu(1990, 1, 32);
  expect(result.valid).toBe(false);
});

test('無効な日付 - 2月30日', () => {
  const result = calcSuumijutsu(1990, 2, 30);
  expect(result.valid).toBe(false);
});

test('うるう年の2月29日', () => {
  const result = calcSuumijutsu(2020, 2, 29);
  expect(result.valid).toBe(true);
  expect(result.birthNumber).toBe(8);
});

test('非うるう年の2月29日', () => {
  const result = calcSuumijutsu(2019, 2, 29);
  expect(result.valid).toBe(false);
});