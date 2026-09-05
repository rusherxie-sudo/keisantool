import { describe, it, expect } from 'vitest';
import { shukumeiDaisakkai } from '../src/lib/shukumei.js';
import { unmeiStar } from '../src/lib/rokusei.js';

describe('shukumeiDaisakkai', () => {
  it('日柱の空亡と運命星は既存 rokusei.js と一致する（1958-02-24 = 戌亥 → 土星人）', () => {
    const r = shukumeiDaisakkai(1958, 2, 24, 'male');
    expect(r.dayXunKong).toBe('戌亥');
    expect(r.star).toBe('土星人');
    // 既存実装との整合
    expect(unmeiStar(1958, 2, 24).kuubou).toBe('戌亥');
  });

  it('大運の首運は月柱の次の干支（順行・甲年男）になる（1974-10-10 月柱甲戌 → 首運乙亥）', () => {
    const r = shukumeiDaisakkai(1974, 10, 10, 'male');
    expect(r.monthGZ).toBe('甲戌');
    expect(r.forward).toBe(true); // 甲年=陽年、男→順行
    expect(r.dayun[0].gz).toBe('乙亥'); // 甲戌 + 1
  });

  it('陽年の男女で順行／逆行が反転する', () => {
    const male = shukumeiDaisakkai(1974, 10, 10, 'male');
    const female = shukumeiDaisakkai(1974, 10, 10, 'female');
    expect(male.forward).toBe(true);
    expect(female.forward).toBe(false);
  });

  it('宿命大殺界は空亡地支に該当する連続20年で、内訳は初起5年・中起10年・転起5年', () => {
    const r = shukumeiDaisakkai(1974, 10, 30, 'male'); // 空亡 寅卯
    const s = r.shukumei;
    expect(s.endAge - s.startAge).toBe(20);
    expect(s.shoki.toAge - s.shoki.fromAge).toBe(5);
    expect(s.chuki.toAge - s.chuki.fromAge).toBe(10);
    expect(s.tenki.toAge - s.tenki.fromAge).toBe(5);
    // 宿命大殺界を構成する2運の地支は、日柱空亡（寅・卯）である
    const kong = [r.dayXunKong[0], r.dayXunKong[1]];
    const startYun = r.dayun.find((y) => y.fromAge === s.startAge);
    const nextYun = r.dayun.find((y) => y.fromAge === s.startAge + 10);
    expect(kong).toContain(startYun.zhi);
    expect(kong).toContain(nextYun.zhi);
  });

  it('不正な日付・性別は null を返す', () => {
    expect(shukumeiDaisakkai(2026, 2, 30, 'male')).toBeNull();
    expect(shukumeiDaisakkai(2026, 13, 1, 'male')).toBeNull();
    expect(shukumeiDaisakkai(2026, 1, 1, 'other')).toBeNull();
  });

  it('起運歳数は「節までの日数 ÷3」で、整数歳＋月（0〜11月）に正規化される', () => {
    const r = shukumeiDaisakkai(1974, 10, 10, 'male');
    expect(r.startYears).toBeGreaterThanOrEqual(0);
    expect(r.startMonths).toBeGreaterThanOrEqual(0);
    expect(r.startMonths).toBeLessThanOrEqual(11);
  });
});
