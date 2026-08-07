// 三角形の面積計算ロジック（純関数・DOM非依存）。
// 画面表示用の丸めは呼び出し側で行い、内部では浮動小数点の値を保持する。

function finiteNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function positiveNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

export function triangleFromBaseHeight(baseInput, heightInput) {
  const base = positiveNumber(baseInput);
  const height = positiveNumber(heightInput);
  if (base === null || height === null) return null;
  return { area: (base * height) / 2 };
}

export function triangleFromThreeSides(aInput, bInput, cInput) {
  const a = positiveNumber(aInput);
  const b = positiveNumber(bInput);
  const c = positiveNumber(cInput);
  if (a === null || b === null || c === null) return null;
  if (a + b <= c || b + c <= a || c + a <= b) return null;

  const semiperimeter = (a + b + c) / 2;
  const radicand = semiperimeter
    * (semiperimeter - a)
    * (semiperimeter - b)
    * (semiperimeter - c);

  return {
    area: Math.sqrt(Math.max(0, radicand)),
    perimeter: a + b + c,
    semiperimeter,
  };
}

export function triangleFromTwoSidesAngle(aInput, bInput, angleInput) {
  const a = positiveNumber(aInput);
  const b = positiveNumber(bInput);
  const angle = finiteNumber(angleInput);
  if (a === null || b === null || angle === null || angle <= 0 || angle >= 180) return null;

  const radians = (angle * Math.PI) / 180;
  const area = (a * b * Math.sin(radians)) / 2;
  const thirdSide = Math.sqrt((a ** 2) + (b ** 2) - (2 * a * b * Math.cos(radians)));

  return {
    area,
    thirdSide,
    perimeter: a + b + thirdSide,
  };
}

export function triangleFromCoordinates(x1Input, y1Input, x2Input, y2Input, x3Input, y3Input) {
  const values = [x1Input, y1Input, x2Input, y2Input, x3Input, y3Input].map(finiteNumber);
  if (values.some((value) => value === null)) return null;
  const [x1, y1, x2, y2, x3, y3] = values;

  const signedDoubleArea = (x1 * (y2 - y3)) + (x2 * (y3 - y1)) + (x3 * (y1 - y2));
  const area = Math.abs(signedDoubleArea) / 2;
  if (area === 0) return null;

  const distance = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const sides = [
    distance(x1, y1, x2, y2),
    distance(x2, y2, x3, y3),
    distance(x3, y3, x1, y1),
  ];

  return {
    area,
    sides,
    perimeter: sides.reduce((sum, side) => sum + side, 0),
  };
}
