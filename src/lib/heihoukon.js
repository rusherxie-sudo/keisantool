// 平方根・根号簡約・n乗根の純関数。
// 表示用の丸めはページ側で行い、計算途中では丸めない。

export const MAX_SIMPLIFY_INTEGER = 1_000_000_000;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeNearInteger(value) {
  const nearest = Math.round(value);
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(value)) * 16;
  return Math.abs(value - nearest) <= tolerance ? nearest : value;
}

// 整数の平方根を a√b（負数は a√bi）の形に簡約する。
// 大きすぎる整数は平方因子探索に時間がかかるため、化簡対象に上限を設ける。
export function simplifyIntegerSquareRoot(value) {
  if (!Number.isSafeInteger(value) || Math.abs(value) > MAX_SIMPLIFY_INTEGER) return null;

  const imaginary = value < 0;
  const absolute = Math.abs(value);
  if (absolute === 0) {
    return {
      coefficient: 0,
      radicand: 1,
      expression: '0',
      imaginary: false,
      perfectSquare: true,
    };
  }

  let coefficient = 1;
  let radicand = absolute;
  for (let factor = Math.floor(Math.sqrt(absolute)); factor >= 2; factor -= 1) {
    const square = factor * factor;
    if (absolute % square === 0) {
      coefficient = factor;
      radicand = absolute / square;
      break;
    }
  }

  const perfectSquare = radicand === 1;
  let expression;
  if (perfectSquare) expression = String(coefficient);
  else if (coefficient === 1) expression = `√${radicand}`;
  else expression = `${coefficient}√${radicand}`;
  if (imaginary) expression = expression === '1' ? 'i' : `${expression}i`;

  return { coefficient, radicand, expression, imaginary, perfectSquare };
}

export function calculateSquareRoot(value) {
  if (!isFiniteNumber(value)) return null;

  const simplified = simplifyIntegerSquareRoot(value);
  if (value < 0) {
    return {
      real: false,
      decimal: null,
      imaginaryMagnitude: normalizeNearInteger(Math.sqrt(Math.abs(value))),
      simplified,
    };
  }

  return {
    real: true,
    decimal: normalizeNearInteger(Math.sqrt(value)),
    imaginaryMagnitude: null,
    simplified,
  };
}

export function calculateNthRoot(value, index) {
  if (!isFiniteNumber(value)) return null;
  if (!Number.isInteger(index) || index < 2 || index > 100) return null;
  if (value < 0 && index % 2 === 0) return { real: false, result: null };

  const magnitude = Math.pow(Math.abs(value), 1 / index);
  const signed = value < 0 ? -magnitude : magnitude;
  return { real: true, result: normalizeNearInteger(signed) };
}
