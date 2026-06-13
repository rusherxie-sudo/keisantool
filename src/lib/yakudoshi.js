// 厄年チェッカーの計算ロジック（純関数・DOM非依存）。
// 「今年」に依存する関数は全て基準年(currentYear)を引数で受け取り、
// 内部で Date を使わない（再現性・テスト容易性のため）。
//
// 数え年 = 現在の年 − 生まれた年 + 1
// 厄年（数え年）:
//   男性: 25・42（大厄）・61
//   女性: 19・33（大厄）・37・61
// 前厄 = 本厄の1歳前、後厄 = 本厄の1歳後

const YAKU = {
  male: [
    { honyaku: 25, taiyaku: false },
    { honyaku: 42, taiyaku: true },
    { honyaku: 61, taiyaku: false },
  ],
  female: [
    { honyaku: 19, taiyaku: false },
    { honyaku: 33, taiyaku: true },
    { honyaku: 37, taiyaku: false },
    { honyaku: 61, taiyaku: false },
  ],
};

// 数え年を求める。生年・基準年が不正なら null。
export function kazoedoshi(birthYear, currentYear) {
  const b = Number(birthYear);
  const c = Number(currentYear);
  if (!Number.isFinite(b) || !Number.isFinite(c)) return null;
  return c - b + 1;
}

// 男女別の厄年一覧（前厄・本厄・後厄をまとめた配列）を返す。
export function yakudoshiList(gender) {
  const base = YAKU[gender];
  if (!base) return [];
  return base.map(({ honyaku, taiyaku }) => ({
    maeyaku: honyaku - 1,
    honyaku,
    atoyaku: honyaku + 1,
    taiyaku,
  }));
}

// 指定の生年・性別・基準年で、今年が前厄/本厄/後厄/該当なしのどれかを判定。
// 返り値:
//   { kazoe, status: 'maeyaku'|'honyaku'|'atoyaku'|'none',
//     honyaku: number|null, taiyaku: boolean }
export function checkYakudoshi(birthYear, gender, currentYear) {
  const kazoe = kazoedoshi(birthYear, currentYear);
  const list = yakudoshiList(gender);
  const empty = { kazoe, status: 'none', honyaku: null, taiyaku: false };
  if (kazoe === null || list.length === 0) return empty;

  for (const y of list) {
    if (kazoe === y.honyaku) {
      return { kazoe, status: 'honyaku', honyaku: y.honyaku, taiyaku: y.taiyaku };
    }
    if (kazoe === y.maeyaku) {
      return { kazoe, status: 'maeyaku', honyaku: y.honyaku, taiyaku: false };
    }
    if (kazoe === y.atoyaku) {
      return { kazoe, status: 'atoyaku', honyaku: y.honyaku, taiyaku: y.taiyaku };
    }
  }
  return empty;
}

// 次に来る厄年（前厄）の情報と、前厄まであと何年かを返す。
// 既に全ての厄年（後厄まで）を過ぎている場合は null。
//   { yearsToMaeyaku, nextMaeyakuAge, nextHonyaku, taiyaku }
export function nextYaku(birthYear, gender, currentYear) {
  const kazoe = kazoedoshi(birthYear, currentYear);
  const list = yakudoshiList(gender);
  if (kazoe === null || list.length === 0) return null;

  // 現在の数え年に対して「前厄の年齢がまだ来ていない（>= 現在）」最初の厄年を探す。
  for (const y of list) {
    if (y.maeyaku >= kazoe) {
      return {
        yearsToMaeyaku: y.maeyaku - kazoe,
        nextMaeyakuAge: y.maeyaku,
        nextHonyaku: y.honyaku,
        taiyaku: y.taiyaku,
      };
    }
  }
  return null;
}
