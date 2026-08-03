// 三角関数と直角三角形の純粋計算関数。
// 浮動小数点誤差で 90度の tan が巨大な数にならないよう、cos≈0を定義なしとする。

const EPSILON = 1e-12;
const VALID_UNITS = new Set(['degree', 'radian']);
const INVERSE_FUNCTIONS = {
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
};

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function clean(value) {
  return Math.abs(value) < EPSILON ? 0 : value;
}

function toRadians(value, unit) {
  return unit === 'degree' ? value * Math.PI / 180 : value;
}

function toDegrees(value) {
  return value * 180 / Math.PI;
}

export function calculateTrig(angle, unit = 'degree') {
  if (!isFiniteNumber(angle) || !VALID_UNITS.has(unit)) return null;

  const radians = toRadians(angle, unit);
  const sin = clean(Math.sin(radians));
  const cos = clean(Math.cos(radians));

  return {
    angle,
    unit,
    degrees: unit === 'degree' ? angle : toDegrees(angle),
    radians,
    sin,
    cos,
    tan: Math.abs(cos) < EPSILON ? null : clean(sin / cos),
  };
}

export function calculateInverseTrig(functionName, value, unit = 'degree') {
  if (!isFiniteNumber(value) || !VALID_UNITS.has(unit)) return null;
  const operation = INVERSE_FUNCTIONS[functionName];
  if (!operation) return null;
  if ((functionName === 'asin' || functionName === 'acos') && (value < -1 || value > 1)) return null;

  const radians = operation(value);
  return unit === 'degree' ? toDegrees(radians) : radians;
}

export function solveRightTriangle({ a = null, b = null, c = null } = {}) {
  const sides = { a, b, c };
  const known = Object.entries(sides).filter(([, value]) => value !== null && value !== '');
  if (known.length !== 2) return null;
  if (known.some(([, value]) => !isFiniteNumber(value) || value <= 0)) return null;

  let sideA = a;
  let sideB = b;
  let hypotenuse = c;

  if (sideA === null || sideA === '') {
    if (hypotenuse <= sideB) return null;
    sideA = Math.sqrt((hypotenuse ** 2) - (sideB ** 2));
  } else if (sideB === null || sideB === '') {
    if (hypotenuse <= sideA) return null;
    sideB = Math.sqrt((hypotenuse ** 2) - (sideA ** 2));
  } else {
    hypotenuse = Math.hypot(sideA, sideB);
  }

  const angleA = toDegrees(Math.asin(sideA / hypotenuse));
  const angleB = 90 - angleA;
  return {
    a: sideA,
    b: sideB,
    c: hypotenuse,
    angleA,
    angleB,
    area: sideA * sideB / 2,
    perimeter: sideA + sideB + hypotenuse,
  };
}
