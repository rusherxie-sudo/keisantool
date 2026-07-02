import { describe, it, expect } from 'vitest';
import { seiza } from '../src/lib/seiza.js';

describe('seiza — 誕生日から12星座', () => {
  it('代表的な日付で正しい星座を返す', () => {
    expect(seiza(4, 1).name).toBe('牡羊座');
    expect(seiza(5, 1).name).toBe('牡牛座');
    expect(seiza(6, 1).name).toBe('双子座');
    expect(seiza(7, 1).name).toBe('蟹座');
    expect(seiza(8, 1).name).toBe('獅子座');
    expect(seiza(9, 1).name).toBe('乙女座');
    expect(seiza(10, 1).name).toBe('天秤座');
    expect(seiza(11, 1).name).toBe('蠍座');
    expect(seiza(12, 1).name).toBe('射手座');
    expect(seiza(1, 5).name).toBe('山羊座');
    expect(seiza(2, 1).name).toBe('水瓶座');
    expect(seiza(3, 1).name).toBe('魚座');
  });

  it('境界日：前後で切り替わる（牡羊座 3/21〜4/19）', () => {
    expect(seiza(3, 20).name).toBe('魚座');
    expect(seiza(3, 21).name).toBe('牡羊座');
    expect(seiza(4, 19).name).toBe('牡羊座');
    expect(seiza(4, 20).name).toBe('牡牛座');
  });

  it('境界日：年をまたぐ山羊座（12/22〜1/19）', () => {
    expect(seiza(12, 21).name).toBe('射手座');
    expect(seiza(12, 22).name).toBe('山羊座');
    expect(seiza(1, 19).name).toBe('山羊座');
    expect(seiza(1, 20).name).toBe('水瓶座');
  });

  it('英名・シンボルも返す', () => {
    const s = seiza(8, 10);
    expect(s.name).toBe('獅子座');
    expect(s.en).toBe('Leo');
    expect(s.symbol).toBe('♌');
  });

  it('無効な入力は null', () => {
    expect(seiza(0, 1)).toBeNull();
    expect(seiza(13, 1)).toBeNull();
    expect(seiza(2, 30)).toBeNull();
    expect(seiza('a', 'b')).toBeNull();
  });
});
