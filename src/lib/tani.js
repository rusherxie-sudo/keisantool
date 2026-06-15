// 単位変換器の純関数ロジック（DOM 非依存）
//
// 倍率方式: 各カテゴリで基準単位を1とした倍率 factor を持ち、
//   結果 = value × factor[from] / factor[to]
// 温度のみ倍率では表せないため特殊公式を使う。

// 長さ（基準: m）
const length = [
  { id: 'mm', label: 'ミリメートル (mm)', factor: 0.001 },
  { id: 'cm', label: 'センチメートル (cm)', factor: 0.01 },
  { id: 'm', label: 'メートル (m)', factor: 1 },
  { id: 'km', label: 'キロメートル (km)', factor: 1000 },
  { id: 'inch', label: 'インチ (inch)', factor: 0.0254 },
  { id: 'feet', label: 'フィート (feet)', factor: 0.3048 },
  { id: 'yard', label: 'ヤード (yard)', factor: 0.9144 },
  { id: 'mile', label: 'マイル (mile)', factor: 1609.344 },
  { id: 'sun', label: '寸', factor: 0.0303030303 },   // 1寸 = 1/33 m
  { id: 'shaku', label: '尺', factor: 0.303030303 },  // 1尺 = 10/33 m
  { id: 'ri', label: '里', factor: 3927.27272727 },   // 1里 = 36町 = 12960尺
];

// 重さ（基準: kg）
const weight = [
  { id: 'mg', label: 'ミリグラム (mg)', factor: 0.000001 },
  { id: 'g', label: 'グラム (g)', factor: 0.001 },
  { id: 'kg', label: 'キログラム (kg)', factor: 1 },
  { id: 't', label: 'トン (t)', factor: 1000 },
  { id: 'oz', label: 'オンス (oz)', factor: 0.028349523125 },
  { id: 'lb', label: 'ポンド (lb)', factor: 0.45359237 },
  { id: 'monme', label: '匁', factor: 0.00375 },  // 1匁 = 3.75 g
  { id: 'kan', label: '貫', factor: 3.75 },       // 1貫 = 1000匁
];

// 面積（基準: m²）
// 坪 ≈ 3.305785 m²（1坪 = 400/121 m²）
// 畳は地域差あり。ここでは中京間 1.6562 m² を採用（使い方で注記）。
const area = [
  { id: 'cm2', label: '平方センチメートル (cm²)', factor: 0.0001 },
  { id: 'm2', label: '平方メートル (m²)', factor: 1 },
  { id: 'km2', label: '平方キロメートル (km²)', factor: 1000000 },
  { id: 'a', label: 'アール (a)', factor: 100 },
  { id: 'ha', label: 'ヘクタール (ha)', factor: 10000 },
  { id: 'tsubo', label: '坪', factor: 3.305785 },
  { id: 'jo', label: '畳（中京間）', factor: 1.6562 },
];

// 体積（基準: L）
const volume = [
  { id: 'ml', label: 'ミリリットル (ml)', factor: 0.001 },
  { id: 'cc', label: 'シーシー (cc)', factor: 0.001 },
  { id: 'L', label: 'リットル (L)', factor: 1 },
  { id: 'm3', label: '立方メートル (m³)', factor: 1000 },
];

// 速さ（基準: m/s）
const speed = [
  { id: 'ms', label: 'メートル毎秒 (m/s)', factor: 1 },
  { id: 'kmh', label: 'キロメートル毎時 (km/h)', factor: 1 / 3.6 },
  { id: 'mph', label: 'マイル毎時 (mph)', factor: 0.44704 },
  { id: 'knot', label: 'ノット (knot)', factor: 0.514444 },
];

// 温度（倍率ではなく公式で変換するため label のみ）
const temperature = [
  { id: 'c', label: '摂氏 (℃)' },
  { id: 'f', label: '華氏 (℉)' },
  { id: 'k', label: 'ケルビン (K)' },
];

export const UNITS = { length, weight, area, volume, temperature, speed };

// 温度を基準（摂氏）に変換
function toCelsius(value, from) {
  if (from === 'c') return value;
  if (from === 'f') return (value - 32) * 5 / 9;
  if (from === 'k') return value - 273.15;
  return null;
}

// 摂氏から目的の温度単位へ変換
function fromCelsius(c, to) {
  if (to === 'c') return c;
  if (to === 'f') return c * 9 / 5 + 32;
  if (to === 'k') return c + 273.15;
  return null;
}

function convertTemperature(value, from, to) {
  const c = toCelsius(value, from);
  if (c === null) return null;
  return fromCelsius(c, to);
}

/**
 * 単位変換。
 * @param {string} category - 'length' | 'weight' | 'area' | 'volume' | 'temperature' | 'speed'
 * @param {number|string} value - 変換したい数値
 * @param {string} fromUnit - 変換元の単位 id
 * @param {string} toUnit - 変換先の単位 id
 * @returns {number|null} 変換結果。不正入力なら null。
 */
export function convert(category, value, fromUnit, toUnit) {
  const list = UNITS[category];
  if (!list) return null;

  // 数値チェック（空文字・非数値は null）
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  if (category === 'temperature') {
    const ids = new Set(list.map((u) => u.id));
    if (!ids.has(fromUnit) || !ids.has(toUnit)) return null;
    return convertTemperature(n, fromUnit, toUnit);
  }

  const from = list.find((u) => u.id === fromUnit);
  const to = list.find((u) => u.id === toUnit);
  if (!from || !to) return null;

  return (n * from.factor) / to.factor;
}
