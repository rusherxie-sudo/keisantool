import { describe, it, expect } from 'vitest';
import { calculationSteps, birthYearTable, daisakkaiRange, chiun } from '../src/lib/rokusei-lookup.js';
import { rokusei, fortuneTable } from '../src/lib/rokusei.js';

describe('出生年月表：公開例・閏年・60の境界', () => {
  // netoff public table and worked examples, read 2026-11-07.
  it.each([
    [1985,8,15,9,23,'火星人マイナス'],
    [2010,1,1,48,48,'木星人プラス'],
    [2015,1,2,14,15,'金星人マイナス'],
    [1975,5,7,44,50,'木星人マイナス'],
    [1953,3,31,48,18,'金星人マイナス'],
  ])('%i-%i-%i', (y,m,d,number,starNumber,type) => {
    expect(calculationSteps(y,m,d)).toMatchObject({number,starNumber,type});
  });
  it('公開1952年うるう年表', () => {
    expect(birthYearTable(1952).map(x=>x.number)).toEqual([43,14,43,14,44,15,45,16,47,17,48,18]);
  });
  it('60は0にせず、61は1に戻る', () => {
    expect(calculationSteps(1960,12,1).starNumber).toBe(60);
    expect(calculationSteps(1960,12,2).starNumber).toBe(1);
  });
  it('日付と年の範囲を検証する', () => {
    for (const d of [[2023,2,29],[2000,13,1],[1899,1,1],[2100,1,1]]) expect(calculationSteps(...d)).toBeNull();
    expect(calculationSteps(2000,2,29)).not.toBeNull();
    expect(birthYearTable(NaN)).toEqual([]);
  });
});
describe('大殺界区間検索', () => {
  it('2026年だけでも火星＋2025〜2027年の完全な区間を返す', () => {
    expect(daisakkaiRange('火星人プラス',2026,2026).periods).toEqual([{startYear:2025,endYear:2027,seedYear:2028,clipped:true}]);
  });
  it('過去と次の周期を混ぜない', () => {
    expect(daisakkaiRange('火星人プラス',2024,2038).periods.map(x=>[x.startYear,x.endYear])).toEqual([[2025,2027],[2037,2039]]);
  });
  it('該当なしと入力エラーを区別する', () => {
    expect(daisakkaiRange('火星人プラス',2028,2036).periods).toEqual([]);
    for (const args of [['?',2026,2027],['土星人プラス',2027,2026],['土星人プラス',1900,2100]]) expect(daisakkaiRange(...args)).toBeNull();
  });
});
describe('地運：相手の干支で判定', () => {
  it('大久保研究室の1956-04-12男性と子年の公開例', () => {
    const p=rokusei(1956,4,12);
    expect(p.type).toBe('木星人プラス');
    expect(chiun(p.type,'子').zone).toBe('安定');
    expect(chiun(p.type,'寅').zone).toBe('停止');
    expect(chiun(p.type,'申').zone).toBe('達成');
  });
  it('同じ極性でも相手の出生年支が違えば結果が変わる', () => {
    expect(chiun('木星人プラス','子').zone).not.toBe(chiun('木星人プラス','寅').zone);
    expect(chiun('?', '子')).toBeNull();
    expect(chiun('木星人プラス','?')).toBeNull();
  });
  it('公開6星ページの2027年プラス/マイナスと一致', () => {
    expect(fortuneTable(2027).map(x=>x.zone)).toEqual(['財成','再会','陰影','安定','減退','停止','緑生','種子','健弱','立花','乱気','達成']);
  });
});
