// 円の面積・円周計算ロジック（純関数・DOM非依存）。
// 途中計算は丸めず、表示桁の調整は画面側で行う。

function positiveNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function circleFromValidatedRadius(radius) {
  return {
    radius,
    diameter: radius * 2,
    circumference: 2 * Math.PI * radius,
    area: Math.PI * radius ** 2,
  };
}

export function circleFromRadius(value) {
  const radius = positiveNumber(value);
  return radius === null ? null : circleFromValidatedRadius(radius);
}

export function circleFromDiameter(value) {
  const diameter = positiveNumber(value);
  return diameter === null ? null : circleFromValidatedRadius(diameter / 2);
}

export function circleFromArea(value) {
  const area = positiveNumber(value);
  return area === null ? null : circleFromValidatedRadius(Math.sqrt(area / Math.PI));
}

export function circleFromCircumference(value) {
  const circumference = positiveNumber(value);
  return circumference === null ? null : circleFromValidatedRadius(circumference / (2 * Math.PI));
}
