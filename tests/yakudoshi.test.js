import { describe, it, expect } from 'vitest';
import {
  kazoedoshi,
  checkYakudoshi,
  yakudoshiList,
  nextYaku,
  yakudoshiTable,
} from '../src/lib/yakudoshi.js';

// 全ての「今年」依存の関数は基準年(currentYear)を引数で受け取る。
// テストは固定値(2026)を渡して再現性を保証する（Dateは使わない）。

describe('kazoedoshi(数え年 = 現在の年 − 生まれた年 + 1)', () => {
  it('1990年生まれ、2026年時点 → 37', () => {
    expect(kazoedoshi(1990, 2026)).toBe(37);
  });
  it('2026年生まれ、2026年時点 → 1', () => {
    expect(kazoedoshi(2026, 2026)).toBe(1);
  });
  it('2000年生まれ、2026年時点 → 27', () => {
    expect(kazoedoshi(2000, 2026)).toBe(27);
  });
});

describe('yakudoshiList(男女別の厄年一覧・数え年)', () => {
  it('男性：本厄は 25・42・61', () => {
    const list = yakudoshiList('male');
    expect(list.map((y) => y.honyaku)).toEqual([25, 42, 61]);
  });
  it('女性：本厄は 19・33・37・61', () => {
    const list = yakudoshiList('female');
    expect(list.map((y) => y.honyaku)).toEqual([19, 33, 37, 61]);
  });
  it('男性 42 は大厄フラグ', () => {
    const list = yakudoshiList('male');
    const o = list.find((y) => y.honyaku === 42);
    expect(o.taiyaku).toBe(true);
  });
  it('女性 33 は大厄フラグ', () => {
    const list = yakudoshiList('female');
    const o = list.find((y) => y.honyaku === 33);
    expect(o.taiyaku).toBe(true);
  });
  it('前厄=本厄-1, 後厄=本厄+1', () => {
    const o = yakudoshiList('male').find((y) => y.honyaku === 42);
    expect(o.maeyaku).toBe(41);
    expect(o.atoyaku).toBe(43);
  });
  it('非対応の性別は空配列', () => {
    expect(yakudoshiList('x')).toEqual([]);
  });
});

describe('checkYakudoshi(birthYear, gender, currentYear)', () => {
  // 男性・大厄42（数え年）の本厄になる生年: 2026 - 42 + 1 = 1985
  it('男性1985年生まれ・2026年 → 本厄(42・大厄)', () => {
    const r = checkYakudoshi(1985, 'male', 2026);
    expect(r.kazoe).toBe(42);
    expect(r.status).toBe('honyaku');
    expect(r.taiyaku).toBe(true);
    expect(r.honyaku).toBe(42);
  });
  // 前厄: 数え年41 → 生年 2026 - 41 + 1 = 1986
  it('男性1986年生まれ・2026年 → 前厄(数え年41)', () => {
    const r = checkYakudoshi(1986, 'male', 2026);
    expect(r.kazoe).toBe(41);
    expect(r.status).toBe('maeyaku');
    expect(r.honyaku).toBe(42);
    expect(r.taiyaku).toBe(false);
  });
  // 後厄: 数え年43 → 生年 2026 - 43 + 1 = 1984
  it('男性1984年生まれ・2026年 → 後厄(数え年43)', () => {
    const r = checkYakudoshi(1984, 'male', 2026);
    expect(r.kazoe).toBe(43);
    expect(r.status).toBe('atoyaku');
    expect(r.honyaku).toBe(42);
  });
  it('該当なし: 男性2000年生まれ・2026年(数え年27)', () => {
    const r = checkYakudoshi(2000, 'male', 2026);
    expect(r.kazoe).toBe(27);
    expect(r.status).toBe('none');
    expect(r.honyaku).toBe(null);
  });
  // 女性・大厄33: 生年 2026 - 33 + 1 = 1994
  it('女性1994年生まれ・2026年 → 本厄(33・大厄)', () => {
    const r = checkYakudoshi(1994, 'female', 2026);
    expect(r.kazoe).toBe(33);
    expect(r.status).toBe('honyaku');
    expect(r.taiyaku).toBe(true);
  });
  // 女性19の前厄(18): 生年 2026 - 18 + 1 = 2009
  it('女性2009年生まれ・2026年 → 前厄(数え年18 / 本厄19)', () => {
    const r = checkYakudoshi(2009, 'female', 2026);
    expect(r.kazoe).toBe(18);
    expect(r.status).toBe('maeyaku');
    expect(r.honyaku).toBe(19);
  });
  it('男女共通 61(本厄)・男性: 生年 2026-61+1=1966', () => {
    const r = checkYakudoshi(1966, 'male', 2026);
    expect(r.status).toBe('honyaku');
    expect(r.honyaku).toBe(61);
    expect(r.taiyaku).toBe(false);
  });
  it('不正な性別は status=none', () => {
    const r = checkYakudoshi(1985, 'x', 2026);
    expect(r.status).toBe('none');
  });
  it('不正な生年(数値でない)は null扱い', () => {
    const r = checkYakudoshi(NaN, 'male', 2026);
    expect(r.kazoe).toBe(null);
    expect(r.status).toBe('none');
  });
});

describe('nextYaku(次の厄年・前厄まであと何年)', () => {
  // 男性2000生まれ・2026 = 数え年27。次の本厄は42、その前厄は41(数え年)。
  // 数え年41になるのは 41-27=14年後。
  it('男性2000年生まれ・2026年 → 次の前厄まで14年(数え年41)', () => {
    const r = nextYaku(2000, 'male', 2026);
    expect(r.yearsToMaeyaku).toBe(14);
    expect(r.nextMaeyakuAge).toBe(41);
    expect(r.nextHonyaku).toBe(42);
  });
  // 現在が厄年期間中(前厄/本厄/後厄)でも、未来の次の前厄を返す。
  it('男性1985年生まれ(本厄42)・2026年 → 次の前厄は61の前(60), あと18年', () => {
    const r = nextYaku(1985, 'male', 2026);
    expect(r.nextHonyaku).toBe(61);
    expect(r.nextMaeyakuAge).toBe(60);
    expect(r.yearsToMaeyaku).toBe(18);
  });
  // 全ての厄年を過ぎた場合は null
  it('男性1950年生まれ・2026年(数え年77, 全厄年経過) → null', () => {
    const r = nextYaku(1950, 'male', 2026);
    expect(r).toBe(null);
  });
  it('ちょうど前厄の年なら0年', () => {
    // 男性 数え年41(前厄) = 生年1986
    const r = nextYaku(1986, 'male', 2026);
    expect(r.yearsToMaeyaku).toBe(0);
  });
});

describe('yakudoshiTable(早見表: 指定年の全厄年・前厄/本厄/後厄)', () => {
  const get = (rows, kind, kazoe) =>
    rows.find((r) => r.kind === kind && r.kazoedoshi === kazoe);

  it('数え年で昇順ソートされている', () => {
    const rows = yakudoshiTable(2026, 'male');
    const ages = rows.map((r) => r.kazoedoshi);
    const sorted = [...ages].sort((a, b) => a - b);
    expect(ages).toEqual(sorted);
  });

  it('男性: 本厄25/42/61 と各前厄・後厄の計9件', () => {
    const rows = yakudoshiTable(2026, 'male');
    expect(rows.filter((r) => r.kind === '本厄').map((r) => r.kazoedoshi)).toEqual([25, 42, 61]);
    expect(rows.filter((r) => r.kind === '前厄').map((r) => r.kazoedoshi)).toEqual([24, 41, 60]);
    expect(rows.filter((r) => r.kind === '後厄').map((r) => r.kazoedoshi)).toEqual([26, 43, 62]);
    expect(rows.length).toBe(9);
  });

  it('女性: 本厄19/33/37/61 の計12件', () => {
    const rows = yakudoshiTable(2026, 'female');
    expect(rows.filter((r) => r.kind === '本厄').map((r) => r.kazoedoshi)).toEqual([19, 33, 37, 61]);
    expect(rows.length).toBe(12);
  });

  it('男性 本厄42・2026年 → 生年1985・大厄', () => {
    const o = get(yakudoshiTable(2026, 'male'), '本厄', 42);
    expect(o.birthYear).toBe(1985); // 2026 - 42 + 1
    expect(o.isTaiyaku).toBe(true);
  });

  it('男性 本厄25・2026年 → 生年2002・大厄でない', () => {
    const o = get(yakudoshiTable(2026, 'male'), '本厄', 25);
    expect(o.birthYear).toBe(2002); // 2026 - 25 + 1
    expect(o.isTaiyaku).toBe(false);
  });

  it('男性 本厄61・2026年 → 生年1966', () => {
    const o = get(yakudoshiTable(2026, 'male'), '本厄', 61);
    expect(o.birthYear).toBe(1966); // 2026 - 61 + 1
    expect(o.isTaiyaku).toBe(false);
  });

  it('男性 大厄42の前厄(41)・後厄(43): 前厄は大厄でない/後厄も大厄でない', () => {
    const rows = yakudoshiTable(2026, 'male');
    const mae = get(rows, '前厄', 41);
    const ato = get(rows, '後厄', 43);
    expect(mae.birthYear).toBe(1986); // 2026 - 41 + 1
    expect(ato.birthYear).toBe(1984); // 2026 - 43 + 1
    expect(mae.isTaiyaku).toBe(false);
    expect(ato.isTaiyaku).toBe(false);
  });

  it('女性 大厄33・2026年 → 生年1994・大厄', () => {
    const o = get(yakudoshiTable(2026, 'female'), '本厄', 33);
    expect(o.birthYear).toBe(1994); // 2026 - 33 + 1
    expect(o.isTaiyaku).toBe(true);
  });

  it('birthYear は currentYear - kazoedoshi + 1 を満たす', () => {
    const rows = yakudoshiTable(2026, 'male');
    rows.forEach((r) => {
      expect(r.birthYear).toBe(2026 - r.kazoedoshi + 1);
    });
  });

  it('非対応の性別は空配列', () => {
    expect(yakudoshiTable(2026, 'x')).toEqual([]);
  });
});
