import { test, expect } from 'vitest';
import { calcWarikai, calcWeightedWarikai, roundToUnit } from '../src/lib/warikai.js';

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

test('100円単位で切り上げる', () => {
  const result = calcWarikai(1001, 5, 'ceil', false, 100);
  expect(result.perPerson).toBe(300);
  expect(result.total).toBe(1500);
  expect(result.difference).toBe(499);
});

test('幹事負担は他の参加者を選択単位で切り捨て、幹事が残額を払う', () => {
  const result = calcWarikai(1001, 5, 'ceil', true, 100);
  expect(result.perPerson).toBe(200);
  expect(result.organizerPays).toBe(201);
  expect(result.total).toBe(1001);
  expect(result.difference).toBe(0);
});

test('人数は正の整数に限る', () => {
  expect(calcWarikai(1000, 2.5).perPerson).toBe(0);
});

test('円未満の合計金額は切り捨てる', () => {
  expect(calcWarikai(1000.9, 2, 'floor').perPerson).toBe(500);
});

test('roundToUnit: 10円・100円・500円・1000円単位に丸められる', () => {
  expect(roundToUnit(1234, 10, 'floor')).toBe(1230);
  expect(roundToUnit(1234, 100, 'ceil')).toBe(1300);
  expect(roundToUnit(1250, 100, 'round')).toBe(1300);
  expect(roundToUnit(1200, 500, 'ceil')).toBe(1500);
  expect(roundToUnit(1800, 1000, 'floor')).toBe(1000);
});

test('roundToUnit: 非対応単位は1円として扱う', () => {
  expect(roundToUnit(123.4, 7, 'floor')).toBe(123);
});

test('傾斜割り勘: 倍率どおりにぴったり配分できる', () => {
  const result = calcWeightedWarikai(10000, [
    { name: '多め', people: 1, weight: 1.5 },
    { name: '普通', people: 3, weight: 1 },
    { name: '少なめ', people: 1, weight: 0.5 },
  ], 100, 'round');

  expect(result.groups.map((group) => group.perPerson)).toEqual([3000, 2000, 1000]);
  expect(result.people).toBe(5);
  expect(result.collectedTotal).toBe(10000);
  expect(result.difference).toBe(0);
});

test('傾斜割り勘: 丸め後の不足額を隠さず返す', () => {
  const result = calcWeightedWarikai(48000, [
    { name: '上司', people: 2, weight: 1.5 },
    { name: '先輩', people: 3, weight: 1.2 },
    { name: '後輩', people: 5, weight: 1 },
  ], 100, 'round');

  expect(result.groups.map((group) => group.perPerson)).toEqual([6200, 5000, 4100]);
  expect(result.groups.map((group) => group.subtotal)).toEqual([12400, 15000, 20500]);
  expect(result.collectedTotal).toBe(47900);
  expect(result.difference).toBe(-100);
});

test('傾斜割り勘: 無効なグループは計算しない', () => {
  expect(calcWeightedWarikai(10000, [{ name: '普通', people: 0, weight: 1 }])).toEqual({
    groups: [], people: 0, total: 0, collectedTotal: 0, difference: 0,
  });
  expect(calcWeightedWarikai(10000, [{ name: '普通', people: 2, weight: 0 }]).groups).toEqual([]);
});
