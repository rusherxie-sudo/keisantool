import { describe, it, expect } from 'vitest';
import { mannenrei, kazoedoshi, schoolGrade, eto } from '../src/lib/nenrei.js';

describe('mannenrei（満年齢）', () => {
  it('誕生日当日は1歳加算される', () => {
    expect(mannenrei('1990-06-15', '2026-06-15')).toBe(36);
  });

  it('誕生日の前日はまだ加算されない', () => {
    expect(mannenrei('1990-06-16', '2026-06-15')).toBe(35);
  });

  it('誕生日の翌日は当然加算済み', () => {
    expect(mannenrei('1990-06-14', '2026-06-15')).toBe(36);
  });

  it('生まれた当日は0歳', () => {
    expect(mannenrei('2026-06-15', '2026-06-15')).toBe(0);
  });

  it('基準日が誕生日より前（未来生まれ）は負にならず…手算: 2027生まれ2026基準は-1相当だが妥当性確認', () => {
    // 基準日が生年月日より前 → null（不正な並び）
    expect(mannenrei('2027-01-01', '2026-06-15')).toBeNull();
  });

  it('Date オブジェクトも受け付ける', () => {
    expect(mannenrei(new Date(1990, 5, 15), new Date(2026, 5, 15))).toBe(36);
  });

  it('2/29 生まれ：閏年でない年は 3/1 到来で加齢（2/28時点はまだ）', () => {
    // 2000-02-29 生まれ。2023(非閏年)。
    // 2/28 時点：誕生日(2/29)未到来とみなす → 22
    expect(mannenrei('2000-02-29', '2023-02-28')).toBe(22);
    // 3/1 時点：誕生日到来とみなす → 23
    expect(mannenrei('2000-02-29', '2023-03-01')).toBe(23);
  });

  it('2/29 生まれ：閏年の 2/29 当日は加齢', () => {
    expect(mannenrei('2000-02-29', '2024-02-29')).toBe(24);
  });

  it('不正な入力は null', () => {
    expect(mannenrei('', '2026-06-15')).toBeNull();
    expect(mannenrei('abc', '2026-06-15')).toBeNull();
    expect(mannenrei('1990-06-15', '')).toBeNull();
    expect(mannenrei(null, null)).toBeNull();
  });
});

describe('kazoedoshi（数え年）', () => {
  it('当年 − 生年 + 1', () => {
    expect(kazoedoshi(1990, 2026)).toBe(37);
    expect(kazoedoshi(2026, 2026)).toBe(1);
  });

  it('不正な入力は null', () => {
    expect(kazoedoshi('abc', 2026)).toBeNull();
    expect(kazoedoshi(1990, null)).toBeNull();
  });
});

describe('schoolGrade（日本の学年）', () => {
  // 早生まれ境界：4/2〜翌4/1 が同学年。
  // 2018-04-02 生まれと 2018-04-01 生まれは別学年。
  // 基準日 2025-05-01（2025年度）で確認。
  it('4/2 生まれと 4/1 生まれは1学年ずれる', () => {
    const g1 = schoolGrade('2018-04-02', '2025-05-01'); // 2018年度
    const g2 = schoolGrade('2018-04-01', '2025-05-01'); // 2017年度（早生まれ）
    expect(g1.grade).not.toBe(g2.grade);
    // 2018-04-02生まれは2025年度に小1（2025-2018=7歳学年で小1）
    expect(g1.label).toBe('小学1年生');
    // 2018-04-01生まれは1学年上で小2
    expect(g2.label).toBe('小学2年生');
  });

  it('小学3年生になる例', () => {
    // 2016-04-02 生まれは 2025年度に小3
    expect(schoolGrade('2016-04-02', '2025-05-01').label).toBe('小学3年生');
  });

  it('未就学（小学校入学前）', () => {
    // 2022-04-02 生まれは 2025年度はまだ未就学
    expect(schoolGrade('2022-04-02', '2025-05-01').label).toBe('未就学');
  });

  it('中学・高校', () => {
    // 2010-04-02生まれ → 2025年度に中3
    expect(schoolGrade('2010-04-02', '2025-05-01').label).toBe('中学3年生');
    // 2007-04-02生まれ → 2025年度に高3
    expect(schoolGrade('2007-04-02', '2025-05-01').label).toBe('高校3年生');
  });

  it('高校卒業後', () => {
    // 2000-04-02生まれ → 2025年度はとっくに卒業後
    expect(schoolGrade('2000-04-02', '2025-05-01').label).toBe('高校卒業後');
  });

  it('年度の切り替わり（4/1 と 4/2 で年度が変わる）', () => {
    // 同じ生年月日 2018-04-02 を、基準日 2025-04-01 と 2025-04-02 で見る
    // 2025-04-01 はまだ2024年度 → 年長相当（未就学）
    expect(schoolGrade('2018-04-02', '2025-04-01').label).toBe('未就学');
    // 2025-04-02 は2025年度 → 小1
    expect(schoolGrade('2018-04-02', '2025-04-02').label).toBe('小学1年生');
  });

  it('不正な入力は null', () => {
    expect(schoolGrade('', '2025-05-01')).toBeNull();
    expect(schoolGrade('2018-04-02', 'xxx')).toBeNull();
  });
});

describe('eto（干支）', () => {
  it('2020年は子（ねずみ）', () => {
    expect(eto(2020)).toBe('子');
  });

  it('十二支の循環', () => {
    expect(eto(2021)).toBe('丑');
    expect(eto(2019)).toBe('亥');
    expect(eto(2008)).toBe('子'); // 2020-12
    expect(eto(1924)).toBe('子');
  });

  it('不正な入力は null', () => {
    expect(eto('abc')).toBeNull();
    expect(eto(null)).toBeNull();
  });
});
