// 坪・平方メートル・不動産表示の帖数を換算する純関数。
// 1坪 = 400/121㎡、1帖 = 1.62㎡（不動産広告の表示規約上の基準）。

export const TSUBO_M2 = 400 / 121;
export const JO_M2 = 1.62;

const AREA_FACTORS = {
  m2: 1,
  tsubo: TSUBO_M2,
  jo: JO_M2,
};

function nonNegativeNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function convertArea(value, fromUnit) {
  const number = nonNegativeNumber(value);
  const factor = AREA_FACTORS[fromUnit];
  if (number === null || factor === undefined) return null;

  const m2 = number * factor;
  return {
    m2,
    tsubo: m2 / TSUBO_M2,
    jo: m2 / JO_M2,
  };
}

export function areaFromDimensions(length, width, unit = 'm') {
  const lengthValue = nonNegativeNumber(length);
  const widthValue = nonNegativeNumber(width);
  const lengthFactor = { m: 1, cm: 0.01 }[unit];
  if (lengthValue === null || widthValue === null || lengthFactor === undefined) return null;

  return convertArea(lengthValue * lengthFactor * widthValue * lengthFactor, 'm2');
}

export function calculateTsuboPrice(totalPrice, areaValue, areaUnit = 'm2') {
  const price = nonNegativeNumber(totalPrice);
  if (price === null || price <= 0 || !['m2', 'tsubo'].includes(areaUnit)) return null;

  const area = convertArea(areaValue, areaUnit);
  if (!area || area.m2 <= 0 || area.tsubo <= 0) return null;

  return {
    totalPrice: Math.floor(price),
    area,
    pricePerTsubo: Math.floor(price / area.tsubo),
    pricePerM2: Math.floor(price / area.m2),
  };
}
