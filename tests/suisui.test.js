import { test, expect } from 'vitest';
import { calcSuisui } from '../src/lib/suisui.js';

test('基本的な水分摂取量計算', () => {
  const result = calcSuisui(60, 'normal');
  expect(result.recommended).toBe(1800);
  expect(result.glasses).toBe(12);
});

test('活動量が多い場合', () => {
  const result = calcSuisui(60, 'active');
  expect(result.recommended).toBe(2400);
  expect(result.glasses).toBe(16);
});

test('活動量が少ない場合', () => {
  const result = calcSuisui(60, 'sedentary');
  expect(result.recommended).toBe(1500);
  expect(result.glasses).toBe(10);
});

test('体重50kgの場合', () => {
  const result = calcSuisui(50, 'normal');
  expect(result.recommended).toBe(1500);
  expect(result.glasses).toBe(10);
});

test('体重70kgの場合', () => {
  const result = calcSuisui(70, 'normal');
  expect(result.recommended).toBe(2100);
  expect(result.glasses).toBe(14);
});

test('体重80kgの場合', () => {
  const result = calcSuisui(80, 'normal');
  expect(result.recommended).toBe(2400);
  expect(result.glasses).toBe(16);
});

test('体重40kgの場合', () => {
  const result = calcSuisui(40, 'normal');
  expect(result.recommended).toBe(1200);
  expect(result.glasses).toBe(8);
});

test('体重90kgの場合', () => {
  const result = calcSuisui(90, 'normal');
  expect(result.recommended).toBe(2700);
  expect(result.glasses).toBe(18);
});

test('活動量が多い - 70kg', () => {
  const result = calcSuisui(70, 'active');
  expect(result.recommended).toBe(2800);
  expect(result.glasses).toBe(19);
});

test('活動量が少ない - 50kg', () => {
  const result = calcSuisui(50, 'sedentary');
  expect(result.recommended).toBe(1250);
  expect(result.glasses).toBe(9);
});

test('非数値入力', () => {
  const result = calcSuisui('abc', 'normal');
  expect(result.recommended).toBe(0);
});

test('負の体重', () => {
  const result = calcSuisui(-60, 'normal');
  expect(result.recommended).toBe(0);
});

test('ゼロ体重', () => {
  const result = calcSuisui(0, 'normal');
  expect(result.recommended).toBe(0);
});

test('小数体重', () => {
  const result = calcSuisui(65.5, 'normal');
  expect(result.recommended).toBe(1965);
});

test('デフォルト活動量', () => {
  const result = calcSuisui(60);
  expect(result.recommended).toBe(1800);
});