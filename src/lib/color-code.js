// カラーコード変換ロジック（純関数・DOM非依存）

const clamp255 = (n) => Math.min(255, Math.max(0, Math.round(n)));

/**
 * HEX文字列 → {r,g,b}。'#1e3a5f' / '1e3a5f' / '#abc' / 'fff' に対応。
 * 不正なら null。
 */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '').toLowerCase();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6) return null;
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * {r,g,b} → '#rrggbb'（小文字）。範囲外は0-255にクランプ、小数は四捨五入。
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => clamp255(n).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * {r,g,b}(0-255) → {h(0-360整数), s(0-100整数), l(0-100整数)}
 */
export function rgbToHsl(r, g, b) {
  const rn = clamp255(r) / 255;
  const gn = clamp255(g) / 255;
  const bn = clamp255(b) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * {h(0-360), s(0-100), l(0-100)} → {r,g,b}(0-255)
 */
export function hslToRgb(h, s, l) {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let rp = 0,
    gp = 0,
    bp = 0;
  if (hn < 60) [rp, gp, bp] = [c, x, 0];
  else if (hn < 120) [rp, gp, bp] = [x, c, 0];
  else if (hn < 180) [rp, gp, bp] = [0, c, x];
  else if (hn < 240) [rp, gp, bp] = [0, x, c];
  else if (hn < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

// ── 抵抗カラーコード（4色環）──

// 数字色（1・2桁目、および乗数の10^n に使う色）
const DIGIT = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  gray: 8,
  white: 9,
};

// 乗数（×10^n）。金=×0.1、銀=×0.01 を追加
const MULTIPLIER = {
  black: 1,
  brown: 10,
  red: 100,
  orange: 1000,
  yellow: 10000,
  green: 100000,
  blue: 1000000,
  violet: 10000000,
  gray: 100000000,
  white: 1000000000,
  gold: 0.1,
  silver: 0.01,
};

// 許容差
const TOLERANCE = {
  brown: '±1%',
  red: '±2%',
  green: '±0.5%',
  blue: '±0.25%',
  violet: '±0.1%',
  gray: '±0.05%',
  gold: '±5%',
  silver: '±10%',
};

function formatOhms(ohms) {
  let value, unit;
  if (ohms >= 1000000) {
    value = ohms / 1000000;
    unit = 'MΩ';
  } else if (ohms >= 1000) {
    value = ohms / 1000;
    unit = 'kΩ';
  } else {
    value = ohms;
    unit = 'Ω';
  }
  // 不要な小数桁を削る（1.0 → "1"、4.7 → "4.7"）
  const str = parseFloat(value.toFixed(3)).toString();
  return str + unit;
}

/**
 * 4色環抵抗の値を計算。
 * band1, band2: 数字色（黒〜白）
 * multiplier: 乗数色（金=×0.1, 銀=×0.01 含む）
 * tolerance: 許容差色
 * 不正な色なら null。
 * 返り値: { ohms, display, tolerance }
 */
export function resistorValue(band1, band2, multiplier, tolerance) {
  const d1 = DIGIT[band1];
  const d2 = DIGIT[band2];
  const mul = MULTIPLIER[multiplier];
  const tol = TOLERANCE[tolerance];
  if (d1 === undefined || d2 === undefined || mul === undefined || tol === undefined) {
    return null;
  }
  const ohms = (d1 * 10 + d2) * mul;
  return {
    ohms,
    display: formatOhms(ohms),
    tolerance: tol,
  };
}
