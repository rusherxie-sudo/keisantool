import { describe, it, expect } from 'vitest';
import {
  CITIES,
  incomeFromSalary,
  reductionRate,
  calcKokuho,
} from '../src/lib/kokuho.js';

describe('CITIES（自治体の料率表）', () => {
  it('東京23区と大阪市が含まれる', () => {
    const keys = CITIES.map((c) => c.key);
    expect(keys).toContain('tokyo23');
    expect(keys).toContain('osaka');
  });

  it('各都市は医療分・支援金分・介護分の料率を持つ', () => {
    for (const c of CITIES) {
      for (const k of ['medical', 'support', 'care']) {
        expect(c.rates[k]).toHaveProperty('incomeRate');
        expect(c.rates[k]).toHaveProperty('perCapita');
        expect(c.rates[k]).toHaveProperty('cap');
      }
    }
  });
});

describe('incomeFromSalary（年収→給与所得の概算）', () => {
  it('給与収入200万円 → 所得132万円（200万×0.3+8万を控除）', () => {
    // 給与所得控除: 162.5万超〜180万=収入×40%-10万, 180万超〜360万=収入×30%+8万
    expect(incomeFromSalary(2000000)).toBe(1320000);
  });

  it('給与収入100万円（55万控除）→ 所得45万円', () => {
    expect(incomeFromSalary(1000000)).toBe(450000);
  });

  it('給与収入が55万以下 → 所得0', () => {
    expect(incomeFromSalary(500000)).toBe(0);
  });

  it('不正入力 → 0', () => {
    expect(incomeFromSalary(NaN)).toBe(0);
    expect(incomeFromSalary(-100)).toBe(0);
  });
});

describe('reductionRate（均等割の軽減判定）', () => {
  // 7割: 43万 + 10万×(給与等の数-1)
  // 5割: 43万 + 31万×加入者数 + 10万×(給与等の数-1)
  // 2割: 43万 + 57万×加入者数 + 10万×(給与等の数-1)
  it('所得0・1人世帯 → 7割軽減（0.7）', () => {
    expect(reductionRate(0, 1)).toBe(0.7);
  });

  it('所得43万ちょうど・1人 → 7割軽減（境界・以下）', () => {
    expect(reductionRate(430000, 1)).toBe(0.7);
  });

  it('所得44万・1人 → 7割超え、5割閾値(43万+31万=74万)以下 → 5割軽減', () => {
    expect(reductionRate(440000, 1)).toBe(0.5);
  });

  it('所得74万ちょうど・1人 → 5割軽減（境界）', () => {
    expect(reductionRate(740000, 1)).toBe(0.5);
  });

  it('所得75万・1人 → 2割閾値(43万+57万=100万)以下 → 2割軽減', () => {
    expect(reductionRate(750000, 1)).toBe(0.2);
  });

  it('所得100万ちょうど・1人 → 2割軽減（境界）', () => {
    expect(reductionRate(1000000, 1)).toBe(0.2);
  });

  it('所得101万・1人 → 軽減なし（0）', () => {
    expect(reductionRate(1010000, 1)).toBe(0);
  });

  it('3人世帯・所得43万 → 5割閾値=43万+31万×3=136万、7割閾値=43万 → 5割軽減', () => {
    // 所得43万は7割閾値43万以下 → 7割
    expect(reductionRate(430000, 3)).toBe(0.7);
  });

  it('3人世帯・所得100万 → 5割閾値136万以下 → 5割軽減', () => {
    expect(reductionRate(1000000, 3)).toBe(0.5);
  });
});

describe('calcKokuho（保険料の総合計算）', () => {
  const tokyo = 'tokyo23';

  it('所得なし・1人・40歳未満 → 均等割のみ・7割軽減適用', () => {
    const r = calcKokuho({ income: 0, members: 1, hasCare: false, city: tokyo });
    expect(r.total).toBeGreaterThan(0);
    expect(r.reduction).toBe(0.7);
    expect(r.care).toBe(0); // 介護対象でない
    // 所得割は0（所得43万未満）
    expect(r.medical).toBe(r.medicalPerCapita); // 均等割のみ
  });

  it('40〜64歳ありで介護分が加算される', () => {
    const noCare = calcKokuho({ income: 3000000, members: 1, hasCare: false, city: tokyo });
    const withCare = calcKokuho({ income: 3000000, members: 1, hasCare: true, city: tokyo });
    expect(noCare.care).toBe(0);
    expect(withCare.care).toBeGreaterThan(0);
    expect(withCare.total).toBeGreaterThan(noCare.total);
  });

  it('金額は全て整数（Math.floor）', () => {
    const r = calcKokuho({ income: 3210987, members: 2, hasCare: true, city: tokyo });
    expect(Number.isInteger(r.total)).toBe(true);
    expect(Number.isInteger(r.medical)).toBe(true);
    expect(Number.isInteger(r.support)).toBe(true);
    expect(Number.isInteger(r.care)).toBe(true);
  });

  it('高所得では賦課限度額が適用される', () => {
    const r = calcKokuho({ income: 20000000, members: 1, hasCare: true, city: tokyo });
    const t = CITIES.find((c) => c.key === tokyo).rates;
    expect(r.medical).toBe(t.medical.cap);
    expect(r.support).toBe(t.support.cap);
    expect(r.care).toBe(t.care.cap);
    expect(r.total).toBe(t.medical.cap + t.support.cap + t.care.cap);
  });

  it('所得割 = (所得-43万)×率（軽減なし・限度額未満の範囲で検算）', () => {
    const income = 2000000;
    const members = 1;
    const r = calcKokuho({ income, members, hasCare: false, city: tokyo });
    const t = CITIES.find((c) => c.key === tokyo).rates;
    const base = income - 430000;
    const expMedical = Math.floor(
      Math.floor(base * t.medical.incomeRate) + t.medical.perCapita * members
    );
    expect(r.medical).toBe(expMedical);
  });

  it('都市が違えば料率が違い結果も変わる', () => {
    const a = calcKokuho({ income: 3000000, members: 2, hasCare: true, city: 'tokyo23' });
    const b = calcKokuho({ income: 3000000, members: 2, hasCare: true, city: 'osaka' });
    expect(a.total).not.toBe(b.total);
  });

  it('不正な都市キー → tokyo23 にフォールバック', () => {
    const r = calcKokuho({ income: 3000000, members: 1, hasCare: false, city: 'unknown' });
    expect(r.total).toBeGreaterThan(0);
  });

  it('世帯人数0や不正入力 → 安全に0または最小値', () => {
    const r = calcKokuho({ income: NaN, members: 0, hasCare: false, city: tokyo });
    expect(r.total).toBe(0);
  });
});
