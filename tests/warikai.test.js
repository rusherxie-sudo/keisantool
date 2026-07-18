import { test, expect } from 'vitest';
import { calcWarikai } from '../src/lib/warikai.js';

test('基本的な割り勘計算', () => {
  const result = calcWarikai(1000, 5, 'ceil');
  expect(result.perPerson).toBe(200);
  expect(result.total).toBe(1000);
  expect(result.remainder).toBe(0);
});

test('端数がある場合 - 切り上げ', () => {
  const result = calcWarikai(1001, 5, 'ceil');
  expect(result.perPerson).toBe(201);
  expect(result.total).toBe(1005);
  expect(result.remainder).toBe(4);
});

test('端数がある場合 - 切り捨て', () => {
  const result = calcWarikai(1001, 5, 'floor');
  expect(result.perPerson).toBe(200);
  expect(result.total).toBe(1000);
  expect(result.remainder).toBe(1);
});

test('端数がある場合 - 四捨五入', () => {
  const result = calcWarikai(1003, 5, 'round');
  expect(result.perPerson).toBe(201);
  expect(result.total).toBe(1005);
  expect(result.remainder).toBe(2);
});

test('四捨五入 - 端数が5未満', () => {
  const result = calcWarikai(1002, 5, 'round');
  expect(result.perPerson).toBe(200);
  expect(result.total).toBe(1000);
  expect(result.remainder).toBe(2);
});

test('一人の場合', () => {
  const result = calcWarikai(1000, 1, 'ceil');
  expect(result.perPerson).toBe(1000);
  expect(result.total).toBe(1000);
  expect(result.remainder).toBe(0);
});

test('二人の場合', () => {
  const result = calcWarikai(1000, 2, 'ceil');
  expect(result.perPerson).toBe(500);
  expect(result.total).toBe(1000);
  expect(result.remainder).toBe(0);
});

test('大きな金額', () => {
  const result = calcWarikai(123456789, 7, 'ceil');
  expect(result.perPerson).toBe(17636685);
  expect(result.total).toBe(123456795);
  expect(result.remainder).toBe(6);
});

test('非数値入力', () => {
  const result = calcWarikai('abc', 5, 'ceil');
  expect(result.perPerson).toBe(0);
});

test('負の金額', () => {
  const result = calcWarikai(-1000, 5, 'ceil');
  expect(result.perPerson).toBe(0);
});

test('ゼロ人数', () => {
  const result = calcWarikai(1000, 0, 'ceil');
  expect(result.perPerson).toBe(0);
});

test('負の人数', () => {
  const result = calcWarikai(1000, -5, 'ceil');
  expect(result.perPerson).toBe(0);
});

test('幹事負担オプション', () => {
  const result = calcWarikai(1001, 5, 'ceil', true);
  expect(result.perPerson).toBe(200);
  expect(result.organizerPays).toBe(201);
  expect(result.total).toBe(1001);
});

test('幹事負担 - 端数なし', () => {
  const result = calcWarikai(1000, 5, 'ceil', true);
  expect(result.perPerson).toBe(200);
  expect(result.organizerPays).toBe(200);
});

test('幹事負担 - 切り捨て', () => {
  const result = calcWarikai(1006, 5, 'floor', true);
  expect(result.perPerson).toBe(201);
  expect(result.organizerPays).toBe(202);
  expect(result.remainder).toBe(1);
});